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
    Pin,
    PinOff,
    MoreVertical,
    Check,
    Sparkles
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

    const toggleSelectAll = () => {
        if (selectedIds.length === candidates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(candidates.map(c => c._id));
        }
    };

    const handleTogglePin = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const data = await resumeService.togglePin(id);
            if (data.success) {
                setCandidates(prev => prev.map(c => c._id === id ? { ...c, isPinned: data.candidate.isPinned } : c));
                toast.success(data.candidate.isPinned ? 'Candidate pinned to top' : 'Candidate unpinned');
            }
        } catch (error) {
            toast.error('Failed to toggle pin');
        }
    };

    const handleUpdateStatus = async (id: string, tagStatus: Resume['tagStatus']) => {
        try {
            const data = await resumeService.updateStatus(id, tagStatus!);
            if (data.success) {
                setCandidates(prev => prev.map(c => c._id === id ? { ...c, tagStatus: data.candidate.tagStatus } : c));
                toast.success(`Candidate marked as ${tagStatus}`);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleBulkStatusUpdate = async (tagStatus: string) => {
        try {
            const data = await resumeService.bulkUpdateStatus(selectedIds, tagStatus);
            if (data.success) {
                setCandidates(prev => prev.map(c => selectedIds.includes(c._id) ? { ...c, tagStatus: tagStatus as any } : c));
                setSelectedIds([]);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error('Bulk update failed');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 9) return 'text-emerald-500';
        if (score >= 7) return 'text-blue-500';
        return 'text-amber-500';
    };


    const getTagBadge = (status?: string) => {
        switch (status) {
            case 'shortlisted':
                return <Badge className="bg-emerald-500 text-white border-none">Shortlisted</Badge>;
            case 'interviewed':
                return <Badge className="bg-blue-500 text-white border-none">Interviewed</Badge>;
            case 'rejected':
                return <Badge className="bg-rose-500 text-white border-none transition-all duration-300">Rejected</Badge>;
            default:
                return null;
        }
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
                    <Badge className="bg-indigo-100 text-indigo-600 animate-pulse border-none">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Finalizing...
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 pointer-events-none">
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

    // Sort candidates: Pinned first, then by score descending
    const sortedCandidates = [...candidates].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.score || 0) - (a.score || 0);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center p-1">
                        <input
                            type="checkbox"
                            checked={candidates.length > 0 && selectedIds.length === candidates.length}
                            onChange={toggleSelectAll}
                            className="peer absolute h-5 w-5 opacity-0 cursor-pointer z-10"
                        />
                        <div className={`h-5 w-5 rounded-lg border-2 transition-all flex items-center justify-center ${candidates.length > 0 && selectedIds.length === candidates.length
                            ? 'bg-primary border-primary'
                            : 'border-slate-300 dark:border-slate-700 bg-white/10 dark:bg-slate-900/10'
                            } ${selectedIds.length > 0 && selectedIds.length < candidates.length ? 'border-primary' : ''}`}>
                            {selectedIds.length === candidates.length ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            ) : selectedIds.length > 0 ? (
                                <div className="h-2 w-2 rounded-sm bg-primary" />
                            ) : null}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select All</span>
                    {isPolling && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary animate-pulse tracking-widest uppercase ml-2">
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
                            className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all duration-300 gap-2 shadow-sm"
                        >
                            <FileDown className="h-4 w-4 text-primary" />
                            Export Top 3
                        </Button>
                    )}
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-xs font-bold text-muted-foreground mr-2">{selectedIds.length} Selected</span>

                        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                            {[
                                { label: 'Shortlist', status: 'shortlisted', color: 'text-emerald-600 hover:bg-emerald-500/10' },
                                { label: 'Interview', status: 'interviewed', color: 'text-blue-600 hover:bg-blue-500/10' },
                                { label: 'Reject', status: 'rejected', color: 'text-rose-600 hover:bg-rose-500/10' }
                            ].map(btn => (
                                <Button
                                    key={btn.status}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBulkStatusUpdate(btn.status)}
                                    className={`h-7 rounded-xl text-[9px] font-black uppercase tracking-widest ${btn.color}`}
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider px-4"
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
                {sortedCandidates.map((candidate, index) => (
                    <div
                        key={candidate._id}
                        style={{ animationDelay: `${index * 100}ms` }}
                        className={`group p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both glass-card relative ${expandedId === candidate._id
                            ? 'ring-2 ring-primary/30 shadow-2xl scale-[1.01] z-40'
                            : 'hover:shadow-lg transition-all duration-300 hover:z-30'
                            } ${candidate.isPinned ? 'border-primary/20 bg-primary/5' : ''}`}
                    >
                        {candidate.isPinned && (
                            <div className="absolute top-0 right-0 p-0">
                                <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg rounded-tr-2xl flex items-center gap-1 shadow-sm">
                                    <Pin className="h-2 w-2 fill-white" />
                                    Pinned
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-4">
                            <div className="pt-1">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        id={`check-${candidate._id}`}
                                        checked={selectedIds.includes(candidate._id)}
                                        onChange={() => toggleSelect(candidate._id)}
                                        className="peer absolute h-5 w-5 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="h-5 w-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md transition-all peer-checked:bg-primary peer-checked:border-primary peer-hover:border-primary/50 flex items-center justify-center">
                                        <CheckCircle2 className={`h-3.5 w-3.5 text-white transition-opacity ${selectedIds.includes(candidate._id) ? 'opacity-100' : 'opacity-0'}`} />
                                    </div>
                                </div>
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
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-200 animate-pulse">
                                            <Star className="h-3 w-3 fill-emerald-600" />
                                            Best Fit
                                        </div>
                                    )}
                                    {getStatusBadge(candidate.processingStatus)}
                                    {getTagBadge(candidate.tagStatus)}
                                </div>

                                {candidate.processingStatus !== 'completed' && candidate.processingStatus !== 'error' && (
                                    <AnalysisStepper status={candidate.processingStatus} />
                                )}

                                {candidate.processingStatus === 'completed' && candidate.score !== undefined && (
                                    <div className="flex items-center gap-8">
                                        <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                            <div className={`text-4xl font-black ${getScoreColor(candidate.score)} leading-none drop-shadow-sm`}>
                                                {candidate.score}
                                                <span className="text-sm text-slate-400 font-medium">/10</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">AI Recommendation</div>
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
                                                        <span className={m.val && m.val >= 0.8 ? 'text-emerald-500' : ''}>{m.val ? m.val * 10 : 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${m.val && m.val >= 0.8 ? 'bg-emerald-500' : 'bg-primary'}`}
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
                                        onClick={(e) => handleTogglePin(e, candidate._id)}
                                        className={`h-8 w-8 rounded-xl transition-all duration-300 ${candidate.isPinned ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100'}`}
                                    >
                                        {candidate.isPinned ? <Pin className="h-4 w-4 fill-primary" /> : <PinOff className="h-4 w-4" />}
                                    </Button>

                                    <div className="relative group/tag">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 hidden group-hover/tag:block animate-in fade-in zoom-in-95 pointer-events-auto">
                                            <div className="p-1">
                                                {[
                                                    { label: 'Shortlist', status: 'shortlisted', color: 'text-emerald-600 hover:bg-emerald-500/10' },
                                                    { label: 'Interview', status: 'interviewed', color: 'text-blue-600 hover:bg-blue-500/10' },
                                                    { label: 'Reject', status: 'rejected', color: 'text-rose-600 hover:bg-rose-500/10' },
                                                    { label: 'Applied', status: 'applied', color: 'text-slate-400 hover:bg-slate-500/10' }
                                                ].map(tag => (
                                                    <button
                                                        key={tag.status}
                                                        onClick={() => handleUpdateStatus(candidate._id, tag.status as any)}
                                                        className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${tag.color} flex items-center justify-between group/item`}
                                                    >
                                                        {tag.label}
                                                        {candidate.tagStatus === tag.status && <Check className="h-3 w-3" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {candidate.processingStatus === 'completed' && (candidate.geminiAnalysis || candidate.analysis) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpandedId(expandedId === candidate._id ? null : candidate._id)}
                                            className="rounded-xl hover:bg-primary/10 text-primary font-bold text-xs h-8 border-none transition-all duration-300"
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
                            <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-800/50 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Skills Section */}
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm space-y-4 shadow-sm">
                                            <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                                    <Zap className="h-4 w-4" />
                                                </div>
                                                Extracted Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(candidate.geminiAnalysis?.skills || candidate.analysis?.skills || []).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm space-y-4 shadow-sm">
                                            <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                                    <GraduationCap className="h-4 w-4" />
                                                </div>
                                                Background
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Experience</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white capitalize">
                                                        {candidate.geminiAnalysis?.yearsExperience || candidate.analysis?.yearsExperience || 'N/A'}
                                                    </p>
                                                </div>
                                                {(candidate.geminiAnalysis?.education || candidate.analysis?.education || []).slice(0, 1).map((edu, idx) => (
                                                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Education</p>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            {edu.degree}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insights Section */}
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 backdrop-blur-md space-y-3 shadow-lg relative overflow-hidden group/just">
                                            <div className="absolute -right-4 -top-4 p-4 rounded-full bg-blue-500/5 group-hover/just:scale-110 transition-transform">
                                                <Lightbulb className="h-12 w-12 text-blue-500/20" />
                                            </div>
                                            <h4 className="flex items-center gap-3 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                                Fit Justification
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic font-medium relative z-10">
                                                "{candidate.geminiAnalysis?.justification || candidate.analysis?.justification || 'No justification provided'}"
                                            </p>
                                        </div>

                                        {((candidate.geminiAnalysis?.warnings?.length || 0) > 0 || (candidate.analysis?.warnings?.length || 0) > 0) && (
                                            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                                                <h4 className="flex items-center gap-3 text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    Critical Gaps
                                                </h4>
                                                <ul className="space-y-2">
                                                    {(candidate.geminiAnalysis?.warnings || candidate.analysis?.warnings || []).map((warning, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-xs text-red-700 dark:text-red-400 font-medium">
                                                            <div className="mt-1 h-1 w-1 rounded-full bg-red-500 shrink-0" />
                                                            {warning}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {(candidate.geminiAnalysis?.interviewQuestions || candidate.analysis?.interviewQuestions || []).length > 0 && (
                                            <div className="p-6 rounded-3xl bg-blue-600 shadow-xl shadow-blue-500/20 text-white space-y-4 overflow-hidden relative">
                                                <Sparkles className="absolute -right-6 -top-6 h-24 w-24 text-white/10" />
                                                <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest relative z-10">
                                                    <Star className="h-4 w-4 fill-white" />
                                                    Suggested Questions
                                                </h4>
                                                <ul className="space-y-3 relative z-10">
                                                    {(candidate.geminiAnalysis?.interviewQuestions || candidate.analysis?.interviewQuestions || []).slice(0, 3).map((q, idx) => (
                                                        <li key={idx} className="text-xs flex gap-3 leading-relaxed bg-white/10 p-3 rounded-2xl border border-white/10">
                                                            <span className="font-black text-blue-200">{idx + 1}</span>
                                                            <span className="font-bold">{q}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
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
