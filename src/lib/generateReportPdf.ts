import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ScanReport, AutomationRecommendation, ScannerFormData } from "@/types/scanner";

const PAIN_POINT_LABELS: Record<string, string> = {
  "lead-followup": "leads slipping through the cracks",
  "customer-onboarding": "manual client onboarding",
  "content-social": "content creation & social media",
  "appointment-booking": "missed appointments and no-shows",
  "invoice-chasing": "chasing invoices and late payments",
  "data-entry": "repetitive data entry and CRM updates",
  "email-management": "drowning in emails",
  "reporting": "spending hours on reports",
};

const NICHE_RESULTS: Record<string, string> = {
  "Real Estate": "80% faster lead response, 3x viewings booked, 15+ hrs saved/week",
  "Healthcare / Clinic": "90% fewer no-shows, 3x appointment fill rate, 12+ hrs saved/week",
  "Recruitment Agency": "80% faster CV screening, 3x placements, 15+ hrs saved/week",
  "Professional Services": "70% faster onboarding, 2x billable hours recovered",
  "Marketing / Agency": "3x content output, 80% faster reporting, 15+ hrs saved/week",
  "Retail / E-Commerce": "60% fewer abandonments, 3x repeat purchases",
  "Construction / Trades": "90% fewer missed quotes, 2x job bookings",
  "Food & Hospitality": "80% faster reservations, 3x online orders",
};

export const generateReportPdf = (report: ScanReport, scannerData?: ScannerFormData | null): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const colors = {
    primary: [191, 87, 40] as [number, number, number],
    green: [72, 145, 108] as [number, number, number],
    dark: [35, 32, 30] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    lightBg: [250, 248, 245] as [number, number, number],
    cardBg: [255, 255, 255] as [number, number, number],
    muted: [130, 123, 118] as [number, number, number],
    borderColor: [230, 225, 220] as [number, number, number],
    greenLight: [240, 248, 243] as [number, number, number],
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      doc.setFillColor(...colors.lightBg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      y = 20;
    }
  };

  // Derive pain drain text
  const painDrains = scannerData?.painPoints
    ?.map((p) => PAIN_POINT_LABELS[p])
    .filter(Boolean)
    .slice(0, 2) || [];
  const drainText = painDrains.length > 0
    ? painDrains.join(" and ")
    : scannerData?.dailyTimeDrain?.trim()?.slice(0, 80) || "repetitive manual tasks";
  const niche = scannerData?.businessType || "";
  const nicheResults = NICHE_RESULTS[niche] || "80% faster operations, 3x appointments booked, 15+ hrs saved/week";

  // ── Page background ──
  doc.setFillColor(...colors.lightBg);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

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

  // ── AI GROWTH SYSTEM SECTION (TOP — Full) ──
  ensureSpace(85);

  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, y, contentWidth, 10, 3, 3, "F");
  // Fill bottom corners to make only top rounded
  doc.rect(margin, y + 5, contentWidth, 5, "F");
  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("★  Recommended AI System for You", margin + 6, y + 7);
  y += 12;

  doc.setFillColor(...colors.cardBg);
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 70, 0, 0, "FD");
  doc.setLineWidth(0.2);

  const sysY = y + 6;
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const bodyText = `Based on your biggest time drains — ${drainText} — the perfect fit is our AI Growth System ($9,997 one-time + $997/mo retainer).`;
  const bodyLines = doc.splitTextToSize(bodyText, contentWidth - 16);
  doc.text(bodyLines, margin + 8, sysY);
  let innerY = sysY + bodyLines.length * 4.5 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("WHAT'S INCLUDED:", margin + 8, innerY);
  innerY += 5;

  const includes = [
    "AI Voice Agent + 24/7 lead capture & booking",
    "Automated client intake & onboarding",
    "Full workflow automation + custom dashboard",
    "4-week build + 2 months of optimization calls",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  includes.forEach((item) => {
    doc.setTextColor(...colors.green);
    doc.text("✓", margin + 10, innerY);
    doc.setTextColor(...colors.dark);
    doc.text(item, margin + 16, innerY);
    innerY += 4.5;
  });

  innerY += 2;
  doc.setFillColor(...colors.greenLight);
  doc.roundedRect(margin + 6, innerY, contentWidth - 12, 8, 2, 2, "F");
  doc.setTextColor(...colors.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`Clients in your niche see: ${nicheResults}`, margin + 10, innerY + 5.5);

  innerY += 12;
  doc.setTextColor(...colors.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Testimonial:", margin + 8, innerY);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.muted);
  const testimonial = '"We went from spending full Mondays screening CVs to having our AI pre-qualify candidates overnight. Placements tripled in 2 months." — Priya N., Recruitment Agency, Lagos';
  const testLines = doc.splitTextToSize(testimonial, contentWidth - 16);
  doc.text(testLines, margin + 8, innerY + 4);

  y += 74;

  // ── Recommendations ──
  ensureSpace(15);
  doc.setTextColor(...colors.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Personalized Automation Recommendations", margin, y);
  y += 10;

  report.recommendations.forEach((rec: AutomationRecommendation, i: number) => {
    ensureSpace(50);

    const impactScore = Math.min(rec.hoursSaved * 20, 100);
    const diffLabel = rec.difficulty === "easy" ? "Easy setup" : rec.difficulty === "advanced" ? "Advanced" : "Moderate";

    doc.setFillColor(...colors.cardBg);
    doc.setDrawColor(...colors.borderColor);
    doc.roundedRect(margin, y, contentWidth, 44, 3, 3, "FD");

    doc.setFillColor(...colors.primary);
    doc.circle(margin + 8, y + 8, 4, "F");
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${i + 1}`, margin + 8, y + 9.5, { align: "center" });

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(rec.title, margin + 16, y + 9);

    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text(diffLabel, pageWidth - margin - 5, y + 9, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    const descLines = doc.splitTextToSize(rec.description, contentWidth - 20);
    doc.text(descLines.slice(0, 2), margin + 16, y + 16);

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
  ensureSpace(15);
  y += 2;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...colors.muted);
  doc.text("These estimates are based on typical results from similar businesses. Actual savings depend on your current processes and implementation.", pageWidth / 2, y, { align: "center", maxWidth: contentWidth });
  y += 12;

  // ── Bottom AI Growth System CTA ──
  ensureSpace(45);

  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, y, contentWidth, 40, 4, 4, "F");

  doc.setTextColor(...colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Your Recommended System: AI Growth System", pageWidth / 2, y + 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Book your free 30-min AI Audit and get this live in under 30 days.", pageWidth / 2, y + 19, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Book My Free AI Audit →", pageWidth / 2, y + 30, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("calendar.app.google/3RL1z4zboDkeWLebA", pageWidth / 2, y + 36, { align: "center" });

  // ── Footer ──
  const footerY = pageHeight - 12;
  doc.setDrawColor(...colors.borderColor);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.muted);
  doc.text("Built by Creative Hauz — creativehauz.space", margin, footerY);
  doc.text("This report is confidential and personalized.", pageWidth - margin, footerY, { align: "right" });

  return doc;
};

export const downloadReportPdf = (report: ScanReport, scannerData?: ScannerFormData | null) => {
  const doc = generateReportPdf(report, scannerData);
  doc.save("Creative-Hauz-Automation-Report.pdf");
};
