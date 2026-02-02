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
import { AnalysisStepper } from './AnalysisStepper';
import { CompareCandidatesModal } from './CompareCandidatesModal';
import { CandidateCardSkeleton } from './ui/CandidateCardSkeleton';
import { exportTopCandidatesToPDF } from '../lib/exportToPDF';
import { FileDown } from 'lucide-react';

interface CandidateListProps {
    jobId: string;
    jobTitle?: string;
    company?: string;
    refreshTrigger?: number;
}

export function CandidateList({ jobId, jobTitle, company, refreshTrigger }: CandidateListProps) {
    const [candidates, setCandidates] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    useEffect(() => {
        loadCandidates();
    }, [jobId, refreshTrigger]);

    // Auto-refresh polling with robust setTimeout pattern
    useEffect(() => {
        const hasProcessing = candidates.some(
            (c) => ['uploaded', 'processing', 'parsing', 'scoring', 'finalizing'].includes(c.processingStatus)
        );

        if (!hasProcessing) {
            if (isPolling) setIsPolling(false);
            return;
        }

        if (!isPolling) setIsPolling(true);

        const timer = setTimeout(() => {
            loadCandidates(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [candidates, jobId]);

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
            const response = await api.delete(`/resumes/${id}`);
            if (response.data.success) {
                toast.success('Candidate deleted');
                setCandidates(prev => prev.filter(c => c._id !== id));
                setSelectedIds(prev => prev.filter(cur => cur !== id));
            }
        } catch (error: any) {
            toast.error('Failed to delete candidate');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} candidates?`)) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/resumes/${id}`)));
            toast.success(`${selectedIds.length} candidates deleted`);
            setCandidates(prev => prev.filter(c => !selectedIds.includes(c._id)));
            setSelectedIds([]);
        } catch (error) {
            toast.error('Bulk delete partially failed');
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(cur => cur !== id) : [...prev, id]
        );
    };

    const selectedCandidates = candidates.filter(c => selectedIds.includes(c._id));

    const getStatusBadge = (status: Resume['processingStatus']) => {
        switch (status) {
            case 'uploaded':
                return (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 animate-pulse border-none">
                        <Clock className="h-3 w-3 mr-1" />
                        Queued
                    </Badge>
                );
            case 'parsing':
                return (
                    <Badge className="bg-yellow-100 text-yellow-600 animate-pulse border-none">
                        <FileText className="h-3 w-3 mr-1" />
                        Extracting...
                    </Badge>
                );
            case 'processing':
            case 'scoring':
                return (
                    <Badge className="bg-blue-100 text-blue-600 animate-pulse border-none">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Scoring...
                    </Badge>
                );
            case 'finalizing':
                return (
                    <Badge className="bg-purple-100 text-purple-600 animate-pulse border-none">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Finalizing...
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
                    <CandidateCardSkeleton key={i} />
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
            <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                    {isPolling && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary animate-pulse tracking-widest uppercase">
                            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                            Live Sync
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {candidates.length > 0 && candidates.some(c => c.processingStatus === 'completed') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportTopCandidatesToPDF(jobTitle || 'Job Position', company || '', candidates)}
                            className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider border-slate-200 hover:bg-slate-50 gap-2 shadow-sm"
                        >
                            <FileDown className="h-4 w-4 text-primary" />
                            Export Top 3
                        </Button>
                    )}
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <span className="text-xs font-bold text-muted-foreground">{selectedIds.length} Selected</span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                        >
                            Delete
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCompareModal(true)}
                            disabled={selectedIds.length !== 2}
                            className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider border-primary/30 text-primary hover:bg-primary/5"
                        >
                            Compare
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds([])}
                            className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {sortedCandidates.map((candidate) => (
                    <div
                        key={candidate._id}
                        className={`group p-6 glass-card relative overflow-hidden ${expandedId === candidate._id
                            ? 'ring-2 ring-primary/30 shadow-2xl'
                            : ''
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="pt-1">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(candidate._id)}
                                    onChange={() => toggleSelect(candidate._id)}
                                    className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary/50 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3 flex-wrap text-foreground">
                                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold truncate max-w-[250px] text-foreground">
                                            {candidate.candidateName || candidate.originalFilename}
                                        </h3>
                                        {candidate.candidateName && (
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {candidate.originalFilename}
                                            </p>
                                        )}
                                    </div>
                                    {candidate.isTopPerformer && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-amber-200">
                                            <Star className="h-3 w-3 fill-amber-600" />
                                            Top Match
                                        </div>
                                    )}
                                    {getStatusBadge(candidate.processingStatus)}
                                </div>

                                {candidate.processingStatus !== 'completed' && candidate.processingStatus !== 'error' && (
                                    <AnalysisStepper status={candidate.processingStatus} />
                                )}

                                {candidate.processingStatus === 'completed' && candidate.score !== undefined && (
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-primary leading-none drop-shadow-sm">
                                                {candidate.score}
                                                <span className="text-sm text-slate-400 font-medium">/10</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Overall</div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 flex-1 max-w-md">
                                            {[
                                                { label: 'Technical', val: (candidate.geminiAnalysis || candidate.analysis)?.technicalFit },
                                                { label: 'Experience', val: (candidate.geminiAnalysis || candidate.analysis)?.experienceMatch },
                                                { label: 'Education', val: (candidate.geminiAnalysis || candidate.analysis)?.educationLevel }
                                            ].map((m, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <span>{m.label}</span>
                                                        <span>{m.val ? m.val * 10 : 0}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-1000"
                                                            style={{ width: `${(m.val || 0) * 10}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
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
                                        className="h-8 w-8 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border-none"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    {candidate.processingStatus === 'completed' && (candidate.geminiAnalysis || candidate.analysis) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpandedId(expandedId === candidate._id ? null : candidate._id)}
                                            className="rounded-xl hover:bg-white dark:hover:bg-slate-800 text-primary font-bold text-xs h-8 border-none"
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
                                                <Zap className="h-3.5 w-3.5 text-primary" />
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
                                                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                                                Experience & Education
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/50 text-sm border border-white/20">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-slate-500">Years of Exp:</span>
                                                        <span className="font-bold capitalize">
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

                                    <div className="space-y-6">
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                                Fit Justification
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/20">
                                                "{candidate.geminiAnalysis?.justification || candidate.analysis?.justification || 'No justification provided'}"
                                            </p>
                                        </section>

                                        {(candidate.geminiAnalysis?.interviewQuestions || candidate.analysis?.interviewQuestions || []).length > 0 && (
                                            <section className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
                                                    <Star className="h-3.5 w-3.5" />
                                                    Suggested Interview Questions
                                                </h4>
                                                <ul className="space-y-2">
                                                    {(candidate.geminiAnalysis?.interviewQuestions || candidate.analysis?.interviewQuestions || []).map((q, idx) => (
                                                        <li key={idx} className="text-xs flex gap-2">
                                                            <span className="font-bold text-primary">{idx + 1}.</span>
                                                            <span className="text-foreground/80">{q}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}

                                        {((candidate.geminiAnalysis?.warnings?.length || 0) > 0 || (candidate.analysis?.warnings?.length || 0) > 0) && (
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

            {showCompareModal && (
                <CompareCandidatesModal
                    candidates={selectedCandidates}
                    onClose={() => setShowCompareModal(false)}
                />
            )}
        </div>
    );
}
