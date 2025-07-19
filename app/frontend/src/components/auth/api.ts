const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    // Send username or email depending on input
    const payload = credentials.identifier.includes('@')
      ? { email: credentials.identifier, password: credentials.password }
      : { username: credentials.identifier, password: credentials.password };
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { data, status: response.status };
  },

  signup: async (userData: { username: string; email: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { data, status: response.status };
  },
}; 