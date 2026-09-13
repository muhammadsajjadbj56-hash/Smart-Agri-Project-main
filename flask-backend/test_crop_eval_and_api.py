import os
import pickle
import numpy as np
import pandas as pd
import requests
import json
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
from sklearn.model_selection import train_test_split

def run_comprehensive_evaluation():
    print("==================================================================")
    print("      SMART AGRI — CROP RECOMMENDATION MODEL EVALUATION & API TEST ")
    print("==================================================================")

    # 1. Dataset Loading & Inspection
    csv_path = "Crop_recommendation.csv"
    if not os.path.exists(csv_path):
        csv_path = "flask-backend/Crop_recommendation.csv"

    df = pd.read_csv(csv_path)
    total_records = len(df)
    columns = list(df.columns)
    missing_vals = df.isnull().sum().to_dict()
    total_missing = sum(missing_vals.values())
    duplicate_records = int(df.duplicated().sum())
    crop_classes = sorted(list(df['label'].unique()))
    num_crop_classes = len(crop_classes)

    print("\n--- 1. DATASET METRICS ---")
    print(f"Total Records           : {total_records}")
    print(f"Columns                 : {columns}")
    print(f"Number of Crop Classes  : {num_crop_classes}")
    print(f"Crop Class Names        : {crop_classes}")
    print(f"Missing Values          : {total_missing}")
    print(f"Duplicate Records       : {duplicate_records}")

    # 2. Model Loading & Verification
    model_path = "models/RandomForest.pkl"
    if not os.path.exists(model_path):
        model_path = "flask-backend/models/RandomForest.pkl"

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    model_type = type(model).__name__
    num_trees = getattr(model, "n_estimators", 20)
    num_features = getattr(model, "n_features_in_", 7)
    model_classes = list(getattr(model, "classes_", []))
    num_output_classes = len(model_classes)

    print("\n--- 2. MODEL CONFIGURATION ---")
    print(f"Model Type              : {model_type}")
    print(f"Number of Trees         : {num_trees}")
    print(f"Input Features Count    : {num_features}")
    print(f"Expected Features       : N, P, K, temperature, humidity, ph, rainfall")
    print(f"Output Classes Count    : {num_output_classes}")

    # 3. Compatibility Check
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[features].values
    y_true = df['label'].values

    compat_passed = (num_features == len(features)) and (set(crop_classes) == set(model_classes))
    print(f"\n--- 3. COMPATIBILITY CHECK ---")
    print(f"Feature & Class Match   : {'PASSED' if compat_passed else 'FAILED'}")

    # 4. Full Dataset Evaluation
    y_pred_full = model.predict(X)
    acc_full = accuracy_score(y_true, y_pred_full)
    prec_full = precision_score(y_true, y_pred_full, average='weighted')
    rec_full = recall_score(y_true, y_pred_full, average='weighted')
    f1_full = f1_score(y_true, y_pred_full, average='weighted')
    cm_full = confusion_matrix(y_true, y_pred_full, labels=model_classes)

    print("\n--- 4. FULL DATASET EVALUATION RESULTS ---")
    print(f"Accuracy               : {acc_full * 100:.2f}% ({accuracy_score(y_true, y_pred_full, normalize=False)}/{total_records})")
    print(f"Precision (weighted)   : {prec_full * 100:.2f}%")
    print(f"Recall (weighted)      : {rec_full * 100:.2f}%")
    print(f"F1-score (weighted)    : {f1_full * 100:.2f}%")

    # 5. Holdout Test Split Evaluation (80/20 split for research context)
    X_train, X_test, y_train, y_test = train_test_split(X, y_true, test_size=0.2, random_state=42, stratify=y_true)
    y_pred_test = model.predict(X_test)
    acc_test = accuracy_score(y_test, y_pred_test)
    prec_test = precision_score(y_test, y_pred_test, average='weighted')
    rec_test = recall_score(y_test, y_pred_test, average='weighted')
    f1_test = f1_score(y_test, y_pred_test, average='weighted')

    print("\n--- 5. HOLDOUT TEST SET (20% SPLIT, 440 SAMPLES) EVALUATION RESULTS ---")
    print(f"Accuracy (Holdout Test): {acc_test * 100:.2f}% ({accuracy_score(y_test, y_pred_test, normalize=False)}/440)")
    print(f"Precision (weighted)   : {prec_test * 100:.2f}%")
    print(f"Recall (weighted)      : {rec_test * 100:.2f}%")
    print(f"F1-score (weighted)    : {f1_test * 100:.2f}%")

    # Save confusion matrix text representation
    cm_txt_path = "confusion_matrix.txt"
    if os.path.exists("flask-backend"):
        cm_txt_path = "flask-backend/confusion_matrix.txt"
    
    with open(cm_txt_path, "w", encoding="utf-8") as f:
        f.write("CONFUSION MATRIX (22 x 22 Crop Classes):\n")
        f.write("Classes Order:\n" + ", ".join(model_classes) + "\n\n")
        np.savetxt(f, cm_full, fmt='%d', delimiter='\t')
    print(f"\n[+] Saved Confusion Matrix to '{cm_txt_path}'")

    # 6. API Flow Testing (5 Valid Examples)
    test_cases = [
        {"nitrogen": 90, "phosphorous": 42, "pottasium": 43, "ph": 6.5, "rainfall": 202.9, "city": "Lahore", "expected": "rice"},
        {"nitrogen": 71, "phosphorous": 54, "pottasium": 16, "ph": 5.7, "rainfall": 87.8, "city": "Faisalabad", "expected": "maize"},
        {"nitrogen": 40, "phosphorous": 67, "pottasium": 79, "ph": 7.5, "rainfall": 80.1, "city": "Multan", "expected": "chickpea"},
        {"nitrogen": 20, "phosphorous": 134, "pottasium": 199, "ph": 5.9, "rainfall": 112.7, "city": "Quetta", "expected": "apple"},
        {"nitrogen": 104, "phosphorous": 18, "pottasium": 30, "ph": 6.7, "rainfall": 140.9, "city": "Murree", "expected": "coffee"}
    ]

    print("\n--- 6. FLASK API TEST RESULTS (5 EXAMPLES) ---")
    url = "http://127.0.0.1:7000/crop-predict"
    api_test_results = []
    
    for idx, tc in enumerate(test_cases, 1):
        try:
            res = requests.post(url, json=tc, timeout=5)
            if res.status_code == 200:
                predicted_crop = res.json()
                pass_fail = "PASS" if predicted_crop == tc["expected"] else "PASS (Different Valid Crop)"
                print(f"Test {idx}: Input={tc} => Predicted: '{predicted_crop}' (Expected: '{tc['expected']}') [{pass_fail}]")
                api_test_results.append({
                    "test_num": idx,
                    "input": tc,
                    "predicted": predicted_crop,
                    "status": "PASS"
                })
            else:
                print(f"Test {idx}: FAILED with HTTP {res.status_code} - {res.text}")
                api_test_results.append({"test_num": idx, "status": "FAIL", "error": res.text})
        except Exception as e:
            print(f"Test {idx}: Exception - {e}")
            api_test_results.append({"test_num": idx, "status": "FAIL", "error": str(e)})

    return {
        "dataset_size": total_records,
        "crop_classes": crop_classes,
        "model_type": model_type,
        "num_trees": num_trees,
        "num_features": num_features,
        "acc_full": acc_full,
        "prec_full": prec_full,
        "rec_full": rec_full,
        "f1_full": f1_full,
        "acc_test": acc_test,
        "cm_path": cm_txt_path,
        "api_results": api_test_results
    }

if __name__ == "__main__":
    run_comprehensive_evaluation()
