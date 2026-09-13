import os
import sys
import json
import argparse
import torch
from PIL import Image

from utils.model import load_disease_model
from utils.predict import predict_disease_image


def test_single_image(image_path, model, classes, device, model_type):
    """Executes prediction pipeline on a single image file."""
    if not os.path.exists(image_path):
        print(f"[!] File not found: {image_path}")
        return None

    with open(image_path, "rb") as f:
        img_bytes = f.read()

    try:
        result = predict_disease_image(
            img_bytes,
            model,
            classes,
            device=device,
            model_type=model_type
        )
        return result
    except ValueError as ve:
        return {"error": str(ve)}
    except Exception as e:
        return {"error": f"Inference failed: {str(e)}"}


def run_generic_test(image_path=None, dir_path=None):
    """
    Generic Plant Disease Inference Test Utility.
    Works for any crop/leaf image (Grape, Potato, Banana, Tomato, Apple, Rice, Wheat, etc.)
    """
    print("==================================================")
    print("      GENERIC PLANT DISEASE DETECTION TEST       ")
    print("==================================================")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "plant_disease_model.pth")
    classes_path = os.path.join(base_dir, "classes.json")

    if not os.path.exists(classes_path):
        print(f"[!] Missing class registry: {classes_path}")
        sys.exit(1)

    with open(classes_path, "r", encoding="utf-8") as f:
        disease_classes = json.load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Inference Device : {device}")
    print(f"[*] Class Registry   : {len(disease_classes)} classes loaded")

    model, model_type, active_classes = load_disease_model(
        model_path,
        num_classes=len(disease_classes),
        all_classes=disease_classes,
        device=device
    )
    model.eval()

    # Collect target files
    targets = []
    if image_path:
        targets.append(image_path)
    elif dir_path and os.path.exists(dir_path):
        valid_exts = (".jpg", ".jpeg", ".png", ".bmp", ".webp")
        for root, _, files in os.walk(dir_path):
            for f in files:
                if f.lower().endswith(valid_exts):
                    targets.append(os.path.join(root, f))
    else:
        # Default test directory
        default_dir = r"C:\Users\muhammad sajjad\Desktop\test_images"
        if os.path.exists(default_dir):
            valid_exts = (".jpg", ".jpeg", ".png", ".bmp", ".webp")
            for f in os.listdir(default_dir):
                if f.lower().endswith(valid_exts):
                    targets.append(os.path.join(default_dir, f))

    if not targets:
        print("[!] No image files found to test.")
        return

    print(f"[*] Found {len(targets)} image(s) to evaluate.\n")

    success_count = 0
    for idx, target in enumerate(targets, 1):
        fname = os.path.basename(target)
        res = test_single_image(target, model, active_classes, device, model_type)

        print(f"[{idx}/{len(targets)}] Image: {fname}")
        if not res or "error" in res:
            print(f"    Status : REJECTED / ERROR ({res.get('error') if res else 'Unknown'})")
        else:
            success_count += 1
            crop = res.get("crop") or res.get("plant")
            disease = res.get("disease")
            confidence = res.get("confidence") or res.get("prediction_confidence")
            top3 = res.get("top_predictions", [])[:3]

            print(f"    Crop       : {crop}")
            print(f"    Disease    : {disease}")
            print(f"    Confidence : {confidence}%")
            print("    Top Predictions:")
            for rank, tp in enumerate(top3, 1):
                print(f"      {rank}. {tp.get('crop')} — {tp.get('disease')} ({tp.get('confidence')}%)")
        print("-" * 50)

    print(f"\n[OK] Tested {len(targets)} images. Successfully evaluated: {success_count}/{len(targets)}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generic Plant Disease Detection Inference Test")
    parser.add_argument("--image", type=str, default=None, help="Path to single crop leaf image file.")
    parser.add_argument("--dir", type=str, default=None, help="Path to directory containing leaf images.")

    args = parser.parse_args()
    run_generic_test(image_path=args.image, dir_path=args.dir)
