import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE } from '../config/api';
import './ContactUs.css';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [issue, setIssue] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const dataMap = {
      name,
      email,
      phone,
      subject,
      issue
    };

    axios({
      url: `${API_BASE}/contact`,
      method: 'POST',
      data: dataMap
    })
      .then((res) => {
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setIssue('');
        toast.success(res?.data?.message ?? 'Submitted successfully.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          'Unable to submit your request.';
        toast.error(message, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  return (
    <div className="contact-page-container">
      {/* PAGE HEADER */}
      <header className="contact-header">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">
          Share your query, bug report, or suggestion. Our team will get back to you soon.
        </p>
      </header>

      {/* FORM CARD */}
      <div className="contact-card">
        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="contact-grid-row">
            <div className="contact-field-group">
              <label className="contact-label" htmlFor="contactName">Name</label>
              <input
                id="contactName"
                className="contact-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="contact-field-group">
              <label className="contact-label" htmlFor="contactEmail">Email</label>
              <input
                id="contactEmail"
                className="contact-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="contact-grid-row">
            <div className="contact-field-group">
              <label className="contact-label" htmlFor="contactPhone">Phone Number</label>
              <input
                id="contactPhone"
                className="contact-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="contact-field-group">
              <label className="contact-label" htmlFor="contactSubject">Subject</label>
              <input
                id="contactSubject"
                className="contact-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                required
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div className="contact-field-group">
            <label className="contact-label" htmlFor="contactMessage">Message</label>
            <textarea
              id="contactMessage"
              className="contact-textarea"
              rows={5}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe your issue in brief…"
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="contact-submit-btn">
            <i className="ti ti-send" />
            <span>Send Message</span>
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}