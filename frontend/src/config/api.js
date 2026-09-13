// Uses the same host as the browser:
//   PC:     http://localhost:3000  → API http://localhost:5000
//   Phone:  http://YOUR_PC_IP:3000 → API http://YOUR_PC_IP:5000
const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_BASE = process.env.REACT_APP_API_BASE || `http://${host}:5000`;
export const FLASK_API_BASE = process.env.REACT_APP_FLASK_API_BASE || `http://${host}:7000`;
