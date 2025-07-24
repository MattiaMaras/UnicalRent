import axios from '../api/axios'; // Usa l'istanza configurata
import { CartaCredito } from '../types';

export interface CartaCreditoCompleta extends CartaCredito {
  id?: number;
  tipoCarta?: string;
  principale?: boolean;
  mascherata?: boolean;
  dataCreazione?: string;
  scaduta?: boolean;
}

export const aggiornaCartaCredito = async (cartaCredito: CartaCredito): Promise<void> => {
  await axios.put('/utenti/me/carta-credito', cartaCredito);
};

export const hasCartaCreditoValida = async (): Promise<boolean> => {
  const response = await axios.get<boolean>('/carte-credito/valida');
  return response.data;
};

export const getCartaCredito = async (): Promise<CartaCredito | null> => {
  try {
    const response = await axios.get<CartaCredito>('/utenti/me/carta-credito');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getCarteCredito = async (): Promise<CartaCreditoCompleta[]> => {
  try {
    const response = await axios.get<CartaCreditoCompleta[]>('/carte-credito');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Errore nel caricamento delle carte:', error);
    return [];
  }
};

export const aggiungiCartaCredito = async (cartaCredito: CartaCredito): Promise<CartaCreditoCompleta> => {
  const response = await axios.post<CartaCreditoCompleta>('/carte-credito', cartaCredito);
  return response.data;
};

export const rimuoviCartaCredito = async (cartaId: number): Promise<void> => {
  await axios.delete(`/carte-credito/${cartaId}`);
};

export const impostaCartaPrincipale = async (cartaId: number): Promise<CartaCreditoCompleta> => {
  const response = await axios.put<CartaCreditoCompleta>(`/carte-credito/${cartaId}/principale`);
  return response.data;
};