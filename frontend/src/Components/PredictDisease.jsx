import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppContext from '../AppContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FLASK_API_BASE } from '../config/api';
import './PredictDisease.css';

export default function PredictDisease() {
  const navigate = useNavigate();
  const { setTempUrl, setAns, tempUrl } = useContext(AppContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(tempUrl || '');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // File Selection Handler
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, JPEG).', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setTempUrl(objectUrl);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Open File / Camera inputs
  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const triggerCameraInput = () => {
    if (cameraInputRef.current) cameraInputRef.current.click();
  };

  // Helper to extract file object safely
  const getFileToUpload = async () => {
    if (selectedFile) return selectedFile;
    if (previewUrl) {
      try {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          return new File([blob], 'crop_leaf.jpg', { type: blob.type || 'image/jpeg' });
        }
      } catch (err) {
        console.warn('Could not extract blob from previewUrl:', err);
      }
    }
    return null;
  };

  // Predict Handler
  const handlePredict = async () => {
    const fileToUpload = await getFileToUpload();
    if (!fileToUpload) {
      toast.warning('Please select or capture a leaf image first.', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', fileToUpload);

    axios
      .post(`${FLASK_API_BASE}/disease-predict`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((response) => {
        setAns({
          Crop: response.data.Crop || response.data.crop || response.data.plant,
          Disease: response.data.Disease || response.data.disease,
          Cause_of_disease: response.data.Cause || response.data.cause || response.data.Cause_of_disease,
          How_to_prevent_OR_cure_the_disease: response.data.Prevent_Cure || response.data.prevent_cure || response.data.How_to_prevent_OR_cure_the_disease,
          prediction_confidence: response.data.prediction_confidence || response.data.confidence,
          top_predictions: response.data.top_predictions || [],
          treatment_recommendation: response.data.treatment_recommendation || null,
          plant: response.data.plant || response.data.crop,
          disease: response.data.disease || response.data.Disease,
          low_confidence_warning: response.data.low_confidence_warning || false
        });
        setLoading(false);
        navigate('/predict-disease-result');
      })
      .catch((err) => {
        console.error('Disease prediction error:', err);
        const message =
          err?.response?.data?.err ??
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          'Prediction failed';
        setLoading(false);
        toast.error(message, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  return (
    <div className="disease-predict-container">
      {/* PAGE HEADER */}
      <header className="disease-predict-header">
        <h1 className="disease-predict-title">Plant Disease Prediction</h1>
        <p className="disease-predict-subtitle">
          Upload a crop image to identify the disease and get prevention guidance.
        </p>
      </header>

      {/* UPLOAD CARD */}
      <div className="disease-upload-card">
        {/* Hidden File & Camera Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {/* DRAG AND DROP ZONE */}
        <div
          className={`disease-dropzone ${dragActive ? 'drag-active' : ''}`}
          onClick={triggerFileInput}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected Crop Preview"
              className="disease-preview-img"
            />
          ) : (
            <>
              <i className="ti ti-cloud-upload disease-dropzone-icon" />
              <span className="disease-dropzone-title">
                Click to upload or drag and drop
              </span>
              <span className="disease-dropzone-sub">
                PNG, JPG, JPEG supported
              </span>
            </>
          )}
        </div>

        {/* ACTION BUTTONS ROW */}
        <div className="disease-actions-row">
          <button
            type="button"
            className="disease-action-btn"
            onClick={triggerFileInput}
            disabled={loading}
          >
            <i className="ti ti-folder" />
            <span>Choose File</span>
          </button>

          <button
            type="button"
            className="disease-action-btn"
            onClick={triggerCameraInput}
            disabled={loading}
          >
            <i className="ti ti-camera" />
            <span>Capture Image (Camera)</span>
          </button>
        </div>

        {/* PREDICT BUTTON */}
        <button
          type="button"
          className="disease-predict-btn"
          onClick={handlePredict}
          disabled={loading || (!selectedFile && !previewUrl)}
          title={!selectedFile && !previewUrl ? 'Upload an image first' : ''}
        >
          {loading ? (
            <>
              <i className="ti ti-loader-2 ti-spin" />
              <span>Analyzing Crop...</span>
            </>
          ) : (
            <>
              <i className="ti ti-microscope" />
              <span>Predict Disease</span>
            </>
          )}
        </button>

        {/* TIP TEXT */}
        <p className="disease-tip-text">
          Tip: Use clear, well-lit photos in natural daylight for best results.
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}