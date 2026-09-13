import io
from PIL import Image
from torchvision import transforms

# EfficientNet-B0 standard ImageNet normalization parameters
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Legacy ResNet9 transform
resnet_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.ToTensor(),
])

# EfficientNet-B0 inference transform
efficientnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

# Default inference transform
disease_transform = efficientnet_transform

# Training transformations optimized for fast transfer learning
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

# Validation transformations
val_transform = efficientnet_transform


def get_transform_for_model(model_type="efficientnet_b0"):
    """
    Returns appropriate preprocessing transform pipeline for the loaded model architecture.
    """
    if model_type == "resnet9":
        return resnet_transform
    return efficientnet_transform


def process_image_bytes(image_bytes):
    """
    Validates and converts image bytes (JPG, JPEG, PNG, mobile camera images) to PIL RGB format.
    """
    if not image_bytes:
        raise ValueError("Empty image file provided.")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")
        return image
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image file: {str(e)}")
