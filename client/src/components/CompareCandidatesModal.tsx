import { X, Trophy, AlertTriangle, Briefcase, Zap } from 'lucide-react';
import { useEffect } from 'react';
import type { Resume } from '../types';

interface CompareCandidatesModalProps {
    candidates: Resume[];
    onClose: () => void;
}

export function CompareCandidatesModal({ candidates, onClose }: CompareCandidatesModalProps) {
    if (candidates.length !== 2) return null;

    const [c1, c2] = candidates;

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [onClose]);

    const renderScoreRow = (label: string, score1: number | undefined, score2: number | undefined) => (
        <div className="grid grid-cols-3 py-4 border-b border-slate-200 dark:border-white/10 items-center">
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="text-center">
                <span className={`text-lg font-bold ${score1 && score1 >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                    {score1 ?? 'N/A'}/10
                </span>
            </div>
            <div className="text-center">
                <span className={`text-lg font-bold ${score2 && score2 >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                    {score2 ?? 'N/A'}/10
                </span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" role="presentation">
            <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-slate-900/50 backdrop-blur-md">
                    <h2 id="compare-modal-title" className="text-2xl font-black flex items-center gap-3 text-foreground tracking-tight">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Zap className="w-6 h-6 fill-primary/20" />
                        </div>
                        Candidate Comparison
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                        aria-label="Close comparison modal"
                        title="Close (Esc)"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950/40">
                    <div className="p-8">
                        <div className="grid grid-cols-3 gap-12 mb-10">
                            <div className="pt-16">
                                <h3 className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black opacity-50">Core Metrics</h3>
                            </div>
                            {/* Candidate 1 Header */}
                            <div className="text-center relative group">
                                {c1.score !== undefined && c2.score !== undefined && c1.score >= c2.score && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.4)] z-20 animate-bounce">
                                        Best Fit
                                    </div>
                                )}
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 transition-all duration-500 shadow-sm ${c1.score && c1.score >= (c2.score || 0)
                                    ? 'bg-primary/5 border-primary/40 scale-105 shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                                    <span className={`text-3xl font-black ${c1.score && c1.score >= (c2.score || 0) ? 'text-primary' : 'text-slate-300'}`}>
                                        {(c1.candidateName || c1.originalFilename)[0].toUpperCase()}
                                    </span>
                                </div>
                                <h4 className="font-black text-xl text-foreground tracking-tight mb-1 truncate px-2">
                                    {c1.candidateName || c1.originalFilename}
                                </h4>
                                {c1.candidateName && <p className="text-[10px] text-slate-400 font-bold truncate px-4 mb-1 uppercase tracking-tighter">{c1.originalFilename}</p>}
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{new Date(c1.uploadTimestamp).toLocaleDateString()}</p>
                            </div>

                            {/* Candidate 2 Header */}
                            <div className="text-center relative group">
                                {c1.score !== undefined && c2.score !== undefined && c2.score > c1.score && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] z-20 animate-bounce">
                                        Best Fit
                                    </div>
                                )}
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 transition-all duration-500 shadow-sm ${c2.score && c2.score > (c1.score || 0)
                                    ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/40 scale-105 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                                    <span className={`text-3xl font-black ${c2.score && c2.score > (c1.score || 0) ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        {(c2.candidateName || c2.originalFilename)[0].toUpperCase()}
                                    </span>
                                </div>
                                <h4 className="font-black text-xl text-foreground tracking-tight mb-1 truncate px-2">
                                    {c2.candidateName || c2.originalFilename}
                                </h4>
                                {c2.candidateName && <p className="text-[10px] text-slate-400 font-bold truncate px-4 mb-1 uppercase tracking-tighter">{c2.originalFilename}</p>}
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{new Date(c2.uploadTimestamp).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Scoring Section */}
                        <div className="space-y-1 mb-10 bg-slate-50/50 dark:bg-white/[0.02] p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/[0.05]">
                            {renderScoreRow('Fit Score', c1.score, c2.score)}
                            {renderScoreRow('Technical Fit', (c1.aiAnalysis || c1.analysis)?.technicalFit, (c2.aiAnalysis || c2.analysis)?.technicalFit)}
                            {renderScoreRow('Experience', (c1.aiAnalysis || c1.analysis)?.experienceMatch, (c2.aiAnalysis || c2.analysis)?.experienceMatch)}
                            {renderScoreRow('Education', (c1.aiAnalysis || c1.analysis)?.educationLevel, (c2.aiAnalysis || c2.analysis)?.educationLevel)}
                        </div>

                        {/* Details Section */}
                        <div className="grid grid-cols-3 gap-12 pt-4">
                            <div className="space-y-16">
                                <div>
                                    <h3 className="flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5"><Briefcase className="w-3.5 h-3.5" /></div>
                                        Experience
                                    </h3>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5"><Trophy className="w-3.5 h-3.5" /></div>
                                        Key Skills
                                    </h3>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5"><AlertTriangle className="w-3.5 h-3.5" /></div>
                                        Warnings
                                    </h3>
                                </div>
                            </div>

                            {/* Candidate 1 Data */}
                            <div className="space-y-16">
                                <div className="text-sm font-bold text-foreground">
                                    <span className="text-2xl font-black text-primary mr-2">{(c1.aiAnalysis || c1.analysis)?.yearsExperience || 'N/A'}</span>
                                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Years</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(c1.aiAnalysis?.skills || c1.analysis?.skills || []).slice(0, 10).map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">{skill}</span>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    {(c1.aiAnalysis?.warnings || c1.analysis?.warnings || []).map((w, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-2xl bg-red-500/5 border border-red-500/10 items-start">
                                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-red-600/80 dark:text-red-400 font-medium leading-tight">{w}</p>
                                        </div>
                                    ))}
                                    {(c1.aiAnalysis?.warnings || c1.analysis?.warnings || []).length === 0 && (
                                        <p className="text-[11px] text-slate-400 italic">No critical gaps identified</p>
                                    )}
                                </div>
                            </div>

                            {/* Candidate 2 Data */}
                            <div className="space-y-16">
                                <div className="text-sm font-bold text-foreground">
                                    <span className="text-2xl font-black text-emerald-500 mr-2">{(c2.aiAnalysis || c2.analysis)?.yearsExperience || 'N/A'}</span>
                                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Years</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(c2.aiAnalysis?.skills || c2.analysis?.skills || []).slice(0, 10).map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">{skill}</span>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    {(c2.aiAnalysis?.warnings || c2.analysis?.warnings || []).map((w, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-2xl bg-red-500/5 border border-red-500/10 items-start">
                                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-red-600/80 dark:text-red-400 font-medium leading-tight">{w}</p>
                                        </div>
                                    ))}
                                    {(c2.aiAnalysis?.warnings || c2.analysis?.warnings || []).length === 0 && (
                                        <p className="text-[11px] text-slate-400 italic">No critical gaps identified</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white dark:bg-slate-900/50">
                    AI Analysis Engine <span className="mx-2 opacity-20">|</span> Side-by-Side Comparison
                </div>
            </div>
        </div>
    );
}
