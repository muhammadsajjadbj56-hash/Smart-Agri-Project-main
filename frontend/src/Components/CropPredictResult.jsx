import React, { useContext } from 'react';
import NavbarFinal from './NavbarFinal';
import { Typography } from '@mui/material';
import AppContext from '../AppContext';
import mango from '../CropPredictImages/mango.jpg';
import apple from '../CropPredictImages/apple.jpg';
import banana from '../CropPredictImages/banana.jpg';
import chickpea from '../CropPredictImages/chickpea.jpg';
import coconut from '../CropPredictImages/coconut.jpg';
import coffee from '../CropPredictImages/coffee.jpg';
import cotton from '../CropPredictImages/cotton.jpg';
import grapes from '../CropPredictImages/grapes.jpg';
import jute from '../CropPredictImages/jute.jpg';
import kidneybeans from '../CropPredictImages/kidneybeans.jpg';
import lentil from '../CropPredictImages/lentil.jpg';
import maize from '../CropPredictImages/maize.jpg';
import mothbean from '../CropPredictImages/mothbean.jpg';
import mungbean from '../CropPredictImages/mungbean.jpg';
import muskmelon from '../CropPredictImages/muskmelon.jpg';
import orange from '../CropPredictImages/orange.jpg';
import papaya from '../CropPredictImages/papaya.jpg';
import pigeonpeas from '../CropPredictImages/pigeonpeas.jpg';
import pomegranate from '../CropPredictImages/pomegranate.jpg';
import rice from '../CropPredictImages/rice.jpg';
import watermelon from '../CropPredictImages/watermelon.jpg';
function CropPredictResult() {
    const { cropPredictRes } = useContext(AppContext);
    const cropImages = {
        watermelon,
        rice,
        pomegranate,
        pigeonpeas,
        papaya,
        orange,
        muskmelon,
        mungbean,
        mothbeans: mothbean,
        maize,
        lentil,
        jute,
        grapes,
        cotton,
        coffee,
        coconut,
        chickpea,
        banana,
        apple,
        mango,
        kidneybeans,
    };

    const cropImage = cropImages[cropPredictRes] || mango;

    return (
        <>
            <NavbarFinal />
            <section className="predict-page">
                <div className="predict-shell">
                    <h1 className="section-title">Crop Prediction Result</h1>
                    <p className="section-subtitle">Recommended crop based on your soil and climate values.</p>
                    <div className="result-card p-4 p-md-5 text-center">
                        <img className="result-image mb-4" src={cropImage} alt={cropPredictRes || "crop"} />
                        <Typography sx={{ fontFamily: "Open Sans", fontWeight: "bold", fontSize: "30px", textTransform: "capitalize" }}>
                            {cropPredictRes || "No result"}
                        </Typography>
                    </div>
                </div>
            </section>

        </>
    )
}
export default CropPredictResult;