"""
Train YOLOv8 classifier on Trash Type Image Dataset.

The dataset has 6 categories: cardboard, glass, metal, paper, plastic, trash.
We train a YOLOv8n-cls model so it can identify waste types in images
instead of relying on the generic COCO-pretrained detector.

Usage:
    python ai-models/scripts/train_yolo_cls.py
"""

import os
import random
import shutil
from pathlib import Path

from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent.parent
DATASET_SRC = Path(
    os.path.expanduser("~"),
    ".cache", "kagglehub", "datasets", "farzadnekouei",
    "trash-type-image-dataset", "versions", "1",
    "TrashType_Image_Dataset",
)
DATASET_DIR = ROOT / "ai-models" / "datasets" / "trash-cls"
WEIGHTS_DIR = ROOT / "ai-models" / "weights"

# Map dataset folders to our class names
CLASS_MAP = {
    "cardboard": "cardboard",
    "glass": "glass",
    "metal": "metal",
    "paper": "paper",
    "plastic": "plastic",
    "trash": "trash",
}

TRAIN_RATIO = 0.8
SEED = 42


def prepare_dataset() -> Path:
    """Organize images into train/val splits expected by YOLOv8-cls."""
    if (DATASET_DIR / "train").exists() and (DATASET_DIR / "val").exists():
        print("Dataset already prepared at", DATASET_DIR)
        return DATASET_DIR

    print("Preparing classification dataset...")
    random.seed(SEED)

    for split in ("train", "val"):
        for cls_name in CLASS_MAP.values():
            (DATASET_DIR / split / cls_name).mkdir(parents=True, exist_ok=True)

    for src_folder, cls_name in CLASS_MAP.items():
        src_path = DATASET_SRC / src_folder
        if not src_path.exists():
            print(f"  WARNING: {src_path} not found, skipping")
            continue

        images = sorted([f for f in src_path.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".bmp")])
        random.shuffle(images)
        split_idx = int(len(images) * TRAIN_RATIO)

        for i, img_path in enumerate(images):
            split = "train" if i < split_idx else "val"
            dst = DATASET_DIR / split / cls_name / img_path.name
            if not dst.exists():
                shutil.copy2(img_path, dst)

        print(f"  {cls_name}: {split_idx} train, {len(images) - split_idx} val")

    print(f"Dataset ready at {DATASET_DIR}")
    return DATASET_DIR


def train():
    dataset_path = prepare_dataset()

    print("\n=== Training YOLOv8n-cls on trash dataset ===\n")
    model = YOLO("yolov8n-cls.pt")  # start from pretrained classification model

    results = model.train(
        data=str(dataset_path),
        epochs=18,
        imgsz=224,
        batch=16,
        patience=8,
        project=str(ROOT / "ai-models" / "runs"),
        name="trash-cls",
        exist_ok=True,
        device="cpu",       # use CPU (change to 'cuda:0' if GPU available)
        workers=2,
        verbose=True,
    )

    # Save best weights
    best_weights = ROOT / "ai-models" / "runs" / "trash-cls" / "weights" / "best.pt"
    target = WEIGHTS_DIR / "yolov8n-trash-cls.pt"
    if best_weights.exists():
        shutil.copy2(best_weights, target)
        print(f"\nBest weights saved to {target}")
    else:
        # Fallback: save last weights
        last_weights = ROOT / "ai-models" / "runs" / "trash-cls" / "weights" / "last.pt"
        if last_weights.exists():
            shutil.copy2(last_weights, target)
            print(f"\nLast weights saved to {target}")

    return target


if __name__ == "__main__":
    train()
