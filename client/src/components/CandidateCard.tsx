import React, { useState, useRef, useEffect } from 'react';
import type { Resume } from '../types';
import { Button } from './ui/button';
import { exportSingleCandidateToPDF } from '../lib/exportToPDF';
import {
    Star,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    FileText,
    CheckCircle2,
    Zap,
    GraduationCap,
    Lightbulb,
    ShieldAlert,
    Pin,
    PinOff,
    MoreVertical,
    Check,
    FileDown
} from 'lucide-react';
import { AnalysisStepper } from './AnalysisStepper';
import { SendEmailModal } from './SendEmailModal';

interface CandidateCardProps {
    candidate: Resume;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onTogglePin: (e: React.MouseEvent) => void;
    onUpdateStatus: (tagStatus: Resume['tagStatus'], candidateEmail?: string | null, jobTitle?: string, companyName?: string) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
    index: number;
    getStatusBadge: (status: Resume['processingStatus']) => React.ReactNode;
    getTagBadge: (status?: string) => React.ReactNode;
    getScoreColor: (score: number) => string;
    jobTitle?: string;
    company?: string;
    isCompact?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
    candidate,
    isExpanded,
    onToggleExpand,
    onTogglePin,
    onUpdateStatus,
    isSelected,
    onToggleSelect,
    index,
    getStatusBadge,
    getTagBadge,
    getScoreColor,
    jobTitle = 'Unknown',
    company = 'Internal',
    isCompact = false
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [emailModal, setEmailModal] = useState<{ isOpen: boolean, status: 'interviewed' | 'rejected' | null }>({ isOpen: false, status: null });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleUpdateStatusClick = (status: Resume['tagStatus']) => {
        setIsMenuOpen(false);
        if (status === 'interviewed' || status === 'rejected') {
            setEmailModal({ isOpen: true, status });
        } else {
            onUpdateStatus(status);
        }
    };

    const handleConfirmEmail = (email: string | null) => {
        if (emailModal.status) {
            onUpdateStatus(emailModal.status, email, jobTitle, company);
        }
        setEmailModal({ isOpen: false, status: null });
    };

