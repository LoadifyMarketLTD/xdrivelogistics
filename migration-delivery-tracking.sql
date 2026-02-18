-- ============================================================
-- XDRIVE LOGISTICS - DELIVERY TRACKING SYSTEM MIGRATION
-- Phase 1: Database Schema Extensions
-- Run this in Supabase SQL Editor AFTER main schema
-- ============================================================

-- ============================================================
-- 1. ADD TRACKING FIELDS TO JOBS TABLE
-- ============================================================

-- Add tracking timestamp fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS on_my_way TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS loaded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS on_site_pickup TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS on_site_delivery TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivered_on TIMESTAMP WITH TIME ZONE;

-- Add POD (Proof of Delivery) fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS received_by TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS left_at TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS no_of_items INTEGER;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_status TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pod_notes TEXT;

-- Add payment and rate fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS smartpay_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS agreed_rate NUMERIC;

-- Add vehicle and customer reference fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vehicle_ref TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS your_ref TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS cust_ref TEXT;

-- Add packaging and dimensions fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS packaging TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS length_cm NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS width_cm NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS distance_miles NUMERIC;

-- Add booked_by company information
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS booked_by_company_name TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS booked_by_company_phone TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS booked_by_company_email TEXT;

-- Add pickup/delivery full address fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_address_line1 TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_address_line2 TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_city TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_postcode TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS pickup_country TEXT DEFAULT 'UK';

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_address_line2 TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_postcode TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS delivery_country TEXT DEFAULT 'UK';

-- Add assigned vehicle type field
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS assigned_vehicle_type TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_jobs_delivery_status ON public.jobs(delivery_status);
CREATE INDEX IF NOT EXISTS idx_jobs_pickup_postcode ON public.jobs(pickup_postcode);
CREATE INDEX IF NOT EXISTS idx_jobs_delivery_postcode ON public.jobs(delivery_postcode);
CREATE INDEX IF NOT EXISTS idx_jobs_vehicle_ref ON public.jobs(vehicle_ref);

-- ============================================================
-- 2. CREATE JOB_TRACKING_EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'assigned', 'on_my_way', 'loaded', 'on_site_pickup', 'on_site_delivery', 'delivered', 'completed', 'cancelled', 'note_added', 'document_uploaded')),
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id),
  event_data JSONB,
  notes TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tracking_job_id ON public.job_tracking_events(job_id);
CREATE INDEX IF NOT EXISTS idx_tracking_timestamp ON public.job_tracking_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_event_type ON public.job_tracking_events(event_type);

-- ============================================================
-- 3. CREATE JOB_DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('pod', 'invoice', 'photo', 'signature', 'cmr', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON public.job_documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.job_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON public.job_documents(uploaded_at DESC);

-- ============================================================
-- 4. CREATE JOB_NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'internal', 'customer', 'driver', 'alert')),
  note_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_job_id ON public.job_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.job_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.job_notes(note_type);

-- ============================================================
-- 5. CREATE JOB_FEEDBACK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  given_by_company_id UUID NOT NULL REFERENCES public.companies(id),
  given_to_company_id UUID NOT NULL REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_job_id ON public.job_feedback(job_id);
