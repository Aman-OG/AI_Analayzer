import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface JobBreakdownRow {
    jobId: string;
    title: string;
    company: string;
    candidateCount: number;
    avgScore: number;
    topScore: number;
    stages: {
        applied: number;
        shortlisted: number;
        interviewed: number;
        offered: number;
        rejected: number;
    };
}

interface JobBreakdownTableProps {
    jobs: JobBreakdownRow[];
}

function getScoreColor(score: number) {
    if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 6) return 'text-blue-600 dark:text-blue-400';
    if (score >= 4) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-400';
}

export function JobBreakdownTable({ jobs }: JobBreakdownTableProps) {
    const navigate = useNavigate();

    if (jobs.length === 0) {
        return (
            <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                    Per-Job Breakdown
                </h3>
                <div className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-400">No jobs created yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 overflow-hidden">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                Per-Job Breakdown
            </h3>

            <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800/50">
                            <th className="text-left py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidates</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Score</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest">Short</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-blue-500 uppercase tracking-widest">Interview</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-purple-500 uppercase tracking-widest">Offered</th>
                            <th className="text-center py-3 px-3 text-[10px] font-black text-rose-500 uppercase tracking-widest">Rejected</th>
                            <th className="py-3 px-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job, idx) => (
                            <tr
                                key={job.jobId}
                                onClick={() => navigate(`/jobs/${job.jobId}`)}
                                className={`cursor-pointer group transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-800/20'
                                    }`}
                            >
                                <td className="py-3.5 px-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] group-hover:text-blue-600 transition-colors">
                                            {job.title}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{job.company}</p>
                                    </div>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{job.candidateCount}</span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className={`text-sm font-black ${getScoreColor(job.avgScore)}`}>{job.avgScore}</span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className={`text-sm font-black ${getScoreColor(job.topScore)}`}>{job.topScore}</span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                                        {job.stages.shortlisted}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-black">
                                        {job.stages.interviewed}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-black">
                                        {job.stages.offered}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-black">
                                        {job.stages.rejected}
                                    </span>
                                </td>
                                <td className="py-3.5 px-2">
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
