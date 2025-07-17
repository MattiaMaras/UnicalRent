import React, { useEffect, useState } from 'react';
import { getPrenotazioni, cancellaPrenotazione } from '../services/PrenotazioniService.ts';
import { Booking } from '../types';

const Bookings: React.FC = () => {
    const [prenotazioni, setPrenotazioni] = useState<Booking[]>([]);

    useEffect(() => {
        // Recupera prenotazioni dal backend
        getPrenotazioni()
            .then(setPrenotazioni)
            .catch((err) => console.error('Errore nel recupero prenotazioni:', err));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await cancellaPrenotazione(id);
            setPrenotazioni(prenotazioni.filter(p => p.id !== id));
        } catch (err) {
            console.error('Errore nella cancellazione:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Le tue prenotazioni</h2>
            {prenotazioni.length === 0 ? (
                <p className="text-gray-600">Nessuna prenotazione trovata.</p>
            ) : (
                <ul className="space-y-4">
                    {prenotazioni.map((prenotazione) => (
                        <li
                            key={prenotazione.id}
                            className="bg-white p-4 rounded shadow flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{prenotazione.veicolo?.modello ?? 'Modello sconosciuto'}</p>
                                <p className="text-sm text-gray-600">
                                    {prenotazione.dataInizio} → {prenotazione.dataFine}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(prenotazione.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                                Cancella
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Bookings;