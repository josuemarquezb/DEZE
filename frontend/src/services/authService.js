// services/authService.js — auth API calls. Mirrors backend/routes/auth.js.

import api from './api.js';

/** POST /auth/signup — create a new account (customer or detailer). */
export const signup = (data) => api.post('/auth/signup', data).then((res) => res.data);

/** POST /auth/login — authenticate with email/password. */
export const login = (data) => api.post('/auth/login', data).then((res) => res.data);

/** POST /auth/logout — end the current session. */
export const logout = () => api.post('/auth/logout').then((res) => res.data);
