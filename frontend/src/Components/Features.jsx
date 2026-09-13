import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cropRelatedIssues from '../Images/cropRelatedIssues.jpg';
import cropMarketing from '../Images/cropMarketing.jpg';
import './Features.css';

export default function Features() {
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
    <div className="features-container">
      {/* PAGE HEADER */}
      <header className="features-header">
        <h1 className="features-title">Professional Feature Center</h1>
        <p className="features-subtitle">
          Choose a module to get data-driven insights, optimize crop decisions, and streamline yield operations.
        </p>
        <div className="features-badges">
          <span className="features-badge">AI-Powered</span>
          <span className="features-badge">Fast Workflow</span>
          <span className="features-badge">Responsive Interface</span>
        </div>
      </header>

      {/* MODULE CARDS GRID */}
      <div className="features-module-grid">
        {/* CARD 1 — Crop Intelligence Suite */}
        <article
          className="features-module-card"
          onClick={() => navigate('/crop-related-issues')}
        >
          <img
            className="features-module-img"
            src={cropRelatedIssues}
            alt="Crop Intelligence Suite"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="features-module-body">
            <h3 className="features-module-title">Crop Intelligence Suite</h3>
            <p className="features-module-desc">
              Disease prediction and crop recommendation tools for better field decisions.
            </p>
            <button
              type="button"
              className="features-module-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/crop-related-issues');
              }}
            >
              <span>Open Module</span>
              <i className="ti ti-arrow-right features-module-arrow" />
            </button>
          </div>
        </article>

        {/* CARD 2 — Yield Commerce Hub */}
        <article
          className="features-module-card"
          onClick={() => navigate('/marketplace')}
        >
          <img
            className="features-module-img"
            src={cropMarketing}
            alt="Yield Commerce Hub"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="features-module-body">
            <h3 className="features-module-title">Yield Commerce Hub</h3>
            <p className="features-module-desc">
              Post, manage, and sell produce with faster buyer visibility.
            </p>
            <button
              type="button"
              className="features-module-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/marketplace');
              }}
            >
              <span>Open Module</span>
              <i className="ti ti-arrow-right features-module-arrow" />
            </button>
          </div>
        </article>
      </div>

      {/* STATS ROW */}
      <div className="features-stats-grid">
        <div className="features-stat-card">
          <span className="features-stat-val">2 Modules</span>
          <span className="features-stat-lbl">Available tools</span>
        </div>
        <div className="features-stat-card">
          <span className="features-stat-val">AI-Powered</span>
          <span className="features-stat-lbl">Deep learning models</span>
        </div>
        <div className="features-stat-card">
          <span className="features-stat-val">Real-Time</span>
          <span className="features-stat-lbl">Instant predictions</span>
        </div>
      </div>
    </div>
  );
}
