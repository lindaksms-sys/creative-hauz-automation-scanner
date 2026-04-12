

## Plan: Add N8N_WEBHOOK_URL Secret

### What I'll Do

Use the `add_secret` tool to prompt you to paste your n8n webhook URL. This will securely store it as `N8N_WEBHOOK_URL` so the `trigger-lead-webhook` Edge Function can use it.

### What You Need Ready

Your n8n **Production** webhook URL — it looks something like:
`https://your-n8n-instance.com/webhook/abc123-xxxx-xxxx`

Make sure your n8n workflow is **activated** so the production URL is live.

### After This

Once the secret is saved, the full flow will work end-to-end:
1. Lead submits email on the gate screen
2. Immediate report email is sent
3. `trigger-lead-webhook` fires the n8n webhook with lead data
4. n8n handles the 1-hour and Day 2 follow-up emails

