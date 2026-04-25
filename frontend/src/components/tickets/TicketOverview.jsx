import React, { useMemo } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Users, Wrench } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../common/Card';

export const TicketOverview = ({ tickets = [], technicians = [], summary = null }) => {
    const stats = useMemo(() => {
        const openTickets = tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS');
        const criticalIssues = tickets.filter((ticket) => ticket.priority === 'HIGH' && ticket.status !== 'CLOSED');
        const resolvedTickets = tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

        const byDay = tickets.reduce((acc, ticket) => {
            const date = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
            const key = date.toLocaleDateString('en-US', { weekday: 'short' });
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const trendData = orderedDays.map((day) => ({
            name: day,
            tickets: byDay[day] || 0
        }));

        const recentActivity = [...tickets]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
            .slice(0, 5)
            .map((ticket) => ({
                id: ticket.id,
                text: `${ticket.category} ticket is ${ticket.status.toLowerCase().replace('_', ' ')}`,
                time: formatRelative(ticket.updatedAt || ticket.createdAt),
                priority: ticket.priority
            }));

        return {
            openTickets: openTickets.length,
            criticalIssues: criticalIssues.length,
            resolvedTickets: resolvedTickets.length,
            trendData,
            recentActivity
        };
    }, [tickets]);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Ticket Command Center</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Maintenance dashboard for the ticket team</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-400">
                        Track open incidents, watch critical issues, and review the latest service activity from one place.
                    </p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                    <span className="font-semibold">{stats.openTickets}</span> active tickets need attention right now.
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <StatCard title="Open Tickets" value={stats.openTickets} icon={Wrench} color="text-accent" />
                <StatCard title="Critical Issues" value={stats.criticalIssues} icon={AlertTriangle} color="text-red-500" />
                <StatCard title="Resolved Tickets" value={stats.resolvedTickets} icon={CheckCircle2} color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric title="Technicians" value={technicians.length} subtitle="Available support staff" />
                <MiniMetric title="Admins" value={summary?.admins ?? 0} subtitle="Operations owners" />
                <MiniMetric title="Managers" value={summary?.managers ?? 0} subtitle="Escalation contacts" />
                <MiniMetric title="Students" value={summary?.students ?? 0} subtitle="Service requesters" />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card className="min-h-[400px] border-white/10 bg-slate-950/50">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Maintenance Trends</h3>
                            <p className="mt-1 text-sm text-slate-400">Ticket volumes across the week</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300" />
                            Live service flow
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <AreaChart data={stats.trendData}>
                                <defs>
                                    <linearGradient id="ticketTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff', borderRadius: '0.75rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="tickets" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#ticketTrendGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="border-white/10 bg-slate-950/50">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                            <p className="mt-1 text-sm text-slate-400">Latest updates across active incidents</p>
                        </div>
                        <Users className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="space-y-6">
                        {stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((item) => (
                                <ActivityItem key={item.id} text={item.text} time={item.time} />
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No recent ticket activity yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </section>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="flex items-center gap-4 border-white/10 bg-slate-950/45 transition-transform hover:-translate-y-1">
        <div className={`rounded-2xl border border-white/10 bg-slate-900/90 p-4 ${color} shadow-lg`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <h4 className="mt-1 text-3xl font-bold text-white">{value}</h4>
        </div>
    </Card>
);

const MiniMetric = ({ title, value, subtitle }) => (
    <Card className="border-white/10 bg-slate-950/45">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </Card>
);

const ActivityItem = ({ text, time }) => (
    <div className="relative flex items-start gap-4 before:absolute before:bottom-[-24px] before:left-[3px] before:top-4 before:w-[2px] before:bg-slate-800 last:before:hidden">
        <div className="relative z-10 mt-1.5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        <div>
            <p className="text-sm font-medium text-slate-200">{text}</p>
            <p className="mt-1 text-xs text-slate-500">{time}</p>
        </div>
    </div>
);

const formatRelative = (value) => {
    if (!value) {
        return 'Just now';
    }

    const timestamp = new Date(value).getTime();
    const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

    if (diffMinutes < 1) {
        return 'Just now';
    }
    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};
