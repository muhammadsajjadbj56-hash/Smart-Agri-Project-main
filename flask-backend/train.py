import os
import json
import argparse
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision.datasets import ImageFolder

from utils.model import get_efficientnet_b0
from utils.transforms import train_transform, val_transform


def save_classes_json(classes, class_to_idx=None, output_paths=["classes.json", "models/classes.json"]):
    """Saves class names list and class_to_idx mapping to JSON files for dynamic loading by Flask API."""
    for path in output_paths:
        dir_name = os.path.dirname(path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(classes, f, indent=2)
        print(f"[+] Saved class registry to '{path}' ({len(classes)} classes)")

    if class_to_idx is not None:
        idx_paths = ["class_to_idx.json", "models/class_to_idx.json"]
        for path in idx_paths:
            dir_name = os.path.dirname(path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(class_to_idx, f, indent=2)
            print(f"[+] Saved class_to_idx mapping to '{path}'")


def train_model(data_dir, output_model_path, epochs=10, batch_size=32, lr=1e-3, val_split=0.2, patience=5):
    """
    Trains EfficientNet-B0 on PlantVillage dataset using ImageFolder, transfer learning,
    mixed precision training (if CUDA available), and early stopping.
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    use_amp = torch.cuda.is_available()
    print(f"[*] Training EfficientNet-B0 using device: {device} (Mixed Precision: {use_amp})")

    if not os.path.exists(data_dir):
        print(f"[!] Error: Dataset directory '{data_dir}' not found.")
        return

    # 1. Load full dataset using ImageFolder
    full_dataset = ImageFolder(data_dir, transform=train_transform)
    classes = full_dataset.classes
    class_to_idx = full_dataset.class_to_idx
    num_classes = len(classes)
    print(f"[*] Found {len(full_dataset)} images across {num_classes} classes.")

    # Save classes.json and class_to_idx.json dynamically
    save_classes_json(classes, class_to_idx=class_to_idx)

    # 2. Split dataset into train and validation sets
    val_size = int(len(full_dataset) * val_split)
    train_size = len(full_dataset) - val_size
    train_ds, val_ds = random_split(full_dataset, [train_size, val_size])

    # Apply validation transforms to validation set
    val_ds.dataset.transform = val_transform

    num_workers = 2 if os.name != 'nt' else 0
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)

    # 3. Instantiate model, loss, optimizer, scaler, and scheduler
    model = get_efficientnet_b0(num_classes=num_classes, pretrained=True).to(device)

    # Freeze lower feature blocks (0..4), fine-tune high-level feature blocks (5..8) and classifier
    for param in model.features[:5].parameters():
        param.requires_grad = False

    optimizer = torch.optim.AdamW([
        {'params': model.features[5:].parameters(), 'lr': 1e-4},
        {'params': model.classifier.parameters(), 'lr': 1e-3}
    ], weight_decay=1e-4)

    criterion = nn.CrossEntropyLoss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = torch.cuda.amp.GradScaler(enabled=use_amp)

    # 4. Training loop with early stopping & best model tracking
    best_acc = 0.0
    patience_counter = 0

    print("\n--- Starting Training ---")
    start_time = time.time()

    for epoch in range(epochs):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            with torch.cuda.amp.autocast(enabled=use_amp):
                outputs = model(images)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data)
            total_train += labels.size(0)

        scheduler.step()

        epoch_train_loss = running_loss / max(1, total_train)
        epoch_train_acc = (correct_train.double() / max(1, total_train)).item() * 100

        # Validation Phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                with torch.cuda.amp.autocast(enabled=use_amp):
                    outputs = model(images)
                    loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels.data)
                total_val += labels.size(0)

        epoch_val_loss = val_loss / max(1, total_val)
        epoch_val_acc = (correct_val.double() / max(1, total_val)).item() * 100

        print(f"Epoch [{epoch + 1}/{epochs}] | "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%", flush=True)

        # Save Best Model Checkpoint
        if epoch_val_acc > best_acc:
            best_acc = epoch_val_acc
            patience_counter = 0
            os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
            torch.save(model.state_dict(), output_model_path)
            print(f"  [+] Saved new best model checkpoint to '{output_model_path}' (Val Acc: {best_acc:.2f}%)", flush=True)
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"[!] Early stopping triggered after {epoch + 1} epochs.")
                break

    total_time = time.time() - start_time
    print(f"\n[OK] Training complete in {total_time // 60:.0f}m {total_time % 60:.0f}s. Best Val Accuracy: {best_acc:.2f}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train EfficientNet-B0 on Plant Disease Dataset.")
    parser.add_argument("--data_dir", type=str, default="dataset/plantvillage", help="Path to dataset root folder.")
    parser.add_argument("--output_model", type=str, default="models/plant_disease_model.pth", help="Output .pth model path.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs.")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size.")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate.")
    parser.add_argument("--patience", type=int, default=5, help="Early stopping patience.")

    args = parser.parse_args()
    train_model(args.data_dir, args.output_model, args.epochs, args.batch_size, args.lr, patience=args.patience)

