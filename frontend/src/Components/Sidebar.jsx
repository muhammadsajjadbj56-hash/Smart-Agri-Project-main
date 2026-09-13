import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config/api';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user');
  const isLoggedIn = Boolean(token);
  const isFarmer = isLoggedIn && userRole === 'farmer';

  // Extract user details or fall back gracefully
  const firstName = localStorage.getItem('firstName') || '';
  const lastName = localStorage.getItem('lastName') || '';
  const storedUser = localStorage.getItem('user') || '';

  let fullName = 'Smart-Agri User';
  let initials = 'SA';

  if (firstName || lastName) {
    fullName = `${firstName} ${lastName}`.trim();
    const fInitial = firstName ? firstName[0] : '';
    const lInitial = lastName ? lastName[0] : '';
    initials = `${fInitial}${lInitial}`.toUpperCase() || 'SA';
  } else if (storedUser) {
    fullName = storedUser === 'farmer' ? 'Farmer User' : 'Buyer User';
    initials = storedUser === 'farmer' ? 'FU' : 'BU';
  }

  const handleSignout = () => {
    localStorage.clear();
    axios
      .post(`${API_BASE}/signout`)
      .then(() => {
        console.log('Successfully Logged Out');
      })
      .catch((err) => {
        console.log('Signout error:', err);
      });
    navigate('/login');
  };

  const renderNavLink = (to, iconClass, label, exact = false) => (
    <NavLink
      key={to}
      to={to}
      end={exact}
      className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="sidebar-active-indicator" />}
          <i className={`ti ${iconClass} sidebar-icon`} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="sidebar-container">
      {/* HEADER ZONE */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <i className="ti ti-plant-2" />
        </div>
        <div className="sidebar-brand-info">
          <span className="sidebar-brand-title">Smart-Agri</span>
          <span className="sidebar-badge">Pro Suite</span>
        </div>
      </div>

      {/* NAV SECTION STRUCTURE */}
      <div className="sidebar-nav">
        {/* Section: MAIN (always shown) */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">Main</span>
          {renderNavLink('/', 'ti-home', 'Home', true)}
          {renderNavLink('/marketplace', 'ti-shopping-bag', 'Marketplace')}
        </div>

        {/* Section: CROP TOOLS (ONLY FOR LOGGED-IN FARMERS) */}
        {isLoggedIn && isFarmer && (
          <div className="sidebar-section">
            <span className="sidebar-section-title">Crop Tools</span>
            {renderNavLink('/features', 'ti-layout-dashboard', 'Features')}
            {renderNavLink('/crop-related-issues', 'ti-analyze', 'Crop Tools')}
          </div>
        )}

        {/* Section: ACCOUNT (FOR LOGGED-IN USERS) */}
        {isLoggedIn && (
          <div className="sidebar-section">
            <span className="sidebar-section-title">Account</span>
            {renderNavLink('/aboutus', 'ti-users', 'About')}
            {renderNavLink('/contactus', 'ti-message-circle', 'Contact')}
            <button
              type="button"
              className="sidebar-nav-item sign-out"
              onClick={handleSignout}
            >
              <i className="ti ti-logout sidebar-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Section: EXPLORE (FOR LOGGED-OUT VISITORS) */}
        {!isLoggedIn && (
          <div className="sidebar-section">
            <span className="sidebar-section-title">Explore</span>
            {renderNavLink('/aboutus', 'ti-users', 'About')}
            {renderNavLink('/contactus', 'ti-message-circle', 'Contact')}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER ZONE */}
      {isLoggedIn ? (
        /* LOGGED-IN FOOTER USER CARD */
        <div className="sidebar-footer">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{fullName}</span>
            <span className="sidebar-user-role">
              {isFarmer ? 'Farmer · Verified' : 'Buyer'}
            </span>
          </div>
          <div className="sidebar-footer-dots">
            <i className="ti ti-dots-vertical" />
          </div>
        </div>
      ) : (
        /* LOGGED-OUT FOOTER STACKED CTA BUTTONS */
        <div className="sidebar-footer-actions">
          <button
            type="button"
            className="sidebar-btn-login"
            onClick={() => navigate('/login')}
          >
            <i className="ti ti-login" />
            <span>Login</span>
          </button>
          <button
            type="button"
            className="sidebar-btn-signup"
            onClick={() => navigate('/sign-up')}
          >
            <i className="ti ti-user-plus" />
            <span>Create Account</span>
          </button>
        </div>
      )}
    </aside>
  );
}
