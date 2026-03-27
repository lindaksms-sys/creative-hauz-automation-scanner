import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ScanReport, AutomationRecommendation } from "@/types/scanner";

export const generateReportPdf = (report: ScanReport): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Creative Hauz brand colors — teal/terracotta primary, green accents, light backgrounds
  const colors = {
    primary: [191, 87, 40] as [number, number, number],       // terracotta
    green: [72, 145, 108] as [number, number, number],         // green accent
    dark: [35, 32, 30] as [number, number, number],            // dark text
    white: [255, 255, 255] as [number, number, number],
    lightBg: [250, 248, 245] as [number, number, number],      // warm light bg
    cardBg: [255, 255, 255] as [number, number, number],
    muted: [130, 123, 118] as [number, number, number],
    borderColor: [230, 225, 220] as [number, number, number],
    greenLight: [240, 248, 243] as [number, number, number],
  };

  // ── Page background ──
  doc.setFillColor(...colors.lightBg);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  // ── Header Band ──
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Creative Hauz", margin, 17);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("AI Automation Scanner Report", margin, 25);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, 33);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("creativehauz.space", pageWidth - margin, 17, { align: "right" });

  y = 52;

  // ── Summary ──
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(report.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 6 + 4;

  if (report.industryInsight) {
    doc.setFillColor(...colors.greenLight);
    const insightLines = doc.splitTextToSize(report.industryInsight, contentWidth - 16);
    const insightH = insightLines.length * 5 + 10;
    doc.roundedRect(margin, y, contentWidth, insightH, 3, 3, "F");
    doc.setTextColor(...colors.green);
    doc.setFontSize(9);
    doc.text(insightLines, margin + 8, y + 7);
    y += insightH + 8;
    doc.setTextColor(...colors.dark);
  }

  // ── Hero Stats Box ──
  const monthlyHours = Math.round(report.totalHoursSaved * 4.3);
  const yearlySavings = Math.round(monthlyHours * 12 * 35);

  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, y, contentWidth, 30, 4, 4, "F");
  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(`${report.totalHoursSaved}+`, pageWidth / 2, y + 14, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("estimated hours saved per week", pageWidth / 2, y + 22, { align: "center" });

  y += 36;

  // Monthly / Yearly stats
  doc.setFillColor(...colors.cardBg);
  doc.setDrawColor(...colors.borderColor);
  doc.roundedRect(margin, y, contentWidth / 2 - 3, 18, 3, 3, "FD");
  doc.roundedRect(margin + contentWidth / 2 + 3, y, contentWidth / 2 - 3, 18, 3, 3, "FD");

  doc.setTextColor(...colors.dark);
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
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Personalized Automation Recommendations", margin, y);
  y += 10;

  report.recommendations.forEach((rec: AutomationRecommendation, i: number) => {
    if (y > 240) {
      doc.addPage();
      doc.setFillColor(...colors.lightBg);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
      y = 20;
    }

    const impactScore = Math.min(rec.hoursSaved * 20, 100);
    const diffLabel = rec.difficulty === "easy" ? "Easy setup" : rec.difficulty === "advanced" ? "Advanced" : "Moderate";

    // Card background
    doc.setFillColor(...colors.cardBg);
    doc.setDrawColor(...colors.borderColor);
    doc.roundedRect(margin, y, contentWidth, 44, 3, 3, "FD");

    // Number badge
    doc.setFillColor(...colors.primary);
    doc.circle(margin + 8, y + 8, 4, "F");
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${i + 1}`, margin + 8, y + 9.5, { align: "center" });

    // Title
    doc.setTextColor(...colors.dark);
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
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    doc.text(`Saves ~${rec.hoursSaved} hrs/week`, margin + 8, statsY);
    doc.setTextColor(...colors.green);
    doc.text(`~${rec.roiPercent}% less manual work`, margin + 55, statsY);
    if (rec.timeToImplement) {
      doc.setTextColor(...colors.muted);
      doc.setFont("helvetica", "normal");
      doc.text(rec.timeToImplement, margin + 110, statsY);
    }

    // Impact bar
    const barY = statsY + 5;
    doc.setFillColor(...colors.borderColor);
    doc.roundedRect(margin + 8, barY, contentWidth - 40, 3, 1.5, 1.5, "F");
    doc.setFillColor(...colors.green);
    doc.roundedRect(margin + 8, barY, (contentWidth - 40) * (impactScore / 100), 3, 1.5, 1.5, "F");
    doc.setFontSize(6);
    doc.setTextColor(...colors.muted);
    doc.text(`Relevance: ${Math.round(impactScore)}%`, pageWidth - margin - 5, barY + 2.5, { align: "right" });

    y += 50;
  });

  // ── Disclaimer ──
  if (y > 245) {
    doc.addPage();
    doc.setFillColor(...colors.lightBg);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
    y = 20;
  }

  y += 2;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...colors.muted);
  doc.text("These estimates are based on typical results from similar businesses. Actual savings depend on your current processes and implementation.", pageWidth / 2, y, { align: "center", maxWidth: contentWidth });
  y += 12;

  // ── Next Steps ──
  if (y > 235) {
    doc.addPage();
    doc.setFillColor(...colors.lightBg);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
    y = 20;
  }

  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, y, contentWidth, 38, 4, 4, "F");

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Ready to implement these automations?", pageWidth / 2, y + 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Book a free 30-minute discovery call with our automation experts.", pageWidth / 2, y + 19, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("calendar.app.google/r7Q8bwxVH5JBsmJW9", pageWidth / 2, y + 29, { align: "center" });

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(...colors.borderColor);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.muted);
  doc.text("Built by Creative Hauz — creativehauz.space", margin, footerY);
  doc.text("This report is confidential and personalized.", pageWidth - margin, footerY, { align: "right" });

  return doc;
};

export const downloadReportPdf = (report: ScanReport) => {
  const doc = generateReportPdf(report);
  doc.save("Creative-Hauz-Automation-Report.pdf");
};
