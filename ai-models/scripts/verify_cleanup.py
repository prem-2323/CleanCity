import base64
import io
import json
import os
import re
import sys
from typing import Any

import requests
import torch
import torch.nn as nn
from PIL import Image
from torchvision.models import MobileNet_V2_Weights, mobilenet_v2
from ultralytics import YOLO


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
YOLO_WEIGHTS = os.path.join(ROOT, 'ai-models', 'weights', 'yolov8n.pt')
SIAMESE_WEIGHTS = os.path.join(ROOT, 'ai-models', 'weights', 'siamese.pt')
TRASH_CLS_WEIGHTS = os.path.join(ROOT, 'ai-models', 'weights', 'yolov8n-trash-cls.pt')

_MOBILENET_WEIGHTS = MobileNet_V2_Weights.DEFAULT
_PREPROCESS = _MOBILENET_WEIGHTS.transforms()
_YOLO = YOLO(YOLO_WEIGHTS)

# Trained trash classifier for detecting waste in after-photos
_TRASH_CLS = None
if os.path.exists(TRASH_CLS_WEIGHTS):
    _TRASH_CLS = YOLO(TRASH_CLS_WEIGHTS)


class SiameseNetwork(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        backbone = mobilenet_v2(weights=_MOBILENET_WEIGHTS)
        self.feature_extractor = backbone.features
        self.projection = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(1280, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
        )

    def encode(self, image_tensor: torch.Tensor) -> torch.Tensor:
        features = self.feature_extractor(image_tensor)
        embedding = self.projection(features)
        return nn.functional.normalize(embedding, dim=1)


_SIAMESE = SiameseNetwork().eval()
if os.path.exists(SIAMESE_WEIGHTS):
    state = torch.load(SIAMESE_WEIGHTS, map_location='cpu')
    _SIAMESE.load_state_dict(state, strict=False)


def _read_json_stdin() -> dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)


def _load_image(source: str) -> Image.Image:
    if source.startswith('data:image'):
        encoded = source.split(',', 1)[1]
        data = base64.b64decode(encoded)
        return Image.open(io.BytesIO(data)).convert('RGB')

    if re.match(r'^https?://', source):
        response = requests.get(source, timeout=30, headers={
            'User-Agent': 'CleanCity-AI/1.0',
        })
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert('RGB')

    with open(source, 'rb') as handle:
        return Image.open(io.BytesIO(handle.read())).convert('RGB')


def _embedding(image: Image.Image) -> torch.Tensor:
    tensor = _PREPROCESS(image).unsqueeze(0)
    with torch.no_grad():
        return _SIAMESE.encode(tensor)


def _cosine_similarity(before: Image.Image, after: Image.Image) -> float:
    before_vec = _embedding(before)
    after_vec = _embedding(after)
    sim = torch.nn.functional.cosine_similarity(before_vec, after_vec).item()
    return float(max(0.0, min(1.0, (sim + 1) / 2)))


def _after_waste_density(after: Image.Image) -> tuple[float, int]:
    """Detect residual waste using generic YOLO (object detection)."""
    result = _YOLO.predict(after, verbose=False)[0]
    if result.boxes is None or len(result.boxes) == 0:
        return 0.0, 0

    image_area = max(result.orig_shape[0] * result.orig_shape[1], 1)
    covered_area = 0.0
    for box in result.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        covered_area += max((x2 - x1) * (y2 - y1), 0.0)

    return float(min(covered_area / image_area, 1.0)), int(len(result.boxes))


def _classify_after_waste(after: Image.Image) -> tuple[str, float]:
    """Use trained trash classifier to check if after-photo still contains waste.
    Returns (predicted_class, confidence).
    """
    if _TRASH_CLS is None:
        return '', 0.0

    result = _TRASH_CLS.predict(after, verbose=False)[0]
    if result.probs is not None:
        top_idx = result.probs.top1
        top_conf = float(result.probs.top1conf)
        class_name = result.names.get(top_idx, 'unknown')
        return class_name, top_conf
    return '', 0.0


