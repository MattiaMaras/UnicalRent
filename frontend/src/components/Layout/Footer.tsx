import React from 'react';
import { Car, Mail, Phone, MapPin } from 'lucide-react';
import unicalFondoPagina from '../../../public/images/unicalfondopagina.webp';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Unical Rent</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Progetto di Piattaforme Software per applicazioni sul web, Università della Calabria,   anno accademico 2024/2025.
            </p>
             <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">mattiamarasco@unical.it</span>
              </div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Link Rapidi</h3>
            <ul className="space-y-2">
              <li><a href="/veicoli" className="text-gray-300 hover:text-white transition-colors">Veicoli Disponibili</a></li>
              <li><a href="/login" className="text-gray-300 hover:text-white transition-colors">Accedi</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contatti</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">Via P. Bucci, Rende (CS)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">+39 0984 123456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">info@unicalrent.it</span>
              </div>
              
            </div>
          </div>
        </div>

        {/* Immagine Unical fondo pagina */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex justify-center mb-6">
            <img 
              src={unicalFondoPagina} 
              alt="Università della Calabria" 
              className="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Unical Rent | Università della Calabria
              <br />
              A cura di Mattia Marasco
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;