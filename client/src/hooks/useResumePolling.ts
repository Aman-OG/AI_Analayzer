import { useState, useEffect, useCallback } from 'react';
import type { Resume } from '../types';
import { resumeService } from '../services';
import { toast } from 'sonner';

export function useResumePolling(jobId: string, refreshTrigger?: number) {
    const [candidates, setCandidates] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);

    const loadCandidates = useCallback(async (silent = false) => {
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
    }, [jobId]);

    useEffect(() => {
        loadCandidates();
    }, [loadCandidates, refreshTrigger]);

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
    }, [candidates, loadCandidates, isPolling]);

    return {
        candidates,
        setCandidates,
        loading,
        isPolling,
        loadCandidates
    };
}
