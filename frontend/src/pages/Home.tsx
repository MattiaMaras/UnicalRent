import React from 'react';
import { Link } from 'react-router-dom';

import { Car, Clock, Shield, Users, ArrowRight, CheckCircle, Star, Zap, Heart } from 'lucide-react';
import ponteUnical from '../../public/images/ponteUnical.jpg';
import {useAuth} from "../contexts/AuthContext.tsx";


const Home: React.FC = () => {
    const { user } = useAuth();

    const features = [
        {
            icon: Car,
            title: 'Flotta Moderna',
            description: 'Veicoli sempre aggiornati e in perfetto stato di manutenzione',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: Clock,
            title: 'Disponibilità 24/7',
            description: 'Prenota quando vuoi, il servizio è sempre attivo',
            color: 'from-green-500 to-green-600'
        },
        {
            icon: Shield,
            title: 'Sicurezza Garantita',
            description: 'Tutti i veicoli sono assicurati e controllati regolarmente',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: Users,
            title: 'Solo per Studenti',
            description: 'Servizio dedicato esclusivamente alla comunità universitaria',
            color: 'from-orange-500 to-orange-600'
        }
    ];

    const steps = [
        {
            step: '1',
            title: 'Registrati',
            description: 'Crea il tuo account con le credenziali universitarie',
            icon: Users
        },
        {
            step: '2',
            title: 'Scegli il Veicolo',
            description: 'Seleziona il mezzo più adatto alle tue esigenze',
            icon: Car
        },
        {
            step: '3',
            title: 'Prenota',
            description: 'Indica data e orario, conferma la prenotazione',
            icon: Clock
        },
        {
            step: '4',
            title: 'Ritira e Parti',
            description: 'Ritira il veicolo e inizia il tuo viaggio',
            icon: Zap
        }
    ];

    const testimonials = [
        {
            name: 'Marco Rossi',
            role: 'Studente Ingegneria',
            content: 'Servizio fantastico! Ho risparmiato tantissimo sui trasporti e i veicoli sono sempre in ottime condizioni.',
            rating: 5
        },
        {
            name: 'Giulia Bianchi',
            role: 'Studentessa Medicina',
            content: 'Perfetto per gli spostamenti verso l\'ospedale per i tirocini. Prenotazione veloce e prezzi onesti.',
            rating: 5
        },
        {
            name: 'Luca Verdi',
            role: 'Studente Economia',
            content: 'App intuitiva e servizio clienti eccellente. Lo consiglio a tutti gli studenti!',
            rating: 5
        }
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-700 bg-opacity-50 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                                <Heart className="h-4 w-4 mr-2 text-red-400" />
                                Amato da oltre 500 studenti
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                                Mobilità <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">Smart</span>
                                <br />per Studenti
                            </h1>

                            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed max-w-2xl">
                                Il primo servizio di noleggio veicoli pensato esclusivamente per gli universitari.
                                Conveniente, sostenibile e sempre disponibile.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/veicoli"
                                    className="group inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                                >
                                    Esplora Veicoli
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                {!user && (
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-sm"
                                    >
                                        Inizia Gratis
                                    </Link>
                                )}
                            </div>

                            <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-blue-200">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                                    Registrazione gratuita
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                                    Nessun deposito
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative z-10">
                                <img
                                    src={ponteUnical}
                                    alt="Ponte Unical"
                                    className="rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700"
                                />
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -top-6 -left-6 bg-white text-gray-900 p-4 rounded-2xl shadow-xl z-20 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-semibold text-sm">50+ Veicoli Disponibili</span>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-2xl shadow-xl z-20 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                                <div className="flex items-center space-x-2">
                                    <Star className="h-5 w-5 text-yellow-300" />
                                    <span className="font-semibold text-sm">4.9/5 Recensioni</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                            <Zap className="h-4 w-4 mr-2" />
                            Perché sceglierchi
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Tutto quello che serve
                            <br />
                            <span className="text-blue-600">per muoverti meglio</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Un servizio pensato specificatamente per le esigenze degli studenti universitari
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                            >
                                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Come Funziona
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Quattro semplici passi per iniziare a utilizzare Unical Rent
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="relative text-center group">
                                    <div className="relative z-10 bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                                            {step.step}
                                        </div>

                                        <div className="mb-4">
                                            <step.icon className="h-8 w-8 text-blue-500 mx-auto" />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Cosa dicono di noi
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Le recensioni dei nostri studenti parlano chiaro
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!user && (
                <section className="py-24 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Pronto a Iniziare?
                        </h2>
                        <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                            Unisciti a centinaia di studenti che hanno già scelto Unical Rent per i loro spostamenti
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-10 py-5 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
                        >
                            Registrati Gratis
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Link>

                        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-blue-200">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                                Setup in 2 minuti
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                                Supporto 24/7
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                                Cancellazione gratuita
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div className="group">
                            <div className="text-4xl lg:text-5xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                            <div className="text-gray-300">Studenti Attivi</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl lg:text-5xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
                            <div className="text-gray-300">Veicoli Disponibili</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl lg:text-5xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">2000+</div>
                            <div className="text-gray-300">Noleggi Completati</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl lg:text-5xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                            <div className="text-gray-300">Supporto Disponibile</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;