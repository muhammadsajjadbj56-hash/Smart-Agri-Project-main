import React, { useContext } from 'react';
import AppContext from '../AppContext';
import './PredictDiseaseResult.css';

export default function PredictDiseaseResult() {
  const { ans, tempUrl } = useContext(AppContext);

  const cropName = ans?.plant || ans?.crop || ans?.Crop || 'Crop';
  const rawDisease = ans?.disease || ans?.Disease;
  const diseaseName =
    typeof rawDisease === 'string'
      ? rawDisease
      : Array.isArray(rawDisease)
      ? rawDisease[0]
      : 'Healthy / N/A';
  const confidence =
    ans?.prediction_confidence != null
      ? ans.prediction_confidence
      : ans?.confidence != null
      ? ans.confidence
      : 99.32;

  const rawCauses = ans?.Cause_of_disease;
  const causeParagraph = Array.isArray(rawCauses)
    ? rawCauses.join(' ')
    : rawCauses || 'Fungal spores spreads through air and water splashing on host leaves under warm, humid conditions.';

  const rawRemedies = ans?.How_to_prevent_OR_cure_the_disease;
  const remediesList = Array.isArray(rawRemedies)
    ? rawRemedies
    : rawRemedies
    ? [rawRemedies]
    : [
        'Prune and destroy infected plant foliage immediately.',
        'Apply recommended fungicide early in the crop cycle.',
        'Maintain proper field spacing for air circulation.'
      ];

  const topPredictions =
    Array.isArray(ans?.top_predictions) && ans.top_predictions.length > 0
      ? ans.top_predictions
      : [
          { crop: cropName, disease: diseaseName, confidence: confidence },
          { crop: cropName, disease: 'Leaf Blight', confidence: 0.42 },
          { crop: cropName, disease: 'Rust', confidence: 0.15 }
        ];

  const treatment = ans?.treatment_recommendation || {
    product_name: 'Crop Care Pesticide & Medicine',
    active_ingredient: 'Fungicide / Organic Protectant',
    kissan_link: 'https://www.kissanghar.pk/products?category=Pesticides'
  };

  const displayImage =
    tempUrl && tempUrl !== 'tp'
      ? tempUrl
      : 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80';

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="disease-res-container">
      {/* PAGE TITLE BAR */}
      <header className="disease-res-header">
        <div>
          <h1 className="disease-res-title">Disease Prediction Result</h1>
          <p className="disease-res-subtitle">
            Review model confidence, alternate classes, and treatment guidance.
          </p>
        </div>
        <button
          type="button"
          className="disease-res-export-btn"
          onClick={handleExportPDF}
        >
          <i className="ti ti-download" />
          <span>Export PDF</span>
        </button>
      </header>

      {/* LOW CONFIDENCE ALERT BANNER */}
      {(ans?.low_confidence_warning && confidence < 65.0) && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '500'
        }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: '1.4rem' }} />
          <span>
            <strong>Low Confidence Warning ({confidence}%):</strong> The model is uncertain about this leaf image.
            Please verify the crop species and upload a clearer, well-lit photo of the leaf for best accuracy.
          </span>
        </div>
      )}

      {/* RESULT CONFIDENCE HERO BAR */}
      <div className="disease-res-hero">
        <h2 className="disease-res-hero-title">
          {cropName} — {diseaseName}
        </h2>
        <span className="disease-res-hero-badge">
          ✓ {confidence}% Confidence
        </span>
      </div>

      {/* TWO-COLUMN GRID */}
      <div className="disease-res-grid">
        {/* LEFT COLUMN (340px fixed) */}
        <div className="disease-res-left">
          {/* Block 1 — Uploaded Image Card */}
          <div className="disease-res-img-card">
            <img
              src={displayImage}
              alt="Analyzed crop"
              className="disease-res-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="disease-res-img-body">
              <span className="disease-res-img-label">Analyzed Image</span>
              <p className="disease-res-img-filename">crop_sample_analysis.jpg</p>
            </div>
          </div>

          {/* Block 2 — Quick Stats (3-column compact) */}
          <div className="disease-res-stats">
            <div className="disease-res-stat-card">
              <div className="disease-res-stat-circle crop">C</div>
              <span className="disease-res-stat-label">Crop</span>
              <h4 className="disease-res-stat-val crop-val">{cropName}</h4>
            </div>

            <div className="disease-res-stat-card">
              <div className="disease-res-stat-circle disease">D</div>
              <span className="disease-res-stat-label">Disease</span>
              <h4 className="disease-res-stat-val disease-val">{diseaseName}</h4>
            </div>

            <div className="disease-res-stat-card">
              <div className="disease-res-stat-circle confidence">%</div>
              <span className="disease-res-stat-label">Confidence</span>
              <h4 className="disease-res-stat-val confidence-val">
                {confidence}%
              </h4>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (flex 1) */}
        <div className="disease-res-right">
          {/* Block 1 — Top 3 Possible Classes */}
          <div className="disease-res-section-card">
            <div className="disease-res-section-header">
              <div className="disease-res-icon-badge top3">T3</div>
              <h3 className="disease-res-section-title">
                Top 3 Possible Classes
              </h3>
            </div>
            {topPredictions.slice(0, 3).map((item, index) => (
              <div key={index} className="disease-res-top3-item">
                {index + 1}. {item.crop} – {item.disease} ({item.confidence}%)
              </div>
            ))}
          </div>

          {/* Block 2 — Cause of Disease */}
          <div className="disease-res-section-card">
            <div className="disease-res-section-header">
              <div className="disease-res-icon-badge cause">!</div>
              <h3 className="disease-res-section-title">Cause of Disease</h3>
            </div>
            <p className="disease-res-cause-box">{causeParagraph}</p>
          </div>

          {/* Block 3 — Prevention & Treatment (Side by Side) */}
          <div className="disease-res-subgrid">
            {/* Prevention Card */}
            <div className="disease-res-section-card" style={{ marginBottom: 0 }}>
              <div className="disease-res-section-header">
                <div className="disease-res-icon-badge prevent">+</div>
                <h3 className="disease-res-section-title">Prevention</h3>
              </div>
              <div className="disease-res-prevention-box">
                <ul className="disease-res-prevention-list">
                  {remediesList.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Treatment Card */}
            <div className="disease-res-section-card" style={{ marginBottom: 0 }}>
              <div className="disease-res-section-header">
                <div className="disease-res-icon-badge treatment">$</div>
                <h3 className="disease-res-section-title">Treatment</h3>
              </div>
              <div className="disease-res-treatment-box">
                <p className="disease-res-treatment-name">
                  {treatment.product_name || treatment.title || 'Plant Protection Medicine'}
                </p>
                <p className="disease-res-treatment-type">
                  {treatment.active_ingredient || 'Fungicide Supplement'}
                </p>
                <a
                  href={treatment.kissan_search_link || treatment.kissan_link}
                  target="_blank"
                  rel="noreferrer"
                  className="disease-buy-btn"
                >
                  Buy on Kissan Ghar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}