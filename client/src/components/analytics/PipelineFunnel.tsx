import { useEffect, useState } from 'react';

interface PipelineFunnelProps {
    stages: {
        applied: number;
        shortlisted: number;
        interviewed: number;
        offered: number;
        rejected: number;
    };
}

const stageConfig = [
    { key: 'applied', label: 'Applied', color: 'bg-slate-500', textColor: 'text-slate-600 dark:text-slate-400', barBg: 'bg-slate-100 dark:bg-slate-800' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', barBg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { key: 'interviewed', label: 'Interviewed', color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400', barBg: 'bg-blue-50 dark:bg-blue-950/30' },
    { key: 'offered', label: 'Offered', color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400', barBg: 'bg-purple-50 dark:bg-purple-950/30' },
    { key: 'rejected', label: 'Rejected', color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', barBg: 'bg-rose-50 dark:bg-rose-950/30' },
];

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
    const [animated, setAnimated] = useState(false);
    const total = Object.values(stages).reduce((a, b) => a + b, 0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                Hiring Pipeline
            </h3>

            <div className="space-y-4">
                {stageConfig.map((stage, idx) => {
                    const count = stages[stage.key as keyof typeof stages] || 0;
                    const percent = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={stage.key} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${stage.color} shadow-sm`} />
                                    <span className={`text-sm font-bold ${stage.textColor}`}>{stage.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{count}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {percent.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <div className={`h-3 rounded-full ${stage.barBg} overflow-hidden`}>
                                <div
                                    className={`h-full rounded-full ${stage.color} transition-all duration-1000 ease-out shadow-sm`}
                                    style={{
                                        width: animated ? `${Math.max(percent, count > 0 ? 3 : 0)}%` : '0%',
                                        transitionDelay: `${idx * 150}ms`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total in Pipeline</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{total}</span>
            </div>
        </div>
    );
}
