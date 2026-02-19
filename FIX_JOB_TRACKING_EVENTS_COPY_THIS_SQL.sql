-- ================================================================
-- COPIAZĂ TOT CE ESTE MAI JOS ȘI RULEAZĂ ÎN SUPABASE > SQL EDITOR
-- (Copy everything below and run it in Supabase > SQL Editor)
-- Fix: "Could not find the table 'public.job_tracking_events' in the schema cache"
-- ================================================================

-- Create the job_tracking_events table (safe — skips if it already exists)
CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL
                 CHECK (event_type IN (
                   'on_my_way_to_pickup',
                   'on_site_pickup',
                   'loaded',
                   'on_my_way_to_delivery',
                   'on_site_delivery',
                   'delivered'
                 )),
  event_time   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name    TEXT,
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_job_tracking_events_job_id    ON public.job_tracking_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tracking_events_event_type ON public.job_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_job_tracking_events_event_time ON public.job_tracking_events(event_time DESC);

-- Enable Row Level Security
ALTER TABLE public.job_tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS: users can view tracking events for jobs posted by or assigned to their company
DROP POLICY IF EXISTS "job_tracking_events_select" ON public.job_tracking_events;
CREATE POLICY "job_tracking_events_select"
  ON public.job_tracking_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_tracking_events.job_id
        AND (
          j.posted_by_company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
          )
          OR j.assigned_company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
          )
        )
    )
  );

-- RLS: users can insert tracking events for jobs their company is assigned to
DROP POLICY IF EXISTS "job_tracking_events_insert" ON public.job_tracking_events;
CREATE POLICY "job_tracking_events_insert"
  ON public.job_tracking_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_tracking_events.job_id
        AND (
          j.posted_by_company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
          )
          OR j.assigned_company_id IN (
            SELECT company_id FROM public.profiles WHERE id = auth.uid()
          )
        )
    )
  );

-- Verify: you should see the table and its columns listed below
SELECT table_name, column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = 'job_tracking_events'
ORDER  BY ordinal_position;
