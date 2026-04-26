import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

const REGISTERED_USERS_KEY = 'smartcampus_registered_users';

export const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const [googleConfigured, setGoogleConfigured] = useState(false);

    const successMessage = location.state?.message || '';
    const supportsGoogleLogin = role === 'ADMIN' || role === 'TECHNICIAN';
    const emailPlaceholder = useMemo(() => {
        if (role === 'ADMIN') {
            return 'admin@gmail.com';
        }
        if (role === 'TECHNICIAN') {
            return 'technician@gmail.com';
        }
        return 'it23382008@my.sliit.lk';
    }, [role]);

    useEffect(() => {
        const fetchOAuthStatus = async () => {
            try {
                const response = await api.get('/api/auth/oauth-status');
                setGoogleConfigured(Boolean(response.data?.googleConfigured));
            } catch (error) {
                setGoogleConfigured(false);
            }
        };

        fetchOAuthStatus();
    }, []);

    const handleRoleChange = (nextRole) => {
        setRole(nextRole);
        setEmail('');
        setPassword('');
        setError('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = email.trim().toLowerCase();
        const requiresStudentEmail = role === 'USER';
        const hasValidDomain = requiresStudentEmail
            ? normalizedEmail.endsWith('@my.sliit.lk')
            : normalizedEmail.endsWith('@gmail.com');

        if (!hasValidDomain) {
            setError(
                requiresStudentEmail
                    ? 'Student login requires an email in the @my.sliit.lk format.'
                    : 'Admin and technician login requires an email in the @gmail.com format.'
            );
            return;
        }

        const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
        const matchedUser = registeredUsers.find(
            (account) =>
                account.role === role &&
                account.email === normalizedEmail &&
                account.password === password
        );

        if (!matchedUser) {
            setError(
                role === 'USER'
                    ? 'Student account not found or password is incorrect.'
                    : `${role === 'ADMIN' ? 'Admin' : 'Technician'} account not found or password is incorrect.`
            );
            return;
        }

        loginWithProfile({
            id: matchedUser.id,
            name: matchedUser.name,
            username: matchedUser.email,
            email: matchedUser.email,
            role: matchedUser.role
        });
        navigate('/dashboard');
    };

    const handleGoogleLogin = () => {
        if (!supportsGoogleLogin) {
            setError('Students should sign in with email and password.');
            return;
        }

        if (!googleConfigured) {
            setError('Google Sign-In is not configured for this backend run. Restart the backend with the Google OAuth environment values.');
            return;
        }

        document.cookie = `oauth_role=${role}; path=/`;
        window.location.href = 'http://localhost:8081/oauth2/authorization/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md relative z-10 mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold neon-text mb-2">SLIIT Nexus</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                {successMessage && (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <Input
                            type="email"
                            placeholder={emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Login Role</label>
                        <select
                            value={role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="USER">Student</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <Input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg">Sign In</Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-gray-400">
                                {supportsGoogleLogin ? 'Or continue with' : 'Student sign-in only'}
                            </span>
                        </div>
                    </div>

                    {supportsGoogleLogin ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 text-white border-gray-700 hover:bg-gray-800"
                            onClick={handleGoogleLogin}
                            disabled={!googleConfigured}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.1v2.73h5.36c-.23 1.25-.97 2.3-1.95 2.9v2.4h3.15c1.84-1.7 2.9-4.2 2.9-7.1c0-.47-.04-.95-.1-1.42zM12.25 21c2.56 0 4.7-.85 6.27-2.3l-3.15-2.4c-.85.57-1.94.9-3.12.9-2.4 0-4.44-1.62-5.17-3.8h-3.26v2.53C5.45 19.38 8.6 21 12.25 21zM7.08 13.4c-.2-.57-.3-1.18-.3-1.8s.1-1.23.3-1.8V7.27H3.82A8.93 8.93 0 002.5 11.6c0 1.45.34 2.82.95 4.05L7.08 13.4zM12.25 6.2c1.4 0 2.65.48 3.64 1.43l2.73-2.73C16.95 3.35 14.81 2.5 12.25 2.5 8.6 2.5 5.45 4.12 3.82 7.27l3.26 2.53c.73-2.18 2.77-3.6 5.17-3.6z" /></svg>
                            Google Sign-In
                        </Button>
                    ) : (
                        <p className="text-center text-xs text-gray-500">
                            Students sign in with email and password.
                        </p>
                    )}

                    <p className="text-center text-sm text-gray-400 mt-6 pb-2">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors">
                            Sign up here
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};
