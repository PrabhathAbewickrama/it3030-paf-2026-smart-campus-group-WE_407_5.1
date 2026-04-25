import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'token';
const AUTH_STORAGE_KEY = 'smartcampus_auth_user';

const createMockToken = (payload) => {
    const toBase64Url = (value) =>
        btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    const header = { alg: 'none', typ: 'JWT' };
    return `${toBase64Url(header)}.${toBase64Url(payload)}.`;
};

const normalizeUser = (decoded) => {
    if (!decoded) {
        return null;
    }

    return {
        id: decoded.id ?? 1,
        name: decoded.name ?? decoded.username ?? decoded.email ?? 'User',
        username: decoded.username ?? decoded.name ?? decoded.email ?? 'user',
        email: decoded.email ?? '',
        role: decoded.role ?? 'ROLE_USER'
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const normalizedUser = normalizeUser(decoded);
                setUser(normalizedUser);
                localStorage.setItem(TOKEN_STORAGE_KEY, token);
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
            } catch (error) {
                console.error("Invalid token", error);
                logout();
            }
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
    };

    const loginWithProfile = (profile) => {
        const now = Math.floor(Date.now() / 1000);
        const normalizedRole = profile.role?.startsWith('ROLE_') ? profile.role : `ROLE_${profile.role || 'USER'}`;
        const tokenPayload = {
            id: profile.id ?? 1,
            name: profile.name ?? profile.username ?? 'User',
            username: profile.username ?? profile.name ?? 'user',
            email: profile.email ?? '',
            role: normalizedRole,
            iat: now,
            exp: now + 60 * 60 * 8
        };

        setToken(createMockToken(tokenPayload));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, loginWithProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
