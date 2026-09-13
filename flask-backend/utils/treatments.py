import json
from pathlib import Path
from urllib.parse import quote

_BASE_DIR = Path(__file__).resolve().parent
_TREATMENTS_PATH = _BASE_DIR / "treatments.json"

with _TREATMENTS_PATH.open("r", encoding="utf-8") as f:
    _TREATMENT_DATA = json.load(f)

KISSAN_GHAR_PESTICIDES_URL = _TREATMENT_DATA.get(
    "kissan_ghar_pesticides_url",
    "https://www.kissanghar.pk/products?category=Pesticides",
)
TREATMENT_CATALOG = _TREATMENT_DATA.get("catalog", [])
DEFAULT_TREATMENT = _TREATMENT_DATA.get("default", {})


def _to_text(value):
    if isinstance(value, list):
        return " ".join(str(item) for item in value)
    return str(value or "")


def get_treatment_recommendation(crop, disease):
    disease_text = _to_text(disease).lower()
    selected = None

    for item in TREATMENT_CATALOG:
        if any(keyword in disease_text for keyword in item["keywords"]):
            selected = item
            break

    is_plant_specific = selected is not None
    treatment = selected or DEFAULT_TREATMENT or {
        "title": "Plant Protection Supplement",
        "description": "Select crop-safe pesticide/medicine from Kissan Ghar and follow product instructions.",
        "image": "",
        "product_name": "Pesticides Collection",
        "active_ingredient": "As per selected product",
    }
    search_query = quote(f"{crop or 'plant'} {disease or 'disease'} pesticide")

    return {
        "title": treatment["title"],
        "description": treatment["description"],
        "image": treatment["image"],
        "kissan_link": KISSAN_GHAR_PESTICIDES_URL,
        "kissan_search_link": f"{KISSAN_GHAR_PESTICIDES_URL}&search={search_query}",
        "product_name": treatment["product_name"],
        "active_ingredient": treatment["active_ingredient"],
        "is_plant_specific": is_plant_specific,
    }
