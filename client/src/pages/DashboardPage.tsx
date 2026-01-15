import React, { useEffect, useState } from 'react';
import resumeService from '@/services/resumeService';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart2,
    Users,
    Briefcase,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useError } from '@/contexts/ErrorContext';

interface StatsData {
    totalJobs: number;
    totalResumes: number;
    averageScore: number;
    statusDistribution: {
        uploaded: number;
        processing: number;
        completed: number;
        failed: number;
    };
    scoreDistribution: {
        low: number;
        mid: number;
        high: number;
    };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showError } = useError();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await resumeService.getRecruiterStats();
                setStats(response.data);
            } catch (err: any) {
                showError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [showError]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 space-y-8">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recruiter Dashboard</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    High-level overview of your hiring metrics and candidate pipeline
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Jobs</CardTitle>
                        <Briefcase className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalJobs}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active postings</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-violet-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Resumes</CardTitle>
                        <Users className="h-5 w-5 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalResumes}</div>
                        <p className="text-xs text-muted-foreground mt-1">Processed by AI</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Avg. Match Score</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.averageScore}/10</div>
                        <p className="text-xs text-muted-foreground mt-1">Candidate quality</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Success Rate</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {stats.totalResumes > 0
                                ? Math.round((stats.statusDistribution.completed / stats.totalResumes) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Processing efficiency</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pipeline Status Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-violet-500" />
                            Pipeline Overview
                        </CardTitle>
                        <CardDescription>Status distribution of all uploaded resumes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {[
                                { label: 'Completed', value: stats.statusDistribution.completed, color: 'bg-emerald-500', icon: <CheckCircle2 className="h-3 w-3" /> },
                                { label: 'Processing', value: stats.statusDistribution.processing, color: 'bg-blue-500', icon: <Clock className="h-3 w-3" /> },
                                { label: 'Uploaded', value: stats.statusDistribution.uploaded, color: 'bg-gray-400', icon: <Users className="h-3 w-3" /> },
                                { label: 'Failed', value: stats.statusDistribution.failed, color: 'bg-red-500', icon: <AlertCircle className="h-3 w-3" /> },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            {item.icon}
                                            {item.label}
                                        </span>
                                        <span className="text-muted-foreground">{item.value} ({stats.totalResumes > 0 ? Math.round((item.value / stats.totalResumes) * 100) : 0}%)</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${stats.totalResumes > 0 ? (item.value / stats.totalResumes) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Candidate Quality Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Candidate Quality
                        </CardTitle>
                        <CardDescription>AI Score distribution across processed candidates</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center min-h-[300px]">
                        <div className="flex items-end justify-between h-48 gap-4 px-4 border-b border-l pb-1">
                            {[
                                { label: 'High (8-10)', value: stats.scoreDistribution.high, color: 'from-emerald-400 to-emerald-600', max: Math.max(stats.scoreDistribution.high, stats.scoreDistribution.mid, stats.scoreDistribution.low) || 1 },
                                { label: 'Mid (5-7)', value: stats.scoreDistribution.mid, color: 'from-amber-400 to-amber-600', max: Math.max(stats.scoreDistribution.high, stats.scoreDistribution.mid, stats.scoreDistribution.low) || 1 },
                                { label: 'Low (0-4)', value: stats.scoreDistribution.low, color: 'from-red-400 to-red-600', max: Math.max(stats.scoreDistribution.high, stats.scoreDistribution.mid, stats.scoreDistribution.low) || 1 },
                            ].map((item) => (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-1000 ease-out relative group-hover:brightness-110 shadow-lg`}
                                        style={{ height: `${(item.value / item.max) * 100}%` }}
                                    >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-0.5 rounded pointer-events-none">
                                            {item.value} candidates
                                        </div>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Alert */}
            <div className="bg-violet-50 border border-violet-100 p-4 rounded-xl flex gap-3 items-start">
                <TrendingUp className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-violet-900 text-sm">Actionable Insight</h4>
                    <p className="text-xs text-violet-700 leading-relaxed mt-1">
                        Based on your pipeline, <strong>{Math.round((stats.scoreDistribution.high / (stats.statusDistribution.completed || 1)) * 100)}%</strong> of processed candidates match your top criteria. We recommend reviewing the "High Score" candidates first to optimize your time.
                    </p>
                </div>
            </div>
        </div>
    );
}
