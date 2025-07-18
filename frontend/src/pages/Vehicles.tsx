import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getVeicoli, eliminaVeicolo, getDisponibilitaVeicolo, getVeicoliTutti, riattivaVeicolo } from '../services/VeicoliService';
import { Vehicle } from '../types';
import { Car, Search, Plus, Edit, Trash2, Fuel, Users, Calendar, Filter, RefreshCw } from 'lucide-react';

const Vehicles: React.FC = () => {
    const { user, hasRole } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedFuel, setSelectedFuel] = useState<string>('');
    const [sortBy, setSortBy] = useState<'marca' | 'prezzo' | 'anno'>('marca');
    const [showInactive, setShowInactive] = useState(false);
    
    // Stati per il filtro disponibilità
    const [dataInizio, setDataInizio] = useState('');
    const [dataFine, setDataFine] = useState('');
    const [loadingDisponibilita, setLoadingDisponibilita] = useState(false);
    const [erroreValidazione, setErroreValidazione] = useState('');

    // Funzione per ottenere la data corrente in formato date
    const getMinDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    // Funzione per gestire il cambio della data di inizio
    const handleDataInizioChange = (value: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            setErroreValidazione('La data di inizio non può essere precedente a oggi');
            return;
        }
        
        setErroreValidazione('');
        setDataInizio(value);
        
        // Se la data di fine è precedente o uguale alla nuova data di inizio, resettala
        if (dataFine && value && new Date(value) >= new Date(dataFine)) {
            setDataFine('');
        }
    };

    // Funzione per gestire il cambio della data di fine
    const handleDataFineChange = (value: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            setErroreValidazione('La data di fine non può essere precedente a oggi');
            return;
        }
        
        if (dataInizio && selectedDate <= new Date(dataInizio)) {
            setErroreValidazione('La data di fine deve essere successiva a quella di inizio');
            return;
        }
        
        setErroreValidazione('');
        setDataFine(value);
    };

    const loadVehicles = async () => {
        try {
            let data;
            if (showInactive && hasRole('ADMIN')) {
                // Carica tutti i veicoli e filtra solo quelli disattivati
                const allVehicles = await getVeicoliTutti();
                data = allVehicles.filter(vehicle => !vehicle.attivo);
            } else {
                // Carica solo i veicoli attivi
                data = await getVeicoli();
            }
            setVehicles(data);
            setFilteredVehicles(data);
        } catch (error) {
            console.error('Errore caricamento veicoli:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateVehicle = async (id: string) => {
        if (window.confirm('Confermi la riattivazione del veicolo?')) {
            try {
                await riattivaVeicolo(id);
                loadVehicles(); // Ricarica la lista
            } catch (error) {
                console.error('Errore riattivazione veicolo:', error);
            }
        }
    };

    useEffect(() => {
        loadVehicles();
    }, [showInactive]);

    const verificaDisponibilita = async (veicoloId: string, inizio: string, fine: string): Promise<boolean> => {
        try {
            const disponibilita = await getDisponibilitaVeicolo(veicoloId);
            const dataInizioObj = new Date(inizio);
            const dataFineObj = new Date(fine);
            
            // Verifica se ci sono date occupate nel periodo selezionato
            return !disponibilita.dateOccupate.some(dataOccupata => {
                const dataOccupataObj = new Date(dataOccupata);
                return dataOccupataObj >= dataInizioObj && dataOccupataObj <= dataFineObj;
            });
        } catch (error) {
            console.error('Errore verifica disponibilità:', error);
            return false;
        }
    };

    useEffect(() => {
        const applyFilters = async () => {
            setLoadingDisponibilita(true);
            
            let filtered = vehicles.filter(vehicle => {
                const matchesSearch = !searchTerm ||
                    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    vehicle.modello.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    vehicle.targa.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesType = !selectedType || vehicle.tipo === selectedType;
                const matchesFuel = !selectedFuel || vehicle.alimentazione === selectedFuel;

                return matchesSearch && matchesType && matchesFuel;
            });

            // Filtro per disponibilità se le date sono selezionate
            if (dataInizio && dataFine) {
                const veicoliDisponibili = [];
                
                for (const vehicle of filtered) {
                    const isDisponibile = await verificaDisponibilita(vehicle.id, dataInizio, dataFine);
                    if (isDisponibile) {
                        veicoliDisponibili.push(vehicle);
                    }
                }
                
                filtered = veicoliDisponibili;
            }

            // Ordinamento
            filtered.sort((a, b) => {
                switch (sortBy) {
                    case 'marca':
                        return a.marca.localeCompare(b.marca);
                    case 'prezzo':
                        return a.costoOrario - b.costoOrario;
                    case 'anno':
                        return b.anno - a.anno;
                    default:
                        return 0;
                }
            });

            setFilteredVehicles(filtered);
            setLoadingDisponibilita(false);
        };

        applyFilters();
    }, [vehicles, searchTerm, selectedType, selectedFuel, sortBy, dataInizio, dataFine]);

    const resetFiltroDisponibilita = () => {
        setDataInizio('');
        setDataFine('');
        setErroreValidazione('');
    };

    const handleDeleteVehicle = async (id: string) => {
        if (window.confirm('Confermi la rimozione del veicolo?')) {
            try {
                await eliminaVeicolo(id);
                setVehicles(prev => prev.filter(v => v.id !== id));
            } catch (error) {
                console.error('Errore eliminazione veicolo:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {showInactive && hasRole('ADMIN') ? "Veicoli Disattivati" : "Veicoli Disponibili"}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {filteredVehicles.length} veicoli {showInactive && hasRole('ADMIN') ? "disattivati" : "trovati"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        {user && hasRole('ADMIN') && (
                            <>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showInactive}
                                        onChange={(e) => setShowInactive(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-gray-700">Mostra disattivati</span>
                                </label>
                                <Link
                                    to="/veicoli/aggiungi"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Aggiungi Veicolo
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Cerca veicoli..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tutti i tipi</option>
                            <option value="AUTO">Auto</option>
                            <option value="SCOOTER">Scooter</option>
                        </select>

                        <select
                            value={selectedFuel}
                            onChange={(e) => setSelectedFuel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tutti i carburanti</option>
                            <option value="BENZINA">Benzina</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="ELETTRICO">Elettrico</option>
                            <option value="IBRIDO">Ibrido</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'prezzo' | 'anno' | 'marca')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="prezzo">Ordina per prezzo</option>
                            <option value="anno">Ordina per anno</option>
                            <option value="marca">Ordina per marca</option>
                        </select>
                    </div>

                    {/* Sezione filtro disponibilità */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center mb-3">
                            <Filter className="h-5 w-5 text-gray-500 mr-2" />
                            <h3 className="text-sm font-medium text-gray-700">Filtra per disponibilità</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Data inizio
                                </label>
                                <input
                                    type="date"
                                    value={dataInizio}
                                    onChange={(e) => handleDataInizioChange(e.target.value)}
                                    min={getMinDate()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Data fine
                                </label>
                                <input
                                    type="date"
                                    value={dataFine}
                                    onChange={(e) => handleDataFineChange(e.target.value)}
                                    min={dataInizio || getMinDate()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Messaggio di errore */}
                        {erroreValidazione && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{erroreValidazione}</p>
                            </div>
                        )}
                        
                        {/* Azioni e stato */}
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {(dataInizio || dataFine) && (
                                    <button
                                        onClick={resetFiltroDisponibilita}
                                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                                
                                {loadingDisponibilita && (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        <span className="text-xs text-gray-600">Verifica...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Filtro attivo */}
                        {dataInizio && dataFine && !erroreValidazione && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Filtro attivo:</strong> Mostrando solo veicoli disponibili dal {' '}
                                    {new Date(dataInizio).toLocaleDateString('it-IT')} al {' '}
                                    {new Date(dataFine).toLocaleDateString('it-IT')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            onDelete={handleDeleteVehicle}
                            onReactivate={handleReactivateVehicle}
                            isAdmin={hasRole('ADMIN')}
                        />
                    ))}
                </div>

                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {showInactive && hasRole('ADMIN') 
                                ? "Nessun veicolo disattivato" 
                                : "Nessun veicolo trovato"
                            }
                        </h3>
                        <p className="text-gray-600">
                            {showInactive && hasRole('ADMIN')
                                ? "Non ci sono veicoli disattivati al momento"
                                : "Prova a modificare i filtri di ricerca"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const VehicleCard: React.FC<{
    vehicle: Vehicle;
    onDelete: (id: string) => void;
    onReactivate?: (id: string) => void;
    isAdmin: boolean;
}> = ({ vehicle, onDelete, onReactivate, isAdmin }) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'AUTO': return '🚗';
            case 'SCOOTER': return '🛵';
            default: return '🚗';
        }
    };

    const getFuelColor = (fuel: string) => {
        switch (fuel) {
            case 'ELETTRICO': return 'bg-green-100 text-green-800';
            case 'IBRIDO': return 'bg-blue-100 text-blue-800';
            case 'BENZINA': return 'bg-yellow-100 text-yellow-800';
            case 'DIESEL': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(vehicle.id);
    };

    const handleReactivateClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onReactivate?.(vehicle.id);
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
            !vehicle.attivo ? 'opacity-60 border-2 border-red-200' : ''
        }`}>
            <div className="relative h-48 bg-gray-200">
                {vehicle.immagine ? (
                    <img
                        src={vehicle.immagine}
                        alt={`${vehicle.marca} ${vehicle.modello}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = ''; // fallback vuoto
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        {getTypeIcon(vehicle.tipo)}
                    </div>
                )}

                <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-2 py-1 rounded-lg text-xs font-medium">
                    {vehicle.tipo}
                </div>

                {isAdmin && (
                    <div className="absolute top-3 right-3 flex space-x-1">
                        {vehicle.attivo ? (
                            <>
                                <Link
                                    to={`/veicoli/modifica/${vehicle.id}`}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={handleDeleteClick}
                                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                                    type="button"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={handleReactivateClick}
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                title="Riattiva veicolo"
                                type="button"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.marca} {vehicle.modello}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">
                        €{vehicle.costoOrario.toFixed(2)}/h
                    </span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Targa:</span>
                        <span className="font-medium">{vehicle.targa}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Anno:</span>
                        <span className="font-medium">{vehicle.anno}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Posti:</span>
                        <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{vehicle.posti}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFuelColor(vehicle.alimentazione)}`}>
                        <Fuel className="h-3 w-3 mr-1" />
                        {vehicle.alimentazione}
                    </span>
                    {!vehicle.attivo && (
                        <span className="text-xs text-red-600 font-medium">
                            DISATTIVATO
                        </span>
                    )}
                </div>

                {vehicle.descrizione && (
                    <p className="text-sm text-gray-600 mb-4">
                        {vehicle.descrizione}
                    </p>
                )}

                {vehicle.attivo && (
                    <div className="flex space-x-2">
                        <Link
                            to={`/prenotazioni/nuova?veicolo=${vehicle.id}`}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                        >
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Prenota
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vehicles;
