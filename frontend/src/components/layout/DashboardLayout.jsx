import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-text">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

                <Navbar />
                <main className="flex-1 overflow-y-auto p-6 z-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
