// Configuration for API URLs
const getApiUrl = () => {
  // In production (Render), use the environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://intern-3ypr.onrender.com';
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl(); 