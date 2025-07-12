export interface User {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'UTENTE';
    nome?: string;
    cognome?: string;
    telefono?: string;
    attivo: boolean;
    dataRegistrazione: string;
    // Aggiunti per Keycloak
    keycloakId?: string;
    firstName?: string;
    lastName?: string;
}

export interface Vehicle {
    id: string;
    targa: string;
    marca: string;
    modello: string;
    anno: number;
    tipo: 'AUTO' | 'SCOOTER';
    carburante: 'BENZINA' | 'DIESEL' | 'ELETTRICO' | 'IBRIDO';
    posti: number;
    descrizione?: string;
    costoOrario: number;
    attivo: boolean;
    immagine?: string;
    dataAggiunta: string;
}

export interface Booking {
    id: string;
    userId: string;
    veicoloId: string;
    dataInizio: string;
    dataFine: string;
    stato: 'ATTIVA' | 'COMPLETATA' | 'ANNULLATA';
    costoTotale: number;
    note?: string;
    dataCreazione: string;

    // Campi popolati per display
    utente?: User;
    veicolo?: Vehicle;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: () => Promise<boolean>; // Modificato: non più username/password
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean; // Aggiunto
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}