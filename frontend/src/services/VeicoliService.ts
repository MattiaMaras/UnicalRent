import axios from '../api/axios';
import { Vehicle } from '../types';

/**
 * Recupera l'elenco di tutti i veicoli
 */
export const getVeicoli = async (): Promise<Vehicle[]> => {
    const risposta = await axios.get('/veicoli');
    return risposta.data;
};

/**
 * Crea un nuovo veicolo
 */
export async function creaVeicolo(veicolo: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const risposta = await axios.post('/veicoli', veicolo);
    return risposta.data;
}

/**
 * Recupera un veicolo per ID
 */
export async function getVeicoloById(id: string): Promise<Vehicle> {
    const risposta = await axios.get(`/veicoli/${id}`);
    return risposta.data;
}

/**
 * Elimina un veicolo
 */
export async function eliminaVeicolo(id: string): Promise<void> {
    await axios.delete(`/veicoli/${id}`);
}

export async function aggiornaVeicolo(veicolo: Vehicle): Promise<Vehicle> {
    const response = await axios.put(`/veicoli/${veicolo.id}`, veicolo);
    return response.data;
}