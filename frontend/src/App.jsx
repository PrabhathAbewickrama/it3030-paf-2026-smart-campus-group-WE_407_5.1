import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { OAuth2RedirectHandler } from './components/auth/OAuth2RedirectHandler';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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
                    
                        <Route path="/users" element={<div className="p-6 text-white text-2xl font-bold">Users Management</div>} />
                        <Route path="/settings" element={<div className="p-6 text-white text-2xl font-bold">Settings</div>} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
