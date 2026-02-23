import base64
import io
import json
import os
import re
import sys
from typing import Any

import requests
import torch
from PIL import Image
from torchvision.models import MobileNet_V2_Weights, mobilenet_v2
from ultralytics import YOLO


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
YOLO_WEIGHTS = os.path.join(ROOT, 'ai-models', 'weights', 'yolov8n.pt')
TRASH_CLS_WEIGHTS = os.path.join(ROOT, 'ai-models', 'weights', 'yolov8n-trash-cls.pt')

_MOBILENET_WEIGHTS = MobileNet_V2_Weights.DEFAULT
_MOBILENET = mobilenet_v2(weights=_MOBILENET_WEIGHTS).eval()
_PREPROCESS = _MOBILENET_WEIGHTS.transforms()
_LABELS = _MOBILENET_WEIGHTS.meta.get('categories', [])
_YOLO = YOLO(YOLO_WEIGHTS)

# Trained trash classifier (cardboard, glass, metal, paper, plastic, trash)
_TRASH_CLS = None
if os.path.exists(TRASH_CLS_WEIGHTS):
    _TRASH_CLS = YOLO(TRASH_CLS_WEIGHTS)

# Map trash classifier labels to our waste types
_TRASH_CLS_TO_TYPE = {
    'cardboard': 'mixed',
    'glass': 'hazardous',
    'metal': 'mixed',
    'paper': 'mixed',
    'plastic': 'plastic',
    'trash': 'mixed',
}

_WASTE_WORDS = {
    'garbage', 'trash', 'waste', 'dustbin', 'rubbish', 'plastic', 'bottle', 'can', 'dump', 'garbage truck'
}

_NON_WASTE_WORDS = {
    'dog', 'cat', 'car', 'bus', 'train', 'bird', 'flower', 'tree', 'person', 'road', 'building', 'chair', 'table'
}

_TYPE_KEYWORDS = {
    'plastic': {'bottle', 'cup', 'wine glass'},
    'electronic': {'cell phone', 'tv', 'laptop', 'keyboard', 'mouse', 'remote'},
    'hazardous': {'knife', 'scissors'},
    'organic': {'banana', 'apple', 'orange', 'broccoli', 'carrot', 'sandwich'},
}


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


def _mobilenet_score(image: Image.Image) -> tuple[float, list[str]]:
    tensor = _PREPROCESS(image).unsqueeze(0)
    with torch.no_grad():
        logits = _MOBILENET(tensor)
        probs = torch.softmax(logits, dim=1)[0]

    top_prob, top_idx = torch.topk(probs, 5)
    top_labels: list[str] = []
    waste_score = 0.0
    non_waste_score = 0.0
    for idx, prob in zip(top_idx.tolist(), top_prob.tolist()):
        label = _LABELS[idx] if idx < len(_LABELS) else f'class-{idx}'
        top_labels.append(label)
        lowered = label.lower()
        if any(word in lowered for word in _WASTE_WORDS):
            waste_score += prob
        if any(word in lowered for word in _NON_WASTE_WORDS):
            non_waste_score += prob

    return float(max(waste_score - (non_waste_score * 0.55), 0.0)), top_labels


def _detect_yolo(image: Image.Image) -> tuple[list[dict[str, Any]], float, float]:
    result = _YOLO.predict(image, verbose=False)[0]
    detections: list[dict[str, Any]] = []

    image_area = max(result.orig_shape[0] * result.orig_shape[1], 1)
    covered_area = 0.0
    conf_sum = 0.0

    if result.boxes is None:
        return detections, 0.0, 0.0

    for box in result.boxes:
        class_idx = int(box.cls.item())
        conf = float(box.conf.item())
        class_name = result.names.get(class_idx, str(class_idx))
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        area = max((x2 - x1) * (y2 - y1), 0.0)
        covered_area += area
        conf_sum += conf
        detections.append({'class': class_name, 'confidence': conf})

    mean_conf = conf_sum / len(detections) if detections else 0.0
    area_ratio = min(covered_area / image_area, 1.0)
    return detections, mean_conf, area_ratio


def _classify_trash(image: Image.Image) -> tuple[str, float, str]:
    """Use trained trash classifier to identify waste type.
    Returns (predicted_class, confidence, mapped_waste_type).
    """
    if _TRASH_CLS is None:
        return '', 0.0, 'mixed'

    result = _TRASH_CLS.predict(image, verbose=False)[0]
    if result.probs is not None:
        top_idx = result.probs.top1
        top_conf = float(result.probs.top1conf)
        class_name = result.names.get(top_idx, 'unknown')
        waste_type = _TRASH_CLS_TO_TYPE.get(class_name, 'mixed')
        return class_name, top_conf, waste_type
    return '', 0.0, 'mixed'


def _infer_type(title: str, description: str, detections: list[dict[str, Any]], trash_cls_type: str = '') -> str:
    text = f'{title} {description}'.lower()
    scores = {'plastic': 0, 'organic': 0, 'hazardous': 0, 'electronic': 0, 'mixed': 0}

    # Give high weight to our trained classifier result
    if trash_cls_type and trash_cls_type in scores:
        scores[trash_cls_type] += 5

    for item in detections:
        cls = item['class'].lower()
        matched = False
        for waste_type, keywords in _TYPE_KEYWORDS.items():
            if cls in keywords:
                scores[waste_type] += 2
                matched = True
        if not matched:
            scores['mixed'] += 1

    for waste_type, keywords in _TYPE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                scores[waste_type] += 1

    return max(scores, key=scores.get)


