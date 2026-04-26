import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Bell, CheckCheck, LogOut, Menu, Search, Trash2, UserCircle } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

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
                <div className="relative" ref={panelRef}>
                    <button
                        className="relative text-gray-400 hover:text-white transition-colors"
                        onClick={() => setOpen((current) => !current)}
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {open && (
                        <div className="absolute right-0 top-10 z-50 w-[360px] overflow-hidden rounded-2xl border border-gray-800 bg-slate-950/95 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-md">
                            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">Notifications</p>
                                    <p className="text-xs text-gray-400">{unreadCount} unread update{unreadCount === 1 ? '' : 's'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-white"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                    Mark all read
                                </button>
                            </div>

                            <div className="max-h-[420px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm font-medium text-white">No notifications yet</p>
                                        <p className="mt-1 text-xs text-gray-400">System, booking, and ticket updates will appear here.</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() => markAsRead(notification.id)}
                                            className={`flex w-full items-start gap-3 border-b border-gray-800/70 px-4 py-3 text-left transition-colors hover:bg-white/5 ${notification.read ? 'opacity-70' : ''}`}
                                        >
                                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                                notification.type === 'success'
                                                    ? 'bg-emerald-400'
                                                    : notification.type === 'warning'
                                                        ? 'bg-amber-400'
                                                        : notification.type === 'error'
                                                            ? 'bg-red-400'
                                                            : 'bg-cyan-400'
                                            }`} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{notification.title}</p>
                                                        <p className="mt-1 text-xs leading-5 text-gray-400">{notification.message}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            removeNotification(notification.id);
                                                        }}
                                                        className="text-gray-500 transition-colors hover:text-red-300"
                                                        title="Remove notification"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                                                    <span>{notification.module}</span>
                                                    {!notification.read && <span className="text-primary">new</span>}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
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
