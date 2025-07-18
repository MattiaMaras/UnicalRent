import axios from '../api/axios';
import { Booking } from '../types';

/**
 * Recupera tutte le prenotazioni dell'utente autenticato
 */
export async function getPrenotazioni(): Promise<Booking[]> {
    const response = await axios.get('/prenotazioni/mybookings');

    // Se il backend risponde con JSON valido come array
    if (Array.isArray(response.data)) {
        return response.data;
    }

    // Se risponde con JSON annidato o stringa JSON
    try {
        const parsed = typeof response.data === 'string'
            ? JSON.parse(response.data)
            : response.data;

        return Array.isArray(parsed)
            ? parsed
            : parsed?.prenotazioni ?? [];
    } catch (err) {
        console.error("Errore nel parsing della risposta JSON:", err);
        return [];
    }
}


/**
 * Recupera tutte le prenotazioni (solo per ADMIN)
 */
export async function getTuttePrenotazioni(): Promise<Booking[]> {
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
            veicoloId: Number(veicoloId),
            inizio: dataInizio,
            fine: dataFine
        }
    });
    
    // Emetti evento per aggiornare la dashboard
    window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    
    return response.data;
};

/**
 * Cancella una prenotazione (soft-delete)
 */
export async function cancellaPrenotazione(id: string): Promise<void> {
    await axios.put(`/prenotazioni/${id}/cancella`);
    
    // Emetti evento per aggiornare la dashboard
    window.dispatchEvent(new CustomEvent('dashboard-refresh'));
}