def _severity_from_signal(waste_type: str, count: int, area_ratio: float, mean_conf: float) -> tuple[int, str]:
    base = 25 + (count * 8) + int(area_ratio * 45) + int(mean_conf * 20)
    if waste_type == 'hazardous':
        base += 20
    elif waste_type == 'electronic':
        base += 8

    score = max(5, min(base, 100))
    if score >= 85:
        level = 'critical'
    elif score >= 65:
        level = 'high'
    elif score >= 40:
        level = 'medium'
    else:
        level = 'low'
    return score, level


def main() -> None:
    payload = _read_json_stdin()
    image_source = payload.get('imageSource')
    title = str(payload.get('title', ''))
    description = str(payload.get('description', ''))

    if not image_source:
        raise ValueError('imageSource is required')

    image = _load_image(str(image_source))
    mobilenet_score, top_labels = _mobilenet_score(image)

    # Run trained trash classifier
    trash_cls_label, trash_cls_conf, trash_cls_type = _classify_trash(image)
    trash_cls_is_waste = trash_cls_conf >= 0.40  # trained model says it's waste

    text_signal = bool(re.search(r'waste|trash|garbage|dump|dirty|plastic|litter|debris', f'{title} {description}', re.IGNORECASE))
    mobilenet_is_waste = mobilenet_score >= 0.085
    is_waste = mobilenet_is_waste or text_signal or trash_cls_is_waste

    if not is_waste:
        confidence = int(max(50, min(95, round((1 - mobilenet_score) * 100))))
        result = {
            'isWaste': False,
            'wasteType': 'mixed',
            'confidence': confidence,
            'severityScore': 12,
            'severityLevel': 'low',
            'recommendedPriority': 'low',
            'detectedObjects': top_labels[:3],
            'rewardCredits': 0,
            'modelTrace': [
                'MobileNetV2: Waste vs Non-Waste',
                'YOLOv8-Trash-Cls: Not Waste' if _TRASH_CLS else 'YOLOv8-Trash-Cls: Not Loaded',
                'YOLOv8: Skipped (non-waste)',
                'Google Maps: Location Attach',
            ],
            'pipeline': {
                'mobilenet': {
                    'wasteProbability': round(mobilenet_score, 4),
                    'isWaste': False,
                    'topLabels': top_labels[:5],
                },
                'trashClassifier': {
                    'loaded': _TRASH_CLS is not None,
                    'predictedClass': trash_cls_label,
                    'confidence': round(trash_cls_conf, 4),
                    'mappedType': trash_cls_type,
                },
                'yolov8': {
                    'ran': False,
                    'detections': [],
                    'meanConfidence': 0,
                },
            },
        }
        sys.stdout.write(json.dumps(result))
        return

    detections, mean_conf, area_ratio = _detect_yolo(image)

    waste_type = _infer_type(title, description, detections, trash_cls_type)
    severity_score, severity_level = _severity_from_signal(waste_type, len(detections), area_ratio, mean_conf)

    is_waste = True
    # Combine confidences: best of MobileNet, YOLO detections, and trained trash classifier
    confidence = int(max(50, min(99, round(max(mobilenet_score * 100, mean_conf * 100, trash_cls_conf * 100, 62)))))
    reward_credits = max(10, int(round((severity_score / 4) + (confidence / 8))))

    detected_objects = [item['class'] for item in detections[:6]] or top_labels[:3]
    # Prepend trained classifier label if available
    if trash_cls_label and trash_cls_label not in [d.lower() for d in detected_objects]:
        detected_objects.insert(0, trash_cls_label.capitalize())

    result = {
        'isWaste': bool(is_waste),
        'wasteType': waste_type,
        'confidence': confidence,
        'severityScore': severity_score,
        'severityLevel': severity_level,
        'recommendedPriority': severity_level,
        'detectedObjects': detected_objects[:6],
        'rewardCredits': reward_credits,
        'modelTrace': [
            'MobileNetV2: Waste vs Non-Waste',
            f'YOLOv8-Trash-Cls: {trash_cls_label} ({round(trash_cls_conf * 100)}%)' if _TRASH_CLS else 'YOLOv8-Trash-Cls: Not Loaded',
            'YOLOv8: Waste Detection & Severity',
            'Google Maps: Location Attach',
        ],
        'pipeline': {
            'mobilenet': {
                'wasteProbability': round(mobilenet_score, 4),
                'isWaste': True,
                'topLabels': top_labels[:5],
            },
            'trashClassifier': {
                'loaded': _TRASH_CLS is not None,
                'predictedClass': trash_cls_label,
                'confidence': round(trash_cls_conf, 4),
                'mappedType': trash_cls_type,
            },
            'yolov8': {
                'ran': True,
                'detections': detections[:10],
                'meanConfidence': round(mean_conf, 4),
                'coverageRatio': round(area_ratio, 4),
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
