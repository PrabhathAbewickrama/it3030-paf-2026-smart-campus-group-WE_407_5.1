import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext.jsx';

export const SignUp = () => {
    const navigate = useNavigate();
    const { loginWithProfile } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSignUp = (e) => {
        e.preventDefault();
        loginWithProfile({
            id: Date.now(),
            name: formData.name,
            username: formData.email,
            email: formData.email,
            role: 'USER'
        });
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md relative z-10 mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold neon-text mb-2">Join Nexus</h1>
                    <p className="text-gray-400">Create your campus account</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <Input
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <Input
                            type="email"
                            placeholder="student@my.sliit.lk"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" variant="secondary">Sign Up</Button>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};
