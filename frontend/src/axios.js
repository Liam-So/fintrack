import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.DEMO_MODE ? import.meta.env.VITE_DEMO_BACKEND_URL : import.meta.env.VITE_DEV_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});