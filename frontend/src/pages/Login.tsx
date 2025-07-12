import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { Car, LogIn } from 'lucide-react';
import {useToast} from "../contexts/ToastContext.tsx";
import {useAuth} from "../contexts/AuthContext.tsx";


const Login: React.FC = () => {
    const { login, user, isLoading } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    useEffect(() => {
        // Se l'utente è già loggato, reindirizza
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleKeycloakLogin = async () => {
        try {
            await login();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showToast('error', 'Errore durante il login. Riprova.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center space-x-2 text-blue-700">
                            <Car className="h-12 w-12" />
                            <span className="text-2xl font-bold">Unical Rent</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Accedi al tuo Account
                    </h2>
                    <p className="text-gray-600">
                        Utilizza le tue credenziali Unical per accedere
                    </p>
                </div>

                {/* Keycloak Login */}
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleKeycloakLogin}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <div className="flex items-center">
                            <LogIn className="mr-2 h-5 w-5" />
                            Accedi con Keycloak
                        </div>
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Verrai reindirizzato al sistema di autenticazione Unical
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Torna alla Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;