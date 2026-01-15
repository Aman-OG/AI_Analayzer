import React from 'react';
import type { Candidate, GeminiEducation } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Star,
    Briefcase,
    GraduationCap,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CandidateComparisonProps {
    isOpen: boolean;
    onClose: () => void;
    candidates: Candidate[];
}

export default function CandidateComparison({ isOpen, onClose, candidates }: CandidateComparisonProps) {
    const renderEducation = (edus?: GeminiEducation[]) => {
        if (!edus?.length) return <span className="text-muted-foreground italic">N/A</span>;
        return (
            <div className="space-y-1">
                {edus.map((e, i) => (
                    <div key={i} className="text-xs">
                        <span className="font-medium">{e.degree || 'Degree'}</span>
                        <br />
                        <span className="text-muted-foreground">{e.institution || 'Institution'}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-violet-600" />
                        <DialogTitle className="text-2xl font-bold">Candidate Comparison</DialogTitle>
                    </div>
                    <DialogDescription>
                        Side-by-side analysis of the top selected candidates ({candidates.length})
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    <div className={`grid gap-6 ${candidates.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
                            candidates.length === 2 ? 'grid-cols-2' :
                                'grid-cols-3'
                        }`}>
                        {candidates.map((c) => (
                            <div
                                key={c.candidateId}
                                className="flex flex-col border rounded-xl overflow-hidden bg-card transition-shadow hover:shadow-md"
                            >
                                {/* Header Section */}
                                <div className="bg-muted/50 p-4 border-b">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg leading-tight truncate pr-2" title={c.originalFilename}>
                                            {c.originalFilename.split('.')[0]}
                                        </h3>
                                        {c.isFlagged && <Star className="h-5 w-5 text-yellow-500 fill-yellow-400 shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-violet-600">{c.score}</span>
                                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-violet-600 transition-all duration-500"
                                                style={{ width: `${c.score * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Sections */}
                                <div className="p-4 space-y-6 flex-1">
                                    {/* Experience */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                            <Briefcase className="h-4 w-4 text-violet-500" />
                                            Experience
                                        </div>
                                        <p className="text-sm bg-violet-50 text-violet-900 px-3 py-1.5 rounded-lg border border-violet-100 font-medium">
                                            {c.yearsExperience || 'Not specified'} years
                                        </p>
                                    </section>

                                    {/* Skills */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            Top Skills
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {c.skills?.slice(0, 8).map((s, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Education */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                            <GraduationCap className="h-4 w-4 text-blue-500" />
                                            Education
                                        </div>
                                        {renderEducation(c.education)}
                                    </section>

                                    {/* AI Justification */}
                                    <section className="bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-200">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Gemini's Take
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-6 italic leading-relaxed">
                                            "{c.justification || 'No specific justification provided.'}"
                                        </p>
                                    </section>

                                    {/* Warnings */}
                                    {c.warnings && c.warnings.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-red-700">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                Key Concerns
                                            </div>
                                            <ul className="space-y-1">
                                                {c.warnings.slice(0, 2).map((w, idx) => (
                                                    <li key={idx} className="text-[10px] text-red-600 flex items-start gap-1">
                                                        <span className="mt-0.5">•</span>
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
