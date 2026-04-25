import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { Tickets } from './pages/Tickets';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import AssetsList from './pages/assets/AssetsList';
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { BookingsHub } from './pages/BookingsHub';
import { OAuth2RedirectHandler } from './components/auth/OAuth2RedirectHandler';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route element={<ProtectedRoute roles={['USER']} />}>
                            <Route path="/bookings" element={<BookingsHub />} />
                            <Route path="/bookings/create" element={<CreateBookingPage />} />
                            <Route path="/bookings/my" element={<MyBookingsPage />} />
                        </Route>
                        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                            <Route path="/users" element={<Users />} />
                            <Route path="/assets" element={<AssetsList />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                        <Route element={<ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']} />}>
                            <Route path="/tickets" element={<Tickets />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
