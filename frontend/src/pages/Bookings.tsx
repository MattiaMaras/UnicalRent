import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { MockAPI } from '../data/mockData';
import { Booking } from '../types';
import { Calendar, Plus, Clock, Car, X, Eye } from 'lucide-react';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useToast} from "../contexts/ToastContext.tsx";

const Bookings: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const data = await MockAPI.getUserBookings(user?.id || '');
                setBookings(data);
            } catch (error) {
                console.error('Errore caricamento prenotazioni:', error);
                showToast('error', 'Errore nel caricamento delle prenotazioni');
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, [user, showToast]);

    const handleCancelBooking = async (bookingId: string) => {
        if (!window.confirm('Sei sicuro di voler annullare questa prenotazione?')) {
            return;
        }

        try {
            await MockAPI.cancelBooking(bookingId);
            setBookings(prev =>
                prev.map(booking =>
                    booking.id === bookingId
                        ? { ...booking, stato: 'ANNULLATA' }
                        : booking
                )
            );
            showToast('success', 'Prenotazione annullata con successo');
        } catch (error) {
            console.error('Errore annullamento prenotazione:', error);
            showToast('error', 'Errore durante l\'annullamento');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        switch (filter) {
            case 'active':
                return booking.stato === 'ATTIVA';
            case 'completed':
                return booking.stato === 'COMPLETATA';
            case 'cancelled':
                return booking.stato === 'ANNULLATA';
            default:
                return true;
        }
    });

    const canCancelBooking = (booking: Booking) => {
        if (booking.stato !== 'ATTIVA') return false;

        const startTime = new Date(booking.dataInizio);
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        return startTime > twoHoursFromNow;
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
                        <h1 className="text-3xl font-bold text-gray-900">Le Tue Prenotazioni</h1>
                        <p className="text-gray-600 mt-2">
                            {filteredBookings.length} prenotazioni trovate
                        </p>
                    </div>

                    <Link
                        to="/prenotazioni/nuova"
                        className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nuova Prenotazione
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'Tutte', count: bookings.length },
                            { key: 'active', label: 'Attive', count: bookings.filter(b => b.stato === 'ATTIVA').length },
                            { key: 'completed', label: 'Completate', count: bookings.filter(b => b.stato === 'COMPLETATA').length },
                            { key: 'cancelled', label: 'Annullate', count: bookings.filter(b => b.stato === 'ANNULLATA').length }
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {label} ({count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length > 0 ? (
                    <div className="space-y-6">
                        {filteredBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={handleCancelBooking}
                                canCancel={canCancelBooking(booking)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === 'all' ? 'Nessuna prenotazione' : `Nessuna prenotazione ${
                                filter === 'active' ? 'attiva' :
                                    filter === 'completed' ? 'completata' : 'annullata'
                            }`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? 'Non hai ancora effettuato prenotazioni'
                                : 'Cambia filtro per vedere altre prenotazioni'
                            }
                        </p>
                        {filter === 'all' && (
                            <Link
                                to="/prenotazioni/nuova"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Crea la tua prima prenotazione
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const BookingCard: React.FC<{
    booking: Booking;
    onCancel: (id: string) => void;
    canCancel: boolean;
}> = ({ booking, onCancel, canCancel }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ATTIVA':
                return 'bg-green-100 text-green-800';
            case 'COMPLETATA':
                return 'bg-blue-100 text-blue-800';
            case 'ANNULLATA':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUpcoming = new Date(booking.dataInizio) > new Date();
    const isActive = booking.stato === 'ATTIVA' && new Date(booking.dataInizio) <= new Date() && new Date(booking.dataFine) >= new Date();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {booking.veicolo?.marca} {booking.veicolo?.modello}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Targa: {booking.veicolo?.targa}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.stato)}`}>
              {booking.stato}
            </span>
                        {isActive && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 animate-pulse">
                In corso
              </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-600">Inizio</p>
                            <p className="font-medium">{formatDateTime(booking.dataInizio)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-600">Fine</p>
                            <p className="font-medium">{formatDateTime(booking.dataFine)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <div>
                            <p className="text-sm text-gray-600">Costo Totale</p>
                            <p className="font-bold text-green-600">€{booking.costoTotale.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {booking.note && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Note:</strong> {booking.note}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Prenotata il {new Date(booking.dataCreazione).toLocaleDateString('it-IT')}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            to={`/prenotazioni/${booking.id}`}
                            className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Dettagli
                        </Link>

                        {canCancel && (
                            <button
                                onClick={() => onCancel(booking.id)}
                                className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Annulla
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bookings;