CREATE INDEX IF NOT EXISTS idx_feedback_given_to ON public.job_feedback(given_to_company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.job_feedback(rating);

-- ============================================================
-- 6. CREATE JOB_INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  amount NUMERIC NOT NULL,
  vat_amount NUMERIC,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  paid_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.job_invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.job_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.job_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.job_invoices(due_date);

-- ============================================================
-- 7. HELPER FUNCTIONS
-- ============================================================

-- Function to add tracking event
CREATE OR REPLACE FUNCTION public.add_tracking_event(
  p_job_id UUID,
  p_event_type TEXT,
  p_notes TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Get current user and company
  v_user_id := auth.uid();
  v_company_id := (SELECT company_id FROM public.profiles WHERE id = v_user_id);
  
  -- Insert tracking event
  INSERT INTO public.job_tracking_events (
    job_id, 
    event_type, 
    event_timestamp,
    user_id, 
    company_id, 
    event_data, 
    notes, 
    location
  )
  VALUES (
    p_job_id,
    p_event_type,
    NOW(),
    v_user_id,
    v_company_id,
    p_event_data,
    p_notes,
    p_location
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update job POD
CREATE OR REPLACE FUNCTION public.update_job_pod(
  p_job_id UUID,
  p_received_by TEXT,
  p_left_at TEXT DEFAULT NULL,
  p_no_of_items INTEGER DEFAULT NULL,
  p_delivery_status TEXT DEFAULT 'delivered',
  p_pod_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update job POD fields
  UPDATE public.jobs
  SET 
    received_by = p_received_by,
    left_at = p_left_at,
    no_of_items = p_no_of_items,
    delivery_status = p_delivery_status,
    pod_notes = p_pod_notes,
    delivered_on = NOW(),
    status = 'completed',
    updated_at = NOW()
  WHERE id = p_job_id;
  
  -- Add tracking event
  PERFORM add_tracking_event(
    p_job_id,
    'delivered',
    p_pod_notes,
    NULL,
    jsonb_build_object(
      'received_by', p_received_by,
      'left_at', p_left_at,
      'no_of_items', p_no_of_items,
      'delivery_status', p_delivery_status
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update job status with tracking
CREATE OR REPLACE FUNCTION public.update_job_status(
  p_job_id UUID,
  p_new_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update job status
  UPDATE public.jobs
  SET 
    status = p_new_status,
    updated_at = NOW()
  WHERE id = p_job_id;
  
  -- Add tracking event based on status
  PERFORM add_tracking_event(
    p_job_id,
    CASE p_new_status
      WHEN 'open' THEN 'created'
      WHEN 'assigned' THEN 'assigned'
      WHEN 'in-transit' THEN 'on_my_way'
      WHEN 'completed' THEN 'completed'
      WHEN 'delivered' THEN 'delivered'
      WHEN 'cancelled' THEN 'cancelled'
      ELSE 'note_added'
    END,
    p_notes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. CREATE JOBS_WITH_TRACKING VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.jobs_with_tracking AS
SELECT 
  j.*,
  -- Company information
  poster_company.name as poster_company_name,
  poster_company.phone as poster_company_phone,
  poster_company.email as poster_company_email,
  assigned_company.name as assigned_company_name,
  assigned_company.phone as assigned_company_phone,
  -- Count related records
  (SELECT COUNT(*) FROM public.job_tracking_events WHERE job_id = j.id) as tracking_events_count,
  (SELECT COUNT(*) FROM public.job_documents WHERE job_id = j.id) as documents_count,
  (SELECT COUNT(*) FROM public.job_notes WHERE job_id = j.id) as notes_count,
  -- Latest tracking event
  (SELECT event_type FROM public.job_tracking_events WHERE job_id = j.id ORDER BY event_timestamp DESC LIMIT 1) as latest_event_type,
  (SELECT event_timestamp FROM public.job_tracking_events WHERE job_id = j.id ORDER BY event_timestamp DESC LIMIT 1) as latest_event_timestamp
FROM public.jobs j
LEFT JOIN public.companies poster_company ON j.posted_by_company_id = poster_company.id
LEFT JOIN public.companies assigned_company ON j.assigned_company_id = assigned_company.id;

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE public.job_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_tracking_events
CREATE POLICY "Users can view tracking events for jobs they're involved in"
  ON public.job_tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_tracking_events.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert tracking events for their jobs"
  ON public.job_tracking_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_tracking_events.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- RLS Policies for job_documents
CREATE POLICY "Users can view documents for jobs they're involved in"
  ON public.job_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_documents.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can upload documents for their jobs"
  ON public.job_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_documents.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- RLS Policies for job_notes
CREATE POLICY "Users can view notes for jobs they're involved in"
  ON public.job_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_notes.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can add notes to their jobs"
  ON public.job_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_notes.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- RLS Policies for job_feedback
CREATE POLICY "Users can view feedback for jobs they're involved in"
  ON public.job_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_feedback.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Companies can submit feedback for completed jobs"
  ON public.job_feedback FOR INSERT
  WITH CHECK (
    given_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_feedback.job_id
      AND j.status IN ('completed', 'delivered')
      AND (
        j.posted_by_company_id = given_by_company_id
        OR j.assigned_company_id = given_by_company_id
      )
    )
  );

-- RLS Policies for job_invoices
CREATE POLICY "Users can view invoices for jobs they're involved in"
  ON public.job_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_invoices.job_id
      AND (
        j.posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Job posters can manage invoices"
  ON public.job_invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_invoices.job_id
      AND j.assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ============================================================
-- 10. UPDATE TRIGGERS
-- ============================================================

-- Add update trigger for job_notes
DROP TRIGGER IF EXISTS update_job_notes_updated_at ON public.job_notes;
CREATE TRIGGER update_job_notes_updated_at
  BEFORE UPDATE ON public.job_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add update trigger for job_invoices
DROP TRIGGER IF EXISTS update_job_invoices_updated_at ON public.job_invoices;
CREATE TRIGGER update_job_invoices_updated_at
  BEFORE UPDATE ON public.job_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- All tracking fields, tables, and policies are now in place.
-- Next: Update TypeScript types and create UI components.
