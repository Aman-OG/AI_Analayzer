
// src/components/CandidateList.tsx
import { useEffect, useState, useCallback } from 'react';
import resumeService from '@/services/resumeService';
import type { Candidate, GeminiEducation } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, AlertCircle, RefreshCcw, ChevronDown, Download, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/Loading';
import { useError } from '@/contexts/ErrorContext';
import { toast } from 'sonner';

import CandidateComparison from './CandidateComparison';

interface CandidateListProps {
  jobId: string;
  jobTitle: string;
  refreshTrigger: number;
}

export default function CandidateList({ jobId, jobTitle, refreshTrigger }: CandidateListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useError();

  const selectedCandidates = candidates.filter(c => selectedIds.includes(c.candidateId));

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : (prev.length < 3 ? [...prev, id] : prev)
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await resumeService.exportCandidates(jobId, jobTitle);
      toast.success("CSV Export Successful", {
        description: `Candidate rankings for "${jobTitle}" have been downloaded.`
      });
    } catch (err: any) {
      showError(err, { jobId });
    } finally {
      setIsExporting(false);
    }
  };

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await resumeService.getCandidatesForJob(jobId);
      setCandidates(data);
    } catch (err: any) {
      showError(err, { jobId });
      setError(err.message || 'Could not load candidates.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId, showError]);


  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates, refreshTrigger]);

  const renderEducation = (edus?: GeminiEducation[]) => {
    if (!edus?.length) {
      return <span className="italic text-muted-foreground">Not specified</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-0.5 text-sm">
        {edus.map((e, i) => (
          <li key={i}>
            <strong>{e.degree || '–'}</strong> at {e.institution || '–'}
            {e.graduationYear && ` (’${String(e.graduationYear).slice(-2)})`}
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} />;
  }


  if (error) {
    return (
      <Alert variant="destructive" className="my-4 flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div>
          <AlertTitle>Error Loading Candidates</AlertTitle>
          <AlertDescription className="flex items-center space-x-2">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCandidates}
              className="flex items-center"
            >
              <RefreshCcw className="mr-1 h-4 w-4" /> Retry
            </Button>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (!candidates.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No candidates analyzed yet.</p>
        <p className="text-sm">Upload resumes to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComparison(true)}
          disabled={selectedIds.length === 0}
          className="flex items-center space-x-1 border-primary/20 hover:bg-primary/10 text-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <Users className="h-4 w-4" />
          <span>Compare {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isLoading || isExporting || candidates.length === 0}
          className="flex items-center space-x-1 border-primary/20 hover:bg-primary/10 text-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCandidates}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <CandidateComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        candidates={selectedCandidates}
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <Accordion type="single" collapsible>
          <Table>
            <TableCaption className="mt-4">
              Analyzed candidates for this job
            </TableCaption>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[40px]">
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[40px] text-center">★</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Exp.</TableHead>
                <TableHead>Top Skills</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="animate-staggered">
              {candidates.map((c, i) => (
                <TableRow
                  key={c.candidateId}
                  className={`${selectedIds.includes(c.candidateId) ? 'bg-primary/10' : ''} hover:bg-muted/50 transition-all duration-300 cursor-default group`}
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        checked={selectedIds.includes(c.candidateId)}
                        onChange={() => toggleSelection(c.candidateId)}
                        disabled={!selectedIds.includes(c.candidateId) && selectedIds.length >= 3}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="text-center">
                    {c.isFlagged && (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{c.score}/10</span>
                      <Progress
                        value={c.score * 10}
                        className="w-24 h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{c.yearsExperience ?? '–'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(c.skills ?? []).slice(0, 5).map((s, idx) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {c.skills && c.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{c.skills.length - 5}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AccordionItem value={`cand-${c.candidateId}`}>
                      <AccordionTrigger className="flex items-center justify-end space-x-1 text-primary hover:text-primary/80">
                        <span>View</span>
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:-rotate-180" />
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-muted/30 rounded-md text-left space-y-4 max-w-md mx-auto break-words whitespace-pre-wrap">
                        <div>
                          <strong>Justification:</strong>
                          <p className="mt-1">{c.justification || 'None.'}</p>
                        </div>
                        <div>
                          <strong>Education:</strong>
                          <div className="mt-1">{renderEducation(c.education)}</div>
                        </div>
                        {c.skills?.length ? (
                          <div>
                            <strong>All Skills:</strong>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.skills.map((s, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {c.warnings?.length ? (
                          <div className="text-red-600">
                            <strong>Warnings:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                              {c.warnings.map((w, j) => (
                                <li key={j}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <p className="mt-2 text-xs text-muted-foreground">
                          File: {c.originalFilename}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Accordion>
      </div>
    </div>
  );
}

