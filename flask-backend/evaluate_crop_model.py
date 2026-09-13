import os
import pickle
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def evaluate_crop_model(csv_path="Crop_recommendation.csv", model_path="models/RandomForest.pkl"):
    print("=" * 60)
    print("        SMART AGRI — CROP RECOMMENDATION EVALUATION       ")
    print("=" * 60)
    
    # 1. Load Model
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    print(f"[*] Model Loaded: {type(model).__name__}")
    n_estimators = getattr(model, "n_estimators", "N/A")
    n_features = getattr(model, "n_features_in_", 7)
    model_classes = list(getattr(model, "classes_", []))
    print(f"[*] Number of Trees (n_estimators): {n_estimators}")
    print(f"[*] Number of Input Features: {n_features}")
    print(f"[*] Number of Target Classes in Model: {len(model_classes)}")
    
    # 2. Load Dataset
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at: {csv_path}")
        
    df = pd.read_csv(csv_path)
    print(f"\n[*] Dataset Loaded: '{csv_path}'")
    print(f"[*] Rows (Samples): {len(df)}")
    print(f"[*] Columns ({len(df.columns)}): {list(df.columns)}")
    print(f"[*] Missing Values: {df.isnull().sum().sum()}")
    print(f"[*] Duplicate Rows: {df.duplicated().sum()}")
    
    dataset_classes = sorted(list(df['label'].unique()))
    print(f"[*] Dataset Crop Classes ({len(dataset_classes)}): {dataset_classes}")
    
    # 3. Compatibility Check
    expected_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    missing_cols = [col for col in expected_features if col not in df.columns]
    if missing_cols:
        raise ValueError(f"[!] Compatibility Error: Missing columns in dataset: {missing_cols}")
        
    unexpected_classes = set(dataset_classes) - set(model_classes)
    if unexpected_classes:
        print(f"[!] Warning: Dataset contains unexpected crop classes not in model: {unexpected_classes}")
    else:
        print("[+] Compatibility Check: PASSED (Features and crop classes match model perfectly)")
        
    # 4. Evaluation
    X = df[expected_features].values
    y_true = df['label'].values
    
    y_pred = model.predict(X)
    
    acc = accuracy_score(y_true, y_pred)
    prec_weighted = precision_score(y_true, y_pred, average='weighted')
    rec_weighted = recall_score(y_true, y_pred, average='weighted')
    f1_weighted = f1_score(y_true, y_pred, average='weighted')
    
    prec_macro = precision_score(y_true, y_pred, average='macro')
    rec_macro = recall_score(y_true, y_pred, average='macro')
    f1_macro = f1_score(y_true, y_pred, average='macro')
    
    cm = confusion_matrix(y_true, y_pred, labels=model_classes)
    
    print("\n" + "=" * 60)
    print("                    EVALUATION RESULTS                    ")
    print("=" * 60)
    print(f"Accuracy         : {acc * 100:.2f}% ({accuracy_score(y_true, y_pred, normalize=False)} / {len(y_true)})")
    print(f"Precision (macro): {prec_macro * 100:.2f}% | (weighted): {prec_weighted * 100:.2f}%")
    print(f"Recall (macro)   : {rec_macro * 100:.2f}% | (weighted): {rec_weighted * 100:.2f}%")
    print(f"F1-score (macro) : {f1_macro * 100:.2f}% | (weighted): {f1_weighted * 100:.2f}%")
    print("=" * 60)
    
    print("\nDetailed Classification Report:")
    print(classification_report(y_true, y_pred, digits=4))
    
    return {
        "accuracy": acc,
        "precision_weighted": prec_weighted,
        "recall_weighted": rec_weighted,
        "f1_weighted": f1_weighted,
        "confusion_matrix": cm
    }

if __name__ == "__main__":
    # Script can be executed from flask-backend directory
    csv_path = "Crop_recommendation.csv"
    if not os.path.exists(csv_path) and os.path.exists("flask-backend/Crop_recommendation.csv"):
        csv_path = "flask-backend/Crop_recommendation.csv"
    
    model_path = "models/RandomForest.pkl"
    if not os.path.exists(model_path) and os.path.exists("flask-backend/models/RandomForest.pkl"):
        model_path = "flask-backend/models/RandomForest.pkl"
        
    evaluate_crop_model(csv_path=csv_path, model_path=model_path)
