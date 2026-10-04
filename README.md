# Creative Hauz Automation Scanner

AI-assisted workflow assessment for small businesses, built by Linda Kisimisi.

## Problem and solution

Business owners can describe repetitive work but may struggle to turn it into an automation brief. The scanner collects business context and pain points, generates a structured report, and captures a lead for follow-up. It connects a public assessment interface to server-side inference and configurable n8n endpoints.

The report's hours and percentage estimates are illustrative planning outputs. They are not measured customer savings, revenue results, or validated industry statistics.

[Published Lovable preview](https://id-preview--f7899ef5-d9f7-4f39-9700-d3984c9db3a4.lovable.app)

The configured custom domain is `scanner.creativehauz.space` in `index.html`. Its availability was not independently confirmed during this review.

## Workflow

1. `ScannerQuestionnaire.tsx` collects business context.
2. `generate-report` truncates input strings and arrays, requires a business type, and calls Groq's chat-completions API with `llama-3.3-70b-versatile` and JSON output.
3. The function parses the response, constrains recommendation hours and percentages, recomputes a bounded total, and adds deterministic input-seeded variation.
4. The interface presents the report. PDF and HTML report helpers support export and formatting.
5. `ReportGate.tsx` saves a lead in Supabase and invokes `trigger-lead-webhook`.
6. The webhook function posts a lead payload and CRM block to configured n8n URLs, recording delivery timestamps when the downstream requests succeed.
7. Admin functions support lead review and CRM resend. A shared-secret endpoint accepts validated workflow state updates.

n8n workflow definitions are external to this repository. A successful webhook request does not establish that every downstream CRM or follow-up action completed.

## Architecture and stack

| Component | Implementation |
| --- | --- |
| Interface | React 18, TypeScript, Vite, React Router |
| UI and state | Tailwind CSS, shadcn/ui, TanStack Query |
| AI | Groq API, Llama 3.3 70B Versatile |
| Backend | Supabase PostgreSQL, Auth and Deno Edge Functions |
| Automation boundary | Configurable n8n lead and CRM webhooks |
| Email infrastructure | React Email templates, queue processing, unsubscribe and suppression handlers |
| Report export | jsPDF and HTML formatting helpers |

The email queue and templates are implemented infrastructure; this review did not verify a delivered email or a running external email schedule.

## Security decisions and limitations

- Model and service-role credentials are read from server environment variables.
- Admin lead endpoints validate the Supabase session and restrict access to the configured admin email.
- Workflow writeback requires `WORKFLOW_SHARED_SECRET` through `x-workflow-secret`.
- Queue processing requires a service-role token, with gateway verification configured.
- The report and lead capture flows are public-facing. Input limits reduce malformed input but do not provide per-user rate limiting or bot protection.
- Model JSON is parsed without a complete output schema. Prompt instructions and numeric bounds do not validate factual claims; the prompt currently asks for a plausible industry statistic without source retrieval.
- The transactional email enqueue endpoint relies on gateway JWT acceptance without an application-level recipient or caller authorization check. Harden it before exposing unrestricted sending.
- Public Supabase configuration is not a server secret. Database policies and server authorization remain the protection boundary.

See [security review](docs/security-review.md) for the audit scope and follow-up work.

## Local setup

Install Node.js and Bun. Bun is required by the existing sitemap lifecycle scripts even when npm installs dependencies.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set the public Supabase URL, project ID and publishable/anon key in `.env.local`. Every `VITE_*` value is browser-visible. The currently tracked `.env` contains public configuration and is retained to preserve the connected deployment; local overrides belong in ignored files.

For a separate backend, provision Supabase, review the migrations on a fresh development database, and deploy the functions. Configure `GROK_API_KEY` with a **Groq** key (the variable's name is historical), `N8N_WEBHOOK_URL`, `N8N_CRM_WEBHOOK_URL`, and `WORKFLOW_SHARED_SECRET` server-side. Supabase supplies its runtime URL and keys. Email delivery also requires the platform's configured sender domain, queue and service credentials; do not copy production secrets into the browser.

```bash
npm run build
npm run test
npm run lint
```

These commands are defined in `package.json`; this documentation review did not run provider calls or a full deployment test. The current example test is a scaffold, not evidence of workflow accuracy.

## Implementation evidence

- [Report generation](supabase/functions/generate-report/index.ts)
- [Lead capture](src/components/ReportGate.tsx)
- [Webhook delivery](supabase/functions/trigger-lead-webhook/index.ts)
- [Admin authorization](supabase/functions/admin-list-leads/index.ts)
- [Workflow state validation](supabase/functions/update-scanner-lead-state/index.ts)
- [Email queue](supabase/functions/process-email-queue/index.ts)

GitHub and matching Lovable implementation files were compared before documenting these capabilities.
