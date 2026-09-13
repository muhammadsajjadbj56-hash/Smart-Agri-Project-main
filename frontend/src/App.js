import { useState } from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";
import Layout from './Components/Layout';
import NavbarFinal from './Components/NavbarFinal';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import Home from './Components/Home';
import Features from './Components/Features';
import PredictDisease from './Components/PredictDisease';
import CropPredict from './Components/CropPredict';
import CropRelatedIssues from './Components/CropRelatedIssues';
import MyHome from './Components/MyHome';
import ContactUs from './Components/ContactUs';
import AboutUs from './Components/AboutUs';
import AppContext from './AppContext';
import PredictDiseaseResult from './Components/PredictDiseaseResult';
import CropPredictResult from './Components/CropPredictResult';
import FarmerDashboard from './Components/FarmerDashboard';

function App() {
  const [tempUrl, setTempUrl] = useState('tp');
  const [cropPredictRes, setCropPredictRes] = useState('');
  const [ans, setAns] = useState({
    Crop: "",
    Disease: "",
    Cause_of_disease: [],
    How_to_prevent_OR_cure_the_disease: [],
    prediction_confidence: null,
    top_predictions: [],
    treatment_recommendation: null
  });

  return (
    <AppContext.Provider value={{ tempUrl, setTempUrl, ans, setAns, cropPredictRes, setCropPredictRes }}>
      <Layout>
        <Routes>
          <Route path="/navbar" element={<NavbarFinal />} />
          <Route path="/" element={<MyHome />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/marketplace" element={<Home />} />
          <Route path="/farmer-dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/features" element={<Features />} />
          <Route path="/predict-disease" element={<PredictDisease />} />
          <Route path="/crop-predict" element={<CropPredict />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/crop-related-issues" element={<CropRelatedIssues />} />
          <Route path="/predict-disease-result" element={<PredictDiseaseResult />} />
          <Route path="/crop-predict-result" element={<CropPredictResult />} />
        </Routes>
      </Layout>
    </AppContext.Provider>
  );
}

export default App;
