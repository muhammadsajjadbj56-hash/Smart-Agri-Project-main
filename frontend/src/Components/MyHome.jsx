import React from 'react';
import './MyHome.css';

export default function MyHome() {
  return (
    <div className="home-page">
      {/* SECTION 1 — Hero Banner */}
      <div className="home-hero-banner">
        <div className="home-hero-circle" />
        <span className="home-hero-pill">Smart-Agri Professional Suite</span>
        <h1 className="home-hero-title">
          Smart Farming Platform{'\n'}Built for Modern Agriculture
        </h1>
        <p className="home-hero-subtitle">
          Smart-Agri helps farmers and buyers with crop prediction, disease diagnosis, and a practical digital marketplace.
        </p>

        <div className="home-hero-grid">
          <div className="home-mini-card">
            <span className="home-mini-card-title">AI Crop Tools</span>
            <p className="home-mini-card-desc">Predict crop suitability and plant disease in seconds.</p>
          </div>
          <div className="home-mini-card">
            <span className="home-mini-card-title">Yield Marketplace</span>
            <p className="home-mini-card-desc">List and discover farm produce with transparent pricing.</p>
          </div>
          <div className="home-mini-card">
            <span className="home-mini-card-title">Unified Dashboard</span>
            <p className="home-mini-card-desc">Access all features from one clean workflow.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Info Grid */}
      <div className="home-info-grid">
        <article className="home-info-card">
          <h2 className="home-info-card-title">Why Farmers Choose Smart-Agri</h2>
          <p className="home-info-card-text">
            Smart-Agri combines decision support and market connectivity in one platform. Instead of switching between apps, users can evaluate crop conditions, check recommendations, and act quickly with confidence.
          </p>
        </article>

        <article className="home-info-card">
          <h2 className="home-info-card-title">What You Can Do Here</h2>
          <p className="home-info-card-text">
            Use crop prediction to understand suitable yields, upload leaf images to detect diseases, and connect with buyers through marketplace listings. Every module is optimized for desktop, tablet, and mobile screens.
          </p>
        </article>

        <article className="home-info-card">
          <h2 className="home-info-card-title">Important Notes</h2>
          <ul className="home-info-list">
            <li>Use clear and well-lit leaf photos for better disease prediction.</li>
            <li>Enter realistic soil and rainfall values for accurate crop suggestions.</li>
            <li>Keep your marketplace listings updated with price and stock details.</li>
          </ul>
        </article>

        <article className="home-info-card">
          <h2 className="home-info-card-title">Professional Workflow</h2>
          <p className="home-info-card-text">
            Start from the sidebar, explore feature modules, then move to actions: prediction, verification, and listing. This flow is designed to save time for both new and experienced users.
          </p>
        </article>
      </div>
    </div>
  );
}