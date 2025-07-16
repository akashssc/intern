const API_URL = 'http://localhost:5000';

export const authApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: credentials.identifier, password: credentials.password }),
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