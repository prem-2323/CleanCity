"""
Train the Siamese Network on Trash Type Image Dataset.

This fine-tunes the MobileNetV2-based Siamese Network to produce better
embeddings for waste images. It learns to:
  - Produce HIGH similarity for same-class image pairs (same waste type)
  - Produce LOW similarity for different-class pairs (different waste types)

After training, the verify_cleanup script will be much better at telling
whether a before/after pair shows a genuine cleanup vs the same scene.

Usage:
    python ai-models/scripts/train_siamese.py
"""

import os
import random
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision.models import MobileNet_V2_Weights, mobilenet_v2

ROOT = Path(__file__).resolve().parent.parent.parent
DATASET_SRC = Path(
    os.path.expanduser("~"),
    ".cache", "kagglehub", "datasets", "farzadnekouei",
    "trash-type-image-dataset", "versions", "1",
    "TrashType_Image_Dataset",
)
WEIGHTS_DIR = ROOT / "ai-models" / "weights"
SIAMESE_WEIGHTS = WEIGHTS_DIR / "siamese.pt"

_MOBILENET_WEIGHTS = MobileNet_V2_Weights.DEFAULT
_PREPROCESS = _MOBILENET_WEIGHTS.transforms()

EPOCHS = 15
BATCH_SIZE = 16
LR = 1e-4
MARGIN = 0.5
SEED = 42


class SiameseNetwork(nn.Module):
    """Same architecture as in verify_cleanup.py."""

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

    def forward(self, x1: torch.Tensor, x2: torch.Tensor):
        return self.encode(x1), self.encode(x2)


class PairDataset(Dataset):
    """
    Generates pairs of images:
      - 50% positive pairs (same class) → label = 1
      - 50% negative pairs (different class) → label = 0
    """

    def __init__(self, root: Path, num_pairs: int = 4000):
        self.transform = _PREPROCESS
        self.classes: dict[str, list[Path]] = {}

        for class_dir in sorted(root.iterdir()):
            if not class_dir.is_dir():
                continue
            images = [
                f for f in class_dir.iterdir()
                if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".bmp")
            ]
            if images:
                self.classes[class_dir.name] = images

        self.class_names = list(self.classes.keys())
        self.pairs = self._generate_pairs(num_pairs)

    def _generate_pairs(self, num_pairs: int):
        random.seed(SEED)
        pairs = []
        half = num_pairs // 2

        # Positive pairs (same class)
        for _ in range(half):
            cls = random.choice(self.class_names)
            imgs = self.classes[cls]
            if len(imgs) < 2:
                continue
            a, b = random.sample(imgs, 2)
            pairs.append((a, b, 1.0))

        # Negative pairs (different class)
        for _ in range(half):
            c1, c2 = random.sample(self.class_names, 2)
            a = random.choice(self.classes[c1])
            b = random.choice(self.classes[c2])
            pairs.append((a, b, 0.0))

        random.shuffle(pairs)
        return pairs

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        path_a, path_b, label = self.pairs[idx]
        img_a = Image.open(path_a).convert("RGB")
        img_b = Image.open(path_b).convert("RGB")
        return self.transform(img_a), self.transform(img_b), torch.tensor(label, dtype=torch.float32)


class ContrastiveLoss(nn.Module):
    """Contrastive loss: pulls same-class embeddings together, pushes different apart."""

    def __init__(self, margin: float = 0.5):
        super().__init__()
        self.margin = margin

    def forward(self, emb1: torch.Tensor, emb2: torch.Tensor, label: torch.Tensor):
        dist = torch.nn.functional.pairwise_distance(emb1, emb2)
        # label=1 → same class → minimize distance
        # label=0 → diff class → maximize distance (up to margin)
        loss = label * dist.pow(2) + (1 - label) * torch.clamp(self.margin - dist, min=0).pow(2)
        return loss.mean()


def train():
    print(f"Loading dataset from {DATASET_SRC}...")
    dataset = PairDataset(DATASET_SRC, num_pairs=4000)
    print(f"Classes found: {dataset.class_names}")
    print(f"Total pairs: {len(dataset)}")

    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)

    model = SiameseNetwork()
    # Load existing weights if available
    if SIAMESE_WEIGHTS.exists():
        state = torch.load(SIAMESE_WEIGHTS, map_location="cpu")
        model.load_state_dict(state, strict=False)
        print("Loaded existing siamese weights for fine-tuning")

    # Freeze early layers, only train projection + last few conv blocks
    for param in model.feature_extractor[:14].parameters():
        param.requires_grad = False

    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR)
    criterion = ContrastiveLoss(margin=MARGIN)

    print(f"\n=== Training Siamese Network ({EPOCHS} epochs) ===\n")
    model.train()

    for epoch in range(EPOCHS):
        total_loss = 0.0
        correct = 0
        total = 0

        for batch_idx, (img_a, img_b, labels) in enumerate(loader):
            optimizer.zero_grad()
            emb_a, emb_b = model(img_a, img_b)
            loss = criterion(emb_a, emb_b, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

            # Compute accuracy: similar if cosine_sim > 0.5
            with torch.no_grad():
                cos_sim = nn.functional.cosine_similarity(emb_a, emb_b)
                predicted = (cos_sim > 0.5).float()
                correct += (predicted == labels).sum().item()
                total += labels.size(0)

        avg_loss = total_loss / len(loader)
        accuracy = correct / total * 100
        print(f"Epoch {epoch + 1}/{EPOCHS} — Loss: {avg_loss:.4f} — Accuracy: {accuracy:.1f}%")

    # Save weights
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), SIAMESE_WEIGHTS)
    print(f"\nSiamese weights saved to {SIAMESE_WEIGHTS}")
    print("Training complete!")


if __name__ == "__main__":
    train()
