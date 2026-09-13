import os
import pandas as pd
from utils.disease import disease_dic


def generate_csv_files():
    disease_info_rows = []
    supplement_info_rows = []

    for idx, (class_name, info) in enumerate(disease_dic.items()):
        crop = info.get("Crop", "")
        disease_raw = info.get("Disease", "")
        if isinstance(disease_raw, list):
            disease = " ".join(disease_raw)
        else:
            disease = str(disease_raw or "")

        cause = info.get("Cause", "")
        if isinstance(cause, list):
            cause_str = " ".join(cause)
        else:
            cause_str = str(cause or "")

        prevent = info.get("Prevent_Cure", "")
        if isinstance(prevent, list):
            prevent_str = " ".join(prevent)
        else:
            prevent_str = str(prevent or "")

        disease_info_rows.append({
            "id": idx,
            "class_name": class_name,
            "crop": crop,
            "disease_name": disease,
            "cause": cause_str,
            "prevent_cure": prevent_str
        })

        supplement_name = f"{crop} Care & Protection Supplement"
        if "healthy" in disease.lower() or "no disease" in disease.lower():
            supplement_name = f"{crop} Health Booster"

        supplement_info_rows.append({
            "id": idx,
            "class_name": class_name,
            "crop": crop,
            "disease_name": disease,
            "supplement_name": supplement_name,
            "supplement_image": "https://www.kissanghar.pk/products?category=Pesticides",
            "buy_link": f"https://www.kissanghar.pk/products?category=Pesticides&search={crop}+{disease}+pesticide"
        })

    df_disease = pd.DataFrame(disease_info_rows)
    df_disease.to_csv("disease_info.csv", index=False)
    print(f"[+] Saved 'disease_info.csv' with {len(df_disease)} entries.")

    df_supplement = pd.DataFrame(supplement_info_rows)
    df_supplement.to_csv("supplement_info.csv", index=False)
    print(f"[+] Saved 'supplement_info.csv' with {len(df_supplement)} entries.")


if __name__ == "__main__":
    generate_csv_files()
