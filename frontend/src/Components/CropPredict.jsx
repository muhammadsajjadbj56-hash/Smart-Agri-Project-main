import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import AppContext from '../AppContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FLASK_API_BASE } from '../config/api';
import './CropPredict.css';

export default function CropPredict() {
  const navigate = useNavigate();
  const { setCropPredictRes } = useContext(AppContext);

  const [nitrogen, setNitrogen] = useState('');
  const [phosphorous, setPhosphorous] = useState('');
  const [pottasium, setPottasium] = useState('');
  const [ph, setPh] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [formHeading, setFormHeading] = useState('Enter the input values');

  const inRange = (value, min, max) => {
    const n = Number(value);
    return !Number.isNaN(n) && n >= min && n <= max;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!nitrogen || !phosphorous || !pottasium || !ph || !rainfall || !city) {
      setLoading(false);
      setFormHeading('Please fill all required values.');
      toast.error('Please fill all required values.', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    if (
      !inRange(nitrogen, 0, 140) ||
      !inRange(phosphorous, 5, 145) ||
      !inRange(pottasium, 5, 205) ||
      !inRange(ph, 3.5, 10) ||
      !inRange(rainfall, 20, 300)
    ) {
      setLoading(false);
      setFormHeading('Please enter realistic values for crop recommendation.');
      toast.warning('Use ranges: N(0-140), P(5-145), K(5-205), pH(3.5-10), Rainfall(20-300).', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    setFormHeading('Your Result is being Processed...');
    setLoading(true);

    const payload = {
      nitrogen: Number(nitrogen),
      phosphorous: Number(phosphorous),
      pottasium: Number(pottasium),
      ph: Number(ph),
      rainfall: Number(rainfall),
      state: state,
      city: city
    };

    axios
      .post(`${FLASK_API_BASE}/crop-predict`, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((response) => {
        setCropPredictRes(response.data);
        setFormHeading('Enter the input values');
        setLoading(false);
        navigate('/crop-predict-result');
      })
      .catch((err) => {
        const message =
          err?.response?.data?.err ??
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          'Crop prediction failed';
        setLoading(false);
        setFormHeading('Prediction failed. Please try again.');
        toast.error(message, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  return (
    <div className="crop-predict-container">
      {/* PAGE HEADER */}
      <header className="crop-predict-header">
        <h1 className="crop-predict-title">Crop Prediction</h1>
        <p className="crop-predict-subtitle">
          Enter soil and rainfall values to get recommended crop output.
        </p>
      </header>

      {/* FORM CARD */}
      <div className="crop-predict-card">
        <h2 className="crop-predict-form-heading">{formHeading}</h2>

        <Fade in={loading} unmountOnExit>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <CircularProgress size={32} style={{ color: 'var(--green-600)' }} />
          </div>
        </Fade>

        <form onSubmit={handleSubmit}>
          <div className="crop-predict-grid">
            {/* Row 1 */}
            <div className="crop-predict-field">
              <label className="crop-predict-label" htmlFor="nitrogenInput">
                Nitrogen Value
              </label>
              <input
                id="nitrogenInput"
                className="crop-predict-input"
                type="number"
                min="0"
                max="140"
                placeholder="0-140"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                required
              />
            </div>

            <div className="crop-predict-field">
              <label className="crop-predict-label" htmlFor="phosphorousInput">
                Phosphorous Value
              </label>
              <input
                id="phosphorousInput"
                className="crop-predict-input"
                type="number"
                min="5"
                max="145"
                placeholder="5-145"
                value={phosphorous}
                onChange={(e) => setPhosphorous(e.target.value)}
                required
              />
            </div>

            {/* Row 2 */}
            <div className="crop-predict-field">
              <label className="crop-predict-label" htmlFor="potassiumInput">
                Potassium Value
              </label>
              <input
                id="potassiumInput"
                className="crop-predict-input"
                type="number"
                min="5"
                max="205"
                placeholder="5-205"
                value={pottasium}
                onChange={(e) => setPottasium(e.target.value)}
                required
              />
            </div>

            <div className="crop-predict-field">
              <label className="crop-predict-label" htmlFor="phInput">
                pH Value
              </label>
              <input
                id="phInput"
                className="crop-predict-input"
                type="number"
                step="0.1"
                min="3.5"
                max="10"
                placeholder="3.5-10"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                required
              />
            </div>

            {/* Row 3 */}
            <div className="crop-predict-field">
              <label className="crop-predict-label" htmlFor="rainfallInput">
                Rainfall Value
              </label>
              <input
                id="rainfallInput"
                className="crop-predict-input"
                type="number"
                min="20"
                max="300"
                placeholder="20-300"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                required
              />
            </div>

            <div className="crop-predict-field">
              <label className="crop-predict-label" htmlFor="stateInput">
                State
              </label>
              <input
                id="stateInput"
                className="crop-predict-input"
                type="text"
                placeholder="e.g. Punjab"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            {/* Row 4 (Full Width) */}
            <div className="crop-predict-field crop-predict-field-full">
              <label className="crop-predict-label" htmlFor="cityInput">
                City
              </label>
              <input
                id="cityInput"
                className="crop-predict-input"
                type="text"
                placeholder="e.g. Multan"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="crop-predict-submit-row">
            <button type="submit" className="crop-predict-btn" disabled={loading}>
              <i className="ti ti-seeding" />
              <span>{loading ? 'Predicting...' : 'Predict'}</span>
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}