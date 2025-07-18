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
    // Converti l'ID da string a number per il backend
    const veicoloPerBackend = {
        ...veicolo,
        id: parseInt(veicolo.id, 10)
    };
    
    const response = await axios.put(`/veicoli/${veicolo.id}`, veicoloPerBackend);
    
    // Converti l'ID da number a string per il frontend
    return {
        ...response.data,
        id: response.data.id.toString()
    };
}

export interface DisponibilitaVeicolo {
    veicoloId: number;
    dateDisponibili: string[];
    dateOccupate: string[];
}

export async function getDisponibilitaVeicolo(veicoloId: string): Promise<DisponibilitaVeicolo> {
    const response = await axios.get(`/veicoli/${veicoloId}/disponibilita`);
    return response.data;
}

// Ottieni tutti i veicoli (per admin)
export async function getVeicoliTutti(): Promise<Vehicle[]> {
    const response = await axios.get('/veicoli/admin/tutti');
    return response.data;
}

// Riattiva un veicolo
export async function riattivaVeicolo(id: string): Promise<Vehicle> {
    const response = await axios.put(`/veicoli/${id}/riattiva`);
    return response.data;
}
