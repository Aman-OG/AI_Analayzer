import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { Resume } from '../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    borderColor: string;
    bgColor: string;
    headerBg: string;
    candidates: Resume[];
    onCardClick?: (candidate: Resume) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    id,
    title,
    color,
    borderColor,
    bgColor,
    headerBg,
    candidates,
    onCardClick,
}) => {
    return (
        <div className={`flex flex-col min-w-[280px] max-w-[320px] w-full rounded-3xl border ${borderColor} ${bgColor} backdrop-blur-sm overflow-hidden transition-all duration-300`}>
            {/* Column Header */}
            <div className={`px-4 py-3.5 ${headerBg} border-b ${borderColor}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                            {title}
                        </h3>
                    </div>
                    <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-black ${color.replace('bg-', 'text-')} bg-white/60 dark:bg-slate-800/60 border ${borderColor}`}>
                        {candidates.length}
                    </span>
                </div>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2.5 space-y-2 min-h-[120px] transition-colors duration-200 ${
                            snapshot.isDraggingOver
                                ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                : ''
                        }`}
                    >
                        {candidates.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex items-center justify-center h-20 rounded-2xl border-2 border-dashed border-slate-200/50 dark:border-slate-700/30">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Drop here
                                </p>
                            </div>
                        )}
                        {candidates.map((candidate, index) => (
                            <KanbanCard
                                key={candidate._id}
                                candidate={candidate}
                                index={index}
                                onClick={() => onCardClick?.(candidate)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
