// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cloudcanvas-backend.onrender.com';

// Update all API requests to use this base URL
export const getApiUrl = (path: string) => {
  // Always use the full API URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}; 