    return (
        <div
            style={{ animationDelay: `${index * 100}ms` }}
            className={`group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both glass-card relative ${isExpanded || !isCompact ? 'p-8 md:p-10' : 'p-4 hover:shadow-md'} ${isExpanded
                ? 'ring-2 ring-primary/30 shadow-2xl scale-[1.01] z-40'
                : 'transition-all duration-300 hover:z-30'
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
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className="peer absolute h-5 w-5 opacity-0 cursor-pointer z-10"
                        />
                        <div className="h-5 w-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md transition-all peer-checked:bg-primary peer-checked:border-primary peer-hover:border-primary/50 flex items-center justify-center">
                            <CheckCircle2 className={`h-3.5 w-3.5 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap text-foreground">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-lg md:text-xl truncate max-w-sm text-foreground">
                                {candidate.candidateName || candidate.originalFilename}
                            </h3>
                            {candidate.candidateName && (
                                <p className="text-xs text-slate-400 truncate">
                                    {candidate.originalFilename}
                                </p>
                            )}
                        </div>
                        {candidate.isTopPerformer && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-200 dark:border-emerald-800/50 animate-pulse">
                                <Star className="h-3 w-3 fill-emerald-600 dark:fill-emerald-400" />
                                Best Fit
                            </div>
                        )}
                        {getStatusBadge(candidate.processingStatus)}
                        {getTagBadge(candidate.tagStatus)}
                    </div>

                    {candidate.processingStatus !== 'completed' && candidate.processingStatus !== 'error' && (
                        <AnalysisStepper status={candidate.processingStatus} />
                    )}

                    {candidate.processingStatus === 'completed' && candidate.score !== undefined && !isCompact && (
                        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 md:gap-8 w-full">
                            <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                <div className={`text-4xl md:text-5xl font-black ${getScoreColor(candidate.score)} leading-none drop-shadow-sm`}>
                                    {candidate.score}
                                    <span className="text-sm md:text-base text-slate-400 font-medium">/10</span>
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-2">AI Recommendation</div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 flex-1 w-full max-w-full lg:max-w-xl">
                                {[
                                    { label: 'Technical', val: (candidate.aiAnalysis || candidate.analysis)?.technicalFit },
                                    { label: 'Experience', val: (candidate.aiAnalysis || candidate.analysis)?.experienceMatch },
                                    { label: 'Education', val: (candidate.aiAnalysis || candidate.analysis)?.educationLevel }
                                ].map((m, i) => (
                                    <div key={i} className="space-y-1 md:space-y-1.5">
                                        <div className="flex justify-between text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                                            <span>{m.label}</span>
                                            <span className={m.val && m.val >= 8 ? 'text-emerald-500' : ''}>{m.val ? Math.round(m.val * 10) : 0}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-1000 ${m.val && m.val >= 8 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                style={{ width: `${(m.val || 0) * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {candidate.processingStatus === 'completed' && candidate.score !== undefined && isCompact && (
                        <div className="flex items-center gap-3">
                            <div className={`text-2xl font-black ${getScoreColor(candidate.score)}`}>
                                {candidate.score}
                                <span className="text-xs text-slate-400 font-medium tracking-tight">/10</span>
                            </div>
                            <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getScoreColor(candidate.score).replace('text-', 'bg-')}`}
                                    style={{ width: `${candidate.score * 10}%` }}
                                />
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
                            onClick={onTogglePin}
                            className={`h-8 w-8 rounded-xl transition-all duration-300 ${candidate.isPinned ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100'}`}
                        >
                            {candidate.isPinned ? <Pin className="h-4 w-4 fill-primary" /> : <PinOff className="h-4 w-4" />}
                        </Button>

                        <div className="relative" ref={menuRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className={`h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 transition-all duration-200 ${isMenuOpen ? 'text-blue-600 bg-blue-500/10 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 animate-in fade-in zoom-in-95 pointer-events-auto">
                                    <div className="p-1">
                                        {[
                                            { label: 'Shortlist', status: 'shortlisted', color: 'text-emerald-600 hover:bg-emerald-500/10' },
                                            { label: 'Interview', status: 'interviewed', color: 'text-blue-600 hover:bg-blue-500/10' },
                                            { label: 'Offered', status: 'offered', color: 'text-purple-600 hover:bg-purple-500/10' },
                                            { label: 'Reject', status: 'rejected', color: 'text-rose-600 hover:bg-rose-500/10' },
                                            { label: 'Applied', status: 'applied', color: 'text-slate-400 hover:bg-slate-500/10' }
                                        ].map(tag => (
                                            <button
                                                key={tag.status}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpdateStatusClick(tag.status as any);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${tag.color} flex items-center justify-between group/item`}
                                            >
                                                {tag.label}
                                                {candidate.tagStatus === tag.status && <Check className="h-3 w-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {candidate.processingStatus === 'completed' && (candidate.aiAnalysis || candidate.analysis) && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => exportSingleCandidateToPDF(jobTitle, company, candidate)}
                                    className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                                    title="Download AI Report"
                                >
                                    <FileDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onToggleExpand}
                                    className="rounded-xl hover:bg-primary/10 text-primary font-bold text-xs h-8 border-none transition-all duration-300"
                                >
                                    {isExpanded ? (
                                        <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Hide</>
                                    ) : (
                                        <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Review</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (candidate.aiAnalysis || candidate.analysis) && (
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
                                    {(candidate.aiAnalysis?.skills || candidate.analysis?.skills || []).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
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
                                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-2">Experience</p>
                                        <p className="text-base font-black text-slate-900 dark:text-white capitalize">
                                            {candidate.aiAnalysis?.yearsExperience || candidate.analysis?.yearsExperience || 'N/A'}
                                        </p>
                                    </div>
                                    {(candidate.aiAnalysis?.education || candidate.analysis?.education || []).slice(0, 1).map((edu, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-2">Education</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {edu.degree}
                                            </p>
                                            {edu.institution && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {edu.institution}
                                                </p>
                                            )}
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
                                <h4 className="flex items-center gap-3 text-xs md:text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    Fit Justification
                                </h4>
                                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed italic font-medium relative z-10">
                                    "{candidate.aiAnalysis?.justification || candidate.analysis?.justification || 'No justification provided'}"
                                </p>
                            </div>

                            {((candidate.aiAnalysis?.warnings?.length || 0) > 0 || (candidate.analysis?.warnings?.length || 0) > 0) && (
                                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                                        <ShieldAlert className="h-4 w-4" />
                                        Critical Gaps
                                    </h4>
                                    <ul className="space-y-2">
                                        {(candidate.aiAnalysis?.warnings || candidate.analysis?.warnings || []).map((warning, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-red-700 dark:text-red-400 font-medium">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {(candidate.aiAnalysis?.interviewQuestions || candidate.analysis?.interviewQuestions || []).length > 0 && (
                                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200 dark:shadow-slate-900/20 text-slate-900 dark:text-white space-y-4 overflow-hidden relative border border-slate-200 dark:border-slate-800 transition-colors">
                                    <div className="absolute -right-6 -top-6 h-24 w-24 bg-blue-500/5 dark:bg-white/5 rounded-full" />
                                    <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest relative z-10">
                                        <Star className="h-4 w-4 fill-blue-600 dark:fill-white text-blue-600 dark:text-white" />
                                        Suggested Questions
                                    </h4>
                                    <ul className="space-y-3 relative z-10">
                                        {(candidate.aiAnalysis?.interviewQuestions || candidate.analysis?.interviewQuestions || []).slice(0, 3).map((q, idx) => (
                                            <li key={idx} className="text-sm flex gap-4 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10 group/q">
                                                <span className="font-black text-primary text-base">{idx + 1}</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-200 pt-0.5">{q}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {emailModal.isOpen && emailModal.status && (
                <SendEmailModal
                    candidateName={candidate.candidateName || 'Candidate'}
                    status={emailModal.status}
                    suggestedEmail={candidate.aiAnalysis?.email || candidate.analysis?.email || null} // Assuming AI might extract email if PII was bypassed, but typically null now since PII redaction
                    onConfirm={handleConfirmEmail}
                    onCancel={() => setEmailModal({ isOpen: false, status: null })}
                />
            )}
        </div>
    );
};
