

## Plan: Set Up n8n Webhook for Follow-Up Email Sequence

### How It Works

When a lead submits their email on the gate screen, your app will fire a webhook to n8n with the lead's data. In n8n, you'll build a workflow with delay nodes to send the 1-hour and Day 2 follow-up emails.

### What I'll Do (in your codebase)

**1. Create an Edge Function: `trigger-lead-webhook`**
- Accepts lead data (email, niche, pain points, report summary) from the client
- Forwards it as a POST request to your n8n webhook URL
- Keeps the n8n webhook URL as a server-side secret (not exposed in frontend code)

**2. Update `ReportGate.tsx`**
- After the lead is saved and the report email is sent, call the new edge function to trigger the n8n workflow

**3. Add a secret for the n8n webhook URL**
- You'll paste your n8n webhook URL as a secret so the edge function can use it

### What You'll Do (in n8n)

Build a workflow like this:

```text
[Webhook Trigger]
       │
       ├──► [Send Email: Case study link]  (1-hour Wait node before)
       │
       └──► [Send Email: "Ready to book?"] (2-day Wait node before)
```

Steps in n8n:
1. Create a new workflow
2. Add a **Webhook** node as the trigger (POST method) — copy the webhook URL
3. Add a **Wait** node set to 1 hour
4. Add an **Email Send** node (using Gmail, SMTP, or Resend node) with your case study content, branded as Linda / Creative Hauz
5. Add another **Wait** node set to 2 days
6. Add another **Email Send** node with the "Ready to book your audit?" content
7. Activate the workflow

### Files to Change
- `supabase/functions/trigger-lead-webhook/index.ts` — new Edge Function
- `src/components/ReportGate.tsx` — add webhook trigger call after lead capture

### Secret Needed
- `N8N_WEBHOOK_URL` — your n8n workflow's webhook trigger URL

