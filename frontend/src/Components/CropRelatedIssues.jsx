import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cropDiseasePrediction from '../Images/cropDiseasePrediction.png';
import cropPrediction from '../Images/cropPrediction.png';
import './CropRelatedIssues.css';

export default function CropRelatedIssues() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
    } else if (userRole !== 'farmer') {
      navigate('/marketplace');
    }
  }, [navigate]);

  return (
    <div className="crop-center-container">
      {/* PAGE HEADER */}
      <header className="crop-center-header">
        <h1 className="crop-center-title">Crop Intelligence Center</h1>
        <p className="crop-center-subtitle">
          Use intelligent models to diagnose plant diseases and predict the best crop for your soil and climate conditions.
        </p>
        <div className="crop-center-badges">
          <span className="crop-center-badge">Smart Diagnosis</span>
          <span className="crop-center-badge">Data-Driven Prediction</span>
          <span className="crop-center-badge">Fast Recommendations</span>
        </div>
      </header>

      {/* TWO TOOL CARDS */}
      <div className="crop-tools-grid">
        {/* CARD 1 — Plant Disease Prediction */}
        <article className="crop-tool-card">
          <img
            className="crop-tool-img"
            src={cropDiseasePrediction}
            alt="Plant Disease Prediction"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="crop-tool-body">
            <h3 className="crop-tool-title">Plant Disease Prediction</h3>
            <p className="crop-tool-desc">
              Upload a crop image and get disease diagnosis, confidence score, top alternatives, causes, and remedies.
            </p>
            <button
              type="button"
              className="crop-tool-btn"
              onClick={() => navigate('/predict-disease')}
            >
              <i className="ti ti-microscope" />
              <span>Predict Crop Disease</span>
            </button>
          </div>
        </article>

        {/* CARD 2 — Crop Prediction */}
        <article className="crop-tool-card">
          <img
            className="crop-tool-img"
            src={cropPrediction}
            alt="Crop Prediction"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="crop-tool-body">
            <h3 className="crop-tool-title">Crop Prediction</h3>
            <p className="crop-tool-desc">
              Enter soil and rainfall values to receive crop recommendations tailored for your agricultural conditions.
            </p>
            <button
              type="button"
              className="crop-tool-btn"
              onClick={() => navigate('/crop-predict')}
            >
              <i className="ti ti-seeding" />
              <span>Predict Best Crop</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}