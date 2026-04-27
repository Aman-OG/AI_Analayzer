import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Resume } from '../../types';
import { FileText, Star, Pin } from 'lucide-react';

interface KanbanCardProps {
    candidate: Resume;
    index: number;
    onClick?: () => void;
}

function getScoreColor(score: number) {
    if (score >= 8) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50';
    if (score >= 6) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50';
    if (score >= 4) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50';
    return 'text-slate-500 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700';
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ candidate, index, onClick }) => {
    const analysis = candidate.aiAnalysis || candidate.analysis;
    const isProcessing = candidate.processingStatus !== 'completed' && candidate.processingStatus !== 'error';

    return (
        <Draggable draggableId={candidate._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                        snapshot.isDragging
                            ? 'bg-white dark:bg-slate-800 shadow-2xl shadow-blue-500/20 border-blue-300 dark:border-blue-600 scale-[1.02] rotate-[1deg] z-50'
                            : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg'
                    }`}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    {/* Header: Name + Score */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                                <FileText className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                    {candidate.candidateName || candidate.originalFilename.replace(/\.(pdf|docx)$/i, '')}
                                </h4>
                                {candidate.candidateName && (
                                    <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                                        {candidate.originalFilename}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Score badge */}
                        {candidate.processingStatus === 'completed' && candidate.score != null && (
                            <div className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-xl border font-black text-sm ${getScoreColor(candidate.score)}`}>
                                {candidate.score}
                            </div>
                        )}
                    </div>

                    {/* Processing state */}
                    {isProcessing && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-blue-500 rounded-full animate-pulse" />
                            </div>
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Analyzing</span>
                        </div>
                    )}

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {candidate.isTopPerformer && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <Star className="h-2.5 w-2.5 fill-current" />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Top</span>
                            </div>
                        )}
                        {candidate.isPinned && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                                <Pin className="h-2.5 w-2.5 fill-current" />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Pinned</span>
                            </div>
                        )}
                        {analysis?.skills && analysis.skills.length > 0 && (
                            <div className="flex items-center gap-1 overflow-hidden">
                                {analysis.skills.slice(0, 2).map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[80px]"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {analysis.skills.length > 2 && (
                                    <span className="text-[9px] font-bold text-slate-400">+{analysis.skills.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};
