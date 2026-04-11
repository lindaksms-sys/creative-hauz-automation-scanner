

## Plan: Enhance Immediate Report Email + Follow-Up Sequence Guidance

### Important Note on Follow-Up Emails

The **immediate report email** (sent right after form submission) is a legitimate transactional email -- the user just completed the scanner and expects the report. This is already working and can be enhanced.

However, the **1-hour follow-up** and **Day 2 follow-up** emails are a **drip/nurture sequence** -- automated emails sent on a schedule to convert leads. These are classified as marketing emails, not transactional. Lovable's built-in email system is designed exclusively for transactional emails (one-to-one, triggered by a specific user action). Sending marketing sequences through it would damage your domain's sender reputation and could affect deliverability of critical emails like your report delivery.

**For the follow-up sequence, you'll need a dedicated marketing email service** like Mailchimp, ConvertKit, or ActiveCampaign. These services are purpose-built for drip campaigns with proper unsubscribe handling, engagement tracking, and compliance.

### What This Plan Covers

**1. Enhance the immediate report email template** (transactional -- fully supported)
- Update `report-summary.tsx` to include the full proposal teaser, AI Growth System pricing, and a branded CTA to book the audit
- Add the lead's niche and specific pain points to personalize the email
- Pass scanner form data (niche, pain points) through `templateData`
- Update `ReportGate.tsx` to include `scannerData` fields in the email payload

**2. Update the ReportGate component**
- Pass niche, scanner answers, and personalized details into the `templateData` so the email is richer and more compelling

### Files to Change
- `supabase/functions/_shared/transactional-email-templates/report-summary.tsx` -- enhanced template with proposal teaser, niche-specific content, case study mention, and audit CTA
- `supabase/functions/_shared/transactional-email-templates/registry.ts` -- no changes needed (template name stays the same)
- `src/components/ReportGate.tsx` -- pass additional `templateData` fields (niche, scanner answers)
- Redeploy `send-transactional-email` edge function after template changes

### Recommendation for Follow-Up Sequence
After approval, I can help you set up a webhook or integration point so that when a lead is captured, their data is sent to your marketing email tool (e.g., via a Zapier/Make webhook or direct API) to trigger the drip sequence there. That keeps your transactional emails clean and your follow-ups properly managed.

