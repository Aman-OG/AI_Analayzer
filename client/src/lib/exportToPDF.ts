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
        c.aiAnalysis?.yearsExperience || 'N/A',
        (c.aiAnalysis?.skills || []).slice(0, 5).join(', ')
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
        const justification = c.aiAnalysis?.justification || 'No justification available.';
        const splitJustification = doc.splitTextToSize(`Justification: ${justification}`, 180);
        doc.text(splitJustification, 14, currentY);
        currentY += splitJustification.length * 5 + 5;

        if (c.aiAnalysis?.interviewQuestions && c.aiAnalysis.interviewQuestions.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(37, 99, 235);
            doc.text('Suggested Interview Questions:', 14, currentY);
            currentY += 6;

            doc.setTextColor(71, 85, 105);
            c.aiAnalysis.interviewQuestions.slice(0, 3).forEach((q) => {
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

export function exportSingleCandidateToPDF(jobTitle: string, company: string, candidate: Resume) {
    const doc = new jsPDF();
    const analysis = candidate.aiAnalysis || candidate.analysis;
    if (!analysis) return;

    // Header with background
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(candidate.candidateName || 'Candidate Summary', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Position: ${jobTitle} | Company: ${company}`, 14, 30);

    // Score Circle replacement
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.circle(180, 20, 15, 'FD');

    doc.setTextColor(37, 99, 235);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${candidate.score || 0}`, 177, 21);
    doc.setFontSize(8);
    doc.text('/10', 184, 21);

    // Reset for content
    let y = 55;
    doc.setTextColor(30, 41, 59); // Slate-800

    // Justification
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Recommendation Justification', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const justificationLines = doc.splitTextToSize(analysis.justification || 'No justification provided', 180);
    doc.text(justificationLines, 14, y);
    y += (justificationLines.length * 5) + 15;

    // Skills & Background Grid
    autoTable(doc, {
        startY: y,
        head: [['Technical Fit', 'Years of Experience', 'Education']],
        body: [[
            `${Math.round((analysis.technicalFit || 0) * 100)}% Match`,
            analysis.yearsExperience || 'N/A',
            analysis.education?.[0]?.degree || 'N/A'
        ]],
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // Skills
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Skills Identified', 14, y);
    y += 8;
    const skills = analysis.skills || [];
    doc.setFontSize(9);
    doc.text(skills.join(' • '), 14, y, { maxWidth: 180 });
    y += 15;

    // Critical Gaps
    if (analysis.warnings && analysis.warnings.length > 0) {
        doc.setTextColor(220, 38, 38); // Red-600
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Identified Gaps', 14, y);
        y += 8;
        doc.setFontSize(9);
        analysis.warnings.forEach(w => {
            doc.text(`• ${w}`, 14, y);
            y += 5;
        });
        y += 10;
    }

    // Interview Questions
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommended Interview Questions', 14, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    (analysis.interviewQuestions || []).slice(0, 4).forEach((q, i) => {
        doc.text(`${i + 1}. ${q}`, 14, y, { maxWidth: 180 });
        y += 10;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `AI Resume Analyzer - Generated for ${candidate.candidateName}`,
            14,
            285
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            190,
            285,
            { align: 'right' }
        );
    }

    doc.save(`Report_${(candidate.candidateName || candidate.originalFilename).replace(/\s+/g, '_')}.pdf`);
}
