import React, { useState } from 'react';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CartaCredito } from '../../types';
import { aggiungiCartaCredito } from '../../services/CartaCreditoService';

interface CartaCreditoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CartaCreditoForm: React.FC<CartaCreditoFormProps> = ({ onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CartaCredito>({
    numeroCarta: '',
    scadenzaCarta: '',
    cvvCarta: '',
    intestatarioCarta: ''
  });

  const [errors, setErrors] = useState<Partial<CartaCredito>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'numeroCarta') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'scadenzaCarta') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvvCarta') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name as keyof CartaCredito]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CartaCredito> = {};

    const numeroSenzaSpazi = formData.numeroCarta.replace(/\s/g, '');
    if (!numeroSenzaSpazi || numeroSenzaSpazi.length !== 16) {
      newErrors.numeroCarta = 'Il numero della carta deve contenere 16 cifre';
    }

    if (!formData.scadenzaCarta || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.scadenzaCarta)) {
      newErrors.scadenzaCarta = 'Inserisci una data valida (MM/YY)';
    } else {

      const [month, year] = formData.scadenzaCarta.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiryDate < now) {
        newErrors.scadenzaCarta = 'La carta è scaduta';
      }
    }

    if (!formData.cvvCarta || formData.cvvCarta.length !== 3) {
      newErrors.cvvCarta = 'Il CVV deve contenere 3 cifre';
    }

    if (!formData.intestatarioCarta.trim()) {
      newErrors.intestatarioCarta = 'L\'intestatario è obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const cartaData = {
        ...formData,
        numeroCarta: formData.numeroCarta.replace(/\s/g, '')
      };
      await aggiungiCartaCredito(cartaData);
      showToast('success', 'Carta di credito salvata con successo!');
      onSuccess();
    } catch (error) {
      console.error('Errore nel salvare la carta:', error);
      showToast('error', 'Errore nel salvare la carta di credito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Aggiungi Carta di Credito</h2>
              <p className="text-gray-600 text-sm">Inserisci i dati della tua carta per completare il profilo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Numero Carta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="h-4 w-4 inline mr-2" />
                Numero Carta
              </label>
              <input
                type="text"
                name="numeroCarta"
                value={formData.numeroCarta}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg tracking-wider ${
                  errors.numeroCarta ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={19} // 16 cifre + 3 spazi
              />
              {errors.numeroCarta && (
                <p className="text-red-600 text-sm mt-1">{errors.numeroCarta}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Scadenza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Scadenza
                </label>
                <input
                  type="text"
                  name="scadenzaCarta"
                  value={formData.scadenzaCarta}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                    errors.scadenzaCarta ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={5}
                />
                {errors.scadenzaCarta && (
                  <p className="text-red-600 text-sm mt-1">{errors.scadenzaCarta}</p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-2" />
                  CVV
                </label>
                <input
                  type="text"
                  name="cvvCarta"
                  value={formData.cvvCarta}
                  onChange={handleChange}
                  placeholder="123"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                    errors.cvvCarta ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={3}
                />
                {errors.cvvCarta && (
                  <p className="text-red-600 text-sm mt-1">{errors.cvvCarta}</p>
                )}
              </div>
            </div>

            {/* Intestatario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Intestatario
              </label>
              <input
                type="text"
                name="intestatarioCarta"
                value={formData.intestatarioCarta}
                onChange={handleChange}
                placeholder="Nome Cognome"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                  errors.intestatarioCarta ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.intestatarioCarta && (
                <p className="text-red-600 text-sm mt-1">{errors.intestatarioCarta}</p>
              )}
            </div>

            {/* Nota di sicurezza */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Sicurezza dei Dati</p>
                  <p className="text-xs text-blue-700 mt-1">
                    I tuoi dati sono protetti con crittografia avanzata e non vengono mai condivisi con terze parti.
                  </p>
                </div>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Salvando...' : 'Salva Carta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartaCreditoForm;