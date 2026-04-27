import { useEffect, useState } from 'react';
import { analyticsService } from '../services';
import { KPICard } from '../components/analytics/KPICard';
import { PipelineFunnel } from '../components/analytics/PipelineFunnel';
import { ScoreHistogram } from '../components/analytics/ScoreHistogram';
import { JobBreakdownTable } from '../components/analytics/JobBreakdownTable';
import { UploadTimeline } from '../components/analytics/UploadTimeline';
import { Users, TrendingUp, Star, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

type DashboardMetrics = Awaited<ReturnType<typeof analyticsService.getDashboardMetrics>>;

export function AnalyticsDashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    async function loadMetrics() {
        try {
            const data = await analyticsService.getDashboardMetrics();
            setMetrics(data);
        } catch (error: any) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* KPI skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 rounded-3xl bg-slate-100/80 dark:bg-slate-800/50 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                        </div>
                    ))}
                </div>
                {/* Charts skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-80 rounded-3xl bg-slate-100/80 dark:bg-slate-800/50 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                        </div>
                    ))}
                </div>
                <div className="h-64 rounded-3xl bg-slate-100/80 dark:bg-slate-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                </div>
            </div>
        );
    }

    if (!metrics) return null;

    return (
        <div className="space-y-8 relative animate-fade-in">
            {/* Ambient Glow */}
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            {/* Page Header */}
            <div className="space-y-1 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Analytics Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Your hiring pipeline at a glance — metrics across all positions.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Candidates"
                    value={metrics.totalCandidates}
                    icon={Users}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-500"
                    delay={0}
                />
                <KPICard
                    title="Average Score"
                    value={metrics.averageScore}
                    suffix="/10"
                    icon={TrendingUp}
                    color="text-emerald-600 dark:text-emerald-400"
                    bgColor="bg-emerald-500"
                    delay={100}
                />
                <KPICard
                    title="Top Performers"
                    value={metrics.topPerformersPercent}
                    suffix="%"
                    icon={Star}
                    color="text-amber-600 dark:text-amber-400"
                    bgColor="bg-amber-500"
                    delay={200}
                />
                <KPICard
                    title="Active Positions"
                    value={metrics.activeJobs}
                    icon={Briefcase}
                    color="text-purple-600 dark:text-purple-400"
                    bgColor="bg-purple-500"
                    delay={300}
                />
            </div>

            {/* Pipeline + Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PipelineFunnel stages={metrics.pipelineStages} />
                <ScoreHistogram distribution={metrics.scoreDistribution} />
            </div>

            {/* Upload Timeline */}
            <UploadTimeline data={metrics.uploadTimeline} />

            {/* Job Breakdown Table */}
            <JobBreakdownTable jobs={metrics.jobBreakdown} />
        </div>
    );
}
