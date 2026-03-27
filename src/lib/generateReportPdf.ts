import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ScanReport, AutomationRecommendation } from "@/types/scanner";

export const generateReportPdf = (report: ScanReport): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const colors = {
    terracotta: [191, 87, 40] as [number, number, number],
    green: [72, 145, 108] as [number, number, number],
    navy: [30, 28, 26] as [number, number, number],
    warmBg: [245, 241, 235] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    muted: [120, 113, 108] as [number, number, number],
  };

  // ── Header Band ──
  doc.setFillColor(...colors.navy);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Creative Hauz", margin, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Automation Scanner Report", margin, 27);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, 35);

  doc.setTextColor(...colors.terracotta);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("creativehauz.space", pageWidth - margin, 18, { align: "right" });

  y = 55;

  // ── Summary ──
  doc.setTextColor(...colors.navy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(report.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 6 + 4;

  if (report.industryInsight) {
    doc.setFillColor(240, 248, 243);
    const insightLines = doc.splitTextToSize(`💡 ${report.industryInsight}`, contentWidth - 12);
    const insightH = insightLines.length * 5 + 10;
    doc.roundedRect(margin, y, contentWidth, insightH, 3, 3, "F");
    doc.setTextColor(...colors.green);
    doc.setFontSize(9);
    doc.text(insightLines, margin + 6, y + 7);
    y += insightH + 8;
    doc.setTextColor(...colors.navy);
  }

  // ── Hero Stats Box ──
  const monthlyHours = Math.round(report.totalHoursSaved * 4.3);
  const yearlySavings = Math.round(monthlyHours * 12 * 35);

  doc.setFillColor(...colors.navy);
  doc.roundedRect(margin, y, contentWidth, 32, 4, 4, "F");
  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(`${report.totalHoursSaved}+`, pageWidth / 2, y + 15, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("estimated hours saved per week", pageWidth / 2, y + 23, { align: "center" });

  y += 38;

  // Monthly / Yearly stats
  doc.setFillColor(...colors.warmBg);
  doc.roundedRect(margin, y, contentWidth / 2 - 3, 18, 3, 3, "F");
  doc.roundedRect(margin + contentWidth / 2 + 3, y, contentWidth / 2 - 3, 18, 3, 3, "F");

  doc.setTextColor(...colors.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${monthlyHours}`, margin + contentWidth / 4 - 1, y + 9, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.muted);
  doc.text("hours/month reclaimed", margin + contentWidth / 4 - 1, y + 14, { align: "center" });

  doc.setTextColor(...colors.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`$${yearlySavings.toLocaleString()}`, margin + contentWidth * 3 / 4 + 1, y + 9, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.muted);
  doc.text("est. yearly savings", margin + contentWidth * 3 / 4 + 1, y + 14, { align: "center" });

  y += 26;

  // ── Recommendations ──
  doc.setTextColor(...colors.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Personalized Automation Recommendations", margin, y);
  y += 10;

  report.recommendations.forEach((rec: AutomationRecommendation, i: number) => {
    if (y > 245) {
      doc.addPage();
      y = 20;
    }

    const impactScore = Math.min(rec.hoursSaved * 12.5, 100);
    const diffLabel = rec.difficulty === "easy" ? "Easy setup" : rec.difficulty === "advanced" ? "Advanced" : "Moderate";

    // Card background
    doc.setFillColor(...colors.white);
    doc.setDrawColor(230, 225, 220);
    doc.roundedRect(margin, y, contentWidth, 42, 3, 3, "FD");

    // Number badge
    doc.setFillColor(...colors.terracotta);
    doc.circle(margin + 8, y + 8, 4, "F");
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${i + 1}`, margin + 8, y + 9.5, { align: "center" });

    // Title
    doc.setTextColor(...colors.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(rec.title, margin + 16, y + 9);

    // Difficulty badge
    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text(diffLabel, pageWidth - margin - 5, y + 9, { align: "right" });

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    const descLines = doc.splitTextToSize(rec.description, contentWidth - 20);
    doc.text(descLines.slice(0, 2), margin + 16, y + 16);

    // Stats row
    const statsY = y + 28;
    doc.setFontSize(8);
    doc.setTextColor(...colors.terracotta);
    doc.setFont("helvetica", "bold");
    doc.text(`Saves ~${rec.hoursSaved} hrs/week`, margin + 8, statsY);
    doc.setTextColor(...colors.green);
    doc.text(`+${rec.roiPercent}% ROI`, margin + 55, statsY);
    if (rec.timeToImplement) {
      doc.setTextColor(...colors.muted);
      doc.setFont("helvetica", "normal");
      doc.text(`⏱ ${rec.timeToImplement}`, margin + 95, statsY);
    }

    // Impact bar
    const barY = statsY + 5;
    doc.setFillColor(230, 225, 220);
    doc.roundedRect(margin + 8, barY, contentWidth - 40, 3, 1.5, 1.5, "F");
    doc.setFillColor(...colors.terracotta);
    doc.roundedRect(margin + 8, barY, (contentWidth - 40) * (impactScore / 100), 3, 1.5, 1.5, "F");
    doc.setFontSize(6);
    doc.setTextColor(...colors.muted);
    doc.text(`Impact: ${Math.round(impactScore)}%`, pageWidth - margin - 5, barY + 2.5, { align: "right" });

    y += 48;
  });

  // ── Next Steps ──
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  y += 4;
  doc.setFillColor(...colors.terracotta);
  doc.roundedRect(margin, y, contentWidth, 40, 4, 4, "F");

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Ready to implement these automations?", pageWidth / 2, y + 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Book a free 30-minute discovery call with our automation experts.", pageWidth / 2, y + 20, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("📅 calendar.app.google/r7Q8bwxVH5JBsmJW9", pageWidth / 2, y + 30, { align: "center" });

  y += 48;

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(230, 225, 220);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.muted);
  doc.text("Built by Creative Hauz — creativehauz.space", margin, footerY);
  doc.text("This report is confidential and personalized. Data is not shared with third parties.", pageWidth - margin, footerY, { align: "right" });

  return doc;
};

export const downloadReportPdf = (report: ScanReport) => {
  const doc = generateReportPdf(report);
  doc.save("Creative-Hauz-Automation-Report.pdf");
};
