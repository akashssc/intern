// Configuration for API URLs
const getApiUrl = () => {
  // Check if we're in production by looking at the hostname
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // In production, always use the deployed backend
    return 'https://intern-3ypr.onrender.com';
  }
  
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_URL = "https://intern-3ypr.onrender.com/api";