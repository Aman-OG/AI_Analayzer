import React from 'react';
import { Check, Circle } from 'lucide-react';

interface PasswordStrengthProps {
    password: string;
    onValidationChange?: (isValid: boolean) => void;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, onValidationChange }) => {
    const requirements = [
        { label: 'Minimum 8 characters', regex: /.{8,}/ },
        { label: 'Numbers included', regex: /[0-9]/ },
        { label: 'Special symbols included', regex: /[^A-Za-z0-9]/ },
    ];

    const validationResults = requirements.map((req) => ({
        ...req,
        met: req.regex.test(password),
    }));

    const allMet = validationResults.every((res) => res.met);

    React.useEffect(() => {
        onValidationChange?.(allMet);
    }, [allMet, onValidationChange]);

    if (!password) return null;

    return (
        <div className="space-y-2 mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Password Requirements
            </p>
            <div className="grid grid-cols-1 gap-2">
                {validationResults.map((res, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${res.met ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                            {res.met ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                        </div>
                        <span className={`text-[11px] font-bold transition-colors ${res.met ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                            {res.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
