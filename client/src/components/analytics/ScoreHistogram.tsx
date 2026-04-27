import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScoreHistogramProps {
    distribution: number[];
}

const COLORS = [
    '#ef4444', // 1 - red
    '#f97316', // 2 - orange
    '#f59e0b', // 3 - amber
    '#eab308', // 4 - yellow
    '#84cc16', // 5 - lime
    '#22c55e', // 6 - green
    '#10b981', // 7 - emerald
    '#14b8a6', // 8 - teal
    '#3b82f6', // 9 - blue
    '#6366f1', // 10 - indigo
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.[0]) return null;
    return (
        <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Score {label}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
                {payload[0].value} <span className="text-xs font-bold text-slate-400">candidates</span>
            </p>
        </div>
    );
}

export function ScoreHistogram({ distribution }: ScoreHistogramProps) {
    const data = distribution.map((count, idx) => ({
        score: `${idx + 1}`,
        count,
    }));

    const hasData = distribution.some(d => d > 0);

    return (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                Score Distribution
            </h3>

            {hasData ? (
                <div className="h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <XAxis
                                dataKey="score"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)', radius: 8 }} />
                            <Bar dataKey="count" radius={[8, 8, 4, 4]} maxBarSize={48}>
                                {data.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx]} fillOpacity={0.85} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-400">No scored candidates yet</p>
                </div>
            )}
        </div>
    );
}
