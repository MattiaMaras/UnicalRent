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

const mapKeycloakRoleToAppRole = (keycloak: Keycloak): 'ADMIN' | 'UTENTE' => {
  const realmRoles = keycloak.realmAccess?.roles || [];
  const clientRoles = keycloak.resourceAccess?.[keycloakConfig.clientId]?.roles || [];
  const parsedRoles = (keycloak.tokenParsed?.roles as string[]) || [];
  const allRoles = [...realmRoles, ...clientRoles, ...parsedRoles];

  console.log('Ruoli Keycloak trovati:', allRoles);

  const adminRoles = ['admin', 'administrator', 'ADMIN', 'ADMINISTRATOR', 'unical-admin', 'realm-admin'];
  const adminRolesLower = adminRoles.map(r => r.toLowerCase());

  const hasAdminRole = allRoles.some(role =>
      adminRolesLower.includes(role.toLowerCase())
  );

  console.log('Has admin role:', hasAdminRole);

  return hasAdminRole ? 'ADMIN' : 'UTENTE';
};

const createUserFromKeycloak = (keycloakInstance: Keycloak): User => {
  const profile = keycloakInstance.tokenParsed;

  console.log('Profile completo:', profile);

  return {
    id: profile?.sub || '',
    keycloakId: profile?.sub || '',
    username: profile?.preferred_username || profile?.email || '',
    email: profile?.email || '',
    nome: profile?.given_name || profile?.firstName || profile?.name?.split(' ')[0] || '',
    cognome: profile?.family_name || profile?.lastName || profile?.name?.split(' ').slice(1).join(' ') || '',
    firstName: profile?.given_name || profile?.firstName || '',
    lastName: profile?.family_name || profile?.lastName || '',
    role: mapKeycloakRoleToAppRole(keycloakInstance),
    telefono: profile?.phone_number || profile?.phone || '',
    attivo: true,
    dataRegistrazione: new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initRef = useRef(false);

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

        if (authenticated) {
          console.log('Token parsed:', keycloak.tokenParsed);
          console.log('Realm roles:', keycloak.realmAccess?.roles);
          console.log('Client roles:', keycloak.resourceAccess);
          console.log('All resource access:', keycloak.resourceAccess);

          setIsAuthenticated(true);
          setToken(keycloak.token || null);

          if (keycloak.token) {
            localStorage.setItem('token', keycloak.token);
          }

          const userData = createUserFromKeycloak(keycloak);
          console.log('User data created:', userData);
          setUser(userData);

          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).then((refreshed) => {
              if (refreshed && keycloak.token) {
                setToken(keycloak.token);
                localStorage.setItem('token', keycloak.token);
                setUser(createUserFromKeycloak(keycloak));
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
        isAuthenticated
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