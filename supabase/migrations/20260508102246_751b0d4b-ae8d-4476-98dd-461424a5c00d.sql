ALTER TABLE public.scanner_leads
  ADD COLUMN IF NOT EXISTS webhook_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_resend_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_payload jsonb;

CREATE INDEX IF NOT EXISTS scanner_leads_created_at_idx
  ON public.scanner_leads (created_at DESC);

CREATE POLICY "Service role can update scanner leads"
  ON public.scanner_leads
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
