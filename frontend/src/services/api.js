// services/api.js — shared axios instance for talking to the backend API.
// Import this instead of calling axios directly so the base URL and
// future interceptors (auth headers, error handling) live in one place.

import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'deze_token';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Backend-provided asset paths (photos, documents) come back root-relative
// (e.g. "/uploads/profiles/xyz.jpg") since they're served by the API server,
// not the Vite dev server. Resolve them against the API's origin so <img>
// tags don't request them from the frontend's own origin.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Resolves a backend-relative asset path to an absolute URL. Absolute/blob/data URLs pass through unchanged. */
export const toAssetUrl = (path) => {
  if (!path) return path;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${API_ORIGIN}${path}`;
};

// Attaches the stored JWT (if any) to every outgoing request. AuthContext is
// the source of truth for the token in memory; localStorage lets it survive
// a page refresh without every call site needing to pass it explicitly.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
