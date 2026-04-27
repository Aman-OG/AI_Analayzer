import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UploadTimelineProps {
    data: Array<{
        date: string;
        count: number;
    }>;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.[0]) return null;
    const dateStr = payload[0].payload.date;
    const date = new Date(dateStr + 'T00:00:00');
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{formatted}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
                {payload[0].value} <span className="text-xs font-bold text-slate-400">uploads</span>
            </p>
        </div>
    );
}

export function UploadTimeline({ data }: UploadTimelineProps) {
    const hasData = data.some(d => d.count > 0);

    // Format dates for display (show every 5th label)
    const formattedData = data.map((d, idx) => ({
        ...d,
        label: idx % 5 === 0
            ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '',
    }));

    return (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                Upload Activity — Last 30 Days
            </h3>

            {hasData ? (
                <div className="h-56 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <defs>
                                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                interval={0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                fill="url(#uploadGradient)"
                                dot={false}
                                activeDot={{
                                    r: 5,
                                    fill: '#3b82f6',
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-56 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-400">No uploads in the last 30 days</p>
                </div>
            )}
        </div>
    );
}
