import React from 'react';
import { X, Sparkles, Download, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface InterviewGuideModalProps {
    guide: string;
    jobTitle: string;
    onClose: () => void;
}

export function InterviewGuideModal({ guide, jobTitle, onClose }: InterviewGuideModalProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(guide);
        setCopied(true);
        toast.success('Interview guide copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Interview Guide', 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Position: ${jobTitle}`, 14, 30);

        // Content
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);

        const lines = doc.splitTextToSize(guide, 180);
        let y = 50;

        lines.forEach((line: string) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            // Basic markdown headers detection for styling in PDF
            if (line.startsWith('#')) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                y += 5;
            } else if (line.startsWith('---')) {
                doc.setDrawColor(200, 200, 200);
                doc.line(14, y, 196, y);
                y += 5;
                return;
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
            }

            doc.text(line, 14, y);
            y += 6;
        });

        doc.save(`Interview_Guide_${jobTitle.replace(/\s+/g, '_')}.pdf`);
        toast.success('PDF downloaded successfully');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                            <Sparkles className="w-6 h-6 fill-primary/20" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">AI Interview Guide</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{jobTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-9 px-3 rounded-xl flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span className="text-xs font-bold">Copy</span>
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleDownloadPDF}
                            className="h-9 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-xs font-bold">Download PDF</span>
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all ml-2"
                        >
                            <X className="w-6 h-6 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-950/30">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {guide}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 flex justify-center">
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                        This guide was generated by AI based on candidate profiles and job requirements. Use it as a starting point for your interviews.
                    </p>
                </div>
            </div>
        </div>
    );
}
