

## Update Email From Address to Show Root Domain

**Goal**: Change the `From:` header so recipients see `noreply@creativehauz.space` instead of `noreply@notify.reports.creativehauz.space`, while keeping the actual sending infrastructure on the verified subdomain.

### What changes

**File: `supabase/functions/send-transactional-email/index.ts`**
- Change `FROM_DOMAIN` from `"notify.reports.creativehauz.space"` to `"creativehauz.space"`
- `SENDER_DOMAIN` stays as `"notify.reports.creativehauz.space"` (required for delivery)

**Deployment**: Redeploy `send-transactional-email` edge function so the change takes effect.

### Result
- Emails will show: **Creative Hauz Automation Scanner \<noreply@creativehauz.space\>**
- Actual sending still routes through the verified subdomain (no deliverability impact)

