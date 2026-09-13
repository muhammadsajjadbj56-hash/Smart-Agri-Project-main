import os
import json
import io
import torch
import pandas as pd
from PIL import Image

from utils.disease import disease_dic
from utils.model import get_efficientnet_b0, load_disease_model
from utils.predict import predict_disease_image
from utils.transforms import train_transform, process_image_bytes


def run_verification():
    print("==================================================")
    print("        SMART AGRI VERIFICATION SUITE             ")
    print("==================================================")

    # 1. Verify classes.json
    classes_path = "classes.json"
    assert os.path.exists(classes_path), "classes.json does not exist!"
    with open(classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)
    print(f"[OK] Verification 1: classes.json loaded ({len(classes)} classes).")
    assert len(classes) == 78, f"Expected 78 classes, got {len(classes)}"

    # 2. Verify model loading & classifier head
    model, model_type, active_classes = load_disease_model(
        "models/plant_disease_model.pth",
        num_classes=len(classes),
        all_classes=classes,
        device=torch.device('cpu')
    )
    in_feat = model.classifier[1].in_features
    out_feat = model.classifier[1].out_features
    print(f"[OK] Verification 2: Trained EfficientNet-B0 loaded with in_features={in_feat}, out_features={out_feat}.")
    assert out_feat == 78, f"Expected 78 out_features, got {out_feat}"

    # Test dummy forward pass
    dummy_input = torch.randn(1, 3, 224, 224)
    logits = model(dummy_input)
    assert logits.shape == (1, 78), f"Expected output shape [1, 78], got {logits.shape}"

    # 3. Verify disease_dic completeness
    missing_keys = [c for c in classes if c not in disease_dic]
    print(f"[OK] Verification 3: disease_dic checked for all classes. Missing: {missing_keys}")
    assert len(missing_keys) == 0, f"Missing classes in disease_dic: {missing_keys}"

    # 4. Verify disease_info.csv and supplement_info.csv
    df_disease = pd.read_csv("disease_info.csv")
    df_supplement = pd.read_csv("supplement_info.csv")
    print(f"[OK] Verification 4: disease_info.csv ({len(df_disease)} rows), supplement_info.csv ({len(df_supplement)} rows).")
    assert len(df_disease) == 78, f"Expected 78 rows in disease_info.csv, got {len(df_disease)}"
    assert len(df_supplement) == 78, f"Expected 78 rows in supplement_info.csv, got {len(df_supplement)}"

    # 5. Verify low-confidence threshold (<70%) handling
    # Create random noise image (low confidence)
    noise_img = Image.new("RGB", (224, 224), (128, 128, 128))
    img_byte_arr = io.BytesIO()
    noise_img.save(img_byte_arr, format='JPEG')
    noise_bytes = img_byte_arr.getvalue()

    low_conf_caught = False
    try:
        res = predict_disease_image(noise_bytes, model, classes, device=torch.device('cpu'), model_type=model_type)
        print(f"[*] Noise image prediction result: {res.get('plant')} ({res.get('confidence')}%)")
        if res.get("confidence", 0) < 70.0:
            low_conf_caught = True
    except ValueError as ve:
        if "Unable to identify" in str(ve) or "Unable to confidently identify" in str(ve):
            low_conf_caught = True
            print(f"[OK] Verification 5: Low confidence properly caught and error raised: '{ve}'")

    assert low_conf_caught, "Expected low-confidence error or low score was not achieved for noise image!"

    print("\n==================================================")
    print("       ALL 5 VERIFICATIONS PASSED SUCCESSFULLY!   ")
    print("==================================================")


if __name__ == "__main__":
    run_verification()
