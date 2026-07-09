// services/api.js — shared axios instance for talking to the backend API.
// Import this instead of calling axios directly so the base URL and
// future interceptors (auth headers, error handling) live in one place.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default api;
