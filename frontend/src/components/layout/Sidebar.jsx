import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarRange, ClipboardList, LayoutDashboard, Settings, ShieldCheck, Users, Wrench } from 'lucide-react';
import { cn } from '../../utils/utils';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = () => {
    const { user } = useAuth();
    const role = user?.role?.replace('ROLE_', '') || 'USER';

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Bookings', path: '/bookings', icon: CalendarRange },
        ...(role !== 'ADMIN' ? [
            { name: 'Create Booking', path: '/bookings/create', icon: CalendarRange },
            { name: 'My Bookings', path: '/bookings/my', icon: ClipboardList },
        ] : [
            { name: 'Booking Approvals', path: '/bookings/admin', icon: ShieldCheck },
        ]),
        { name: 'Tickets', path: '/tickets', icon: Wrench },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex bg-card/80 backdrop-blur-md border-r border-gray-800 w-64 flex-col h-full hidden lg:flex">
            <div className="flex items-center h-16 px-6 border-b border-gray-800">
                <span className="text-xl font-bold neon-text tracking-wide">SLIIT Nexus</span>
            </div>
            <nav className="flex-1 py-4 flex flex-col gap-2 px-4 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive ? "bg-primary/20 text-primary shadow-[inset_0_0_10px_rgba(124,58,237,0.2)]" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.name}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};
