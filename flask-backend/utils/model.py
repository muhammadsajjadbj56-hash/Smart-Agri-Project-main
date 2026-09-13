import os
import json
import torch
import torch.nn as nn
from torchvision import models


def ConvBlock(in_channels, out_channels, pool=False):
    layers = [
        nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
        nn.BatchNorm2d(out_channels),
        nn.ReLU(inplace=True)
    ]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)


class ResNet9(nn.Module):
    """Legacy ResNet9 model architecture."""
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))

        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))

        self.classifier = nn.Sequential(
            nn.MaxPool2d(4),
            nn.Flatten(),
            nn.Linear(512, num_diseases)
        )

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out


def get_efficientnet_b0(num_classes=78, pretrained=True, dropout=0.2):
    """
    Creates and returns an EfficientNet-B0 model for plant disease classification.
    Automatically replaces the classifier head based on num_classes.
    """
    try:
        if pretrained:
            weights = models.EfficientNet_B0_Weights.DEFAULT
            model = models.efficientnet_b0(weights=weights)
        else:
            model = models.efficientnet_b0(weights=None)
    except AttributeError:
        model = models.efficientnet_b0(pretrained=pretrained)

    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    if dropout > 0:
        model.classifier[0] = nn.Dropout(p=dropout, inplace=True)

    return model


ORIGINAL_38_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]


def load_disease_classes_registry():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = [
        os.path.join(base_dir, 'classes.json'),
        os.path.join(base_dir, 'models', 'classes.json'),
        'classes.json',
        'models/classes.json'
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    cls = json.load(f)
                    if cls:
                        print(f"[*] load_disease_classes_registry: Loaded {len(cls)} classes from '{p}'", flush=True)
                        return cls
            except Exception as e:
                print(f"[!] load_disease_classes_registry error loading '{p}': {e}", flush=True)
    print(f"[!] load_disease_classes_registry: Fallback to ORIGINAL_38_CLASSES ({len(ORIGINAL_38_CLASSES)})", flush=True)
    return ORIGINAL_38_CLASSES


def load_disease_model(model_path, num_classes=78, all_classes=None, device=torch.device('cpu')):
    """
    Smart auto-detecting model loader.
    Detects model architecture and number of output classes from checkpoint if available,
    instantiates the matching architecture, and returns the model alongside the matching class list.

    Returns:
        tuple: (model, model_type, active_classes)
    """
    if all_classes is None:
        all_classes = load_disease_classes_registry()

    if not os.path.exists(model_path):
        print(f"[*] Checkpoint '{model_path}' not found. Initializing EfficientNet-B0 with ImageNet weights (classes: {num_classes}).")
        model = get_efficientnet_b0(num_classes=num_classes, pretrained=True)
        return model.to(device), "efficientnet_b0", all_classes

    try:
        state_dict = torch.load(model_path, map_location=device)
        keys = list(state_dict.keys())

        # Auto-detect number of classes from state_dict if possible
        ckpt_num_classes = num_classes
        if "classifier.1.weight" in state_dict:
            ckpt_num_classes = state_dict["classifier.1.weight"].shape[0]
            print(f"[*] Detected {ckpt_num_classes} classes from EfficientNet-B0 checkpoint state dict.")
        elif "classifier.2.weight" in state_dict:
            ckpt_num_classes = state_dict["classifier.2.weight"].shape[0]

        # Match class order based on detected class count
        if ckpt_num_classes == 38:
            active_classes = ORIGINAL_38_CLASSES
            print("[*] Checkpoint has 38 output classes. Using original 38-class mapping.")
        else:
            active_classes = all_classes
            print(f"[*] Checkpoint has {ckpt_num_classes} output classes. Using loaded class registry ({len(all_classes)} classes).")

        # Check if state dict belongs to ResNet9
        if any("conv1.0.weight" in k for k in keys):
            print(f"[*] Auto-detected trained ResNet9 checkpoint ({ckpt_num_classes} classes). Loading ResNet9 model.")
            model = ResNet9(3, ckpt_num_classes)
            model.load_state_dict(state_dict)
            return model.to(device), "resnet9", active_classes

        # Otherwise assume EfficientNet-B0
        print(f"[*] Auto-detected EfficientNet-B0 checkpoint ({ckpt_num_classes} classes). Loading EfficientNet-B0 model.")
        model = get_efficientnet_b0(num_classes=ckpt_num_classes, pretrained=False)
        model.load_state_dict(state_dict)
        return model.to(device), "efficientnet_b0", active_classes

    except Exception as e:
        print(f"[!] Warning: Could not load state dict ({str(e)}). Falling back to EfficientNet-B0 ImageNet pretrained.")
        model = get_efficientnet_b0(num_classes=num_classes, pretrained=True)
        return model.to(device), "efficientnet_b0", all_classes