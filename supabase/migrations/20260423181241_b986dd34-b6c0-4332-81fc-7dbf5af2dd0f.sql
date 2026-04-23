ALTER TABLE public.scanner_leads
  ADD COLUMN IF NOT EXISTS booked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scanner_answers jsonb,
  ADD COLUMN IF NOT EXISTS follow_up_stage text NOT NULL DEFAULT 'report_sent',
  ADD COLUMN IF NOT EXISTS case_study_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS booking_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'scanner';

ALTER TABLE public.scanner_leads
  ALTER COLUMN created_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_scanner_leads_email ON public.scanner_leads (email);