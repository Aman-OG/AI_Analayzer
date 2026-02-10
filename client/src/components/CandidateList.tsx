import { useState } from 'react';
import type { Resume } from '../types';
import { resumeService } from '../services';
import api from '../services/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    Users,
    Mail,
    UserCheck,
    CheckCircle2,
    LayoutGrid,
    Search,
    FileDown,
    Trash2,
    Clock,
    FileText,
    Zap,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { CompareCandidatesModal } from './CompareCandidatesModal';
import { CandidateCardSkeleton } from './ui/CandidateCardSkeleton';
import { exportTopCandidatesToPDF } from '../lib/exportToPDF';
import { useResumePolling } from '../hooks/useResumePolling';
import { CandidateCard } from './CandidateCard';

interface CandidateListProps {
    jobId: string;
    jobTitle?: string;
    company?: string;
    refreshTrigger?: number;
}

export function CandidateList({ jobId, jobTitle, company, refreshTrigger }: CandidateListProps) {
    const { candidates, setCandidates, loading, isPolling, loadCandidates } = useResumePolling(jobId, refreshTrigger);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Resume['tagStatus']>('all');
    const [viewMode, setViewMode] = useState<'rich' | 'compact'>('rich');
    const [showCompareModal, setShowCompareModal] = useState(false);

    const handleBulkDelete = async () => {
        if (!selectedIds.length || !window.confirm(`Are you sure you want to delete ${selectedIds.length} candidate(s)?`)) return;

        try {
            await api.delete('/resumes/bulk', { data: { ids: selectedIds } });
            toast.success('Candidates deleted successfully');
            setSelectedIds([]);
            loadCandidates();
        } catch (error) {
            toast.error('Failed to delete candidates');
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCandidates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCandidates.map(c => c._id));
        }
    };

    const handleTogglePin = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const data = await resumeService.togglePin(id);
            if (data.success) {
                setCandidates(prev => prev.map(c => c._id === id ? data.candidate : c));
                toast.success(data.candidate.isPinned ? 'Candidate pinned' : 'Candidate unpinned');
            }
        } catch (error) {
            toast.error('Failed to update pin status');
        }
    };

    const handleUpdateStatus = async (id: string, tagStatus: Resume['tagStatus']) => {
        try {
            const data = await resumeService.updateStatus(id, tagStatus!);
            if (data.success) {
                setCandidates(prev => prev.map(c => c._id === id ? data.candidate : c));
                toast.success(`Candidate marked as ${tagStatus}`);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleBulkStatusUpdate = async (tagStatus: string) => {
        if (!selectedIds.length) return;
        try {
            await resumeService.bulkUpdateStatus(selectedIds, tagStatus as any);
            toast.success(`Selected candidates marked as ${tagStatus}`);
            loadCandidates(true);
            setSelectedIds([]);
        } catch (error) {
            toast.error('Failed to update statuses');
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
            default:
                return null;
        }
    };

    const sortedCandidates = [...candidates].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.score || 0) - (a.score || 0);
    });

    const filteredCandidates = sortedCandidates.filter(c => {
        const matchesSearch = (c.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || c.tagStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading && candidates.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <CandidateCardSkeleton key={i} />)}
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

    const selectedCandidates = candidates.filter(c => selectedIds.includes(c._id));

    return (
        <div className="space-y-6">
            {/* Header & Unified Sticky Controls */}
            <div className="flex flex-col gap-6 sticky top-0 z-50 py-4 -mt-4 bg-background/50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Candidates</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{candidates.length} Applications Total</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">

                        <Button
                            variant="outline"
                            onClick={() => exportTopCandidatesToPDF(jobTitle || 'Unknown', company || 'Internal', candidates)}
                            disabled={candidates.filter(c => c.processingStatus === 'completed').length === 0}
                            className="h-11 px-6 rounded-2xl border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all duration-300 shadow-sm"
                        >
                            <FileDown className="h-4 w-4 mr-2" />
                            <span className="font-bold">Export Top 3</span>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or file..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'shortlisted', label: 'Shortlist' },
                                { id: 'interviewed', label: 'Interview' },
                                { id: 'rejected', label: 'Rejected' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${statusFilter === f.id
                                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Panel */}
                {selectedIds.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                                    {selectedIds.length}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">Candidates Selected</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Bulk Actions Available</p>
                                </div>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="ml-2 text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkStatusUpdate('shortlisted')}
                                    className="h-9 px-4 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-500/10 font-bold text-xs"
                                >
                                    <Users className="h-3.5 w-3.5 mr-2" />
                                    Shortlist
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkStatusUpdate('interviewed')}
                                    className="h-9 px-4 rounded-xl bg-white dark:bg-slate-900 text-blue-600 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-500/10 font-bold text-xs"
                                >
                                    <Mail className="h-3.5 w-3.5 mr-2" />
                                    Interview
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkStatusUpdate('rejected')}
                                    className="h-9 px-4 rounded-xl bg-white dark:bg-slate-900 text-rose-600 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-500/10 font-bold text-xs"
                                >
                                    <UserCheck className="h-3.5 w-3.5 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCompareModal(true)}
                                    disabled={selectedIds.length !== 2}
                                    className="h-9 px-4 rounded-xl text-primary border-primary/30 hover:bg-primary/5 font-bold text-xs"
                                >
                                    Compare
                                </Button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="h-9 px-4 rounded-xl text-rose-600 hover:bg-rose-500/10 font-bold text-xs"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Select All Checkbox */}
            {filteredCandidates.length > 0 && (
                <div className="flex justify-between items-center px-6 py-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                                onChange={toggleSelectAll}
                                className="peer absolute h-5 w-5 opacity-0 cursor-pointer z-10"
                            />
                            <div className="h-5 w-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all peer-checked:bg-primary peer-checked:border-primary peer-hover:border-primary/50 flex items-center justify-center shadow-sm">
                                {selectedIds.length > 0 && selectedIds.length < filteredCandidates.length ? (
                                    <div className="h-2 w-2 bg-primary rounded-sm" />
                                ) : (
                                    <CheckCircle2 className={`h-3.5 w-3.5 text-white transition-opacity ${selectedIds.length === filteredCandidates.length ? 'opacity-100' : 'opacity-0'}`} />
                                )}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Select All {filteredCandidates.length > 0 && `(${filteredCandidates.length})`}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <LayoutGrid className="h-3 w-3" />
                            View Mode:
                            <button
                                onClick={() => setViewMode(viewMode === 'rich' ? 'compact' : 'rich')}
                                className="text-primary hover:underline transition-all"
                            >
                                {viewMode === 'rich' ? 'Rich Details' : 'Compact List'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredCandidates.length === 0 ? (
                <div className="text-center py-10 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                    <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500">No candidates match your search.</p>
                </div>
            ) : (
                <div className={`grid gap-4 ${viewMode === 'compact' ? 'md:grid-cols-2 lg:grid-cols-1' : ''}`}>
                    {filteredCandidates.map((candidate, index) => (
                        <CandidateCard
                            key={candidate._id}
                            candidate={candidate}
                            index={index}
                            isCompact={viewMode === 'compact'}
                            isSelected={selectedIds.includes(candidate._id)}
                            isExpanded={expandedId === candidate._id}
                            onToggleExpand={() => setExpandedId(expandedId === candidate._id ? null : candidate._id)}
                            onToggleSelect={() => toggleSelect(candidate._id)}
                            onTogglePin={(e) => handleTogglePin(e, candidate._id)}
                            onUpdateStatus={(status) => handleUpdateStatus(candidate._id, status)}
                            getScoreColor={getScoreColor}
                            getStatusBadge={getStatusBadge}
                            getTagBadge={getTagBadge}
                            jobTitle={jobTitle}
                            company={company}
                        />
                    ))}
                </div>
            )}

            {isPolling && (
                <div className="fixed bottom-8 right-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex items-center gap-4">
                        <div className="relative h-2 w-2">
                            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                            <div className="relative bg-primary rounded-full h-2 w-2" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Engine Working...</span>
                    </div>
                </div>
            )}

            {showCompareModal && (
                <CompareCandidatesModal
                    candidates={selectedCandidates}
                    onClose={() => setShowCompareModal(false)}
                />
            )}
        </div>
    );
}
