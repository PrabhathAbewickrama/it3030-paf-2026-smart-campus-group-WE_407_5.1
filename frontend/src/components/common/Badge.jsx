import React from 'react';
import { cn } from '../../utils/utils';

export const Badge = ({ children, variant = 'default', className, ...props }) => {
    const variants = {
        default: 'bg-primary/20 text-primary border-primary/30',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        danger: 'bg-red-500/20 text-red-400 border-red-500/30',
        neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    return (
        <span
            className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border", variants[variant], className)}
            {...props}
        >
            {children}
        </span>
    );
};
