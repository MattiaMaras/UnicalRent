import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Vehicle } from '../types';
import { creaVeicolo } from '../services/VeicoliService';
import { Car, ArrowLeft, Save } from 'lucide-react';
import axios from "axios";

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    targa: '',
    marca: '',
    modello: '',
    anno: new Date().getFullYear(),
    tipo: 'AUTO' as Vehicle['tipo'],
    alimentazione: 'BENZINA' as Vehicle['alimentazione'],
    posti: 4,
    descrizione: '',
    costoOrario: 10.0,
    immagine: '',
    attivo: true,
    dataAggiunta: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targa || !formData.marca || !formData.modello) {
      showToast('error', 'Compila tutti i campi obbligatori');
      return;
    }

    const targaValida = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(formData.targa);
    if (!targaValida) {
      showToast('error', 'Formato targa non valido (es. AA123BB)');
      return;
    }

    setLoading(true);

    try {
      await creaVeicolo(formData);
      showToast('success', 'Veicolo aggiunto con successo!');
      navigate('/veicoli');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          showToast('error', 'Targa già presente nel sistema');
        } else {
          showToast('error', "Errore durante l'aggiunta del veicolo");
        }
        console.error('Errore:', error);
      } else {
        showToast('error', "Errore sconosciuto");
        console.error('Errore non Axios:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Aggiungi Nuovo Veicolo</h1>
                <p className="text-gray-600">Inserisci i dettagli del nuovo veicolo</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="targa" className="block text-sm font-medium text-gray-700 mb-2">Targa *</label>
                  <input
                      type="text"
                      id="targa"
                      name="targa"
                      value={formData.targa}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. AB123CD"
                      required
                  />
                </div>

                <div>
                  <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                  <input
                      type="text"
                      id="marca"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. Fiat"
                      required
                  />
                </div>

                <div>
                  <label htmlFor="modello" className="block text-sm font-medium text-gray-700 mb-2">Modello *</label>
                  <input
                      type="text"
                      id="modello"
                      name="modello"
                      value={formData.modello}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. 500"
                      required
                  />
                </div>

                <div>
                  <label htmlFor="anno" className="block text-sm font-medium text-gray-700 mb-2">Anno</label>
                  <input
                      type="number"
                      id="anno"
                      name="anno"
                      value={formData.anno}
                      onChange={handleChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo e alimentazione */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">Tipo Veicolo</label>
                  <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="AUTO">Auto</option>
                    <option value="SCOOTER">Scooter</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="alimentazione" className="block text-sm font-medium text-gray-700 mb-2">Carburante</label>
                  <select
                      id="alimentazione"
                      name="alimentazione"
                      value={formData.alimentazione}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BENZINA">Benzina</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELETTRICO">Elettrico</option>
                    <option value="IBRIDO">Ibrido</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="posti" className="block text-sm font-medium text-gray-700 mb-2">Numero Posti</label>
                  <input
                      type="number"
                      id="posti"
                      name="posti"
                      value={formData.posti}
                      onChange={handleChange}
                      min="1"
                      max="9"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Costo e immagine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="costoOrario" className="block text-sm font-medium text-gray-700 mb-2">Costo Orario (€)</label>
                  <input
                      type="number"
                      id="costoOrario"
                      name="costoOrario"
                      value={formData.costoOrario}
                      onChange={handleChange}
                      min="0"
                      step="0.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="immagine" className="block text-sm font-medium text-gray-700 mb-2">URL Immagine</label>
                  <input
                      type="url"
                      id="immagine"
                      name="immagine"
                      value={formData.immagine}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                  />
                </div>
              </div>

              {/* Descrizione */}
              <div>
                <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                <textarea
                    id="descrizione"
                    name="descrizione"
                    value={formData.descrizione}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrizione del veicolo..."
                />
              </div>

              {/* Submit */}
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
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                      <Save className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Salvando...' : 'Salva Veicolo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default AddVehicle;