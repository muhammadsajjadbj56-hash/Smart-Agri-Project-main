from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
import numpy as np
import pandas as pd
from utils.disease import disease_dic
import requests
import pickle
import io
import config
import torch
from torchvision import transforms
from PIL import Image
from utils.model import get_efficientnet_b0, load_disease_model
from utils.predict import predict_disease_image
from utils.treatments import get_treatment_recommendation

import os
import json

def load_disease_classes():
    paths = ['classes.json', 'models/classes.json']
    for p in paths:
        if os.path.exists(p):
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    classes = json.load(f)
                    if classes:
                        print(f"[*] Dynamically loaded {len(classes)} disease classes from '{p}'.")
                        return classes
            except Exception as e:
                print(f"[!] Warning reading '{p}': {e}")
    # Fallback to disease_dic keys
    fallback = sorted(list(disease_dic.keys()))
    print(f"[*] Fallback: loaded {len(fallback)} disease classes from disease_dic.")
    return fallback

disease_classes = load_disease_classes()

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
disease_model_path = 'models/plant_disease_model.pth'

# Load disease model using smart checkpoint auto-detection
disease_model, model_type, disease_classes = load_disease_model(
    disease_model_path,
    num_classes=len(disease_classes),
    all_classes=disease_classes,
    device=device
)
disease_model.eval()

crop_recommendation_model_path = 'models/RandomForest.pkl'
crop_recommendation_model = pickle.load(open(crop_recommendation_model_path, 'rb'))

def weather_fetch(city_name):
    api_key = config.weather_api_key
    base_url = "http://api.openweathermap.org/data/2.5/weather?"

    complete_url = base_url + "appid=" + api_key + "&q=" + city_name
    response = requests.get(complete_url)
    x = response.json()

    cod = str(x.get("cod", ""))
    if cod != "404" and "main" in x:
        y = x["main"]

        temperature = round((y["temp"] - 273.15), 2)
        humidity = y["humidity"]
        return temperature, humidity
    else:
        return None

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/check-get',methods=['GET'])
def check():
    data = {
        "message":"hello world"
    }
    return jsonify(data)

@app.route('/check-post',methods=['POST'])
def check_post():
    if request.method == 'POST':
        Name = request.json['name']
        return jsonify(Name)
    else:
        S="something went wrong!"
        return jsonify(S)

@app.route('/disease-predict', methods=['POST'])
def disease_prediction():
    if request.method == 'POST':
        if 'file' not in request.files or not request.files['file']:
            return jsonify({"err": "No file payload found in request. Please select a valid crop leaf image."}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"err": "Empty filename uploaded. Please select a valid crop leaf image."}), 400

        try:
            img_bytes = file.read()
            prediction_result = predict_disease_image(
                img_bytes,
                disease_model,
                disease_classes,
                device=device,
                model_type=model_type
            )
            return jsonify(prediction_result)
        except ValueError as ve:
            print(f"[!] Validation Error: {str(ve)}")
            return jsonify({"err": str(ve)}), 400
        except Exception as e:
            print(f"[!] Inference Error: {str(e)}")
            return jsonify({"err": "Something went wrong during disease prediction."}), 500
    else:
        return jsonify({"err": "Method not allowed"}), 405

    
@ app.route('/crop-predict', methods=['POST'])
def crop_prediction():
    if request.method == 'POST':
        try:
            N = float(request.json['nitrogen'])
            P = float(request.json['phosphorous'])
            K = float(request.json['pottasium'])
            ph = float(request.json['ph'])
            rainfall = float(request.json['rainfall'])
            city = request.json['city']
            weather_data = weather_fetch(city)
            if weather_data != None:
                temperature, humidity = weather_data
            else:
                # Fallback values keep crop prediction functional if weather API fails.
                # Use input-dependent defaults to avoid always biasing toward one crop.
                temperature = max(15.0, min(35.0, 25.0 + ((ph - 7.0) * 2.0)))
                humidity = max(35.0, min(90.0, 45.0 + (rainfall * 0.08)))
            data = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
            my_prediction = crop_recommendation_model.predict(data)
            final_prediction = my_prediction[0]
            return jsonify(final_prediction)
        except Exception as e:
            print(str(e))
            return jsonify({"err": "Crop prediction failed."}), 400
    
if __name__ == '__main__':
    # Bind to all interfaces so mobile devices can reach it on LAN.
    app.run(host='0.0.0.0', port=7000)