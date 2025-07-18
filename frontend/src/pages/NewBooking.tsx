import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, CreditCard, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Vehicle } from '../types';
import { getVeicoli, getDisponibilitaVeicolo, DisponibilitaVeicolo } from '../services/VeicoliService';
import { creaPrenotazione } from '../services/PrenotazioniService';
import { hasCartaCreditoValida } from '../services/CartaCreditoService';
import CartaCreditoForm from '../components/CartaCreditoForm';

interface ErrorResponse {
  response?: {
    status: number;
    data: {
      tipo?: string;
      messaggio?: string;
      dettaglio?: string;
    };
  };
}

const NewBooking: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [veicoli, setVeicoli] = useState<Vehicle[]>([]);
  const [disponibilita, setDisponibilita] = useState<DisponibilitaVeicolo | null>(null);
  const [loadingDisponibilita, setLoadingDisponibilita] = useState(false);
  const [erroreValidazione, setErroreValidazione] = useState('');
  
  // Stati mancanti da aggiungere
  const [checkingCarta, setCheckingCarta] = useState(true);
  const [hasCartaValida, setHasCartaValida] = useState(false);
  const [showCartaForm, setShowCartaForm] = useState(false);
  
  const [formData, setFormData] = useState({
    veicoloId: searchParams.get('veicolo') || '',
    dataInizio: '',
    oraInizio: '',
    dataFine: '',
    oraFine: ''
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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
    setFormData(prev => ({ ...prev, dataInizio: value }));
    
    // Se la data di fine è precedente alla nuova data di inizio, resettala
    if (formData.dataFine && value && new Date(value) > new Date(formData.dataFine)) {
      setFormData(prev => ({ ...prev, dataFine: '' }));
    }
  };

  // Funzione per gestire il cambio dell'ora di inizio
  const handleOraInizioChange = (value: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Se è oggi, verifica che l'ora non sia nel passato
    if (formData.dataInizio === today) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (value < currentTime) {
        setErroreValidazione('L\'ora di inizio non può essere nel passato');
        return;
      }
    }
    
    setErroreValidazione('');
    setFormData(prev => ({ ...prev, oraInizio: value }));
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
  
    if (formData.dataInizio) {
      const dataInizio = new Date(formData.dataInizio);
      dataInizio.setHours(0, 0, 0, 0);
      
      if (selectedDate < dataInizio) {
        setErroreValidazione('La data di fine non può essere precedente a quella di inizio');
        return;
      }
    }
    
    setErroreValidazione('');
    setFormData(prev => ({ ...prev, dataFine: value }));
  };

  // Funzione per gestire il cambio dell'ora di fine
  const handleOraFineChange = (value: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Se è oggi, verifica che l'ora non sia nel passato
    if (formData.dataFine === today) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (value < currentTime) {
        setErroreValidazione('L\'ora di fine non può essere nel passato');
        return;
      }
    }
    
    // Se è lo stesso giorno della data di inizio, verifica che l'ora sia successiva
    if (formData.dataInizio === formData.dataFine && formData.oraInizio && value <= formData.oraInizio) {
      setErroreValidazione('L\'ora di fine deve essere successiva a quella di inizio');
      return;
    }
    
    setErroreValidazione('');
    setFormData(prev => ({ ...prev, oraFine: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getVeicoli();
        setVeicoli(response);

        if (formData.veicoloId) {
          const selected = response.find(v => v.id.toString() === formData.veicoloId);
          if (selected) setSelectedVehicle(selected);
        }
      } catch (error) {
        showToast('error', 'Errore nel caricamento dei veicoli');
        console.error('Errore:', error);
      }
    };

    fetchData();
  }, [formData.veicoloId, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Gestisci i campi di data e ora con validazione
    switch (name) {
      case 'dataInizio':
        handleDataInizioChange(value);
        break;
      case 'oraInizio':
        handleOraInizioChange(value);
        break;
      case 'dataFine':
        handleDataFineChange(value);
        break;
      case 'oraFine':
        handleOraFineChange(value);
        break;
      default:
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'veicoloId') {
      const selected = veicoli.find(v => v.id.toString() === value);
      setSelectedVehicle(selected || null);
    }
  };

  const calcolaTotale = () => {
    if (!selectedVehicle || !formData.dataInizio || !formData.oraInizio || !formData.dataFine || !formData.oraFine) return 0;
    const inizio = new Date(`${formData.dataInizio}T${formData.oraInizio}`);
    const fine = new Date(`${formData.dataFine}T${formData.oraFine}`);
    const ore = Math.ceil((fine.getTime() - inizio.getTime()) / (1000 * 60 * 60));
    return Math.max(1, ore) * selectedVehicle.costoOrario;
  };

  // Carica disponibilità quando cambia il veicolo
  useEffect(() => {
    // Listener per refresh disponibilità dopo annullamento
    const handleAvailabilityRefresh = () => {
      if (formData.veicoloId) {
        setLoadingDisponibilita(true);
        getDisponibilitaVeicolo(formData.veicoloId)
          .then(setDisponibilita)
          .catch(err => {
            console.error('Errore caricamento disponibilità:', err);
            setDisponibilita(null);
          })
          .finally(() => setLoadingDisponibilita(false));
      }
    };

    window.addEventListener('vehicle-availability-refresh', handleAvailabilityRefresh);
    
    // Carica disponibilità iniziale
    if (formData.veicoloId) {
      setLoadingDisponibilita(true);
      getDisponibilitaVeicolo(formData.veicoloId)
        .then(setDisponibilita)
        .catch(err => {
          console.error('Errore caricamento disponibilità:', err);
          setDisponibilita(null);
        })
        .finally(() => setLoadingDisponibilita(false));
    } else {
      setDisponibilita(null);
    }
    
    return () => {
      window.removeEventListener('vehicle-availability-refresh', handleAvailabilityRefresh);
    };
  }, [formData.veicoloId]);

  // Funzione per ottenere le date non disponibili nel periodo selezionato
  const getDateNonDisponibili = () => {
    if (!disponibilita || !formData.dataInizio || !formData.dataFine) return [];
    
    const dataInizio = new Date(formData.dataInizio);
    const dataFine = new Date(formData.dataFine);
    const dateNonDisponibili: string[] = [];
    
    for (let data = new Date(dataInizio); data <= dataFine; data.setDate(data.getDate() + 1)) {
      const dataStr = data.toISOString().split('T')[0];
      if (!disponibilita.dateDisponibili.includes(dataStr)) {
        dateNonDisponibili.push(dataStr);
      }
    }
    return dateNonDisponibili;
  };

  // Funzione per verificare se il periodo selezionato è disponibile
  const isPeriodoDisponibile = () => {
    if (!disponibilita || !formData.dataInizio || !formData.dataFine) return true;
    
    const dataInizio = new Date(formData.dataInizio);
    const dataFine = new Date(formData.dataFine);
    
    // Verifica ogni giorno nel periodo selezionato
    for (let data = new Date(dataInizio); data <= dataFine; data.setDate(data.getDate() + 1)) {
      const dataStr = data.toISOString().split('T')[0];
      if (!disponibilita.dateDisponibili.includes(dataStr)) {
        return false;
      }
    }
    return true;
  };

  // Verifica carta di credito all'avvio
  useEffect(() => {
    const verificaCarta = async () => {
      try {
        const hasCard = await hasCartaCreditoValida();
        setHasCartaValida(hasCard);
      } catch (error) {
        console.error('Errore verifica carta:', error);
        setHasCartaValida(false);
      } finally {
        setCheckingCarta(false);
      }
    };

    if (user) {
      verificaCarta();
    }
  }, [user]);

  const handleCartaSuccess = async () => {
    setShowCartaForm(false);
    setHasCartaValida(true);
    showToast('success', 'Carta di credito aggiunta con successo! Ora puoi procedere con la prenotazione.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica carta di credito prima di procedere
    if (!hasCartaValida) {
      setShowCartaForm(true);
      return;
    }
    
    if (!formData.veicoloId || !formData.dataInizio || !formData.oraInizio || !formData.dataFine || !formData.oraFine) {
      showToast('error', 'Compila tutti i campi');
      return;
    }

    const inizioStr = `${formData.dataInizio}T${formData.oraInizio}`;
    const fineStr = `${formData.dataFine}T${formData.oraFine}`;
    const inizio = new Date(inizioStr);
    const fine = new Date(fineStr);

    if (fine < inizio) {
      showToast('error', 'La data di fine deve essere successiva a quella di inizio');
      return;
    }
    
    // Validazione durata minima di un'ora
    const durataMinuti = (fine.getTime() - inizio.getTime()) / (1000 * 60);
    if (durataMinuti < 60) {
      showToast('error', 'La durata minima della prenotazione deve essere di almeno un\'ora');
      return;
    }

    // Verifica disponibilità del periodo selezionato
    if (!isPeriodoDisponibile()) {
      showToast('error', 'Il veicolo non è disponibile in una o più date del periodo selezionato');
      return;
    }

    try {
      await creaPrenotazione(formData.veicoloId, inizioStr, fineStr);
      showToast('success', 'Prenotazione effettuata con successo');
      navigate('/prenotazioni');
    } catch (error) {
      console.error('Errore:', error);
      
      const errorResponse = error as ErrorResponse;
      
      // Gestisci errore carta di credito mancante
      if (errorResponse.response?.data?.messaggio?.includes('carta di credito')) {
        setHasCartaValida(false);
        setShowCartaForm(true);
        showToast('error', 'È necessario inserire una carta di credito per procedere con la prenotazione');
        return;
      }
      
      if (errorResponse.response?.status === 400) {
        const errorData = errorResponse.response.data;
        if (typeof errorData === 'object' && errorData.tipo === 'VALIDATION_ERROR') {
          showToast('error', errorData.messaggio || 'Errore di validazione');
        } else {
          showToast('error', 'Dati non validi. Controlla i campi inseriti.');
        }
      } else if (errorResponse.response?.status === 409) {
        const errorData = errorResponse.response.data;
        if (typeof errorData === 'object' && errorData.tipo === 'BOOKING_CONFLICT') {
          showToast('error', 
            `${errorData.messaggio || 'Conflitto di prenotazione'} ${errorData.dettaglio || 'Controlla le date disponibili nella sezione a destra.'}`
          );
        } else {
          showToast('error', 'Il veicolo non è disponibile nelle date selezionate. Prova con date diverse.');
        }
      } else {
        showToast('error', 'Errore nella prenotazione. Riprova più tardi.');
      }
    }
  };

  if (checkingCarta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica dati utente...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Torna alla Dashboard
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuova Prenotazione</h1>
                <p className="text-gray-600">Compila il modulo per prenotare un veicolo</p>
              </div>
            </div>
          </div>

          {/* Avviso carta di credito */}
          {!hasCartaValida && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800">Carta di Credito Richiesta</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Per effettuare una prenotazione è necessario inserire una carta di credito valida.
                  </p>
                  <button
                    onClick={() => setShowCartaForm(true)}
                    className="mt-2 inline-flex items-center px-3 py-1 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors"
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Aggiungi Carta
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="veicoloId" className="block text-sm font-medium text-gray-700 mb-2">
                      Seleziona Veicolo
                    </label>
                    <select
                        id="veicoloId"
                        name="veicoloId"
                        value={formData.veicoloId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">-- Seleziona --</option>
                      {veicoli.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.marca} {v.modello} ({v.targa})
                          </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="dataInizio" className="block text-sm font-medium text-gray-700 mb-2">
                        Data Inizio
                      </label>
                      <input
                          type="date"
                          id="dataInizio"
                          name="dataInizio"
                          value={formData.dataInizio}
                          onChange={handleChange}
                          min={getMinDate()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <label htmlFor="oraInizio" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                        Ora Inizio
                      </label>
                      <input
                          type="time"
                          id="oraInizio"
                          name="oraInizio"
                          value={formData.oraInizio}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="dataFine" className="block text-sm font-medium text-gray-700 mb-2">
                        Data Fine
                      </label>
                      <input
                          type="date"
                          id="dataFine"
                          name="dataFine"
                          value={formData.dataFine}
                          onChange={handleChange}
                          min={formData.dataInizio || getMinDate()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <label htmlFor="oraFine" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                        Ora Fine
                      </label>
                      <input
                          type="time"
                          id="oraFine"
                          name="oraFine"
                          value={formData.oraFine}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Messaggio di errore */}
                  {erroreValidazione && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{erroreValidazione}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annulla
                    </button>
                    <button
                        type="submit"
                        disabled={!!erroreValidazione}
                        className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!hasCartaValida ? (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" /> Aggiungi Carta e Prenota
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" /> Prenota
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo</h3>
                {selectedVehicle ? (
                    <>
                      {selectedVehicle.immagine && (
                          <img
                              src={selectedVehicle.immagine}
                              alt="Veicolo"
                              className="w-full h-40 object-cover rounded mb-4"
                          />
                      )}

                      <p className="font-medium text-gray-900 mb-1">
                        {selectedVehicle.marca} {selectedVehicle.modello} - {selectedVehicle.targa}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedVehicle.tipo} - {selectedVehicle.alimentazione} - {selectedVehicle.posti} posti
                      </p>

                      {/* Sezione disponibilità semplificata */}
                      {loadingDisponibilita ? (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600">Caricamento disponibilità...</p>
                        </div>
                      ) : disponibilita && formData.dataInizio && formData.dataFine ? (
                        <div className="mb-4">
                          {(() => {
                            const dateNonDisponibili = getDateNonDisponibili();
                            
                            return dateNonDisponibili.length > 0 ? (
                              <div className="p-3 bg-red-50 rounded-lg">
                                <h4 className="text-sm font-medium text-red-700 mb-2">⚠️ Date non disponibili nel periodo</h4>
                                <div className="flex flex-wrap gap-1">
                                  {dateNonDisponibili.map(data => (
                                    <span key={data} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                      {new Date(data).toLocaleDateString('it-IT', { 
                                        day: '2-digit', 
                                        month: '2-digit',
                                        year: '2-digit'
                                      })}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()} 
                        </div>
                      ) : null}

                      {formData.dataInizio && formData.oraInizio && formData.dataFine && formData.oraFine && (
                          <>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Dal:</span>
                              <span>{new Date(`${formData.dataInizio}T${formData.oraInizio}`).toLocaleString('it-IT')}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-3">
                              <span>Al:</span>
                              <span>{new Date(`${formData.dataFine}T${formData.oraFine}`).toLocaleString('it-IT')}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between text-base font-semibold">
                              <span>Totale:</span>
                              <span className="text-green-700">€{calcolaTotale().toFixed(2)}</span>
                            </div>
                          </>
                      )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500">Seleziona un veicolo per visualizzare il riepilogo.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal per inserimento carta di credito */}
        {showCartaForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Aggiungi Carta di Credito</h2>
                <button
                  onClick={() => setShowCartaForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <CartaCreditoForm
                onSuccess={handleCartaSuccess}
                onCancel={() => setShowCartaForm(false)}
              />
            </div>
          </div>
        )}
      </div>
  );
};

export default NewBooking;
