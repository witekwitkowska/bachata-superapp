"use client";
import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CompactInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const CompactInput = forwardRef<HTMLInputElement, CompactInputProps>(
    ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-foreground/80">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}
                    <Input
                        ref={ref}
                        className={cn(
                            "h-10 bg-background/50 border-border/50 focus:border-primary transition-all duration-200",
                            "focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
                {helperText && !error && (
                    <p className="text-sm text-muted-foreground">{helperText}</p>
                )}
            </div>
        );
    }
);

CompactInput.displayName = "CompactInput";

export { CompactInput }; 