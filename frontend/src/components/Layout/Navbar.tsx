import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Car, Menu, X, User, LogOut, Home, Calendar, Settings } from 'lucide-react';
import {useAuth} from "../../contexts/AuthContext.tsx";

import logoUnical from '../../../public/images/logoUnical.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const publicLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/veicoli', label: 'Veicoli', icon: Car },
  ];

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/veicoli', label: 'Veicoli', icon: Car },
    { path: '/prenotazioni', label: 'Prenotazioni', icon: Calendar },
    { path: '/profilo', label: 'Profilo', icon: User },
  ];

  const adminLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/veicoli', label: 'Veicoli', icon: Car },
    { path: '/veicoli/aggiungi', label: 'Aggiungi Veicolo', icon: Settings },
    { path: '/prenotazioni', label: 'Prenotazioni', icon: Calendar },
  ];

  const getNavigationLinks = () => {
    if (!user) return publicLinks;
    return user.role === 'ADMIN' ? adminLinks : userLinks;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 transition-colors">
              <img src={logoUnical} alt="Logo Unical" className="h-8 w-8" />
              <Car className="h-8 w-8" />
              <span className="text-xl font-bold">Unical Rent</span>
            </Link>
          </div>

          {/* Navigation links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavigationLinks().map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(path)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Ciao, <span className="font-medium">{user.nome || user.username}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Accedi
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {getNavigationLinks().map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveRoute(path)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}

            {user ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-700">
                    Ciao, <span className="font-medium">{user.nome || user.username}</span>
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                >
                  Accedi
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;