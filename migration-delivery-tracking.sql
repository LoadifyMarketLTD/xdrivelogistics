-- ============================================================
-- XDRIVE LOGISTICS LTD - DELIVERY TRACKING SYSTEM
-- Migration to add comprehensive tracking features
-- ============================================================

-- ============================================================
-- 1. EXTEND JOBS TABLE WITH DELIVERY TRACKING FIELDS
-- ============================================================

-- Add detailed location fields
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS pickup_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS pickup_postcode TEXT,
  ADD COLUMN IF NOT EXISTS pickup_city TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS delivery_postcode TEXT,
  ADD COLUMN IF NOT EXISTS delivery_city TEXT;

-- Add distance and packaging details
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS distance_miles NUMERIC,
  ADD COLUMN IF NOT EXISTS packaging TEXT,
  ADD COLUMN IF NOT EXISTS dimensions TEXT, -- Format: "LxWxH cm"
  ADD COLUMN IF NOT EXISTS requested_vehicle_type TEXT; -- What was requested

-- Add company and booking details
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS booked_by_company_name TEXT,
  ADD COLUMN IF NOT EXISTS booked_by_company_ref TEXT, -- e.g., "GB 122846"
  ADD COLUMN IF NOT EXISTS booked_by_phone TEXT,
  ADD COLUMN IF NOT EXISTS load_id TEXT UNIQUE; -- External load ID

-- Add payment and rate details
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS agreed_rate NUMERIC, -- Actual agreed rate
  ADD COLUMN IF NOT EXISTS payment_terms TEXT, -- e.g., "30 Days (From Invoice)"
  ADD COLUMN IF NOT EXISTS smartpay_enabled BOOLEAN DEFAULT false;

-- Add customer references
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS your_ref TEXT, -- Customer's reference
  ADD COLUMN IF NOT EXISTS cust_ref TEXT, -- System customer reference
  ADD COLUMN IF NOT EXISTS items INTEGER; -- Number of items

-- Add vehicle and driver assignment
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS vehicle_ref TEXT, -- Driver name or vehicle ID
  ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES auth.users(id);

-- Add completion details
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS completed_by_name TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add load notes
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS load_notes TEXT,
  ADD COLUMN IF NOT EXISTS pod_required BOOLEAN DEFAULT false; -- POD requirements

-- Generate load_id if not exists
CREATE SEQUENCE IF NOT EXISTS load_id_seq START 79000000;

CREATE OR REPLACE FUNCTION generate_load_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.load_id IS NULL OR NEW.load_id = '' THEN
    NEW.load_id := NEXTVAL('load_id_seq')::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_load_id ON public.jobs;
CREATE TRIGGER set_load_id
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_load_id();

-- ============================================================
-- 2. JOB TRACKING EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'on_my_way_to_pickup',
    'on_site_pickup',
    'loaded',
    'on_my_way_to_delivery',
    'on_site_delivery',
    'delivered'
  )),
  event_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT, -- Cached for display
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tracking events
CREATE INDEX IF NOT EXISTS idx_tracking_events_job_id ON public.job_tracking_events(job_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_type ON public.job_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_time ON public.job_tracking_events(event_time DESC);

-- ============================================================
-- 3. PROOF OF DELIVERY (POD) TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proof_of_delivery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL UNIQUE REFERENCES public.jobs(id) ON DELETE CASCADE,
  delivered_on TIMESTAMP WITH TIME ZONE NOT NULL,
  received_by TEXT NOT NULL, -- Name of person who received
  left_at TEXT, -- Where goods were left (e.g., "Goods Inwards")
  no_of_items INTEGER,
  delivery_status TEXT NOT NULL DEFAULT 'Completed Delivery' CHECK (delivery_status IN (
    'Completed Delivery',
    'Partial Delivery',
    'Failed Delivery',
    'Refused',
    'Left Safe'
  )),
  delivery_notes TEXT,
  signature_url TEXT, -- Link to signature image if captured
  photo_urls TEXT[], -- Array of photo URLs
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for POD
CREATE INDEX IF NOT EXISTS idx_pod_job_id ON public.proof_of_delivery(job_id);

-- ============================================================
-- 4. JOB DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'POD',
    'Invoice',
    'Delivery Note',
    'CMR',
    'Photo',
    'Other'
  )),
  document_url TEXT NOT NULL,
  document_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON public.job_documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.job_documents(document_type);

-- ============================================================
-- 5. JOB NOTES/HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN (
    'General',
    'Status Update',
    'Customer Communication',
    'Internal',
    'Issue',
    'Resolution'
  )),
  note_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Hide from customer if true
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT, -- Cached for display
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_job_id ON public.job_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.job_notes(created_at DESC);

-- ============================================================
-- 6. JOB FEEDBACK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  from_company_id UUID REFERENCES public.companies(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  feedback_type TEXT CHECK (feedback_type IN ('Positive', 'Neutral', 'Negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_job_id ON public.job_feedback(job_id);
CREATE INDEX IF NOT EXISTS idx_feedback_company ON public.job_feedback(from_company_id);

-- ============================================================
-- 7. INVOICES TABLE EXTENSION
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  vat_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'paid',
    'overdue',
    'cancelled'
  )),
  payment_terms TEXT,
  smartpay_transaction_id TEXT, -- If paid via SmartPay
  invoice_url TEXT, -- PDF URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.job_invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.job_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.job_invoices(due_date);

-- Auto-generate invoice number
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                          LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number ON public.job_invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.job_invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE public.job_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_invoices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view tracking events for jobs they're involved with
CREATE POLICY "Users can view tracking events for their company jobs"
  ON public.job_tracking_events FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

-- Allow users to create tracking events for assigned jobs
CREATE POLICY "Users can create tracking events for assigned jobs"
  ON public.job_tracking_events FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE assigned_company_id = public.current_user_company_id()
    )
  );

