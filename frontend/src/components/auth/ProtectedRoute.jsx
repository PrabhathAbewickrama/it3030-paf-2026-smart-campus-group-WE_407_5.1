import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ roles }) => {
    const { user, token } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roles && user && !roles.includes(user.role.replace('ROLE_', ''))) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
