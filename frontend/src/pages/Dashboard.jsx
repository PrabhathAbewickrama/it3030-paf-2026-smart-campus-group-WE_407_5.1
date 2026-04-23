import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Users, Wrench } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/common/Card';
import { getTickets, getTechnicians, getUserSummary } from '../services/api';

export const Dashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketsRes, techniciansRes, summaryRes] = await Promise.all([
                    getTickets(),
                    getTechnicians(),
                    getUserSummary()
                ]);
                setTickets(ticketsRes.data);
                setTechnicians(techniciansRes.data);
                setSummary(summaryRes.data);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            }
        };

        fetchData();
    }, []);

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Open Tickets" value={stats.openTickets} icon={Wrench} color="text-accent" />
                <StatCard title="Critical Issues" value={stats.criticalIssues} icon={AlertTriangle} color="text-red-500" />
                <StatCard title="Resolved Tickets" value={stats.resolvedTickets} icon={CheckCircle2} color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MiniMetric title="Technicians" value={technicians.length} subtitle="Available support staff" />
                <MiniMetric title="Admins" value={summary?.admins ?? 0} subtitle="Operations owners" />
                <MiniMetric title="Managers" value={summary?.managers ?? 0} subtitle="Escalation contacts" />
                <MiniMetric title="Students" value={summary?.students ?? 0} subtitle="Service requesters" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Maintenance Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <AreaChart data={stats.trendData}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#6B7280" axisLine={false} tickLine={false} />
                                <YAxis stroke="#6B7280" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="tickets" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((item) => (
                                <ActivityItem key={item.id} text={item.text} time={item.time} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No recent ticket activity yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className={`p-4 rounded-xl bg-gray-800 border border-gray-700 ${color} shadow-lg`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
    </Card>
);

const MiniMetric = ({ title, value, subtitle }) => (
    <Card className="border border-gray-800/80">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </Card>
);

const ActivityItem = ({ text, time }) => (
    <div className="flex gap-4 items-start relative before:absolute before:left-[3px] before:top-4 before:bottom-[-24px] before:w-[2px] before:bg-gray-800 last:before:hidden">
        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary relative z-10 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
        <div>
            <p className="text-sm font-medium text-gray-200">{text}</p>
            <p className="text-xs text-gray-500 mt-1">{time}</p>
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
