# Security review

Reviewed 4 October 2026 against current GitHub and matching Lovable report/webhook implementation.

## Controls observed

Admin endpoints verify sessions and the configured admin email. Workflow state writeback requires `WORKFLOW_SHARED_SECRET`. Queue processing restricts service-role callers. Provider and service-role keys are server-held. Report inputs are bounded.

## Findings

1. Public report and lead-webhook paths have no application-level per-caller throttling or bot protection. Add abuse controls and limits on request bodies before wider exposure.
2. `generate-report` parses model JSON without a complete output schema. Numeric clamping does not validate types or factual accuracy. The prompt asks for a plausible industry statistic without a retrieved source; treat reports as illustrative and remove unsupported statistics in a follow-up.
3. `send-transactional-email` relies on gateway JWT verification and accepts a caller-supplied recipient for the report template. It lacks application-level authorization for enqueueing. Apply caller, recipient and rate controls; a public anon JWT is not trusted service identity.
4. Webhook delivery timestamps indicate accepted HTTP responses, not verified downstream CRM completion. External n8n definitions and schedules are absent from this repo.
5. Tracked `.env` contains public URL/project/anon configuration only. Server secrets were not found there. It is retained to avoid changing the connected deployment; ignore rules protect new overrides.
6. Wildcard CORS permits browser origins but is not authentication or authorization.

## Scope

Static current-source review, not a penetration test, history-wide secret scan or live RLS/provider audit. No reports, webhooks or emails were sent. This PR documents findings and adds environment hygiene; it does not deploy runtime fixes.
