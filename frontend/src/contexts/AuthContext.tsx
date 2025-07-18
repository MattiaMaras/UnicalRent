import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import Keycloak from 'keycloak-js';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configurazione Keycloak
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
};

let keycloakInstance: Keycloak | null = null;

const getKeycloakInstance = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};

const getRolesFromToken = (token: string): string[] => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.realm_access?.roles || [];
  } catch (error) {
    console.error('Errore parsing JWT:', error);
    return [];
  }
};

// Funzione per sincronizzare l'utente con il backend
const syncUserWithBackend = async (token: string): Promise<User | null> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/utenti/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const backendUser = await response.json();
    
    // Estrai i ruoli dal token per il frontend
    const rolesFromToken = getRolesFromToken(token);
    
    // Crea l'oggetto User combinando dati backend e ruoli dal token
    const user: User = {
      id: backendUser.id,
      username: backendUser.email || backendUser.id,
      email: backendUser.email,
      roles: rolesFromToken, // Array di ruoli dal token JWT
      nome: backendUser.nome,
      cognome: backendUser.cognome,
      telefono: backendUser.telefono,
      attivo: backendUser.attivo ?? true,
      dataRegistrazione: backendUser.dataRegistrazione || new Date().toISOString(),
      keycloakId: backendUser.id
    };

    console.log('Utente sincronizzato con backend:', user);
    return user;
  } catch (error) {
    console.error('Errore nella sincronizzazione con il backend:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initRef = useRef(false);

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles.includes(role) ?? false;
    },
    [user]
  );

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initKeycloak = async () => {
      try {
        const keycloak = getKeycloakInstance();

        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
          enableLogging: true,
        });

        console.log('Keycloak authenticated:', authenticated);

        if (authenticated && keycloak.token) {
          setIsAuthenticated(true);
          setToken(keycloak.token);
          localStorage.setItem('token', keycloak.token);

          // Sincronizza l'utente con il backend
          const syncedUser = await syncUserWithBackend(keycloak.token);
          if (syncedUser) {
            setUser(syncedUser);
          }

          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).then(async (refreshed) => {
              if (refreshed && keycloak.token) {
                setToken(keycloak.token);
                localStorage.setItem('token', keycloak.token);
                
                // Risincronizza con il backend dopo il refresh del token
                const syncedUser = await syncUserWithBackend(keycloak.token);
                if (syncedUser) {
                  setUser(syncedUser);
                }
              }
            }).catch(() => {
              console.error('Failed to refresh token');
              logout();
            });
          };
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const keycloak = getKeycloakInstance();
      await keycloak.login({
        redirectUri: window.location.origin + '/dashboard'
      });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');

    const keycloak = getKeycloakInstance();
    keycloak.logout({
      redirectUri: window.location.origin
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isLoading,
      isAuthenticated,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};