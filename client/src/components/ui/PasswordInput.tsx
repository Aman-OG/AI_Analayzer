import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, icon = true, className = '', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    )}
                    <input
                        {...props}
                        ref={ref}
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full ${icon ? 'pl-11' : 'px-4'} pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium ${className}`}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
            </div>
        );
    }
);

PasswordInput.displayName = 'PasswordInput';
