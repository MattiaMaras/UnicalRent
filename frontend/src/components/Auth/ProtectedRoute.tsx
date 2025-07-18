import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {useAuth} from "../../contexts/AuthContext.tsx";


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'UTENTE';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!user) {
    // Salva la location corrente per redirect dopo login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/errore/403" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;