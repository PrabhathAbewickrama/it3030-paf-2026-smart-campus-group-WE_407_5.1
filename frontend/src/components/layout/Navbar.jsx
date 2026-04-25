import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Bell, LogOut, Menu, Search, UserCircle } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
            <div className="flex items-center gap-4 lg:hidden">
                <button className="text-gray-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold neon-text">Nexus</span>
            </div>

            <div className="hidden lg:flex items-center bg-gray-900 rounded-full px-4 py-1.5 border border-gray-700 w-96 focus-within:ring-1 focus-within:ring-primary shadow-inner">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search tickets..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-gray-500"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-[0_0_10px_rgba(236,72,153,0.8)]">3</span>
                </button>
                
                <div className="flex items-center gap-3 border-l border-gray-700 pl-4 ml-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white leading-tight">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('ROLE_', '').toLowerCase() || 'User'}</p>
                    </div>
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-700" />
                    ) : (
                        <UserCircle className="w-8 h-8 text-gray-300" />
                    )}
                </div>

                <button 
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};
