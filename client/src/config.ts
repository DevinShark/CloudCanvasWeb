// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cloudcanvas-backend.onrender.com';

// Update all API requests to use this base URL
export const getApiUrl = (path: string) => {
  // If we're in a browser, use the relative path for same-origin API requests
  if (typeof window !== 'undefined' && window.location.hostname === 'cloudcanvas.wuaze.com') {
    // For the wuaze domain, we'll use relative paths
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
  }

  // Otherwise use the full API URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}; 