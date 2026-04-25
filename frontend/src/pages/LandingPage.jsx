import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowRight, ShieldCheck, Wrench } from 'lucide-react';

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-text overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[150px] pointer-events-none" />

            <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold neon-text tracking-tighter">SLIIT Nexus</h1>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
                    <Button onClick={() => navigate('/login')}>Get Started</Button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center justify-center pt-32 px-4 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-8 border border-primary/20">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    New: Smart Ticketing System Live
                </div>

                <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                    Connecting Campus <br />
                    <span className="neon-text">Intelligence</span>
                </h2>

                <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
                    The all-in-one smart campus operations platform. Manage critical maintenance incidents and access secure authentication with seamless efficiency.
                </p>

                <div className="flex gap-4 mb-24">
                    <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
                        Enter Nexus <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Secure Auth"
                        desc="OAuth 2.0 Google Sign-In with Role-Based Access Control."
                    />
                    <FeatureCard
                        icon={Wrench}
                        title="Incident Ticketing"
                        desc="Priority-based SLA tracking for campus maintenance."
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
        <div className="h-14 w-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-6 shadow-lg border border-gray-700">
            <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);
