import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE } from '../config/api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [check, setCheck] = useState(false);
  const navigate = useNavigate();

  const handleCheck = (e) => {
    setCheck(e.target.checked);
  };

  const handleClick = async (e) => {
    if (e) e.preventDefault();

    const dataMap = {
      Email: email,
      Password: password,
      IsFarmer: check
    };

    // Clear stale session before setting new login credentials
    localStorage.clear();

    axios({
      url: `${API_BASE}/login`,
      method: 'POST',
      data: dataMap
    })
      .then((response) => {
        const tokenVal = response?.data?.jwt_token || response?.data?.token;
        const returnedUser = response?.data?.user;
        const userRole = check ? 'farmer' : (returnedUser === 'farmer' ? 'farmer' : 'user');
        const userId = response?.data?._id || '';

        if (tokenVal || returnedUser) {
          localStorage.setItem('token', tokenVal || 'token_active');
          localStorage.setItem('user', userRole);
          if (userId) localStorage.setItem('_id', userId);

          toast.success(`Successfully logged in as ${userRole === 'farmer' ? 'Farmer' : 'Buyer'}!`, {
            position: toast.POSITION.BOTTOM_RIGHT
          });

          // Navigate farmers to features hub, buyers directly to marketplace
          if (userRole === 'farmer') {
            navigate('/features');
          } else {
            navigate('/marketplace');
          }
        } else {
          toast.error('Invalid credentials', {
            position: toast.POSITION.BOTTOM_RIGHT
          });
        }
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          'Login failed';
        toast.error(message, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  return (
    <div className="login-page-container">
      <div className="login-auth-card">
        <span className="login-pill-tag">🔒 Secure Access Portal</span>
        <h2 className="login-heading">Welcome Back</h2>
        <p className="login-subtext">Sign in to continue your Smart-Agri journey.</p>

        <form onSubmit={handleClick}>
          <div className="login-field-group">
            <label className="login-label" htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="login-field-group">
            <label className="login-label" htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <label className="login-checkbox-row">
            <input
              type="checkbox"
              id="isFarmerChkBox"
              checked={check}
              onChange={handleCheck}
            />
            <span>Are you a farmer?</span>
          </label>

          <button type="submit" className="login-submit-btn">
            Login
          </button>
        </form>

        <p className="login-bottom-text">
          New user?
          <Link to="/sign-up" className="login-bottom-link">
            Create an account
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}