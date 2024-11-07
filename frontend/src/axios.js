import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${yourAuthToken}` // Replace with your actual auth token
  }
});