def _severity_threshold(severity_score: int) -> int:
    if severity_score >= 85:
        return 75
    if severity_score >= 65:
        return 70
    if severity_score >= 40:
        return 65
    return 60


def main() -> None:
    payload = _read_json_stdin()
    before_source = payload.get('beforeImageSource')
    after_source = payload.get('afterImageSource')
    severity_score = int(payload.get('severityScore', 60))

    if not after_source:
        raise ValueError('afterImageSource is required')

    after_image = _load_image(str(after_source))

    # Try to load before image
    before_image = None
    before_available = False
    if before_source:
        try:
            before_image = _load_image(str(before_source))
            before_available = True
        except Exception as exc:
            sys.stderr.write(f'Warning: could not load beforeImage ({exc})\n')

    waste_density, waste_boxes = _after_waste_density(after_image)

    # Use trained trash classifier to check for residual waste
    trash_cls_label, trash_cls_conf = _classify_after_waste(after_image)
    # If classifier is VERY confident it's still waste, penalize cleanliness.
    # NOTE: The trash classifier has NO "clean" class (only cardboard/glass/metal/
    # paper/plastic/trash), so it always picks a waste label even on clean images.
    # We use a high threshold (0.80) to avoid penalizing genuinely clean scenes.
    trash_penalty = 0.0
    if _TRASH_CLS is not None and trash_cls_conf >= 0.80:
        # The classifier is very confident waste remains in the after-photo
        trash_penalty = trash_cls_conf * 0.20
        sys.stderr.write(f'Trash classifier: {trash_cls_label} ({trash_cls_conf:.2f}) -> penalty {trash_penalty:.2f}\n')

    cleanliness = max(0.0, (1.0 - waste_density) - trash_penalty)  # higher = cleaner after image

    if before_available:
        similarity = _cosine_similarity(before_image, after_image)
        similarity_score = int(round(similarity * 100))

        if similarity > 0.95:
            # Nearly identical images — no real cleanup performed
            sys.stderr.write(f'Same-image detected (similarity={similarity:.4f})\n')
            cleanliness_score = min(30, int(round(cleanliness * 30)))
        elif similarity > 0.90:
            # Suspiciously similar — heavy penalty
            change_score = 1.0 - similarity
            cleanliness_score = int(round((change_score * 40) + (cleanliness * 40)))
        else:
            # Normal range — scene changed, check cleanliness
            change_score = 1.0 - similarity
            cleanliness_score = int(round((change_score * 35) + (cleanliness * 65)))
    else:
        # Before image unavailable — rely on waste detection only (max 70)
        similarity = 0.0
        similarity_score = 0
        cleanliness_score = int(round(cleanliness * 70))

    threshold = _severity_threshold(severity_score)
    verified = cleanliness_score >= threshold

    reward_credits = int(round(20 + severity_score / 3)) if verified else int(round(8 + severity_score / 7))

    result = {
        'verified': bool(verified),
        'similarityScore': similarity_score,
        'cleanupScore': cleanliness_score,
        'rewardCredits': reward_credits,
        'residualDetections': waste_boxes,
        'modelTrace': [
            'Siamese Network: Before vs After Similarity',
            f'YOLOv8-Trash-Cls: {trash_cls_label} ({round(trash_cls_conf * 100)}%)' if _TRASH_CLS else 'YOLOv8-Trash-Cls: Not Loaded',
            'YOLOv8: Residual Waste Estimate',
        ],
        'pipeline': {
            'siamese': {
                'model': 'SiameseNetwork(MobileNetV2 backbone)',
                'checkpointLoaded': os.path.exists(SIAMESE_WEIGHTS),
                'similarity': round(similarity, 4),
            },
            'trashClassifier': {
                'loaded': _TRASH_CLS is not None,
                'predictedClass': trash_cls_label,
                'confidence': round(trash_cls_conf, 4),
                'penalty': round(trash_penalty, 4),
            },
            'yolov8': {
                'residualWasteDetections': waste_boxes,
                'residualWasteCoverage': round(waste_density, 4),
            },
        },
    }

    sys.stdout.write(json.dumps(result))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)
