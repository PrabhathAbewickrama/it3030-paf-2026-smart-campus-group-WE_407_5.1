import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext();

const buildStorageKey = (user) => {
    const role = user?.role?.replace('ROLE_', '') || 'GUEST';
    const id = user?.id ?? 'anonymous';
    return `smartcampus_notifications_${role}_${id}`;
};

const createNotification = ({
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    type = 'info',
    roleScope = [],
    module = 'system',
    createdAt = new Date().toISOString(),
    read = false
}) => ({
    id,
    title,
    message,
    type,
    roleScope,
    module,
    createdAt,
    read
});

const createSeedNotifications = (role) => {
    const shared = [
        createNotification({
            title: 'System notifications are active',
            message: 'This panel now tracks booking, ticket, and account updates inside the app.',
            type: 'success',
            roleScope: [role],
            module: 'system'
        })
    ];

    switch (role) {
        case 'ADMIN':
            return [
                ...shared,
                createNotification({
                    title: 'Admin review queue',
                    message: 'Watch booking approvals, user activity, and ticket escalations from one place.',
                    type: 'info',
                    roleScope: ['ADMIN'],
                    module: 'admin'
                }),
                createNotification({
                    title: 'Priority alerts enabled',
                    message: 'High-impact ticket and booking decisions should appear here for admin follow-up.',
                    type: 'warning',
                    roleScope: ['ADMIN'],
                    module: 'tickets'
                })
            ];
        case 'MANAGER':
            return [
                ...shared,
                createNotification({
                    title: 'Manager alerts enabled',
                    message: 'Operational updates, booking risks, and service bottlenecks will be surfaced here.',
                    type: 'info',
                    roleScope: ['MANAGER'],
                    module: 'operations'
                })
            ];
        case 'TECHNICIAN':
            return [
                ...shared,
                createNotification({
                    title: 'Technician workspace ready',
                    message: 'Assigned ticket progress, resolution reminders, and comment updates will appear here.',
                    type: 'info',
                    roleScope: ['TECHNICIAN'],
                    module: 'tickets'
                })
            ];
        default:
            return [
                ...shared,
                createNotification({
                    title: 'User updates enabled',
                    message: 'Booking responses, ticket updates, and important account notices will appear here.',
                    type: 'info',
                    roleScope: ['USER'],
                    module: 'bookings'
                })
            ];
    }
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const role = user?.role?.replace('ROLE_', '') || 'USER';
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const storageKey = buildStorageKey(user);
        const stored = localStorage.getItem(storageKey);

        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
                return;
            } catch (error) {
                console.error('Failed to parse notifications from storage', error);
            }
        }

        const seeded = createSeedNotifications(role);
        setNotifications(seeded);
        localStorage.setItem(storageKey, JSON.stringify(seeded));
    }, [role, user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        localStorage.setItem(buildStorageKey(user), JSON.stringify(notifications));
    }, [notifications, user]);

    const api = useMemo(() => ({
        notifications,
        unreadCount: notifications.filter((item) => !item.read).length,
        addNotification: (notification) => {
            const next = createNotification({
                ...notification,
                roleScope: notification.roleScope?.length ? notification.roleScope : [role]
            });
            setNotifications((current) => [next, ...current].slice(0, 40));
            return next;
        },
        markAsRead: (id) => {
            setNotifications((current) =>
                current.map((item) => (item.id === id ? { ...item, read: true } : item))
            );
        },
        markAllAsRead: () => {
            setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        },
        removeNotification: (id) => {
            setNotifications((current) => current.filter((item) => item.id !== id));
        },
        clearNotifications: () => {
            setNotifications([]);
        }
    }), [notifications, role]);

    return (
        <NotificationContext.Provider value={api}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
