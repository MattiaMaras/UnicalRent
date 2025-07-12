import { Vehicle, Booking } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    targa: 'AB123CD',
    marca: 'Fiat',
    modello: '500',
    anno: 2022,
    tipo: 'AUTO',
    carburante: 'BENZINA',
    posti: 4,
    descrizione: 'Piccola e agile, perfetta per la città',
    costoOrario: 8.50,
    attivo: true,
    immagine: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    dataAggiunta: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    targa: 'EF456GH',
    marca: 'Toyota',
    modello: 'Yaris',
    anno: 2023,
    tipo: 'AUTO',
    carburante: 'IBRIDO',
    posti: 5,
    descrizione: 'Ecologica e spaziosa, consumi ridotti',
    costoOrario: 12.00,
    attivo: true,
    immagine: 'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    dataAggiunta: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    targa: 'IJ789KL',
    marca: 'Honda',
    modello: 'SH 125',
    anno: 2022,
    tipo: 'SCOOTER',
    carburante: 'BENZINA',
    posti: 2,
    descrizione: 'Scooter veloce e pratico per muoversi rapidamente',
    costoOrario: 6.00,
    attivo: true,
    immagine: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    dataAggiunta: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    targa: 'MN012OP',
    marca: 'Vespa',
    modello: 'Primavera 150',
    anno: 2023,
    tipo: 'SCOOTER',
    carburante: 'BENZINA',
    posti: 2,
    descrizione: 'Stile italiano, comfort e praticità',
    costoOrario: 7.50,
    attivo: true,
    immagine: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    dataAggiunta: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    targa: 'UV678WX',
    marca: 'Nissan',
    modello: 'Leaf',
    anno: 2023,
    tipo: 'AUTO',
    carburante: 'ELETTRICO',
    posti: 5,
    descrizione: 'Auto 100% elettrica, zero emissioni',
    costoOrario: 15.00,
    attivo: true,
    immagine: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    dataAggiunta: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    targa: 'QR345ST',
    marca: 'BMW',
    modello: 'i3',
    anno: 2023,
    tipo: 'AUTO',
    carburante: 'ELETTRICO',
    posti: 4,
    descrizione: 'Auto elettrica premium con design innovativo',
    costoOrario: 18.00,
    attivo: true,
    immagine: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    dataAggiunta: '2024-01-01T00:00:00Z'
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '2',
    veicoloId: '1',
    dataInizio: '2024-01-15T09:00:00Z',
    dataFine: '2024-01-15T12:00:00Z',
    stato: 'COMPLETATA',
    costoTotale: 25.50,
    note: 'Viaggio per università',
    dataCreazione: '2024-01-14T15:30:00Z'
  },
  {
    id: '2',
    userId: '2',
    veicoloId: '3',
    dataInizio: '2024-01-20T14:00:00Z',
    dataFine: '2024-01-20T16:00:00Z',
    stato: 'COMPLETATA',
    costoTotale: 12.00,
    note: 'Commissioni in centro',
    dataCreazione: '2024-01-19T10:15:00Z'
  },
  {
    id: '3',
    userId: '3',
    veicoloId: '2',
    dataInizio: '2024-01-25T10:00:00Z',
    dataFine: '2024-01-25T18:00:00Z',
    stato: 'ATTIVA',
    costoTotale: 96.00,
    note: 'Gita fuori città',
    dataCreazione: '2024-01-24T12:00:00Z'
  },
  {
    id: '4',
    userId: '2',
    veicoloId: '5',
    dataInizio: '2024-01-28T08:00:00Z',
    dataFine: '2024-01-28T10:00:00Z',
    stato: 'ATTIVA',
    costoTotale: 7.00,
    note: 'Spostamento eco-friendly',
    dataCreazione: '2024-01-27T14:20:00Z'
  }
];

// Utility per simulare delay API
export const simulateApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API functions
export class MockAPI {
  // Vehicles
  static async getVehicles(): Promise<Vehicle[]> {
    await simulateApiDelay();
    return mockVehicles.filter(v => v.attivo);
  }

  static async getVehicleById(id: string): Promise<Vehicle | null> {
    await simulateApiDelay();
    return mockVehicles.find(v => v.id === id && v.attivo) || null;
  }

