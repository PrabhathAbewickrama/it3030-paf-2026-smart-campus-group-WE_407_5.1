import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CalendarClock,
    ClipboardList,
    Radar,
    ShieldCheck,
    Sparkles,
    Wrench
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getTickets, getUserSummary } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketsRes, summaryRes] = await Promise.all([
                    getTickets(),
                    getUserSummary()
                ]);
                setTickets(ticketsRes.data);
                setSummary(summaryRes.data);
            } catch (error) {
                console.error('Failed to load home page data', error);
            }
        };

        fetchData();
    }, []);

    const overview = useMemo(() => {
        const activeTickets = tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;
        const resolvedToday = tickets.filter((ticket) => {
            if (!(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') || !ticket.updatedAt) {
                return false;
            }

            const updated = new Date(ticket.updatedAt);
            const today = new Date();

            return updated.toDateString() === today.toDateString();
        }).length;

        return {
            activeTickets,
            resolvedToday,
            users: (summary?.students ?? 0) + (summary?.admins ?? 0) + (summary?.managers ?? 0)
        };
    }, [summary, tickets]);

    const quickActions = [
        {
            title: 'Open Ticket Center',
            description: 'Review incidents, priorities, and recent maintenance activity.',
            icon: Wrench,
            action: () => navigate('/tickets'),
            buttonLabel: 'Go to Tickets'
        },
        {
            title: 'Manage Bookings',
            description: 'Create requests, review schedules, and handle room availability.',
            icon: CalendarClock,
            action: () => navigate('/bookings'),
            buttonLabel: 'Open Bookings'
        },
        {
            title: 'System Administration',
            description: 'View users, roles, and the operational settings for the campus platform.',
            icon: ShieldCheck,
            action: () => navigate('/users'),
            buttonLabel: 'View Users'
        }
    ];

    const capabilities = [
        {
            title: 'Smart Maintenance Flow',
            description: 'Prioritize issues, assign technicians, and keep every resolution update visible to the right people.'
        },
        {
            title: 'Campus Space Coordination',
            description: 'Handle bookings, approvals, and schedules without bouncing between disconnected tools.'
        },
        {
            title: 'Role-Based Control',
            description: 'Students, managers, technicians, and admins each get a focused view of the work that matters to them.'
        }
    ];

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,32,0.92),rgba(16,32,55,0.78))] px-6 py-8 shadow-[0_30px_90px_rgba(2,6,23,0.45)] md:px-10 md:py-10">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.25),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_32%)]" />
                <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] lg:items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                            <Sparkles className="h-3.5 w-3.5" />
                            Smart Campus System
                        </div>
                        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
                            Welcome back, {user?.name?.split(' ')[0] || 'Team'}.
                            <span className="block text-cyan-300">Run campus operations from one focused workspace.</span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                            SLIIT Nexus brings together maintenance support, space coordination, and operational oversight so the whole campus can move faster with less confusion.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Button onClick={() => navigate('/tickets')} className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                                Open Ticket Center <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/bookings')} className="border-cyan-300/40 text-cyan-200 hover:bg-cyan-400/10">
                                Explore Bookings
                            </Button>
                        </div>
                    </div>

                    <Card className="border-white/10 bg-slate-950/55">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Live Snapshot</p>
                        <div className="mt-6 space-y-4">
                            <SnapshotRow label="Active maintenance tickets" value={overview.activeTickets} accent="text-cyan-300" />
                            <SnapshotRow label="Resolved today" value={overview.resolvedToday} accent="text-emerald-300" />
                            <SnapshotRow label="Registered operations users" value={overview.users} accent="text-amber-300" />
                            <SnapshotRow label="Admins and managers" value={(summary?.admins ?? 0) + (summary?.managers ?? 0)} accent="text-fuchsia-300" />
                        </div>
                    </Card>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <Card className="border-white/10 bg-slate-950/45">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                            <Radar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">System Home</p>
                            <h2 className="mt-1 text-2xl font-bold text-white">Everything important, without the noise</h2>
                        </div>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {capabilities.map((item) => (
                            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="border-white/10 bg-slate-950/45">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Quick Actions</p>
                    <div className="mt-6 space-y-4">
                        {quickActions.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={item.action}
                                    className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all hover:border-cyan-300/30 hover:bg-cyan-400/[0.05]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="rounded-2xl bg-slate-900 p-3 text-cyan-300">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                                                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="mt-1 h-5 w-5 text-slate-500" />
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-cyan-200">{item.buttonLabel}</p>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.55),rgba(15,23,42,0.85))]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                            <Wrench className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Ticket analytics now live in the Tickets module</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                The dashboard overview belongs to maintenance operations, so it now sits inside the ticket workspace where the team can act on it immediately.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(69,26,3,0.45),rgba(15,23,42,0.85))]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Designed for daily use</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                This home page is meant to orient users quickly, point them to the right module, and give a cleaner first impression of the full system.
                            </p>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};

const SnapshotRow = ({ label, value, accent }) => (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-2xl font-bold ${accent}`}>{value}</span>
    </div>
);
