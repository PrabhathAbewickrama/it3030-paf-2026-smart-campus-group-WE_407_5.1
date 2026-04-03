import React from 'react';
import { cn } from '../../utils/utils';

export const Card = ({ className, children, ...props }) => {
    return (
        <div className={cn("glass-card p-6", className)} {...props}>
            {children}
        </div>
    );
};
