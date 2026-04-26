import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck2, ClipboardList, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext.jsx';

export const BookingsHub = () => {
    const { user } = useAuth();
    const role = user?.role?.replace('ROLE_', '') || 'USER';
    const isAdmin = role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Booking Management</h1>
                    <p className="text-sm text-gray-400">Create, monitor, and review campus resource bookings from the same dashboard.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {!isAdmin && (
                    <>
                        <BookingActionCard
                            icon={CalendarCheck2}
                            title="Create Booking"
                            description="Reserve a lecture hall, lab, meeting room, or equipment after checking time-slot availability."
                            to="/bookings/create"
                            cta="New Request"
                        />
                        <BookingActionCard
                            icon={ClipboardList}
                            title="My Bookings"
                            description="Track approvals, view booking details, and cancel approved reservations when needed."
                            to="/bookings/my"
                            cta="View Mine"
                        />
                    </>
                )}

                {isAdmin && (
                    <BookingActionCard
                        icon={ShieldCheck}
                        title="Booking Approvals"
                        description="Review pending booking requests, apply filters, and approve or reject campus reservations."
                        to="/bookings/admin"
                        cta="Review Requests"
                    />
                )}
            </div>
        </div>
    );
};

const BookingActionCard = ({ icon: Icon, title, description, to, cta }) => (
    <Card className="border border-gray-800/80">
        <div className="flex h-full flex-col">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/70 text-primary shadow-lg">
                <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{description}</p>
            <Button asChild className="mt-6 w-fit">
                <Link to={to}>{cta}</Link>
            </Button>
        </div>
    </Card>
);
