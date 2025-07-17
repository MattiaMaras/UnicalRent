import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVeicoli } from '../services/VeicoliService';
import { getPrenotazioni } from '../services/PrenotazioniService';
import { Vehicle, Booking } from '../types';
import { Car, Calendar, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesData, bookingsData] = await Promise.all([
          getVeicoli(),
          getPrenotazioni()
        ]);

        setVehicles(vehiclesData);
        setBookings(bookingsData);
      } catch (error) {
        console.error('Errore caricamento dati:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
        </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const userBookings = bookings.filter(b => b.utente?.id === user?.id);
  const activeBookings = bookings.filter(b => b.stato === 'ATTIVA');
  const completedBookings = bookings.filter(b => b.stato === 'COMPLETATA');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.costoTotale, 0);
  const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
  const totalSpent = userBookings.reduce((sum, b) => sum + b.costoTotale, 0);

  const visibleBookings = isAdmin ? bookings : userBookings;

  const stats = isAdmin ? [
    {
      title: 'Veicoli Totali',
      value: vehicles.length,
      icon: Car,
      color: 'bg-blue-500',
      change: '+2 questo mese'
    },
    {
      title: 'Prenotazioni Attive',
      value: activeBookings.length,
      icon: Calendar,
      color: 'bg-green-500',
      change: `${activeBookings.length} in corso`
    },
    {
      title: 'Ricavi Totali',
      value: `€${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15% vs mese scorso'
    },
    {
      title: 'Valore Medio',
      value: `€${avgBookingValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'per prenotazione'
    }
  ] : [
    {
      title: 'Prenotazioni Attive',
      value: userBookings.filter(b => b.stato === 'ATTIVA').length,
      icon: Clock,
      color: 'bg-blue-500',
      change: ''
    },
    {
      title: 'Noleggi Completati',
      value: userBookings.filter(b => b.stato === 'COMPLETATA').length,
      icon: Calendar,
      color: 'bg-green-500',
      change: ''
    },
    {
      title: 'Totale Speso',
      value: `€${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: ''
    },
    {
      title: 'Veicoli Disponibili',
      value: vehicles.length,
      icon: Car,
      color: 'bg-orange-500',
      change: ''
    }
  ];

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Dashboard Amministratore' : `Ciao, ${user?.nome || user?.username}!`}
          </h1>
          <p className="text-gray-600 mb-6">
            {isAdmin ? 'Panoramica generale del servizio Unical Rent' : 'Benvenuto nella tua dashboard personale'}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      {stat.change && <p className="text-xs text-gray-500 mt-1">{stat.change}</p>}
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* Prenotazioni Recenti */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {isAdmin ? 'Prenotazioni Recenti' : 'Le Tue Prenotazioni'}
              </h3>
            </div>
            <div className="p-0">
              {visibleBookings.length > 0 ? (
                  visibleBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="p-6 border-b border-gray-50 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.veicolo?.marca} {booking.veicolo?.modello}
                            </p>
                            {isAdmin && (
                                <p className="text-sm text-gray-600">
                                  {booking.utente?.nome} {booking.utente?.cognome}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(booking.dataInizio).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">€{booking.costoTotale.toFixed(2)}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                booking.stato === 'ATTIVA'
                                    ? 'bg-green-100 text-green-800'
                                    : booking.stato === 'COMPLETATA'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                            }`}>
                        {booking.stato}
                      </span>
                          </div>
                        </div>
                      </div>
                  ))
              ) : (
                  <div className="p-6 text-center text-gray-500">
                    Nessuna prenotazione trovata
                  </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {isAdmin ? (
                <>
                  <Link
                      to="/veicoli/aggiungi"
                      className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Car className="h-8 w-8 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aggiungi Veicolo</h3>
                    <p className="text-blue-100">Inserisci un nuovo veicolo nella flotta</p>
                  </Link>

                  <Link
                      to="/veicoli"
                      className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Users className="h-8 w-8 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gestisci Veicoli</h3>
                    <p className="text-green-100">Modifica o rimuovi veicoli esistenti</p>
                  </Link>

                  <div className="bg-purple-600 text-white p-6 rounded-xl">
                    <TrendingUp className="h-8 w-8 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Report</h3>
                    <p className="text-purple-100">Visualizza statistiche dettagliate</p>
                  </div>
                </>
            ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
                    <div className="space-y-3">
                      <Link
                          to="/prenotazioni/nuova"
                          className="block bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5" />
                          <span>Nuova Prenotazione</span>
                        </div>
                      </Link>
                      <Link
                          to="/veicoli"
                          className="block bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Car className="h-5 w-5" />
                          <span>Esplora Veicoli</span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggerimenti</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <p>Prenota in anticipo per avere più scelta di veicoli</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <p>Scegli veicoli elettrici per risparmiare sui costi</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <p>Puoi annullare gratuitamente fino a 2 ore prima</p>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Dashboard;