  static async getAvailableVehicles(startDate: string, endDate: string): Promise<Vehicle[]> {
    await simulateApiDelay();
    
    // Simula logica di disponibilità
    const bookedVehicleIds = mockBookings
      .filter(b => b.stato === 'ATTIVA' && 
        ((new Date(b.dataInizio) <= new Date(endDate)) && 
         (new Date(b.dataFine) >= new Date(startDate))))
      .map(b => b.veicoloId);
    
    return mockVehicles.filter(v => v.attivo && !bookedVehicleIds.includes(v.id));
  }

  static async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    await simulateApiDelay();
    
    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      targa: vehicleData.targa || '',
      marca: vehicleData.marca || '',
      modello: vehicleData.modello || '',
      anno: vehicleData.anno || new Date().getFullYear(),
      tipo: vehicleData.tipo || 'AUTO',
      carburante: vehicleData.carburante || 'BENZINA',
      posti: vehicleData.posti || 4,
      descrizione: vehicleData.descrizione || '',
      costoOrario: vehicleData.costoOrario || 10.00,
      attivo: true,
      immagine: vehicleData.immagine,
      dataAggiunta: new Date().toISOString()
    };
    
    mockVehicles.push(newVehicle);
    return newVehicle;
  }

  static async updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> {
    await simulateApiDelay();
    
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index === -1) return null;
    
    mockVehicles[index] = { ...mockVehicles[index], ...vehicleData };
    return mockVehicles[index];
  }

  static async deleteVehicle(id: string): Promise<boolean> {
    await simulateApiDelay();
    
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    // Soft delete
    mockVehicles[index].attivo = false;
    return true;
  }

  // Bookings
  static async getBookings(): Promise<Booking[]> {
    await simulateApiDelay();
    return mockBookings.map(booking => ({
      ...booking,
      utente: mockUsers.find(u => u.id === booking.userId),
      veicolo: mockVehicles.find(v => v.id === booking.veicoloId)
    }));
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    await simulateApiDelay();
    return mockBookings
      .filter(b => b.userId === userId)
      .map(booking => ({
        ...booking,
        veicolo: mockVehicles.find(v => v.id === booking.veicoloId)
      }));
  }

  static async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    await simulateApiDelay();
    
    // Verifica sovrapposizioni
    const overlappingBookings = mockBookings.filter(b => 
      b.veicoloId === bookingData.veicoloId &&
      b.stato === 'ATTIVA' &&
      ((new Date(b.dataInizio) < new Date(bookingData.dataFine!)) && 
       (new Date(b.dataFine) > new Date(bookingData.dataInizio!)))
    );
    
    if (overlappingBookings.length > 0) {
      throw new Error('Veicolo non disponibile per il periodo selezionato');
    }
    
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: bookingData.userId || '',
      veicoloId: bookingData.veicoloId || '',
      dataInizio: bookingData.dataInizio || '',
      dataFine: bookingData.dataFine || '',
      stato: 'ATTIVA',
      costoTotale: bookingData.costoTotale || 0,
      note: bookingData.note,
      dataCreazione: new Date().toISOString()
    };
    
    mockBookings.push(newBooking);
    return newBooking;
  }

  static async cancelBooking(id: string): Promise<boolean> {
    await simulateApiDelay();
    
    const booking = mockBookings.find(b => b.id === id);
    if (!booking) return false;
    
    booking.stato = 'ANNULLATA';
    return true;
  }
}

// Export degli utenti mock per context
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@unical.it',
    role: 'ADMIN' as const,
    nome: 'Mario',
    cognome: 'Rossi',
    telefono: '123456789',
    attivo: true,
    dataRegistrazione: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'studente1',
    email: 'studente1@studenti.unical.it',
    role: 'UTENTE' as const,
    nome: 'Giulia',
    cognome: 'Bianchi',
    telefono: '987654321',
    attivo: true,
    dataRegistrazione: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    username: 'studente2',
    email: 'studente2@studenti.unical.it',
    role: 'UTENTE' as const,
    nome: 'Luca',
    cognome: 'Verdi',
    telefono: '456789123',
    attivo: true,
    dataRegistrazione: '2024-02-01T00:00:00Z'
  }
];

export { mockUsers };