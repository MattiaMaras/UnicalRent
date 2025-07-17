import axios from '../api/axios';
import { Booking } from '../types';

/**
 * Recupera tutte le prenotazioni dell'utente autenticato
 */
export async function getPrenotazioni(): Promise<Booking[]> {
    const risposta = await axios.get('/prenotazioni');
    return risposta.data;
}

/**
 * Crea una nuova prenotazione
 */

export const creaPrenotazione = async (
    veicoloId: string,
    dataInizio: string,
    dataFine: string
): Promise<Booking> => {
    const response = await axios.post<Booking>('/prenotazioni', null, {
        params: {
            veicoloId: Number(veicoloId), // Converti a numero
            inizio: dataInizio,
            fine: dataFine
        }
    });
    return response.data;
};

/**
 * Cancella una prenotazione (soft-delete)
 */
export async function cancellaPrenotazione(id: string): Promise<void> {
    await axios.delete(`/prenotazioni/${id}`);
}