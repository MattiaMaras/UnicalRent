import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Vehicle } from '../types';
import { getVeicoli } from '../services/VeicoliService';
import { creaPrenotazione } from '../services/PrenotazioniService';

const NewBooking: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [veicoli, setVeicoli] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    veicoloId: searchParams.get('veicolo') || '',
    dataInizio: '',
    oraInizio: '',
    dataFine: '',
    oraFine: ''
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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
    setFormData(prev => ({ ...prev, [name]: value }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { veicoloId, dataInizio, oraInizio, dataFine, oraFine } = formData;

    if (!veicoloId || !dataInizio || !oraInizio || !dataFine || !oraFine) {
      showToast('error', 'Compila tutti i campi');
      return;
    }

    // Formato ISO completo con secondi
    const inizioStr = `${dataInizio}T${oraInizio}:00`;
    const fineStr = `${dataFine}T${oraFine}:00`;

    const inizio = new Date(inizioStr);
    const fine = new Date(fineStr);

    if (fine <= inizio) {
      showToast('error', 'La data di fine deve essere successiva a quella di inizio');
      return;
    }

    try {
      await creaPrenotazione(
          veicoloId,
          inizioStr,
          fineStr
      );
      showToast('success', 'Prenotazione effettuata con successo');
      navigate('/prenotazioni');
    } catch (error: unknown) {
      showToast('error', 'Errore nella prenotazione');
      console.error('Errore:', error);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

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
                        className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      <Save className="h-5 w-5 mr-2" /> Prenota
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
      </div>
  );
};

export default NewBooking;
