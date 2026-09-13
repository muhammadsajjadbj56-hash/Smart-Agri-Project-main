import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE } from '../config/api';
import './SignUp.css';

export default function SignUp() {
  const [check, setCheck] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmerID, setFarmerID] = useState('');
  const navigate = useNavigate();

  const handleCheck = (e) => {
    setCheck(e.target.checked);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    const dataMap = {
      FirstName: firstName,
      LastName: lastName,
      PhoneNumber: phoneNumber,
      Email: email,
      Password: password,
      ConfirmPassword: confirmPassword,
      IsFarmer: check,
      FarmerID: farmerID ? parseInt(farmerID, 10) : 0
    };

    axios({
      url: `${API_BASE}/signup`,
      method: 'POST',
      data: dataMap
    })
      .then(() => {
        toast.success('Account created successfully! Please login.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        navigate('/login');
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          'Registration failed';
        toast.error(message, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  return (
    <div className="signup-page-container">
      <div className="signup-auth-card">
        <span className="signup-pill-tag">🔐 Secure Registration Portal</span>
        <h2 className="signup-heading">Create Account</h2>
        <p className="signup-subtext">Join Smart-Agri and unlock smart agricultural insights.</p>

        <form onSubmit={handleSubmit}>
          {/* Two-column First/Last Name */}
          <div className="signup-grid-two">
            <div className="signup-field-group">
              <label className="signup-label" htmlFor="frstNameTxtBox">First Name</label>
              <input
                id="frstNameTxtBox"
                className="signup-input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Muhammad"
                required
              />
            </div>
            <div className="signup-field-group">
              <label className="signup-label" htmlFor="lstNameTxtBox">Last Name</label>
              <input
                id="lstNameTxtBox"
                className="signup-input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sajjad"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="signup-field-group">
            <label className="signup-label" htmlFor="phnNmbrTxtBox">Phone Number</label>
            <input
              id="phnNmbrTxtBox"
              className="signup-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+92 300 1234567"
              required
            />
          </div>

          {/* Email */}
          <div className="signup-field-group">
            <label className="signup-label" htmlFor="emailIDTxtBox">Email</label>
            <input
              id="emailIDTxtBox"
              className="signup-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="signup-field-group">
            <label className="signup-label" htmlFor="pswdTxtBox">Password</label>
            <input
              id="pswdTxtBox"
              className="signup-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="signup-field-group">
            <label className="signup-label" htmlFor="cnfrmPswdTxtBox">Confirm Password</label>
            <input
              id="cnfrmPswdTxtBox"
              className="signup-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Collapsible Farmer ID Field */}
          <div className={`signup-farmer-container ${check ? 'open' : ''}`}>
            <div className="signup-field-group">
              <label className="signup-label" htmlFor="farmerIDTxtBox">Farmer ID</label>
              <input
                id="farmerIDTxtBox"
                className="signup-input"
                type="number"
                value={farmerID}
                onChange={(e) => setFarmerID(e.target.value)}
                placeholder="e.g. 10482"
                required={check}
              />
            </div>
          </div>

          {/* Checkbox */}
          <label className="signup-checkbox-row">
            <input
              type="checkbox"
              id="isFarmerChkBox"
              checked={check}
              onChange={handleCheck}
            />
            <span>Are you a farmer?</span>
          </label>

          {/* Submit Button */}
          <button type="submit" className="signup-submit-btn">
            Create Account
          </button>
        </form>

        <p className="signup-bottom-text">
          Already have an account?
          <Link to="/login" className="signup-bottom-link">
            Login
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}