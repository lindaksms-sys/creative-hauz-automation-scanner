## Goal
Push scanner leads into the CRM (via the existing n8n webhook) using the CRM's required fields, and confirm success with a toast on the report page.

## CRM field mapping
n8n will receive a new `crm` block alongside the existing payload. Mapping:

- `full_name` ← gate `name`
- `email` ← gate `email`
- `phone` ← new gate field (optional)
- `company` ← new gate field (optional)
- `source` ← `"scanner"`
- `campaign` ← `"ai-automation-scanner"`
- `lead_magnet` ← `"automation-report"`

n8n will be responsible for forwarding the `crm` object to the CRM endpoint. No new secret needed in Lovable.

## Changes

**1. `src/components/ReportGate.tsx`**
- Add two optional inputs: **Phone** (tel, optional) and **Company** (text, optional).
- Light validation: phone max 30 chars, digits/spaces/+/-/() only; company max 120 chars; both trimmed.
- Pass `phone` and `company` upward to the submit handler.

**2. Gate submit flow (where `scanner_leads` insert + `trigger-lead-webhook` call live)**
- Store `phone` and `company` inside `scanner_answers` JSON (no schema change to `scanner_leads` — keeps DB stable, RLS untouched).
- Pass them through to the edge function call.

**3. `supabase/functions/trigger-lead-webhook/index.ts`**
- Accept optional `phone` and `company` in the body (validated, length-capped, sanitized).
- Build a `crm` object with the 7 fields above and include it in the payload posted to `N8N_WEBHOOK_URL`:
  ```json
  {
    "...existing fields...": "...",
    "crm": {
      "full_name": "...",
      "email": "...",
      "phone": "...",
      "company": "...",
      "source": "scanner",
      "campaign": "ai-automation-scanner",
      "lead_magnet": "automation-report"
    }
  }
  ```
- Return `{ success: true, crm_sent: true }` only when n8n responds 200; otherwise keep the existing non-blocking `queued` behavior.

**4. Success toast (report page)**
- After the gate submit resolves with `success: true`, fire a sonner toast: **"Sent to your CRM ✓"** (description: "We've added your details to follow up.").
- On non-200 / queued response: silent (no error toast — keeps UX clean; lead is already saved).

## Out of scope
- No DB migration (phone/company live in `scanner_answers` jsonb).
- No direct CRM API call from Lovable — n8n owns the CRM POST.
- No changes to the report content, PDF, or email templates.

## Verification
- Submit gate with phone + company → network call to `trigger-lead-webhook` includes `crm` block → toast appears.
- Submit gate without phone/company → still works, `crm.phone` and `crm.company` are empty strings.
- n8n webhook unreachable → no toast, no error shown, lead still saved in `scanner_leads`.
