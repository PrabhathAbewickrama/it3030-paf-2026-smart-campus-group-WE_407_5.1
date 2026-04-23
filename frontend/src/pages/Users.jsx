import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { getTickets, getUsers, getUserSummary } from '../services/api';
import { Shield, UserCog, Users as UsersIcon, Wrench } from 'lucide-react';

const ROLE_META = {
    ADMIN: { label: 'Admins', icon: Shield, accent: 'text-red-400' },
    MANAGER: { label: 'Managers', icon: UserCog, accent: 'text-blue-400' },
    TECHNICIAN: { label: 'Technicians', icon: Wrench, accent: 'text-emerald-400' },
    USER: { label: 'Students', icon: UsersIcon, accent: 'text-violet-400' }
};

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, ticketsRes, summaryRes] = await Promise.all([
                    getUsers(),
                    getTickets(),
                    getUserSummary()
                ]);
                setUsers(usersRes.data);
                setTickets(ticketsRes.data);
                setSummary(summaryRes.data);
            } catch (error) {
                console.error('Failed to load users page data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const technicianLoad = useMemo(() => {
        return tickets.reduce((acc, ticket) => {
            if (!ticket.technicianId) {
                return acc;
            }

            if (!acc[ticket.technicianId]) {
                acc[ticket.technicianId] = { active: 0, resolved: 0, closed: 0 };
            }

            if (ticket.status === 'RESOLVED') {
                acc[ticket.technicianId].resolved += 1;
            } else if (ticket.status === 'CLOSED') {
                acc[ticket.technicianId].closed += 1;
            } else if (ticket.status !== 'REJECTED') {
                acc[ticket.technicianId].active += 1;
            }

            return acc;
        }, {});
    }, [tickets]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
            const value = search.trim().toLowerCase();
            const matchesSearch =
                value.length === 0 ||
                user.name.toLowerCase().includes(value) ||
                user.email.toLowerCase().includes(value);

            return matchesRole && matchesSearch;
        });
    }, [roleFilter, search, users]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">User Operations</h1>
                    <p className="text-sm text-gray-400">View campus roles, technician workload, and account coverage.</p>
                </div>
                <Badge variant="default" className="w-fit">
                    {loading ? 'Loading users...' : `${filteredUsers.length} visible account(s)`}
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard title="Total Accounts" value={summary?.totalUsers ?? users.length} icon={UsersIcon} color="text-primary" />
                <SummaryCard title="Technicians" value={summary?.technicians ?? users.filter((user) => user.role === 'TECHNICIAN').length} icon={Wrench} color="text-emerald-400" />
                <SummaryCard title="Managers" value={summary?.managers ?? users.filter((user) => user.role === 'MANAGER').length} icon={UserCog} color="text-blue-400" />
                <SummaryCard title="Admins" value={summary?.admins ?? users.filter((user) => user.role === 'ADMIN').length} icon={Shield} color="text-red-400" />
            </div>

            <Card className="border border-gray-800/80">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by user name or email"
                        />
                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="ALL">All roles</option>
                            <option value="ADMIN">Admins</option>
                            <option value="MANAGER">Managers</option>
                            <option value="TECHNICIAN">Technicians</option>
                            <option value="USER">Students</option>
                        </select>
                    </div>
                    <Button variant="outline" onClick={() => { setSearch(''); setRoleFilter('ALL'); }}>
                        Reset Filters
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
                <Card className="overflow-hidden border border-gray-800/80">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Campus Accounts</h2>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Member 4 Admin View</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="border-b border-gray-800 text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Assigned Work</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredUsers.map((user) => {
                                    const load = technicianLoad[user.id] || { active: 0, resolved: 0, closed: 0 };
                                    return (
                                        <tr key={user.id} className="transition-colors hover:bg-gray-800/40">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-sm font-semibold text-white">
                                                        {user.name?.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={user.role === 'TECHNICIAN' ? 'success' : user.role === 'ADMIN' ? 'danger' : user.role === 'MANAGER' ? 'default' : 'neutral'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-300">
                                                {user.role === 'TECHNICIAN' ? `${load.active} active, ${load.resolved} resolved, ${load.closed} closed` : 'Not ticket-assigned'}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently added'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loading && filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                            No users match the current search filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="border border-gray-800/80">
                    <h2 className="mb-4 text-lg font-semibold text-white">Role Breakdown</h2>
                    <div className="space-y-4">
                        {Object.entries(ROLE_META).map(([role, meta]) => {
                            const count = users.filter((user) => user.role === role).length;
                            const Icon = meta.icon;
                            return (
                                <div key={role} className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-xl border border-gray-800 bg-gray-950 p-2 ${meta.accent}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{meta.label}</p>
                                                <p className="text-xs text-gray-500">{role}</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-white">{count}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                                            style={{ width: `${users.length ? (count / users.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon: Icon, color }) => (
    <Card className="border border-gray-800/80">
        <div className="flex items-center gap-4">
            <div className={`rounded-2xl border border-gray-800 bg-gray-900/50 p-4 ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </Card>
);
