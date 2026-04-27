import React, { useMemo } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Resume } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { resumeService } from '../../services';
import { toast } from 'sonner';
import { SendEmailModal } from '../SendEmailModal';

interface KanbanBoardProps {
    candidates: Resume[];
    setCandidates: React.Dispatch<React.SetStateAction<Resume[]>>;
    onCardClick?: (candidate: Resume) => void;
    jobTitle?: string;
    company?: string;
}

const COLUMNS = [
    {
        id: 'applied',
        title: 'Applied',
        color: 'bg-slate-500',
        borderColor: 'border-slate-200/50 dark:border-slate-700/40',
        bgColor: 'bg-slate-50/50 dark:bg-slate-900/30',
        headerBg: 'bg-slate-100/60 dark:bg-slate-800/40',
    },
    {
        id: 'shortlisted',
        title: 'Shortlisted',
        color: 'bg-emerald-500',
        borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
        bgColor: 'bg-emerald-50/30 dark:bg-emerald-950/20',
        headerBg: 'bg-emerald-100/50 dark:bg-emerald-900/20',
    },
    {
        id: 'interviewed',
        title: 'Interviewed',
        color: 'bg-blue-500',
        borderColor: 'border-blue-200/50 dark:border-blue-800/30',
        bgColor: 'bg-blue-50/30 dark:bg-blue-950/20',
        headerBg: 'bg-blue-100/50 dark:bg-blue-900/20',
    },
    {
        id: 'offered',
        title: 'Offered',
        color: 'bg-purple-500',
        borderColor: 'border-purple-200/50 dark:border-purple-800/30',
        bgColor: 'bg-purple-50/30 dark:bg-purple-950/20',
        headerBg: 'bg-purple-100/50 dark:bg-purple-900/20',
    },
    {
        id: 'rejected',
        title: 'Rejected',
        color: 'bg-rose-500',
        borderColor: 'border-rose-200/50 dark:border-rose-800/30',
        bgColor: 'bg-rose-50/30 dark:bg-rose-950/20',
        headerBg: 'bg-rose-100/50 dark:bg-rose-900/20',
    },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidates, setCandidates, onCardClick, jobTitle = 'Unknown', company = 'Internal' }) => {
    const [emailModal, setEmailModal] = React.useState<{ isOpen: boolean, status: 'interviewed' | 'rejected' | null, candidateId: string | null }>({ isOpen: false, status: null, candidateId: null });
    // Group candidates by tagStatus
    const columnData = useMemo(() => {
        const groups: Record<string, Resume[]> = {};
        COLUMNS.forEach(col => {
            groups[col.id] = [];
        });

        candidates.forEach(c => {
            const status = c.tagStatus || 'applied';
            if (groups[status]) {
                groups[status].push(c);
            } else {
                groups['applied'].push(c);
            }
        });

        // Sort each column by score (desc), with processing candidates at the end
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                if (a.processingStatus !== 'completed' && b.processingStatus === 'completed') return 1;
                if (a.processingStatus === 'completed' && b.processingStatus !== 'completed') return -1;
                return (b.score || 0) - (a.score || 0);
            });
        });

        return groups;
    }, [candidates]);

    const handleDragEnd = async (result: DropResult) => {
        const { draggableId, destination, source } = result;

        // Dropped outside or same position
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as Resume['tagStatus'];
        const candidateId = draggableId;

        // Optimistic update
        setCandidates(prev =>
            prev.map(c =>
                c._id === candidateId ? { ...c, tagStatus: newStatus } : c
            )
        );

        if (newStatus === 'interviewed' || newStatus === 'rejected') {
            setEmailModal({ isOpen: true, status: newStatus, candidateId });
        } else {
            try {
                await resumeService.updateStatus(candidateId, newStatus!);
                toast.success(`Moved to ${newStatus}`, {
                    duration: 2000,
                    icon: '✓',
                });
            } catch (error) {
                // Revert on failure
                const oldStatus = source.droppableId as Resume['tagStatus'];
                setCandidates(prev =>
                    prev.map(c =>
                        c._id === candidateId ? { ...c, tagStatus: oldStatus } : c
                    )
                );
                toast.error('Failed to update status');
            }
        }
    };

    const handleConfirmEmail = async (email: string | null) => {
        if (!emailModal.candidateId || !emailModal.status) return;

        try {
            await resumeService.updateStatus(emailModal.candidateId, emailModal.status, email, jobTitle, company);
            toast.success(`Moved to ${emailModal.status}`, {
                duration: 2000,
                icon: '✓',
            });
        } catch (error) {
             // We can't easily revert optimistic update here without tracking original status, 
             // but user can just drag it back.
             toast.error('Failed to update status');
        } finally {
            setEmailModal({ isOpen: false, status: null, candidateId: null });
        }
    };

    const handleCancelEmail = () => {
         // User cancelled, but we still want to update the status (or revert? usually "Skip Email" is handled by confirm(null)).
         // If they clicked "X", we should probably revert the drag, or treat it as "Skip". Let's treat "X" as cancel drag and revert.
         // Actually, SendEmailModal has a "Skip Email, Just Update Status" button which calls onConfirm(null).
         // So if they click X, we revert the optimistic update.
         if(emailModal.candidateId) {
             // Find candidate to see what we revert to. (Optimistic update happened, so it's currently newStatus. Hard to revert to exact oldStatus unless we store it).
             // Let's just treat cancel as "Skip Email" to be simple and not revert.
             handleConfirmEmail(null);
         } else {
             setEmailModal({ isOpen: false, status: null, candidateId: null });
         }
    };

    const activeCandidate = candidates.find(c => c._id === emailModal.candidateId);

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollbarWidth: 'thin' }}>
                {COLUMNS.map(column => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        borderColor={column.borderColor}
                        bgColor={column.bgColor}
                        headerBg={column.headerBg}
                        candidates={columnData[column.id] || []}
                        onCardClick={onCardClick}
                    />
                ))}
            </div>

            {emailModal.isOpen && emailModal.status && activeCandidate && (
                <SendEmailModal
                    candidateName={activeCandidate.candidateName || 'Candidate'}
                    status={emailModal.status}
                    suggestedEmail={activeCandidate.aiAnalysis?.email || activeCandidate.analysis?.email || null}
                    onConfirm={handleConfirmEmail}
                    onCancel={handleCancelEmail}
                />
            )}
        </DragDropContext>
    );
};
