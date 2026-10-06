"""
Derma Assist - PyTorch Deep Vision Training & Checkpoint Exporter
Trains the authentic DermaDeepVisionNet on clinical dataset splits
and saves real PyTorch weights to backend/models/derma_model.pth.
"""

import sys
import time
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from backend.config import BASE_DIR, DATA_DIR, CLASSES, MODEL_DIR
from backend.models.deep_vision import DermaDeepVisionNet, preprocess_pil_to_tensor

CLASS_MAP = {
    "acne": "acne_rosacea",
    "acne_rosacea": "acne_rosacea",
    "benign_nevi": "benign_nevi",
    "contact_dermatitis": "contact_dermatitis",
    "eczema": "eczema",
    "fungal": "fungal_infections",
    "fungal_infections": "fungal_infections",
    "melanoma": "melanoma_suspicious",
    "melanoma_suspicious": "melanoma_suspicious",
    "psoriasis": "psoriasis",
    "viral": "viral_eruptions",
    "viral_eruptions": "viral_eruptions"
}

class DermaDataset(Dataset):
    def __init__(self, root_dir: Path):
        self.samples = []
        for folder in root_dir.iterdir():
            if folder.is_dir():
                target_cls = CLASS_MAP.get(folder.name)
                if target_cls and target_cls in CLASSES:
                    label = CLASSES.index(target_cls)
                    for img_p in folder.glob("*.*"):
                        if img_p.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                            self.samples.append((img_p, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")
        tensor = preprocess_pil_to_tensor(img).squeeze(0)
        return tensor, torch.tensor(label, dtype=torch.long)

def train_and_export(epochs: int = 6, batch_size: int = 16, lr: float = 1e-3):
    print("=" * 60)
    print("Training Authentic PyTorch Deep Vision Network...")
    print("=" * 60)
    
    train_dir = DATA_DIR / "train"
    val_dir = DATA_DIR / "val"
    
    train_dataset = DermaDataset(train_dir)
    val_dataset = DermaDataset(val_dir)
    print(f"Loaded {len(train_dataset)} training samples and {len(val_dataset)} validation samples.")
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    model = DermaDeepVisionNet(num_classes=len(CLASSES)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    
    best_val_acc = 0.0
    save_path = MODEL_DIR / "derma_model.pth"
    
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss, correct, total = 0.0, 0, 0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item() * x.size(0)
            preds = logits.argmax(dim=1)
            correct += (preds == y).sum().item()
            total += x.size(0)
            
        train_loss = total_loss / total
        train_acc = (correct / total) * 100.0
        
        # Validation
        model.eval()
        val_correct, val_total = 0, 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                logits = model(x)
                preds = logits.argmax(dim=1)
                val_correct += (preds == y).sum().item()
                val_total += x.size(0)
                
        val_acc = (val_correct / max(1, val_total)) * 100.0
        print(f"Epoch [{epoch:02d}/{epochs:02d}] - Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | Val Acc: {val_acc:.2f}%")
        
    # Save authentic PyTorch model checkpoint bundle
    checkpoint = {
        "model_architecture": "DermaDeepVisionNet",
        "num_classes": len(CLASSES),
        "classes": CLASSES,
        "state_dict": model.state_dict(),
        "final_train_acc": round(train_acc, 2),
        "final_val_acc": round(val_acc, 2),
        "timestamp": time.time()
    }
    torch.save(checkpoint, save_path)
    print(f"\n[SUCCESS] Authentic PyTorch weights successfully saved to: {save_path}")
    print("=" * 60)

if __name__ == "__main__":
    train_and_export()
