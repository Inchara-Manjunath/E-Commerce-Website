import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './index.css'
import App from './App.tsx'

// Configure axios base URL for split-hosting (e.g., Render). If VITE_API_BASE is set,
// all axios calls will use that origin (like https://your-backend.onrender.com).
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
