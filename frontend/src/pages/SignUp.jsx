import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../services/api';

const REGISTERED_USERS_KEY = 'smartcampus_registered_users';

export const SignUp = () => {
    const navigate = useNavigate();
    const { loginWithProfile } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isStudentRole = formData.role === 'USER';

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = formData.email.trim().toLowerCase();
        if (isStudentRole && !normalizedEmail.endsWith('@my.sliit.lk')) {
            setError('Student registration requires an email in the @my.sliit.lk format.');
            return;
        }

        if (!isStudentRole && !normalizedEmail.endsWith('@gmail.com')) {
            setError('Admin and technician registration requires a @gmail.com address.');
            return;
        }

        if (!formData.password.trim()) {
            setError('A password is required for every account.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await registerUser({
                name: formData.name.trim(),
                email: normalizedEmail,
                password: formData.password,
                role: formData.role
            });

            const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
            const nextRegisteredUsers = [
                ...registeredUsers.filter((account) => account.email !== normalizedEmail),
                {
                    id: response.data.id,
                    name: formData.name.trim(),
                    email: normalizedEmail,
                    password: formData.password,
                    role: formData.role
                }
            ];
            localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextRegisteredUsers));

            if (isStudentRole) {
                loginWithProfile({
                    id: response.data.id,
                    name: formData.name.trim(),
                    username: normalizedEmail,
                    email: normalizedEmail,
                    role: formData.role
                });
                navigate('/dashboard');
                return;
            }

            navigate('/login', {
                state: {
                    message: `${formData.role === 'ADMIN' ? 'Admin' : 'Technician'} account created. You can now sign in with email/password or Google using the same Gmail address.`
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md relative z-10 mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold neon-text mb-2">Join Nexus</h1>
                    <p className="text-gray-400">Create your campus account</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Account Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value, email: '', password: '' })}
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="USER">Student</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
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
                            placeholder={isStudentRole ? 'it23382008@my.sliit.lk' : 'staffmember@gmail.com'}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <Input
                            type="password"
                            placeholder="********"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" variant="secondary" disabled={submitting}>
                        {submitting ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                    <p className="text-center text-xs text-gray-500 -mt-2">
                        {isStudentRole
                            ? 'Student accounts use @my.sliit.lk and can sign in with email and password.'
                            : 'Admin and technician accounts use @gmail.com and can sign in with email/password or Google.'}
                    </p>

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
