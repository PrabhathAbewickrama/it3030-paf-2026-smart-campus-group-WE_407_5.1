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
    const role = user?.role?.replace('ROLE_', '') || 'USER';
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
            users: (summary?.students ?? 0) + (summary?.admins ?? 0) + (summary?.technicians ?? 0)
        };
    }, [summary, tickets]);

    const quickActions = role === 'ADMIN'
        ? [
            {
                title: 'Booking Approvals',
                description: 'Review and decide on booking requests across the campus.',
                icon: CalendarClock,
                action: () => navigate('/bookings/admin'),
                buttonLabel: 'Review Bookings'
            },
            {
                title: 'Manage Tickets',
                description: 'Monitor campus incidents and support workload.',
                icon: Wrench,
                action: () => navigate('/tickets'),
                buttonLabel: 'Open Tickets'
            },
            {
                title: 'Manage Users',
                description: 'View students, admins, and technicians in one place.',
                icon: ShieldCheck,
                action: () => navigate('/users'),
                buttonLabel: 'Open Users'
            }
        ]
        : role === 'TECHNICIAN'
            ? [
                {
                    title: 'Assigned Tickets',
                    description: 'Focus on maintenance tasks, progress updates, and closure.',
                    icon: Wrench,
                    action: () => navigate('/tickets'),
                    buttonLabel: 'Open Technician Queue'
                }
            ]
            : [
                {
                    title: 'My Bookings',
                    description: 'Create resource bookings and track their status.',
                    icon: CalendarClock,
                    action: () => navigate('/bookings'),
                    buttonLabel: 'Open Bookings'
                },
                {
                    title: 'My Tickets',
                    description: 'Report incidents and follow maintenance updates.',
                    icon: Wrench,
                    action: () => navigate('/tickets'),
                    buttonLabel: 'Go to Tickets'
                }
            ];

    const capabilities = role === 'ADMIN'
        ? [
            {
                title: 'Administrative Oversight',
                description: 'Keep booking approvals, users, and campus operations under control.'
            },
            {
                title: 'Support Visibility',
                description: 'Track incident progress and technician activity without opening every module first.'
            },
            {
                title: 'Role-Based Access',
                description: 'Admin tools stay available only where they are actually needed.'
            }
        ]
        : role === 'TECHNICIAN'
            ? [
                {
                    title: 'Maintenance Queue',
                    description: 'See active incidents and move them toward resolution faster.'
                },
                {
                    title: 'Work Updates',
                    description: 'Add notes, progress updates, and closing actions from one focused space.'
                },
                {
                    title: 'Technician-Only View',
                    description: 'No admin or user-management pages clutter the support workflow.'
                }
            ]
            : [
                {
                    title: 'Student Booking Flow',
                    description: 'Request rooms and resources without seeing admin-only controls.'
                },
                {
                    title: 'Support Requests',
                    description: 'Create incident tickets and follow updates from the same dashboard.'
                },
                {
                    title: 'Clean Student Experience',
                    description: 'Students only see the parts of the system they actually need.'
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
                            {role === 'ADMIN' ? 'Admin Workspace' : role === 'TECHNICIAN' ? 'Technician Workspace' : 'Student Workspace'}
                        </div>
                        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
                            Welcome back, {user?.name?.split(' ')[0] || 'Team'}.
                            <span className="block text-cyan-300">
                                {role === 'ADMIN'
                                    ? 'Oversee bookings, users, and support operations.'
                                    : role === 'TECHNICIAN'
                                        ? 'Handle maintenance work from a focused support dashboard.'
                                        : 'Access bookings and support from a student-focused dashboard.'}
                            </span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                            {role === 'ADMIN'
                                ? 'This dashboard is designed for operational control, approvals, and user oversight.'
                                : role === 'TECHNICIAN'
                                    ? 'This dashboard keeps your daily work centered on incidents, repairs, and updates.'
                                    : 'This dashboard keeps student tasks simple by focusing on bookings and ticket help.'}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Button
                                onClick={() => navigate(role === 'ADMIN' ? '/tickets' : role === 'TECHNICIAN' ? '/tickets' : '/bookings')}
                                className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]"
                            >
                                {role === 'ADMIN' ? 'Open Ticket Center' : role === 'TECHNICIAN' ? 'Open Technician Queue' : 'Open Bookings'}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            {role !== 'TECHNICIAN' && (
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(role === 'ADMIN' ? '/users' : '/tickets')}
                                    className="border-cyan-300/40 text-cyan-200 hover:bg-cyan-400/10"
                                >
                                    {role === 'ADMIN' ? 'Open Users' : 'Open Tickets'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="border-white/10 bg-slate-950/55">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Live Snapshot</p>
                        <div className="mt-6 space-y-4">
                            <SnapshotRow label="Active maintenance tickets" value={overview.activeTickets} accent="text-cyan-300" />
                            <SnapshotRow label="Resolved today" value={overview.resolvedToday} accent="text-emerald-300" />
                            <SnapshotRow label="Registered system users" value={overview.users} accent="text-amber-300" />
                            <SnapshotRow label="Admins and technicians" value={(summary?.admins ?? 0) + (summary?.technicians ?? 0)} accent="text-fuchsia-300" />
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
                            <h2 className="mt-1 text-2xl font-bold text-white">
                                {role === 'ADMIN' ? 'Administrative control, without the noise' : role === 'TECHNICIAN' ? 'Maintenance work, without the noise' : 'Student essentials, without the noise'}
                            </h2>
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
                            <h3 className="text-xl font-semibold text-white">
                                {role === 'TECHNICIAN' ? 'Support work stays front and center' : 'Tickets stay close when support is needed'}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                {role === 'TECHNICIAN'
                                    ? 'Technicians get a direct path into the ticket queue and maintenance progress updates.'
                                    : 'The ticket module is ready whenever you need deeper maintenance actions or issue tracking.'}
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
                            <h3 className="text-xl font-semibold text-white">Designed for daily role-based use</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                {role === 'ADMIN'
                                    ? 'Admins see control tools only.'
                                    : role === 'TECHNICIAN'
                                        ? 'Technicians see support tools only.'
                                        : 'Students see booking and help tools only.'}
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