-- POD policies (similar pattern)
CREATE POLICY "Users can view POD for their jobs"
  ON public.proof_of_delivery FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

CREATE POLICY "Assigned companies can create/update POD"
  ON public.proof_of_delivery FOR ALL
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE assigned_company_id = public.current_user_company_id()
    )
  );

-- Documents policies
CREATE POLICY "Users can view documents for their jobs"
  ON public.job_documents FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

CREATE POLICY "Users can upload documents for their jobs"
  ON public.job_documents FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

-- Notes policies
CREATE POLICY "Users can view non-internal notes for their jobs"
  ON public.job_notes FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
    AND (is_internal = false OR created_by = auth.uid())
  );

CREATE POLICY "Users can create notes for their jobs"
  ON public.job_notes FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

-- Feedback policies
CREATE POLICY "Users can view feedback for their jobs"
  ON public.job_feedback FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

CREATE POLICY "Users can leave feedback for completed jobs"
  ON public.job_feedback FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE (posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id())
        AND status = 'completed'
    )
  );

-- Invoice policies
CREATE POLICY "Users can view invoices for their jobs"
  ON public.job_invoices FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
         OR assigned_company_id = public.current_user_company_id()
    )
  );

CREATE POLICY "Posting companies can create invoices"
  ON public.job_invoices FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = public.current_user_company_id()
    )
  );

-- ============================================================
-- 9. HELPER FUNCTIONS FOR TRACKING
-- ============================================================

-- Function to record a tracking event
CREATE OR REPLACE FUNCTION public.record_tracking_event(
  p_job_id UUID,
  p_event_type TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_user_name TEXT;
BEGIN
  -- Get user's name
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE id = auth.uid();

  -- Insert tracking event
  INSERT INTO public.job_tracking_events (
    job_id,
    event_type,
    event_time,
    user_id,
    user_name,
    notes
  ) VALUES (
    p_job_id,
    p_event_type,
    NOW(),
    auth.uid(),
    v_user_name,
    p_notes
  )
  RETURNING id INTO v_event_id;

  -- Update job status based on event type
  IF p_event_type = 'loaded' THEN
    UPDATE public.jobs SET status = 'in-transit' WHERE id = p_job_id;
  ELSIF p_event_type = 'delivered' THEN
    UPDATE public.jobs 
    SET status = 'completed',
        completed_at = NOW(),
        completed_by_name = v_user_name
    WHERE id = p_job_id;
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create POD
CREATE OR REPLACE FUNCTION public.create_proof_of_delivery(
  p_job_id UUID,
  p_received_by TEXT,
  p_left_at TEXT DEFAULT NULL,
  p_no_of_items INTEGER DEFAULT NULL,
  p_delivery_status TEXT DEFAULT 'Completed Delivery',
  p_delivery_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_pod_id UUID;
BEGIN
  INSERT INTO public.proof_of_delivery (
    job_id,
    delivered_on,
    received_by,
    left_at,
    no_of_items,
    delivery_status,
    delivery_notes,
    created_by
  ) VALUES (
    p_job_id,
    NOW(),
    p_received_by,
    p_left_at,
    p_no_of_items,
    p_delivery_status,
    p_delivery_notes,
    auth.uid()
  )
  ON CONFLICT (job_id) 
  DO UPDATE SET
    delivered_on = NOW(),
    received_by = EXCLUDED.received_by,
    left_at = EXCLUDED.left_at,
    no_of_items = EXCLUDED.no_of_items,
    delivery_status = EXCLUDED.delivery_status,
    delivery_notes = EXCLUDED.delivery_notes,
    updated_at = NOW()
  RETURNING id INTO v_pod_id;

  -- Also record delivered tracking event
  PERFORM public.record_tracking_event(p_job_id, 'delivered', p_delivery_notes);

  RETURN v_pod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. VIEWS FOR EASY DATA ACCESS
-- ============================================================

-- Complete job view with all tracking data
CREATE OR REPLACE VIEW public.jobs_with_tracking AS
SELECT 
  j.*,
  pc.name as posted_by_company_name,
  pc.phone as posted_by_company_phone,
  ac.name as assigned_company_name,
  ac.phone as assigned_company_phone,
  pod.delivered_on,
  pod.received_by,
  pod.left_at as pod_left_at,
  pod.delivery_status as pod_delivery_status,
  pod.delivery_notes as pod_notes,
  (SELECT COUNT(*) FROM public.job_tracking_events WHERE job_id = j.id) as tracking_event_count,
  (SELECT COUNT(*) FROM public.job_documents WHERE job_id = j.id) as document_count,
  (SELECT COUNT(*) FROM public.job_notes WHERE job_id = j.id) as note_count
FROM public.jobs j
LEFT JOIN public.companies pc ON j.posted_by_company_id = pc.id
LEFT JOIN public.companies ac ON j.assigned_company_id = ac.id
LEFT JOIN public.proof_of_delivery pod ON j.id = pod.job_id;

-- Grant access to view
GRANT SELECT ON public.jobs_with_tracking TO authenticated;

COMMENT ON TABLE public.job_tracking_events IS 'Real-time tracking events for job delivery lifecycle';
COMMENT ON TABLE public.proof_of_delivery IS 'Proof of delivery records with recipient and delivery details';
COMMENT ON TABLE public.job_documents IS 'Documents attached to jobs (POD, invoices, photos, etc.)';
COMMENT ON TABLE public.job_notes IS 'Notes and history for jobs';
COMMENT ON TABLE public.job_feedback IS 'Feedback ratings between companies';
COMMENT ON TABLE public.job_invoices IS 'Invoices generated for completed jobs';
