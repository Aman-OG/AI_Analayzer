import { useEffect, useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number;
    suffix?: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    delay?: number;
}

export function KPICard({ title, value, suffix = '', icon: Icon, color, bgColor, delay = 0 }: KPICardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!isVisible) return;

        const duration = 1200;
        const steps = 40;
        const stepDuration = duration / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            // Ease-out cubic for satisfying deceleration
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(eased * value * 10) / 10;
            setDisplayValue(current);

            if (step >= steps) {
                setDisplayValue(value);
                clearInterval(timer);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [value, isVisible]);

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            {/* Background glow */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgColor} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${bgColor} bg-opacity-10`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className={`text-3xl md:text-4xl font-black ${color} tracking-tight`}>
                        {Number.isInteger(value) ? Math.round(displayValue) : displayValue.toFixed(1)}
                        <span className="text-lg md:text-xl font-bold text-slate-400 ml-1">{suffix}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                </div>
            </div>
        </div>
    );
}
