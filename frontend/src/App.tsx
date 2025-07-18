import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ToastContainer from './components/Toast/ToastContainer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import AddVehicle from './pages/AddVehicle';
import NewBooking from './pages/NewBooking';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import Error403 from './pages/Error403';
import Error404 from './pages/Error404';
import EditVehicle from "./pages/EditVehicle.tsx";

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Layout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/veicoli" element={<Vehicles />} />
                            <Route path="/errore/403" element={<Error403 />} />
                            <Route path="/errore/404" element={<Error404 />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profilo"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/prenotazioni"
                                element={
                                    <ProtectedRoute>
                                        <Bookings />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/prenotazioni/:id"
                                element={
                                    <ProtectedRoute>
                                        <BookingDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/prenotazioni/nuova"
                                element={
                                    <ProtectedRoute>
                                        <NewBooking />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Only Routes */}
                            <Route
                                path="/veicoli/aggiungi"
                                element={
                                    <ProtectedRoute requiredRole="ADMIN">
                                        <AddVehicle />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/veicoli/modifica/:id"
                                element={
                                    <ProtectedRoute requiredRole="ADMIN">
                                        <EditVehicle />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch all - 404 */}
                            <Route path="*" element={<Error404 />} />
                        </Routes>
                    </Layout>
                    <ToastContainer />
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;