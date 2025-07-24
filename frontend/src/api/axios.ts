import axios from 'axios';

const istanzaAxios = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

istanzaAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token && isValidToken(token)) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

// Funzione per verificare se il token è valido (non scaduto)
function isValidToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.warn('Token non valido:', error);
    return false;
  }
}

istanzaAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default istanzaAxios;