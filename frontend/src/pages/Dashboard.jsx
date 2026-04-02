import React from 'react';
import { Card } from '../components/common/Card';
import { Users, Calendar, Wrench, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', tickets: 24 },
    { name: 'Tue', tickets: 13 },
    { name: 'Wed', tickets: 98 },
    { name: 'Thu', tickets: 39 },
    { name: 'Fri', tickets: 48 },
    { name: 'Sat', tickets: 38 },
    { name: 'Sun', tickets: 43 },
];

export const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Open Tickets" value="12" icon={Wrench} color="text-accent" />
                <StatCard title="Critical Issues" value="3" icon={AlertTriangle} color="text-red-500" />
                <StatCard title="Resolved Today" value="5" icon={Users} color="text-primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Maintenance Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <AreaChart data={data}>
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
                        <ActivityItem text="Projector maintenance resolved" time="1 hour ago" />
                        <ActivityItem text="Critical ticket reported: AC failure" time="3 hours ago" />
                        <ActivityItem text="New technician assigned to Ticket #102" time="5 hours ago" />
                        <ActivityItem text="Maintenance schedule updated" time="6 hours ago" />
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

const ActivityItem = ({ text, time }) => (
    <div className="flex gap-4 items-start relative before:absolute before:left-[3px] before:top-4 before:bottom-[-24px] before:w-[2px] before:bg-gray-800 last:before:hidden">
        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary relative z-10 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
        <div>
            <p className="text-sm font-medium text-gray-200">{text}</p>
            <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
    </div>
);
