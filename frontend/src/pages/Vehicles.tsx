import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MockAPI } from '../data/mockData';
import { Vehicle } from '../types';
import { Car, Search, Filter, Plus, Edit, Trash2, Fuel, Users, Calendar } from 'lucide-react';
import {useAuth} from "../contexts/AuthContext.tsx";

const Vehicles: React.FC = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedFuel, setSelectedFuel] = useState<string>('');
    const [sortBy, setSortBy] = useState<'prezzo' | 'anno' | 'marca'>('prezzo');

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const data = await MockAPI.getVehicles();
                setVehicles(data);
                setFilteredVehicles(data);
            } catch (error) {
                console.error('Errore caricamento veicoli:', error);
            } finally {
                setLoading(false);
            }
        };

        loadVehicles();
    }, []);

    useEffect(() => {
        let filtered = vehicles.filter(vehicle => {
            const matchesSearch = !searchTerm ||
                vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.modello.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.targa.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = !selectedType || vehicle.tipo === selectedType;
            const matchesFuel = !selectedFuel || vehicle.carburante === selectedFuel;

            return matchesSearch && matchesType && matchesFuel;
        });

        // Ordinamento
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'prezzo':
                    return a.costoOrario - b.costoOrario;
                case 'anno':
                    return b.anno - a.anno;
                case 'marca':
                    return a.marca.localeCompare(b.marca);
                default:
                    return 0;
            }
        });

        setFilteredVehicles(filtered);
    }, [vehicles, searchTerm, selectedType, selectedFuel, sortBy]);

    const handleDeleteVehicle = async (id: string) => {
        if (window.confirm('Sei sicuro di voler eliminare questo veicolo?')) {
            try {
                await MockAPI.deleteVehicle(id);
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
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Veicoli Disponibili</h1>
                        <p className="text-gray-600 mt-2">
                            {filteredVehicles.length} veicoli trovati
                        </p>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/veicoli/aggiungi"
                            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Aggiungi Veicolo
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
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

                        {/* Type Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tutti i tipi</option>
                            <option value="AUTO">Auto</option>
                            <option value="SCOOTER">Scooter</option>
                        </select>

                        {/* Fuel Filter */}
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

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="prezzo">Ordina per prezzo</option>
                            <option value="anno">Ordina per anno</option>
                            <option value="marca">Ordina per marca</option>
                        </select>
                    </div>
                </div>

                {/* Vehicles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            isAdmin={user?.role === 'ADMIN'}
                            onDelete={handleDeleteVehicle}
                        />
                    ))}
                </div>

                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nessun veicolo trovato
                        </h3>
                        <p className="text-gray-600">
                            Prova a modificare i filtri di ricerca
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const VehicleCard: React.FC<{
    vehicle: Vehicle;
    isAdmin: boolean;
    onDelete: (id: string) => void;
}> = ({ vehicle, isAdmin, onDelete }) => {
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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Vehicle Image */}
            <div className="relative h-48 bg-gray-200">
                {vehicle.immagine ? (
                    <img
                        src={vehicle.immagine}
                        alt={`${vehicle.marca} ${vehicle.modello}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        {getTypeIcon(vehicle.tipo)}
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-2 py-1 rounded-lg text-xs font-medium">
                    {vehicle.tipo}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                    <div className="absolute top-3 right-3 flex space-x-1">
                        <Link
                            to={`/veicoli/modifica/${vehicle.id}`}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => onDelete(vehicle.id)}
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Vehicle Info */}
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

                {/* Fuel Badge */}
                <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFuelColor(vehicle.carburante)}`}>
            <Fuel className="h-3 w-3 mr-1" />
              {vehicle.carburante}
          </span>
                </div>

                {/* Description */}
                {vehicle.descrizione && (
                    <p className="text-sm text-gray-600 mb-4">
                        {vehicle.descrizione}
                    </p>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                    <Link
                        to={`/prenotazioni/nuova?veicolo=${vehicle.id}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                    >
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Prenota
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Vehicles;