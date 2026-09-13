# SMART AGRI: An AI-Powered Crop Intelligence and Digital Agriculture Marketplace Platform Using MERN Stack and Machine Learning

## Short Description
SMART AGRI is a full‑stack web application that assists farmers and consumers with crop disease diagnosis, crop recommendation, and a digital marketplace for agricultural products. It combines a **React** frontend, a **Node.js/Express** backend, a **MongoDB** database, and a **Flask** micro‑service that hosts machine‑learning models built with **PyTorch** (EfficientNet‑B0) and **scikit‑learn** (Random Forest).

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Machine Learning](#machine-learning)
  - [Plant Disease Detection](#plant-disease-detection)
  - [Crop Recommendation](#crop-recommendation)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup (Windows)](#installation--setup-windows)
- [Environment Variables](#environment-variables)
- [How to Use](#how-to-use)
- [API / Backend](#api--backend)
- [Machine Learning Models](#machine-learning-models)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Authors](#authors)
- [License](#license)

---

## Overview
SMART AGRI addresses two major pain points in modern agriculture:
1. **Early disease detection** – Farmers can upload a leaf image (or capture it via a mobile camera) and receive a disease prediction with confidence scores and recommended treatment.
2. **Data‑driven crop selection** – Based on soil nutrient levels, pH, rainfall, and local weather, the platform suggests the most suitable crop.
The platform also provides a **peer‑to‑peer marketplace** where farmers list produce and buyers can browse, purchase, and receive order notifications.

---

## Key Features
- User registration and login with **JWT‑based authentication**.
- Distinct **Farmer** and **Normal User/Buyer** roles.
- Protected API routes using middleware.
- **Plant disease detection** (image upload & mobile camera) powered by EfficientNet‑B0.
- Detailed disease information, causes, prevention, and treatment suggestions.
- **Crop recommendation** using a Random Forest model (soil & environmental parameters).
- **Agriculture marketplace** – Farmers can post items, buyers can browse and place orders.
- Order workflow: buyer confirms purchase → seller receives notification.
- **Google Drive** integration for storing uploaded product images.
- **Contact Us** form with email handling via Nodemailer.
- Fully **responsive** UI built with Material‑UI & React‑Bootstrap.
- **No admin‑only contact/message management** is currently implemented (the contact endpoint simply stores messages).

---

## System Architecture
```
React (frontend) ⇄ Node.js/Express (REST API) ⇄ MongoDB
            │                     │
            └─► Flask (ML service) ─► EfficientNet‑B0 (disease) & RandomForest (crop) ⇄ Model files

Google Drive API is used by the Express backend to upload and retrieve product images.
```
- **React** handles routing (React Router) and UI.
- **Node.js/Express** validates JWTs, manages user data, marketplace logic, and forwards ML requests to Flask.
- **MongoDB** stores users, products, orders, and contact messages.
- **Flask** exposes `/disease-predict` and `/crop-predict` endpoints that the Express server calls internally (or the frontend can call directly via `FLASK_API_BASE`).
- **Google Drive** stores image binaries; the backend falls back to a local `uploads/` folder when the Drive upload fails.

---

## Machine Learning
### Plant Disease Detection
- **Input**: JPEG/PNG image of a leaf (multipart/form‑data).
- **Pre‑processing**: Image bytes are transformed to a tensor (resized, normalized) in `utils/predict.py`.
- **Model**: EfficientNet‑B0 with a custom classifier head (`utils/model.py`). The checkpoint at `flask-backend/models/plant_disease_model.pth` defines the number of output classes.
- **Output**: JSON containing the predicted disease class, confidence score, and a textual description pulled from `utils/disease.py` (e.g., cause, prevention, treatment).

### Crop Recommendation
- **Input**: Soil nutrients (N, P, K), pH, rainfall, and city name.
- **Weather fallback**: If the OpenWeatherMap API fails, temperature and humidity are estimated from pH and rainfall.
- **Model**: Scikit‑learn Random Forest (`flask-backend/models/RandomForest.pkl`).
- **Output**: Predicted crop name (string) returned as JSON.

---

## User Roles
| Role | Main Functions |
|------|----------------|
| **Farmer** | Register with `IsFarmer` flag, post agricultural products, view own listings, receive order notifications, view buyer queries. |
| **Normal User / Buyer** | Register as regular user, browse marketplace, add items to cart, place orders, receive order confirmation. |

---

## Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, React Router, Material‑UI, React‑Bootstrap | UI & client‑side routing |
| Backend (API) | Node.js, Express.js, Mongoose, JWT, Multer, Google APIs, Nodemailer | Auth, marketplace logic, image handling |
| Database | MongoDB | Persistent storage for users, products, orders, messages |
| ML Service | Flask, PyTorch, EfficientNet‑B0, scikit‑learn (Random Forest) | Disease detection & crop recommendation |
| Cloud Storage | Google Drive API | Store product images securely |
| Dev Tools | npm, pip, dotenv, cors, helmet (optional) | Environment management |

---

## Project Structure
```
Smart-Agri-Project-main/
├─ backend/                 # Node/Express API
│  ├─ models/               # Mongoose schemas (userRegister, farmerRegister, postItem, order, contactMessage)
│  ├─ routes/               # auth.js, category.js (marketplace), contact.js
│  ├─ middleware.js         # JWT verification & role middleware
│  ├─ server.js             # Entry point
│  └─ .env                  # Environment variables (not committed)
├─ flask-backend/           # Flask ML service
│  ├─ models/               # ML model files (plant_disease_model.pth, RandomForest.pkl)
│  ├─ utils/                # disease dictionary, model loader, prediction helpers
│  ├─ app.py                # API routes (`/disease-predict`, `/crop-predict`)
│  └─ config.py             # Holds external API keys (e.g., OpenWeatherMap)
├─ frontend/                # React application
│  ├─ src/
│  │   ├─ Components/       # UI components (SignUp, Login, CropRelatedIssues, PredictDisease, etc.)
│  │   ├─ config/api.js     # Base URLs for Node and Flask APIs
│  │   ├─ index.js, App.js  # Entry points
│  │   └─ styles/ …
│  └─ public/               # Static assets
├─ README.md                # Project documentation (this file)
└─ package.json / requirements.txt
```
Key folders referenced in the README are linked where possible.

---

## Installation & Setup (Windows)
1. **Clone the repository**
   ```powershell
   git clone https://github.com/muhammad-sajjad/Smart-Agri-Project.git
   cd Smart-Agri-Project-main
   ```
2. **Install Node.js dependencies** for both backend and frontend
   ```powershell
   # Backend (Express)
   cd backend
   npm install

   # Frontend (React) – from project root
   cd ..\frontend
   npm install
   ```
3. **Install Python dependencies** for the Flask ML service
   ```powershell
   cd ..\flask-backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. **Create a `.env` file** in `backend/` (see *Environment Variables* section) and another one in `flask-backend/` if you wish to override defaults.
5. **Start the services** (each in its own PowerShell window)
   ```powershell
   # Express backend
   cd backend
   npm run start   # runs server.js on port 5000

   # Flask ML service
   cd ..\flask-backend
   python app.py   # runs on port 7000

   # React frontend
   cd ..\frontend
   npm start       # runs on port 3000
   ```
6. Open a browser and navigate to `http://localhost:3000` (or `http://<YOUR_PC_IP>:3000` from a mobile device on the same LAN).

---

## Environment Variables
**Backend (`backend/.env`)**
```env
MONGOURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1h
NODE_ENV=development   # or production
AWSACCESSKEY=your_aws_access_key   # if using S3 (currently unused)
AWSSECRETACCESSKEY=your_aws_secret_key
AWSBUCKET=your_s3_bucket_name
SCOPES_0=your_google_scope_0
SCOPES_1=your_google_scope_1
GOOGLE_FOLDER_ID=your_google_drive_folder_id
```
**Flask (`flask-backend/config.py` or `.env`)**
```env
WEATHER_API_KEY=your_openweathermap_api_key
# optional: GOOGLE_APPLICATION_CREDENTIALS=path/to/service_account.json
```
> **Important:** Never commit real secrets. The README only lists variable *names*.

---

## How to Use
1. **Register / Login** – Choose *Farmer* if you want to list products.
2. **Disease Detection** – Navigate to the *Crop Related Issues* section, upload a leaf image or use the mobile camera, and view the predicted disease with treatment info.
3. **Crop Recommendation** – Enter soil N‑P‑K values, pH, rainfall, and city name to receive a suggested crop.
4. **Marketplace** – Farmers post items (image uploaded to Google Drive). Buyers browse listings, add items to the cart, and place orders.
5. **Contact Us** – Fill out the contact form; the message is stored in MongoDB.

---

## API / Backend
- `POST /signup` – Register a new user or farmer (expects `IsFarmer` flag and optional `FarmerID`).
- `POST /login` – Authenticate and receive a JWT (`jwt_token`).
- `GET /auth` – Protected route example (requires JWT).
- **Marketplace (`category.js`)**
  - `POST /postitem` – Create a new product (image upload). Uses Google Drive; falls back to local storage.
  - `GET /getitem` – Retrieve all products.
  - `GET /item/:id` – Get a single product and its Q&A.
  - `POST /place-order` – Buyer places an order; stock is updated.
  - `GET /farmer-orders/:farmerId` – Farmer views their orders.
- **Contact (`contact.js`)**
  - `GET /contact` – Health check.
  - `POST /contact` – Save a contact message.
- **Flask ML Service** (accessed via `FLASK_API_BASE`)
  - `POST /disease-predict` – Submit image for disease prediction.
  - `POST /crop-predict` – Submit soil & weather data for crop recommendation.

---

## Machine Learning Models
- `flask-backend/models/plant_disease_model.pth` – EfficientNet‑B0 checkpoint for 78 disease classes (or 38 if a legacy checkpoint is detected).
- `flask-backend/models/RandomForest.pkl` – Scikit‑learn model for crop recommendation.
- `flask-backend/utils/disease.py` – Dictionary mapping disease class names to detailed information (causes, prevention, treatment).
- `flask-backend/utils/model.py` – Helper for loading the appropriate model architecture and class list.

---

## Screenshots
> *(Add actual images to `frontend/screenshots/` and replace the placeholder paths below.)*
```markdown
## Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Disease Detection
![Disease Detection](screenshots/disease-detection.png)

### Crop Recommendation
![Crop Recommendation](screenshots/crop-recommendation.png)

### Marketplace
![Marketplace](screenshots/marketplace.png)
```

---

## Future Improvements
- Implement an **admin dashboard** for managing contact messages and user reports.
- Add **role‑based access control** (e.g., admin, moderator).
- Expand **ML models** to cover more crops and disease categories.
- Introduce **payment gateway integration** for real‑world transactions.
- Provide **offline support** for mobile users in low‑connectivity areas.
- Add **unit & integration tests** for both Node and Flask services.

---

## Authors
The repository does not contain explicit author metadata. Please refer to the Git commit history for contributor information.

---

## License
A license file is not currently included. Consider adding an appropriate open‑source license (e.g., MIT or Apache‑2.0) before publishing the repository publicly.





