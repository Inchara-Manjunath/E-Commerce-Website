import axios from 'axios';

const baseURL =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : '';

export const api = axios.create({
  baseURL
});


