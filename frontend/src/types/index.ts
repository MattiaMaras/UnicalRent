export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    nome?: string;
    cognome?: string;
    telefono?: string;
    attivo: boolean;
    dataRegistrazione: string;
    // Aggiunti per Keycloak
    keycloakId?: string;
    firstName?: string;
    lastName?: string;
    // Campi carta di credito
    numeroCarta?: string;
    scadenzaCarta?: string;
    cvvCarta?: string;
    intestatarioCarta?: string;
    hasCartaCredito?: boolean;
}

// Nuova interfaccia per i dati della carta di credito
export interface CartaCredito {
    numeroCarta: string;
    scadenzaCarta: string;
    cvvCarta: string;
    intestatarioCarta: string;
}

export interface CartaCreditoCompleta extends CartaCredito {
    id?: number;
    tipoCarta?: string;
    principale?: boolean;
    mascherata?: boolean;
    dataCreazione?: string;
    scaduta?: boolean;
}

export interface Vehicle {
    id: string; // Mantieni string per compatibilità frontend
    targa: string;
    marca: string;
    modello: string;
    anno: number;
    tipo: 'AUTO' | 'SCOOTER';
    alimentazione: 'BENZINA' | 'DIESEL' | 'ELETTRICO' | 'IBRIDO';
    posti: number;
    descrizione?: string;
    costoOrario: number;
    attivo: boolean;
    disponibile?: boolean; // Aggiungi questo campo
    immagine?: string;
    dataAggiunta: string;
}

export interface Booking {
    id: string;
    dataInizio: string;
    dataFine: string;
    stato: 'ATTIVA' | 'COMPLETATA' | 'ANNULLATA';
    costoTotale: number;
    note?: string;
    dataCreazione: string;
    veicolo?: {
        id: string;
        marca: string;
        modello: string;
        targa: string;
        tipo: 'AUTO' | 'SCOOTER';
        alimentazione: 'BENZINA' | 'DIESEL' | 'ELETTRICO' | 'IBRIDO';
        posti: number;
        costoOrario: number;
    };
    utente?: {
        id: string;
        nome: string;
        cognome: string;
        email: string;
    };
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: () => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasRole: (role: string) => boolean;  // Aggiunto hasRole
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}