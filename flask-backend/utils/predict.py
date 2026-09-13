import torch
from utils.transforms import get_transform_for_model, process_image_bytes
from utils.disease import disease_dic
from utils.treatments import get_treatment_recommendation


def predict_disease_image(image_bytes, model, disease_classes, device=torch.device('cpu'), model_type="efficientnet_b0", min_confidence=15.0):
    """
    Executes pure neural network disease prediction on raw image bytes.
    Calculates authentic softmax probabilities directly from model logits without rule overrides.

    Args:
        image_bytes (bytes): Uploaded image payload bytes.
        model (nn.Module): Loaded PyTorch model instance in eval mode.
        disease_classes (list): List of disease class string names.
        device (torch.device): Inference device (CPU or GPU).
        model_type (str): "resnet9" or "efficientnet_b0".
        min_confidence (float): Minimum valid leaf confidence threshold percentage.

    Returns:
        dict: Pure model prediction metadata dictionary.
    """
    # 1. Image Preprocessing (RGB PIL Image conversion & model transform)
    image = process_image_bytes(image_bytes)
    transform = get_transform_for_model(model_type)
    img_t = transform(image)
    img_u = torch.unsqueeze(img_t, 0).to(device)

    # 2. Pure Model Inference
    model.eval()
    with torch.no_grad():
        logits = model(img_u)
        probabilities = torch.softmax(logits, dim=1)[0]
        k_val = min(5, len(disease_classes))
        top_probs, top_indices = torch.topk(probabilities, k=k_val)

    # 3. Direct Argmax Selection from Neural Network
    top_idx = top_indices[0].item()
    prediction_key = disease_classes[top_idx]
    confidence = float(top_probs[0].item() * 100)

    # Leaf image validation check
    if confidence < min_confidence:
        raise ValueError(f"Unable to identify a valid crop leaf in this image (confidence score: {confidence:.1f}%). Please upload a clear photo of a crop leaf.")

    # Debug Log
    top_3_summary = [
        f"{disease_classes[top_indices[i].item()]} ({float(top_probs[i].item()*100):.2f}%)"
        for i in range(min(3, len(top_indices)))
    ]
    print(f"[MODEL PREDICTION] Top-1: Index {top_idx} -> {prediction_key} ({confidence:.2f}%)", flush=True)
    print(f"[MODEL PREDICTION] Top-3: {', '.join(top_3_summary)}", flush=True)

    # 4. Format Structured Output Payload
    raw_info = disease_dic.get(prediction_key, {})
    disease_info = dict(raw_info)

    crop_name = disease_info.get("Crop", "")
    disease_name = disease_info.get("Disease", "")

    if isinstance(disease_name, list):
        disease_name = disease_name[0]

    if not crop_name or not disease_name:
        parts = prediction_key.split("___")
        crop_name = crop_name or parts[0].replace("_", " ")
        disease_name = disease_name or (parts[1].replace("_", " ") if len(parts) > 1 else "Healthy")

    disease_info["success"] = True
    disease_info["plant"] = crop_name
    disease_info["crop"] = crop_name
    disease_info["Crop"] = crop_name
    disease_info["disease"] = disease_name
    disease_info["Disease"] = disease_name
    disease_info["class_name"] = prediction_key
    disease_info["predicted_class_key"] = prediction_key
    disease_info["confidence"] = round(confidence, 2)
    disease_info["prediction_confidence"] = round(confidence, 2)
    disease_info["confidence_score"] = round(confidence, 2)
    disease_info["low_confidence_warning"] = (confidence < 50.0)

    # Treatment recommendation
    disease_info["treatment_recommendation"] = get_treatment_recommendation(
        crop_name,
        disease_name
    )

    # Top predictions list
    top_predictions = []
    for idx_t, prob_t in zip(top_indices, top_probs):
        cls_key = disease_classes[idx_t.item()]
        details = disease_dic.get(cls_key, {})
        d_crop = details.get("Crop", "")
        d_disease = details.get("Disease", "")
        if isinstance(d_disease, list):
            d_disease = d_disease[0]
        if not d_crop or not d_disease:
            parts = cls_key.split("___")
            d_crop = d_crop or parts[0].replace("_", " ")
            d_disease = d_disease or (parts[1].replace("_", " ") if len(parts) > 1 else "Healthy")

        top_predictions.append({
            "class_key": cls_key,
            "class_name": cls_key,
            "confidence": round(float(prob_t.item() * 100), 2),
            "crop": d_crop,
            "plant": d_crop,
            "disease": d_disease
        })

    disease_info["top_predictions"] = top_predictions
    return disease_info
