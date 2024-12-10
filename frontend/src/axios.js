import axios from 'axios';

const baseURL = import.meta.env.DEMO_MODE ? import.meta.env.VITE_DEMO_BACKEND_URL : import.meta.env.VITE_DEV_BACKEND_URL;
console.log('baseURL:', baseURL);

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});