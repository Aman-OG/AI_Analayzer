import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Resume } from '../types';

export function exportTopCandidatesToPDF(jobTitle: string, company: string, candidates: Resume[]) {
    const doc = new jsPDF();
    const topCandidates = candidates
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 3);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('Candidate Analysis Report', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Position: ${jobTitle}`, 14, 32);
    doc.text(`Company: ${company || 'Internal'}`, 14, 38);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 44);

    // Summary Table
    const tableData = topCandidates.map((c, index) => [
        `#${index + 1}`,
        c.candidateName || c.originalFilename,
        `${c.score || 0}/10`,
        c.geminiAnalysis?.yearsExperience || 'N/A',
        (c.geminiAnalysis?.skills || []).slice(0, 5).join(', ')
    ]);

    autoTable(doc, {
        startY: 55,
        head: [['Rank', 'Candidate Name', 'Overall Score', 'Experience', 'Top Skills']],
        body: tableData,
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Detailed Insights
    let currentY = (doc as any).lastAutoTable.finalY + 15;

    topCandidates.forEach((c, index) => {
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text(`${index + 1}. ${c.candidateName || c.originalFilename}`, 14, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // Slate-600
        const justification = c.geminiAnalysis?.justification || 'No justification available.';
        const splitJustification = doc.splitTextToSize(`Justification: ${justification}`, 180);
        doc.text(splitJustification, 14, currentY);
        currentY += splitJustification.length * 5 + 5;

        if (c.geminiAnalysis?.interviewQuestions && c.geminiAnalysis.interviewQuestions.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(37, 99, 235);
            doc.text('Suggested Interview Questions:', 14, currentY);
            currentY += 6;

            doc.setTextColor(71, 85, 105);
            c.geminiAnalysis.interviewQuestions.slice(0, 3).forEach((q) => {
                const splitQ = doc.splitTextToSize(`• ${q}`, 170);
                doc.text(splitQ, 18, currentY);
                currentY += splitQ.length * 5;
            });
            currentY += 5;
        }

        currentY += 5;
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount} - AI Analyzer Engine`, 105, 285, { align: 'center' });
    }

    doc.save(`Top_Candidates_${jobTitle.replace(/\s+/g, '_')}.pdf`);
}
