

## Create `update-scanner-lead-state` Edge Function

A new server-side endpoint that lets n8n (or any external workflow) safely update `scanner_leads` rows — booking status, follow-up stage, timestamps — without ever holding the Supabase service role key.

### What gets built

**1. New edge function: `supabase/functions/update-scanner-lead-state/index.ts`**

- Accepts only `POST` (everything else → 405). Handles `OPTIONS` preflight.
- Auth: requires header `x-workflow-secret` matching `Deno.env.get("WORKFLOW_SHARED_SECRET")`. Missing/wrong → 401.
- Parses JSON body. Identifier resolution: prefer `id`, fall back to `email`. Neither → 400.
- Builds an update object containing **only** fields present in the body, restricted to this allowlist:
  - `booked` (boolean)
  - `follow_up_stage` (text)
  - `booking_date` (timestamptz)
  - `last_contacted_at` (timestamptz)
  - `case_study_sent_at` (timestamptz, nullable)
  - `reminder_sent_at` (timestamptz, nullable)
- `undefined` values skipped; explicit `null` allowed (so n8n can clear timestamps).
- Uses `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` with `auth: { persistSession: false }`.
- Runs `.update(updates).eq('id'|'email', value).select().maybeSingle()`.
- No row → 404 `{ success: false, error: "lead_not_found" }`.
- Success → 200 `{ success: true, lead: updatedRow }`.
- Logs: `[update-scanner-lead-state] invalid_secret`, `missing_identifier`, `no_match id=…`, `updated id=… stage=…`, plus error details on db failures.
- CORS headers on every response (including errors) — `Access-Control-Allow-Headers` includes `x-workflow-secret`, `content-type`, `authorization`, `apikey`.

**2. `supabase/config.toml`** — add a function block to disable JWT verification (auth is the shared secret instead):

```toml
[functions.update-scanner-lead-state]
verify_jwt = false
```

**3. RLS** — no changes needed. Service role bypasses RLS, so the existing `scanner_leads` policies are fine.

**4. New secret to add:** `WORKFLOW_SHARED_SECRET` — I'll prompt you to paste a strong random value (e.g. a 32-char token you generate). The function will refuse all requests until it's set.

### Deployed URL

`https://nlfclipvqxipaoxxoxzu.supabase.co/functions/v1/update-scanner-lead-state`

### Sample n8n HTTP Request node config

- **Method**: POST
- **URL**: `https://nlfclipvqxipaoxxoxzu.supabase.co/functions/v1/update-scanner-lead-state`
- **Authentication**: None (we use a custom header)
- **Headers**:
  - `x-workflow-secret`: `{{ $env.WORKFLOW_SHARED_SECRET }}` (store it in n8n's credentials/env, not inline)
  - `Content-Type`: `application/json`
- **Body** (JSON):
  ```json
  {
    "email": "{{ $json.email }}",
    "booked": true,
    "follow_up_stage": "booked",
    "booking_date": "{{ $json.booking_date }}",
    "last_contacted_at": "{{ $now.toISO() }}"
  }
  ```

### Order of operations

1. You approve this plan.
2. I add the `WORKFLOW_SHARED_SECRET` secret prompt — **you paste a value** before the function will work.
3. I create the function file + config.toml entry. It auto-deploys.
4. I share the final code, the URL above, and confirm the secret name.
5. You wire up n8n.

No frontend changes. No DB schema changes. No changes to existing functions.

