import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Star, AlertTriangle, Calendar, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CartaCreditoCompleta, getCarteCredito, rimuoviCartaCredito, impostaCartaPrincipale } from '../../services/CartaCreditoService';
import CartaCreditoForm from './CartaCreditoForm';

interface Props {
  onCartaAggiunta?: () => void;
}

const GestioneCarteCredito: React.FC<Props> = ({ onCartaAggiunta }) => {
  const { showToast } = useToast();
  const [carte, setCarte] = useState<CartaCreditoCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [cartaInRimozione, setCartaInRimozione] = useState<number | null>(null);

  useEffect(() => {
    caricaCarte();
  }, []);

  const caricaCarte = async () => {
    try {
      setLoading(true);
      const carteUtente = await getCarteCredito();
      // Assicurati che sia sempre un array
      setCarte(Array.isArray(carteUtente) ? carteUtente : []);
    } catch (error) {
      console.error('Errore nel caricamento delle carte:', error);
      setCarte([]); // array vuoto in caso di errore
      showToast('error', 'Errore nel caricamento delle carte di credito');
    } finally {
      setLoading(false);
    }
  };

  const handleRimuoviCarta = async (cartaId: number) => {
    if (!cartaId) return;
    
    try {
      setCartaInRimozione(cartaId);
      await rimuoviCartaCredito(cartaId);
      showToast('success', 'Carta di credito rimossa con successo');
      await caricaCarte();
    } catch (error) {
      console.error('Errore rimozione carta:', error);
      showToast('error', 'Errore nella rimozione della carta di credito');
    } finally {
      setCartaInRimozione(null);
    }
  };

  const handleImpostaPrincipale = async (cartaId: number) => {
    if (!cartaId) return;
    
    try {
      await impostaCartaPrincipale(cartaId);
      showToast('success', 'Carta principale aggiornata');
      await caricaCarte();
    } catch (error) {
      console.error('Errore impostazione carta principale:', error);
      showToast('error', 'Errore nell\'impostazione della carta principale');
    }
  };

  const handleCartaAggiunta = async () => {
    setShowAddForm(false);
    await caricaCarte();
    onCartaAggiunta?.();
    showToast('success', 'Carta di credito aggiunta con successo');
  };

  const getTipoCartaColor = (tipo: string) => {
    switch (tipo) {
      case 'VISA': return 'bg-blue-500';
      case 'MASTERCARD': return 'bg-red-500';
      case 'AMEX': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Carte di Credito</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Carte di Credito</h3>
              <p className="text-gray-600 text-sm mt-1">
                Gestisci le tue carte di credito per i pagamenti
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Carta
            </button>
          </div>
        </div>

        <div className="p-6">
          {!Array.isArray(carte) || carte.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nessuna carta di credito</h4>
              <p className="text-gray-600 mb-6">
                Aggiungi una carta di credito per effettuare prenotazioni
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prima Carta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {carte.map((carta) => (
                <div
                  key={carta.id}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    carta.principale
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${
                    carta.scaduta ? 'opacity-60' : ''
                  }`}
                >
                  {/* Badge carta principale */}
                  {carta.principale && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        <Star className="h-3 w-3 mr-1" />
                        Principale
                      </span>
                    </div>
                  )}

                  {/* Alert carta scaduta */}
                  {carta.scaduta && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Scaduta
                      </span>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Icona tipo carta */}
                    <div className={`w-12 h-8 ${getTipoCartaColor(carta.tipoCarta || '')} rounded flex items-center justify-center text-white font-bold text-sm`}>
                      {carta.tipoCarta || 'CARD'}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Numero carta mascherato */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-mono font-medium text-gray-900">
                          {carta.numeroCarta}
                        </span>
                      </div>

                      {/* Dettagli carta */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{carta.intestatarioCarta}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Scade {carta.scadenzaCarta}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Aggiunta il {carta.dataCreazione ? new Date(carta.dataCreazione).toLocaleDateString('it-IT') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Azioni */}
                    <div className="flex items-center space-x-2">
                      {!carta.principale && (
                        <button
                          onClick={() => handleImpostaPrincipale(carta.id!)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Imposta come principale"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRimuoviCarta(carta.id!)}
                        disabled={cartaInRimozione === carta.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Rimuovi carta"
                      >
                        {cartaInRimozione === carta.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal per aggiungere carta */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Aggiungi Carta di Credito</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <CartaCreditoForm
              onSuccess={handleCartaAggiunta}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GestioneCarteCredito;