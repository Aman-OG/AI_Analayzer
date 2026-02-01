import { useEffect, useState } from 'react';
import type { Resume } from '../types';
import { resumeService } from '../services';
import api from '../services/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    Star,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    FileText,
    CheckCircle2,
    Clock,
    Zap,
    GraduationCap,
    Lightbulb,
    ShieldAlert,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface CandidateListProps {
    jobId: string;
    refreshTrigger?: number;
}

export function CandidateList({ jobId, refreshTrigger }: CandidateListProps) {
    const [candidates, setCandidates] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    useEffect(() => {
        loadCandidates();
    }, [jobId, refreshTrigger]);

    // Auto-refresh polling
    useEffect(() => {
        const hasProcessing = candidates.some(
            (c) => c.processingStatus === 'uploaded' || c.processingStatus === 'processing'
        );

        if (hasProcessing && !isPolling) {
            setIsPolling(true);
            const interval = setInterval(() => {
                loadCandidates(true);
            }, 5000);

            return () => {
                clearInterval(interval);
                setIsPolling(false);
            };
        } else if (!hasProcessing && isPolling) {
            setIsPolling(false);
        }
    }, [candidates]);

    const loadCandidates = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await resumeService.getCandidates(jobId);
            setCandidates(data);
        } catch (error: any) {
            if (!silent) {
                toast.error('Failed to load candidates');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleDeleteCandidate = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this candidate?')) {
            return;
        }

        try {
            // Need to implement this in service
            const response = await api.delete(`/resumes/${id}`);
            if (response.data.success) {
                toast.success('Candidate deleted');
                loadCandidates(true);
            }
        } catch (error: any) {
            toast.error('Failed to delete candidate');
        }
    };

    const getStatusBadge = (status: Resume['processingStatus']) => {
        switch (status) {
            case 'uploaded':
                return (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 animate-pulse border-none">
                        <Clock className="h-3 w-3 mr-1" />
                        Queued
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge className="bg-blue-100 text-blue-600 animate-pulse border-none">
                        <Zap className="h-3 w-3 mr-1" />
                        Analyzing...
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-emerald-100 text-emerald-600 border-none">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Matched
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive" className="bg-red-100 text-red-600 border-none">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
            </div>
        );
    }

    if (candidates.length === 0) {
        return (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No candidates yet</h3>
                <p className="text-slate-500 text-sm">Upload a resume to start the AI analysis.</p>
            </div>
        );
    }

    // Sort candidates by score descending
    const sortedCandidates = [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div className="space-y-4">
            {isPolling && (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-4 ml-1">
                    <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    UPDATING IN REAL-TIME
                </div>
            )}

            <div className="space-y-4">
                {sortedCandidates.map((candidate) => (
                    <div
                        key={candidate._id}
                        className={`group p-6 rounded-3xl border transition-all duration-300 ${expandedId === candidate._id
                            ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 shadow-xl shadow-blue-500/5'
                            : 'bg-white/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                        {candidate.originalFilename}
                                    </h3>
                                    {candidate.isTopPerformer && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-amber-200">
                                            <Star className="h-3 w-3 fill-amber-600" />
                                            Top Match
                                        </div>
                                    )}
                                    {getStatusBadge(candidate.processingStatus)}
                                </div>

                                {candidate.processingStatus === 'completed' && candidate.score !== undefined && (
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-blue-600 leading-none">
                                                {candidate.score}
                                                <span className="text-sm text-slate-400 font-medium">/10</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">AI Score</div>
                                        </div>

                                        <div className="flex-1 max-w-xs space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                <span>Match Probability</span>
                                                <span>{candidate.score * 10}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${candidate.score >= 8 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                        candidate.score >= 5 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                                            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                                        }`}
                                                    style={{ width: `${(candidate.score / 10) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {candidate.processingStatus === 'error' && candidate.errorDetails && (
                                    <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 mt-2">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{candidate.errorDetails}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {new Date(candidate.uploadTimestamp).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteCandidate(e, candidate._id)}
                                        className="h-8 w-8 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    {candidate.processingStatus === 'completed' && (candidate.geminiAnalysis || candidate.analysis) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpandedId(expandedId === candidate._id ? null : candidate._id)}
                                            className="rounded-xl hover:bg-white dark:hover:bg-slate-800 text-blue-600 font-bold text-xs h-8"
                                        >
                                            {expandedId === candidate._id ? (
                                                <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Hide</>
                                            ) : (
                                                <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Review</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {expandedId === candidate._id && (candidate.geminiAnalysis || candidate.analysis) && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-slide-up">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                <Zap className="h-3.5 w-3.5 text-blue-600" />
                                                Detected Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(candidate.geminiAnalysis?.skills || candidate.analysis?.skills || []).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                                                Experience & Education
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-slate-500">Years of Exp:</span>
                                                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                                                            {candidate.geminiAnalysis?.yearsExperience || candidate.analysis?.yearsExperience || 'N/A'}
                                                        </span>
                                                    </div>
                                                    {(candidate.geminiAnalysis?.education || candidate.analysis?.education || []).slice(0, 1).map((edu, idx) => (
                                                        <div key={idx} className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2 truncate text-slate-600 dark:text-slate-400">
                                                            {edu.degree} @ {edu.institution}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-4">
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                                Fit Justification
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
                                                "{candidate.geminiAnalysis?.justification || candidate.analysis?.justification || 'No justification provided'}"
                                            </p>
                                        </section>

                                        {(candidate.geminiAnalysis?.warnings?.length || 0) > 0 || (candidate.analysis?.warnings?.length || 0) > 0 && (
                                            <section>
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                    Critical Gaps
                                                </h4>
                                                <ul className="space-y-1">
                                                    {(candidate.geminiAnalysis?.warnings || candidate.analysis?.warnings || []).map((warning, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-red-400 shrink-0" />
                                                            {warning}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
