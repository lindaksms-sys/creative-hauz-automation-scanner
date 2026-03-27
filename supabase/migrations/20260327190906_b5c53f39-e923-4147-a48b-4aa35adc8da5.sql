CREATE TABLE public.scanner_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scanner_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scanner leads"
  ON public.scanner_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
