import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Car, CreditCard, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { getPrenotazioni, cancellaPrenotazione } from '../services/PrenotazioniService';
import { Booking } from '../types';

const BookingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const loadBooking = async () => {
            try {
                const bookings = await getPrenotazioni();
                // Fix type comparison issue by converting both to string
                const foundBooking = bookings.find(b => b.id.toString() === id);
                if (foundBooking) {
                    setBooking(foundBooking);
                } else {
                    showToast('error', 'Prenotazione non trovata');
                    navigate('/prenotazioni');
                }
            } catch (error) {
                console.error('Errore caricamento prenotazione:', error);
                showToast('error', 'Errore nel caricamento della prenotazione');
                navigate('/prenotazioni');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadBooking();
        }
    }, [id, navigate, showToast]);

    const formatDateTime = (date: string) =>
        new Date(date).toLocaleString('it-IT', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ATTIVA': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETATA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ANNULLATA': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ATTIVA': return <CheckCircle className="h-5 w-5" />;
            case 'COMPLETATA': return <CheckCircle className="h-5 w-5" />;
            case 'ANNULLATA': return <X className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    const canCancelBooking = () => {
        if (!booking || booking.stato !== 'ATTIVA') return { canCancel: false, reason: 'Prenotazione non attiva', penalty: false };
        
        const startTime = new Date(booking.dataInizio);
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        if (startTime <= twoHoursFromNow) {
            return { 
                canCancel: false, 
                reason: 'Cancellazione non consentita: mancano meno di 2 ore all\'inizio',
                penalty: true
            };
        }
        
        return { canCancel: true, reason: '', penalty: false };
    };

    const calculatePenalty = () => {
        if (!booking) return 0;
        // Multa del 20% del costo totale se si cancella entro 2 ore
        return booking.costoTotale * 0.2;
    };

    const handleCancelBooking = async () => {
        if (!booking) return;
        
        const { penalty } = canCancelBooking();
        
        let confirmMessage = 'Sei sicuro di voler annullare questa prenotazione?';
        if (penalty) {
            const penaltyAmount = calculatePenalty();
            confirmMessage += ` Verrà applicata una penale di €${penaltyAmount.toFixed(2)}.`;
        }
        
        if (!window.confirm(confirmMessage)) return;
        
        setCancelling(true);
        try {
            await cancellaPrenotazione(booking.id);
            setBooking(prev => prev ? { ...prev, stato: 'ANNULLATA' } : null);
            showToast('success', penalty ? 
                `Prenotazione annullata. Multa applicata: €${calculatePenalty().toFixed(2)}` : 
                'Prenotazione annullata con successo'
            );
        } catch (error) {
            console.error('Errore annullamento prenotazione:', error);
            showToast('error', 'Errore durante l\'annullamento');
        } finally {
            setCancelling(false);
        }
    };

    const getDuration = () => {
        if (!booking) return '';
        const start = new Date(booking.dataInizio);
        const end = new Date(booking.dataFine);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes > 0 ? diffMinutes + 'm' : ''}`;
        }
        return `${diffMinutes}m`;
    };
    
    // Aggiungi questa funzione dopo getDuration() (intorno alla riga 138)
    const getCostoOrarioEffettivo = () => {
        if (!booking) return 0;
        const start = new Date(booking.dataInizio);
        const end = new Date(booking.dataFine);
        const diffMs = end.getTime() - start.getTime();
        const ore = diffMs / (1000 * 60 * 60);
        return booking.costoTotale / ore;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Prenotazione non trovata</h2>
                    <Link to="/prenotazioni" className="text-blue-600 hover:text-blue-800">
                        Torna alle prenotazioni
                    </Link>
                </div>
            </div>
        );
    }

   
    const { canCancel, reason, penalty } = canCancelBooking();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/prenotazioni"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Torna alle prenotazioni
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dettagli Prenotazione</h1>
                            <p className="text-gray-600 mt-2">ID: {booking.id}</p>
                        </div>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(booking.stato)}`}>
                            {getStatusIcon(booking.stato)}
                            <span className="font-medium">{booking.stato}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Car className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Veicolo</h2>
                                    <p className="text-gray-600">Dettagli del veicolo prenotato</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Marca e Modello</p>
                                    <p className="font-medium text-lg">{booking.veicolo?.marca} {booking.veicolo?.modello}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Targa</p>
                                    <p className="font-medium text-lg">{booking.veicolo?.targa}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tipo</p>
                                    <p className="font-medium">{booking.veicolo?.tipo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Alimentazione</p>
                                    <p className="font-medium">{booking.veicolo?.alimentazione}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Posti</p>
                                    <p className="font-medium">{booking.veicolo?.posti}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Costo orario</p>
                                    <p className="font-medium text-green-600">€{booking.veicolo?.costoOrario}/h</p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Calendar className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Periodo di Noleggio</h2>
                                    <p className="text-gray-600">Date e orari della prenotazione</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">Inizio</span>
                                        </div>
                                        <p className="font-medium">{formatDateTime(booking.dataInizio)}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">Fine</span>
                                        </div>
                                        <p className="font-medium">{formatDateTime(booking.dataFine)}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm font-medium text-blue-600">Durata totale</span>
                                    </div>
                                    <p className="font-medium text-blue-900">{getDuration()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {booking.note && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Note</h2>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{booking.note}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            {/* Cost Summary */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Riepilogo Costi</h3>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Costo orario (al momento della prenotazione)</span>
                                        <span>€{getCostoOrarioEffettivo().toFixed(2)}/h</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Durata</span>
                                        <span>{getDuration()}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Totale</span>
                                        <span className="text-green-600">€{booking.costoTotale.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Informazioni Prenotazione</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Data creazione</span>
                                        <span>{new Date(booking.dataCreazione).toLocaleDateString('it-IT')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID Prenotazione</span>
                                        <span className="font-mono text-xs">{booking.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Section */}
                            {booking.stato === 'ATTIVA' && (
                                <div className="border-t pt-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Cancellazione</h4>
                                    
                                    {canCancel ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm text-green-700">
                                                    ✓ Puoi cancellare gratuitamente questa prenotazione
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleCancelBooking}
                                                disabled={cancelling}
                                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {cancelling ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                ) : (
                                                    <X className="h-4 w-4 mr-2" />
                                                )}
                                                {cancelling ? 'Annullamento...' : 'Annulla Prenotazione'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-yellow-50 rounded-lg">
                                                <div className="flex items-start space-x-2">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-yellow-700 font-medium">
                                                            {reason}
                                                        </p>
                                                        {penalty && (
                                                            <p className="text-xs text-yellow-600 mt-1">
                                                                Multa per cancellazione tardiva: €{calculatePenalty().toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {penalty && (
                                                <button
                                                    onClick={handleCancelBooking}
                                                    disabled={cancelling}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {cancelling ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                    )}
                                                    {cancelling ? 'Annullamento...' : 'Annulla con Multa'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {booking.stato === 'ANNULLATA' && (
                                <div className="border-t pt-6">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <X className="h-4 w-4 text-red-600" />
                                            <span className="text-sm text-red-700 font-medium">
                                                Prenotazione annullata
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {booking.stato === 'COMPLETATA' && (
                                <div className="border-t pt-6">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-blue-700 font-medium">
                                                Prenotazione completata
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;