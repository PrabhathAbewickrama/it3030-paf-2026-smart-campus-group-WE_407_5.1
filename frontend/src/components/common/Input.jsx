import React from 'react';
import { cn } from '../../utils/utils';

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";
