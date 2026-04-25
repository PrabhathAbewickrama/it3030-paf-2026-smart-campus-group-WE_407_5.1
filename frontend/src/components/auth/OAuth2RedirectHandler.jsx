import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            login(token);
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, [location, login, navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
            <div className="text-2xl font-bold">Redirecting...</div>
        </div>
    );
};
