import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MockAPI } from '../../../../../../../Downloads/project/src/data/mockData';
import { Vehicle } from '../../../../../../../Downloads/project/src/types';
import { Calendar, Clock, Car, ArrowLeft, BookOpen } from 'lucide-react';

const NewBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const preselectedVehicleId = searchParams.get('veicolo');
  
  const [formData, setFormData] = useState({
    veicoloId: preselectedVehicleId || '',
    dataInizio: '',
    oraInizio: '',
    dataFine: '',
    oraFine: '',
    note: ''
  });

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await MockAPI.getVehicles();
        setVehicles(data);
        
        if (preselectedVehicleId) {
          const preselected = data.find(v => v.id === preselectedVehicleId);
          if (preselected) {
            setAvailableVehicles([preselected]);
          }
        } else {
          setAvailableVehicles(data);
        }
      } catch (error) {
        console.error('Errore caricamento veicoli:', error);
        showToast('error', 'Errore nel caricamento dei veicoli');
      }
    };

    loadVehicles();
  }, [preselectedVehicleId, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkAvailability = async () => {
    if (!formData.dataInizio || !formData.oraInizio || !formData.dataFine || !formData.oraFine) {
      showToast('warning', 'Seleziona date e orari per verificare la disponibilità');
      return;
    }

    const startDateTime = `${formData.dataInizio}T${formData.oraInizio}:00Z`;
    const endDateTime = `${formData.dataFine}T${formData.oraFine}:00Z`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      showToast('error', 'La data di fine deve essere successiva a quella di inizio');
      return;
    }

    setCheckingAvailability(true);
    
    try {
      const available = await MockAPI.getAvailableVehicles(startDateTime, endDateTime);
      setAvailableVehicles(available);
      
      if (available.length === 0) {
        showToast('warning', 'Nessun veicolo disponibile per il periodo selezionato');
      } else {
        showToast('success', `${available.length} veicoli disponibili trovati`);
      }
      
      // Reset vehicle selection if the current one is not available
      if (formData.veicoloId && !available.find(v => v.id === formData.veicoloId)) {
        setFormData(prev => ({ ...prev, veicoloId: '' }));
      }
    } catch (error) {
      console.error('Errore verifica disponibilità:', error);
      showToast('error', 'Errore nella verifica della disponibilità');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateCost = () => {
    if (!formData.veicoloId || !formData.dataInizio || !formData.oraInizio || !formData.dataFine || !formData.oraFine) {
      return 0;
    }

    const vehicle = availableVehicles.find(v => v.id === formData.veicoloId);
    if (!vehicle) return 0;

    const startDateTime = new Date(`${formData.dataInizio}T${formData.oraInizio}:00Z`);
    const endDateTime = new Date(`${formData.dataFine}T${formData.oraFine}:00Z`);
    
    const diffInHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    
    return Math.max(1, Math.ceil(diffInHours)) * vehicle.costoOrario;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.veicoloId || !formData.dataInizio || !formData.oraInizio || !formData.dataFine || !formData.oraFine) {
      showToast('error', 'Compila tutti i campi obbligatori');
      return;
    }

    const startDateTime = `${formData.dataInizio}T${formData.oraInizio}:00Z`;
    const endDateTime = `${formData.dataFine}T${formData.oraFine}:00Z`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      showToast('error', 'La data di fine deve essere successiva a quella di inizio');
      return;
    }

    if (new Date(startDateTime) < new Date()) {
      showToast('error', 'Non puoi prenotare per date passate');
      return;
    }

    setLoading(true);
    
    try {
      const costoTotale = calculateCost();
      
      await MockAPI.createBooking({
        userId: user?.id,
        veicoloId: formData.veicoloId,
        dataInizio: startDateTime,
        dataFine: endDateTime,
        costoTotale,
        note: formData.note
      });
      
      showToast('success', 'Prenotazione creata con successo!');
      navigate('/prenotazioni');
    } catch (error: any) {
      showToast('error', error.message || 'Errore durante la creazione della prenotazione');
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = availableVehicles.find(v => v.id === formData.veicoloId);
  const totalCost = calculateCost();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/veicoli')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna ai veicoli
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuova Prenotazione</h1>
              <p className="text-gray-600">Seleziona veicolo e periodo per il noleggio</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Date and Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Seleziona Date e Orari
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="dataInizio" className="block text-sm font-medium text-gray-700 mb-2">
                        Data Inizio *
                      </label>
                      <input
                        type="date"
                        id="dataInizio"
                        name="dataInizio"
                        value={formData.dataInizio}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="oraInizio" className="block text-sm font-medium text-gray-700 mb-2">
                        Ora Inizio *
                      </label>
                      <input
                        type="time"
                        id="oraInizio"
                        name="oraInizio"
                        value={formData.oraInizio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="dataFine" className="block text-sm font-medium text-gray-700 mb-2">
                        Data Fine *
                      </label>
                      <input
                        type="date"
                        id="dataFine"
                        name="dataFine"
                        value={formData.dataFine}
                        onChange={handleChange}
                        min={formData.dataInizio || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="oraFine" className="block text-sm font-medium text-gray-700 mb-2">
                        Ora Fine *
                      </label>
                      <input
                        type="time"
                        id="oraFine"
                        name="oraFine"
                        value={formData.oraFine}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={checkAvailability}
                    disabled={checkingAvailability}
                    className="w-full md:w-auto inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {checkingAvailability ? (
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Clock className="h-5 w-5 mr-2" />
                    )}
                    {checkingAvailability ? 'Verificando...' : 'Verifica Disponibilità'}
                  </button>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Seleziona Veicolo
                  </h3>
                  
                  {availableVehicles.length > 0 ? (
                    <div className="space-y-3">
                      {availableVehicles.map((vehicle) => (
                        <label
                          key={vehicle.id}
                          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.veicoloId === vehicle.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="veicoloId"
                            value={vehicle.id}
                            checked={formData.veicoloId === vehicle.id}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Car className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {vehicle.marca} {vehicle.modello}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {vehicle.targa} • {vehicle.tipo} • {vehicle.carburante}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                €{vehicle.costoOrario.toFixed(2)}/h
                              </p>
                              <p className="text-xs text-gray-500">
                                {vehicle.posti} posti
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Verifica la disponibilità per vedere i veicoli
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Aggiungi eventuali note alla prenotazione..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/veicoli')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.veicoloId}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Calendar className="h-5 w-5 mr-2" />
                    )}
                    {loading ? 'Prenotando...' : 'Conferma Prenotazione'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Riepilogo Prenotazione
              </h3>
              
              {selectedVehicle ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedVehicle.marca} {selectedVehicle.modello}
                      </p>
                      <p className="text-sm text-gray-600">{selectedVehicle.targa}</p>
                    </div>
                  </div>

                  {formData.dataInizio && formData.oraInizio && formData.dataFine && formData.oraFine && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Inizio:</span>
                        <span className="font-medium">
                          {new Date(`${formData.dataInizio}T${formData.oraInizio}`).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fine:</span>
                        <span className="font-medium">
                          {new Date(`${formData.dataFine}T${formData.oraFine}`).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tariffa oraria:</span>
                        <span className="font-medium">€{selectedVehicle.costoOrario.toFixed(2)}</span>
                      </div>
                      <hr className="my-3" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Totale:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          €{totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Seleziona un veicolo per vedere il riepilogo
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;