import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVeicoloById, aggiornaVeicolo } from '../services/VeicoliService';
import { useToast } from '../contexts/ToastContext';
import { Vehicle } from '../types';
import { Save, ArrowLeft, Car } from 'lucide-react';
import axios from 'axios';

const EditVehicle: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {showToast} = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Vehicle | null>(null);

    useEffect(() => {
        if (id) {
            getVeicoloById(id)
                .then(setFormData)
                .catch(() => showToast('error', 'Errore nel caricamento del veicolo'));
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        setFormData((prev) =>
            prev
                ? {
                    ...prev,
                    [name]: type === 'number' ? Number(value) : value
                }
                : null
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

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
            await aggiornaVeicolo(formData);
            showToast('success', 'Veicolo aggiornato con successo!');
            navigate('/veicoli');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    showToast('error', 'Targa già presente nel sistema');
                } else {
                    showToast('error', 'Errore durante la modifica del veicolo');
                }
            } else {
                showToast('error', 'Errore sconosciuto');
            }
            console.error('Errore:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!formData) {
        return <p className="text-center py-10">Caricamento...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/veicoli')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2"/> Torna ai veicoli
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Car className="h-6 w-6 text-blue-600"/>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Modifica Veicolo</h1>
                            <p className="text-gray-600">Aggiorna i dettagli del veicolo</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Prima sezione */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="targa"
                                       className="block text-sm font-medium text-gray-700 mb-1">Targa</label>
                                <input
                                    id="targa"
                                    name="targa"
                                    value={formData.targa}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="marca"
                                       className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                <input
                                    id="marca"
                                    name="marca"
                                    value={formData.marca}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="modello"
                                       className="block text-sm font-medium text-gray-700 mb-1">Modello</label>
                                <input
                                    id="modello"
                                    name="modello"
                                    value={formData.modello}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="anno"
                                       className="block text-sm font-medium text-gray-700 mb-1">Anno</label>
                                <input
                                    type="number"
                                    id="anno"
                                    name="anno"
                                    value={formData.anno}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Seconda sezione */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="tipo"
                                       className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="AUTO">Auto</option>
                                    <option value="SCOOTER">Scooter</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="alimentazione"
                                       className="block text-sm font-medium text-gray-700 mb-1">Carburante</label>
                                <select
                                    id="alimentazione"
                                    name="alimentazione"
                                    value={formData.alimentazione}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="BENZINA">Benzina</option>
                                    <option value="DIESEL">Diesel</option>
                                    <option value="ELETTRICO">Elettrico</option>
                                    <option value="IBRIDO">Ibrido</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="posti"
                                       className="block text-sm font-medium text-gray-700 mb-1">Posti</label>
                                <input
                                    type="number"
                                    id="posti"
                                    name="posti"
                                    value={formData.posti}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Terza sezione */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="costoOrario" className="block text-sm font-medium text-gray-700 mb-1">Costo
                                    Orario (€)</label>
                                <input
                                    type="number"
                                    id="costoOrario"
                                    name="costoOrario"
                                    step="0.5"
                                    value={formData.costoOrario}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="immagine" className="block text-sm font-medium text-gray-700 mb-1">URL
                                    Immagine</label>
                                <input
                                    type="url"
                                    id="immagine"
                                    name="immagine"
                                    value={formData.immagine}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Descrizione */}
                        <div>
                            <label htmlFor="descrizione"
                                   className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                            <textarea
                                id="descrizione"
                                name="descrizione"
                                rows={3}
                                value={formData.descrizione}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {loading ? 'Aggiornando...' : <><Save className="h-4 w-4 inline mr-2"/> Aggiorna</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditVehicle;