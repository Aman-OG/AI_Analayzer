import { X, Trophy, AlertTriangle, Briefcase, Zap } from 'lucide-react';
import type { Resume } from '../types';

interface CompareCandidatesModalProps {
    candidates: Resume[];
    onClose: () => void;
}

export function CompareCandidatesModal({ candidates, onClose }: CompareCandidatesModalProps) {
    if (candidates.length !== 2) return null;

    const [c1, c2] = candidates;

    const renderScoreRow = (label: string, score1: number | undefined, score2: number | undefined) => (
        <div className="grid grid-cols-3 py-4 border-b border-white/10 items-center">
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="text-center">
                <span className={`text-lg font-bold ${score1 && score1 >= 7 ? 'text-green-400' : 'text-primary'}`}>
                    {score1 ?? 'N/A'}/10
                </span>
            </div>
            <div className="text-center">
                <span className={`text-lg font-bold ${score2 && score2 >= 7 ? 'text-green-400' : 'text-primary'}`}>
                    {score2 ?? 'N/A'}/10
                </span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="text-primary w-6 h-6" />
                        Candidate Comparison
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-3 gap-8 mb-8">
                        <div className="pt-12">
                            <h3 className="text-muted-foreground text-sm uppercase tracking-widest font-semibold">Metrics</h3>
                        </div>
                        {/* Candidate 1 Header */}
                        <div className="text-center relative">
                            {c1.score !== undefined && c2.score !== undefined && c1.score >= c2.score && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-20 animate-bounce">
                                    Best Fit
                                </div>
                            )}
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all ${c1.score && c1.score >= (c2.score || 0) ? 'bg-primary/20 border-primary/50 scale-105 shadow-xl shadow-primary/10' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                <span className={`text-2xl font-bold ${c1.score && c1.score >= (c2.score || 0) ? 'text-primary' : 'text-slate-400'}`}>
                                    {(c1.candidateName || c1.originalFilename)[0].toUpperCase()}
                                </span>
                            </div>
                            <h4 className="font-bold text-lg truncate px-2">
                                {c1.candidateName || c1.originalFilename}
                            </h4>
                            {c1.candidateName && <p className="text-[10px] text-slate-400 truncate px-4">{c1.originalFilename}</p>}
                            <p className="text-[10px] text-muted-foreground">{new Date(c1.uploadTimestamp).toLocaleDateString()}</p>
                        </div>
                        {/* Candidate 2 Header */}
                        <div className="text-center relative">
                            {c1.score !== undefined && c2.score !== undefined && c2.score > c1.score && (
                                <div className="absolute -top-4 left-1/2 -translation-x-1/2 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-20 animate-bounce">
                                    Best Fit
                                </div>
                            )}
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all ${c2.score && c2.score > (c1.score || 0) ? 'bg-emerald-500/20 border-emerald-500/50 scale-105 shadow-xl shadow-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                <span className={`text-2xl font-bold ${c2.score && c2.score > (c1.score || 0) ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {(c2.candidateName || c2.originalFilename)[0].toUpperCase()}
                                </span>
                            </div>
                            <h4 className="font-bold text-lg truncate px-2">
                                {c2.candidateName || c2.originalFilename}
                            </h4>
                            {c2.candidateName && <p className="text-[10px] text-slate-400 truncate px-4">{c2.originalFilename}</p>}
                            <p className="text-[10px] text-muted-foreground">{new Date(c2.uploadTimestamp).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Scoring Section */}
                    <div className="space-y-1">
                        {renderScoreRow('Fit Score', c1.score, c2.score)}
                        {renderScoreRow('Technical Fit', c1.geminiAnalysis?.technicalFit, c2.geminiAnalysis?.technicalFit)}
                        {renderScoreRow('Experience', c1.geminiAnalysis?.experienceMatch, c2.geminiAnalysis?.experienceMatch)}
                        {renderScoreRow('Education', c1.geminiAnalysis?.educationLevel, c2.geminiAnalysis?.educationLevel)}
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-3 gap-8 mt-8 border-t border-white/10 pt-8">
                        <div className="space-y-12">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase"><Briefcase className="w-4 h-4" /> Experience</h3>
                            </div>
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase"><Trophy className="w-4 h-4" /> Key Skills</h3>
                            </div>
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase"><AlertTriangle className="w-4 h-4" /> Warnings</h3>
                            </div>
                        </div>

                        {/* Candidate 1 Data */}
                        <div className="space-y-12">
                            <div className="text-sm leading-relaxed">{c1.geminiAnalysis?.yearsExperience || 'N/A'} years</div>
                            <div className="flex flex-wrap gap-1">
                                {c1.geminiAnalysis?.skills.slice(0, 8).map(skill => (
                                    <span key={skill} className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[10px]">{skill}</span>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {c1.geminiAnalysis?.warnings.map((w, i) => (
                                    <p key={i} className="text-[10px] text-amber-500 flex gap-1"><AlertTriangle className="w-3 h-3 flex-shrink-0" /> {w}</p>
                                ))}
                            </div>
                        </div>

                        {/* Candidate 2 Data */}
                        <div className="space-y-12">
                            <div className="text-sm leading-relaxed">{c2.geminiAnalysis?.yearsExperience || 'N/A'} years</div>
                            <div className="flex flex-wrap gap-1">
                                {c2.geminiAnalysis?.skills.slice(0, 8).map(skill => (
                                    <span key={skill} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px]">{skill}</span>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {c2.geminiAnalysis?.warnings.map((w, i) => (
                                    <p key={i} className="text-[10px] text-amber-500 flex gap-1"><AlertTriangle className="w-3 h-3 flex-shrink-0" /> {w}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 text-center text-xs text-muted-foreground bg-white/5">
                    Comparison powered by AI Analysis Engine
                </div>
            </div>
        </div>
    );
}
