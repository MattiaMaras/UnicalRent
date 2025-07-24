import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, ExternalLink, Shield } from 'lucide-react';
import GestioneCarteCredito from '../components/CarteCredito/GestioneCarteCredito';

const Profile: React.FC = () => {
  const { user, hasRole } = useAuth();

  const handleKeycloakAccountManagement = () => {
    const keycloakAccountUrl = `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/account`;
    window.open(keycloakAccountUrl, '_blank');
  };

  const getUserRoleDisplay = () => {
    return hasRole('ADMIN') ? 'Amministratore' : 'Utente';
  };

  const getRoleStyles = () => {
    return hasRole('ADMIN')
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  };

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Accesso richiesto</h2>
            <p className="text-gray-600 mt-2">Effettua il login per visualizzare il profilo</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Il Tuo Profilo</h1>
                <p className="text-gray-600">Gestisci le tue informazioni personali e metodi di pagamento</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.nome && user.cognome ? `${user.nome} ${user.cognome}` : user.username}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${getRoleStyles()}`}>
                    {getUserRoleDisplay()}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Registrato il {new Date(user.dataRegistrazione).toLocaleDateString('it-IT')}</span>
                  </div>
                  {user.telefono && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{user.telefono}</span>
                      </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forms */}
            <div className="lg:col-span-3 space-y-8">
              {/* Gestione Carte di Credito */}
              <GestioneCarteCredito />

              {/* Keycloak Account Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Gestione Account</h3>
                  <p className="text-gray-600 text-sm mt-1">Gestisci password, dati personali e sicurezza tramite Keycloak</p>
                </div>

                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Gestione Sicurezza</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Per modificare password, nome, cognome, email e altre impostazioni di sicurezza,
                          utilizza il pannello di gestione account Keycloak.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                      onClick={handleKeycloakAccountManagement}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apri Gestione Account Keycloak
                  </button>
                </div>
              </div>

              {/* Informazioni da Keycloak - Solo lettura */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Informazioni Aggiuntive</h3>
                  <p className="text-gray-600 text-sm mt-1">Informazioni provenienti da Keycloak</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Campi di sola lettura per dati Keycloak */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome (da Keycloak)
                      </label>
                      <input
                          type="text"
                          value={user.nome || 'Non disponibile'}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cognome (da Keycloak)
                      </label>
                      <input
                          type="text"
                          value={user.cognome || 'Non disponibile'}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (da Keycloak)
                    </label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;