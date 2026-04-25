import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
    const navigate = useNavigate();
    const { loginWithProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const isAdmin = (email || '').toLowerCase().includes('admin');
        loginWithProfile({
            id: isAdmin ? 1 : 2,
            name: isAdmin ? 'Campus Admin' : 'Campus User',
            username: email || (isAdmin ? 'admin@sliit.lk' : 'user@sliit.lk'),
            email: email || (isAdmin ? 'admin@sliit.lk' : 'user@sliit.lk'),
            role: isAdmin ? 'ADMIN' : 'USER'
        });
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md relative z-10 mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold neon-text mb-2">SLIIT Nexus</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <Input
                            type="email"
                            placeholder="admin@sliit.lk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg">Sign In</Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full gap-2 text-white border-gray-700 hover:bg-gray-800"
                        onClick={() => window.location.href = 'http://localhost:8081/oauth2/authorization/google'}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.1v2.73h5.36c-.23 1.25-.97 2.3-1.95 2.9v2.4h3.15c1.84-1.7 2.9-4.2 2.9-7.1c0-.47-.04-.95-.1-1.42zM12.25 21c2.56 0 4.7-.85 6.27-2.3l-3.15-2.4c-.85.57-1.94.9-3.12.9-2.4 0-4.44-1.62-5.17-3.8h-3.26v2.53C5.45 19.38 8.6 21 12.25 21zM7.08 13.4c-.2-.57-.3-1.18-.3-1.8s.1-1.23.3-1.8V7.27H3.82A8.93 8.93 0 002.5 11.6c0 1.45.34 2.82.95 4.05L7.08 13.4zM12.25 6.2c1.4 0 2.65.48 3.64 1.43l2.73-2.73C16.95 3.35 14.81 2.5 12.25 2.5 8.6 2.5 5.45 4.12 3.82 7.27l3.26 2.53c.73-2.18 2.77-3.6 5.17-3.6z" /></svg>
                        Google Sign-In
                    </Button>

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
