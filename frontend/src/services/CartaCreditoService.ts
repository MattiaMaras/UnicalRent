import axios from 'axios';
import { CartaCredito } from '../types';

// Configura l'interceptor per includere il token di autenticazione
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const aggiornaCartaCredito = async (cartaCredito: CartaCredito): Promise<void> => {
  await axios.put('/api/utenti/me/carta-credito', cartaCredito);
};

export const hasCartaCreditoValida = async (): Promise<boolean> => {
  const response = await axios.get<boolean>('/api/utenti/me/carta-credito/valida');
  return response.data;
};

export const getCartaCredito = async (): Promise<CartaCredito | null> => {
  try {
    const response = await axios.get<CartaCredito>('/api/utenti/me/carta-credito');
    return response.data;
  } catch (error) {
    return null;
  }
};