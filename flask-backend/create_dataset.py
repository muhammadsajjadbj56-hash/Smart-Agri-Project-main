import os
import json
from PIL import Image

CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Banana___Black_Sigatoka",
    "Banana___Cordana_Leaf_Spot",
    "Banana___Healthy",
    "Banana___Panama_Disease",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Chili___Anthracnose",
    "Chili___Bacterial_Spot",
    "Chili___Healthy",
    "Chili___Leaf_Curl_Virus",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Cotton___Bacterial_Blight",
    "Cotton___Fusarium_Wilt",
    "Cotton___Healthy",
    "Cotton___Leaf_Curl_Virus",
    "Cucumber___Anthracnose",
    "Cucumber___Downy_Mildew",
    "Cucumber___Healthy",
    "Cucumber___Powdery_Mildew",
    "Garlic___Healthy",
    "Garlic___Purple_Blotch",
    "Garlic___Rust",
    "Garlic___White_Rot",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Mango___Anthracnose",
    "Mango___Bacterial_Canker",
    "Mango___Healthy",
    "Mango___Powdery_Mildew",
    "Okra___Healthy",
    "Okra___Leaf_Spot",
    "Okra___Powdery_Mildew",
    "Okra___Yellow_Vein_Mosaic",
    "Onion___Downy_Mildew",
    "Onion___Healthy",
    "Onion___Purple_Blotch",
    "Onion___Stemphylium_Blight",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Rice___Bacterial_Leaf_Blight",
    "Rice___Blast",
    "Rice___Brown_Spot",
    "Rice___Healthy",
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
    "Tomato___healthy",
    "Wheat___Healthy",
    "Wheat___Loose_Smut",
    "Wheat___Powdery_Mildew",
    "Wheat___Rust"
]


def init_dataset(base_dir="dataset/plantvillage"):
    """
    Creates dataset folder structure following PyTorch ImageFolder convention
    for all 78 plant disease classes. Generates sample placeholder images.
    """
    sorted_classes = sorted(CLASSES)
    print(f"[*] Initializing dataset for {len(sorted_classes)} classes at '{base_dir}'...")

    for cls in sorted_classes:
        class_path = os.path.join(base_dir, cls)
        os.makedirs(class_path, exist_ok=True)

        # Create a dummy image in each folder if empty so PyTorch ImageFolder can load it
        existing_files = [f for f in os.listdir(class_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if not existing_files:
            img = Image.new("RGB", (224, 224), color=(34, 139, 34))
            dummy_file = os.path.join(class_path, "sample_1.jpg")
            img.save(dummy_file)

    # Export classes.json into root and models directory
    json_paths = ["classes.json", "models/classes.json"]
    for path in json_paths:
        dir_name = os.path.dirname(path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(sorted_classes, f, indent=2)
        print(f"[+] Saved class list to '{path}' ({len(sorted_classes)} classes)")

    print("[OK] Dataset initialization complete!")


if __name__ == "__main__":
    init_dataset()
