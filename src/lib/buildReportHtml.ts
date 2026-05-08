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
  const { totalHoursSaved, recommendations, summary, industryInsight } = params;

  const recsHtml = recommendations
    .map(
      (rec) => `
      <div style="background:#F2ECDD;border-radius:8px;padding:14px 16px;margin-bottom:8px;border-left:4px solid #D4A24C;">
        <div style="font-size:15px;font-weight:600;color:#14130F;margin:0 0 4px;">${rec.title}</div>
        <div style="font-size:13px;color:#5A5247;">⏱ ${rec.hoursSaved} hrs/month saved · 💰 ${rec.roiPercent}% ROI</div>
        <div style="font-size:13px;color:#5A5247;margin-top:4px;">${rec.description}</div>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#EDE7D8;font-family:'DM Sans',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:580px;margin:0 auto;padding:32px 24px;background:#EDE7D8;">

  <div style="margin-bottom:24px;">
    <span style="font-size:22px;font-weight:700;color:#14130F;font-family:'Cormorant Garamond',Georgia,serif;">Creative <span style="color:#D4A24C;">Hauz</span></span>
  </div>

  <h1 style="font-size:26px;font-weight:600;color:#14130F;margin:0 0 16px;line-height:1.3;font-family:'Cormorant Garamond',Georgia,serif;">Your automation report is ready!</h1>

  <p style="font-size:15px;color:#5A5247;line-height:1.6;margin:0 0 14px;">${summary}</p>

  ${industryInsight ? `<p style="font-size:14px;color:#5A5247;line-height:1.6;margin:0 0 14px;font-style:italic;">${industryInsight}</p>` : ""}

  <div style="background:#F2ECDD;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;border:1px solid #D4A24C;">
    <div style="font-size:42px;font-weight:700;color:#14130F;margin:0;line-height:1;font-family:'Cormorant Garamond',Georgia,serif;">${totalHoursSaved}+</div>
    <div style="font-size:14px;color:#5A5247;margin:8px 0 0;font-weight:500;">Hours/Month You Could Save</div>
  </div>

  <h2 style="font-size:18px;font-weight:600;color:#14130F;margin:24px 0 12px;font-family:'Cormorant Garamond',Georgia,serif;">Top Automation Opportunities</h2>
  ${recsHtml}

  <hr style="border:0;border-top:1px solid #D8D0BE;margin:28px 0;">

  <div style="text-align:center;">
    <p style="font-size:15px;color:#5A5247;margin:0 0 16px;">Ready to implement these automations and start saving time?</p>
    <a href="https://calendar.app.google/SfprwqMYFqERrAwi7" style="background:#14130F;color:#EDE7D8;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">Book My Free AI Audit →</a>
    <p style="font-size:13px;color:#C8451A;font-weight:600;margin:12px 0 0;">⚡ Limited audit slots this week — 4 already booked today</p>
  </div>

  <hr style="border:0;border-top:1px solid #D8D0BE;margin:28px 0;">

  <p style="font-size:12px;color:#5A5247;text-align:center;margin:0;">Built by Creative Hauz · <a href="https://creativehauz.space" style="color:#14130F;text-decoration:underline;">creativehauz.space</a></p>

</div>
</body>
</html>`;
}
