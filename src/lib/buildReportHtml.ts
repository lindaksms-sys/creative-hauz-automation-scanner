import type { AutomationRecommendation } from "@/types/scanner";

const PAIN_POINT_LABELS: Record<string, string> = {
  "lead-response": "Slow lead response & missed inquiries",
  "appointment-scheduling": "Manual appointment scheduling",
  "follow-ups": "Inconsistent follow-ups",
  "data-entry": "Repetitive data entry & admin tasks",
  "client-onboarding": "Slow client onboarding",
  "social-media": "Social media management overhead",
};


interface BuildReportParams {
  totalHoursSaved: number;
  recommendations: AutomationRecommendation[];
  summary: string;
  industryInsight?: string;
  niche: string;
  painPoints: string[];
}

export function buildReportHtml(params: BuildReportParams): string {
  const { totalHoursSaved, recommendations, summary, industryInsight, niche, painPoints } = params;

  const painLabels = painPoints
    .map((p) => PAIN_POINT_LABELS[p] || p)
    .filter(Boolean);

  const recsHtml = recommendations
    .map(
      (rec) => `
      <div style="background:#f8f8f6;border-radius:8px;padding:14px 16px;margin-bottom:8px;border-left:4px solid #4a9e7a;">
        <div style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">${rec.title}</div>
        <div style="font-size:13px;color:#777;">⏱ ${rec.hoursSaved} hrs/month saved · 💰 ${rec.roiPercent}% ROI</div>
        <div style="font-size:13px;color:#555;margin-top:4px;">${rec.description}</div>
      </div>`
    )
    .join("");
  void painLabels;
  void niche;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#fff;font-family:'Inter',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:580px;margin:0 auto;padding:32px 24px;">

  <div style="margin-bottom:24px;">
    <span style="font-size:22px;font-weight:700;color:#1a1a1a;">Creative <span style="color:#c4572a;">Hauz</span></span>
  </div>

  <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 16px;line-height:1.3;">Your automation report is ready!</h1>

  <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 14px;">${summary}</p>

  ${industryInsight ? `<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 14px;font-style:italic;">${industryInsight}</p>` : ""}

  <div style="background:#fdf3ef;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;border:1px solid #f5d5c8;">
    <div style="font-size:42px;font-weight:800;color:#c4572a;margin:0;line-height:1;">${totalHoursSaved}+</div>
    <div style="font-size:14px;color:#777;margin:8px 0 0;font-weight:500;">Hours/Month You Could Save</div>
  </div>

  <h2 style="font-size:18px;font-weight:600;color:#1a1a1a;margin:24px 0 12px;">Top Automation Opportunities</h2>
  ${recsHtml}

  <hr style="border-color:#eee;margin:28px 0;">

  <div style="text-align:center;">
    <p style="font-size:15px;color:#555;margin:0 0 16px;">Ready to implement these automations and start saving time?</p>
    <a href="https://calendar.app.google/3RL1z4zboDkeWLebA" style="background:#c4572a;color:#fff;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">Book My Free AI Audit →</a>
    <p style="font-size:13px;color:#e67e22;font-weight:600;margin:12px 0 0;">⚡ Limited audit slots this week — 4 already booked today</p>
  </div>

  <hr style="border-color:#eee;margin:28px 0;">

  <p style="font-size:12px;color:#999;text-align:center;margin:0;">Built by Creative Hauz · <a href="https://creativehauz.space" style="color:#c4572a;text-decoration:underline;">creativehauz.space</a></p>

</div>
</body>
</html>`;
}
