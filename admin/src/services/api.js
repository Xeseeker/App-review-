import axios from 'axios';
import { supabase } from './supabase';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api' });
api.interceptors.request.use(async (config) => { const { data } = await supabase?.auth.getSession() || {}; if (data?.session?.access_token) config.headers.Authorization = `Bearer ${data.session.access_token}`; return config; });
export const messageFrom = (error) => error.response?.data?.error?.message || 'Something went wrong. Please try again.';
export default api;
