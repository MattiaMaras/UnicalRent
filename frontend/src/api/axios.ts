// src/api/axios.ts
import axios from 'axios';

const istanzaAxios = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercettore migliorato per aggiungere il token JWT alle richieste
istanzaAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Verifica che il token sia valido prima di aggiungerlo
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

// Intercettore per gestire errori di autenticazione
istanzaAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido, rimuovilo
      localStorage.removeItem('token');
      // Opzionalmente, reindirizza al login per endpoint protetti
    }
    return Promise.reject(error);
  }
);

export default istanzaAxios;