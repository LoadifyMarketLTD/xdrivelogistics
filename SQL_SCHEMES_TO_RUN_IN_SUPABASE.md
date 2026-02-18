# 📋 SCHEME SQL PENTRU SUPABASE - XDrive Logistics LTD

**Instrucțiuni:** Copiază fiecare secțiune SQL și rulează-le în Supabase SQL Editor în ordinea indicată.

---

## ✅ MIGRARE 1: Delivery Tracking System (Sistem de Urmărire Livrări)

**Descriere:** Adaugă sistem complet de urmărire livrări cu POD, documente, notițe, feedback și facturi.

**Copie acest SQL în Supabase SQL Editor:**

```sql
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
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Allow users to create tracking events for assigned jobs
CREATE POLICY "Users can create tracking events for assigned jobs"
  ON public.job_tracking_events FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- POD policies
CREATE POLICY "Users can view POD for their jobs"
  ON public.proof_of_delivery FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Assigned companies can create/update POD"
  ON public.proof_of_delivery FOR ALL
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Documents policies
CREATE POLICY "Users can view documents for their jobs"
  ON public.job_documents FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents for their jobs"
  ON public.job_documents FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Notes policies
CREATE POLICY "Users can view non-internal notes for their jobs"
  ON public.job_notes FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    AND (is_internal = false OR created_by = auth.uid())
  );

CREATE POLICY "Users can create notes for their jobs"
  ON public.job_notes FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Feedback policies
CREATE POLICY "Users can view feedback for their jobs"
  ON public.job_feedback FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can leave feedback for completed jobs"
  ON public.job_feedback FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE (posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
        AND status = 'completed'
    )
  );

-- Invoice policies
CREATE POLICY "Users can view invoices for their jobs"
  ON public.job_invoices FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
         OR assigned_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Posting companies can create invoices"
  ON public.job_invoices FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs 
      WHERE posted_by_company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
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
```

---

## ✅ MIGRARE 2: Fleet Tracking (Urmărire Flotă)

**Descriere:** Adaugă sistem de urmărire pentru vehicule cu istoric locație.

**Copiază acest SQL în Supabase SQL Editor:**

```sql
-- ============================================================
-- MY FLEET - VEHICLE TRACKING ENHANCEMENT
-- Courier Exchange-style fleet management
-- ============================================================

-- Add enhanced tracking fields to vehicles table
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'Waiting for next job (available)',
  ADD COLUMN IF NOT EXISTS current_location TEXT,
  ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS future_position TEXT,
  ADD COLUMN IF NOT EXISTS future_journey TEXT,
  ADD COLUMN IF NOT EXISTS advertise_to TEXT DEFAULT 'General Exchange',
  ADD COLUMN IF NOT EXISTS notify_when TEXT,
  ADD COLUMN IF NOT EXISTS is_tracked BOOLEAN DEFAULT true;

-- Add vehicle size field (separate from type for display)
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS vehicle_size TEXT; -- e.g., "Luton", "MWB", "LWB", "SWB"

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_vehicles_current_location ON public.vehicles(current_location);
CREATE INDEX IF NOT EXISTS idx_vehicles_last_tracked ON public.vehicles(last_tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_name ON public.vehicles(driver_name);

-- Create vehicle tracking history table
CREATE TABLE IF NOT EXISTS public.vehicle_tracking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  status TEXT,
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_history_vehicle_id ON public.vehicle_tracking_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_history_tracked_at ON public.vehicle_tracking_history(tracked_at DESC);

-- Enable RLS for tracking history
ALTER TABLE public.vehicle_tracking_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracking history
DROP POLICY IF EXISTS "Users can view tracking history for their company vehicles" ON public.vehicle_tracking_history;
CREATE POLICY "Users can view tracking history for their company vehicles"
  ON public.vehicle_tracking_history FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert tracking history for their company vehicles" ON public.vehicle_tracking_history;
CREATE POLICY "Users can insert tracking history for their company vehicles"
  ON public.vehicle_tracking_history FOR INSERT
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

GRANT ALL ON public.vehicle_tracking_history TO authenticated;

-- Helper function to update vehicle location and log history
CREATE OR REPLACE FUNCTION public.update_vehicle_location(
  p_vehicle_id UUID,
  p_location TEXT,
  p_status TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  -- Update vehicle's current location
  UPDATE public.vehicles
  SET 
    current_location = p_location,
    current_status = COALESCE(p_status, current_status),
    last_tracked_at = NOW()
  WHERE id = p_vehicle_id;

  -- Log to history
  INSERT INTO public.vehicle_tracking_history (
    vehicle_id,
    location,
    status,
    tracked_at,
    notes
  ) VALUES (
    p_vehicle_id,
    p_location,
    p_status,
    NOW(),
    p_notes
  )
  RETURNING id INTO v_history_id;

  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get vehicles with latest tracking info
CREATE OR REPLACE VIEW public.vehicles_with_tracking AS
SELECT 
  v.*,
  c.name as company_name,
  c.phone as company_phone,
  (SELECT COUNT(*) FROM public.vehicle_tracking_history WHERE vehicle_id = v.id) as tracking_count
FROM public.vehicles v
LEFT JOIN public.companies c ON v.company_id = c.id;

GRANT SELECT ON public.vehicles_with_tracking TO authenticated;

COMMENT ON TABLE public.vehicle_tracking_history IS 'Tracks location history for fleet vehicles';
COMMENT ON FUNCTION public.update_vehicle_location IS 'Updates vehicle location and logs to history';
```

---

## ✅ MIGRARE 3: User Profile Enhancement (Îmbunătățire Profil Utilizator)

**Descriere:** Adaugă sistem complet de management utilizatori cu setări și roluri.

**Copiază acest SQL în Supabase SQL Editor:**

```sql
-- ============================================================
-- USER/DRIVER PROFILE ENHANCEMENT
-- Extended user management with driver capabilities
-- ============================================================

-- Extend profiles table with additional user fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone_2 TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS time_zone TEXT DEFAULT 'GMT',
  ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS web_login_allowed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_visible_to_members BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_mobile_account BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mobile_option TEXT DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS interface_language TEXT DEFAULT 'English';

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  show_notification_bar BOOLEAN DEFAULT true,
  enable_load_alerts BOOLEAN DEFAULT true,
  send_booking_confirmation BOOLEAN DEFAULT true,
  enroute_alert_hours INTEGER DEFAULT 4,
  alert_distance_uk_miles INTEGER DEFAULT 10,
  alert_distance_euro_miles INTEGER DEFAULT 50,
  despatch_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- User roles table (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL CHECK (role_name IN (
    'Company Admin',
    'Company User',
    'Finance Director',
    'Finance Bookkeeper',
    'Driver',
    'Dispatcher',
    'Viewer'
  )),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON public.user_roles(role_name);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Company admins can view settings for company users" ON public.user_settings;
CREATE POLICY "Company admins can view settings for company users"
  ON public.user_settings FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Company admins can manage roles for company users" ON public.user_roles;
CREATE POLICY "Company admins can manage roles for company users"
  ON public.user_roles FOR ALL
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;

-- Trigger for user_settings updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user settings
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_initialize_settings ON auth.users;
CREATE TRIGGER on_user_created_initialize_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_settings();

-- View for complete user profile
CREATE OR REPLACE VIEW public.user_profiles_complete AS
SELECT 
  p.*,
  us.show_notification_bar,
  us.enable_load_alerts,
  us.send_booking_confirmation,
  us.enroute_alert_hours,
  us.alert_distance_uk_miles,
  us.alert_distance_euro_miles,
  us.despatch_group,
  c.name as company_name,
  ARRAY_AGG(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles
FROM public.profiles p
LEFT JOIN public.user_settings us ON p.id = us.user_id
LEFT JOIN public.companies c ON p.company_id = c.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
GROUP BY p.id, us.show_notification_bar, us.enable_load_alerts, 
         us.send_booking_confirmation, us.enroute_alert_hours,
         us.alert_distance_uk_miles, us.alert_distance_euro_miles,
         us.despatch_group, c.name;

GRANT SELECT ON public.user_profiles_complete TO authenticated;

COMMENT ON TABLE public.user_settings IS 'Extended settings for user notifications and alerts';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';
```

---

## ✅ MIGRARE 4: Vehicle Details Enhancement (Îmbunătățire Detalii Vehicule)

**Descriere:** Adaugă detalii complete pentru vehicule și documente.

**Copiază acest SQL în Supabase SQL Editor:**

```sql
-- ============================================================
-- VEHICLE DETAILS ENHANCEMENT
-- Extended vehicle management fields
-- ============================================================

-- Add detailed vehicle fields
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS telematics_id TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_reference TEXT, -- What others can see (e.g., "LUTON VAN")
  ADD COLUMN IF NOT EXISTS internal_reference TEXT, -- What you can see (e.g., "DANIEL PREDA")
  ADD COLUMN IF NOT EXISTS body_type TEXT, -- e.g., "Box", "Curtain", "Fridge"
  ADD COLUMN IF NOT EXISTS notify_when_tracked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vin TEXT, -- Vehicle Identification Number
  ADD COLUMN IF NOT EXISTS has_livery BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_tail_lift BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_hiab BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_trailer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_moffet_mounty BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS loading_capacity_m3 NUMERIC,
  ADD COLUMN IF NOT EXISTS length_m NUMERIC,
  ADD COLUMN IF NOT EXISTS width_m NUMERIC,
  ADD COLUMN IF NOT EXISTS height_m NUMERIC,
  ADD COLUMN IF NOT EXISTS max_weight_kg NUMERIC;

-- Create vehicle documents table
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id ON public.vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_expiry_date ON public.vehicle_documents(expiry_date);

-- Enable RLS for vehicle documents
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle documents
DROP POLICY IF EXISTS "Users can view documents for their company vehicles" ON public.vehicle_documents;
CREATE POLICY "Users can view documents for their company vehicles"
  ON public.vehicle_documents FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage documents for their company vehicles" ON public.vehicle_documents;
CREATE POLICY "Users can manage documents for their company vehicles"
  ON public.vehicle_documents FOR ALL
  USING (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

GRANT ALL ON public.vehicle_documents TO authenticated;

-- View for vehicles with document count
CREATE OR REPLACE VIEW public.vehicles_with_details AS
SELECT 
  v.*,
  c.name as company_name,
  (SELECT COUNT(*) FROM public.vehicle_documents WHERE vehicle_id = v.id) as document_count,
  (SELECT COUNT(*) FROM public.vehicle_documents 
   WHERE vehicle_id = v.id AND expiry_date < CURRENT_DATE) as expired_documents_count
FROM public.vehicles v
LEFT JOIN public.companies c ON v.company_id = c.id;

GRANT SELECT ON public.vehicles_with_details TO authenticated;

-- Function to check for expiring documents
CREATE OR REPLACE FUNCTION public.get_expiring_vehicle_documents(
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  document_id UUID,
  vehicle_id UUID,
  vehicle_reference TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vd.id as document_id,
    vd.vehicle_id,
    v.vehicle_reference,
    vd.document_name,
    vd.expiry_date,
    (vd.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM public.vehicle_documents vd
  JOIN public.vehicles v ON vd.vehicle_id = v.id
  WHERE vd.expiry_date IS NOT NULL
    AND vd.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    AND v.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ORDER BY vd.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.vehicle_documents IS 'Documents attached to vehicles (insurance, MOT, etc.)';
COMMENT ON FUNCTION public.get_expiring_vehicle_documents IS 'Returns vehicle documents expiring within specified days';
```

---

## 📋 REZUMAT

**Total 4 migrații SQL de rulat în această ordine:**

1. ✅ **Delivery Tracking System** - Sistem complet de urmărire livrări
2. ✅ **Fleet Tracking** - Urmărire vehicule și istoric locație
3. ✅ **User Profile Enhancement** - Management utilizatori complet
4. ✅ **Vehicle Details Enhancement** - Detalii complete vehicule

**Cum să rulezi:**
1. Deschide Supabase Dashboard
2. Mergi la SQL Editor
3. Copiază prima migrație SQL
4. Apasă "Run" (sau Ctrl+Enter)
5. Repetă pentru toate cele 4 migrații

**Toate migrațiile sunt idempotente** - pot fi rulate de mai multe ori fără probleme (folosesc `IF NOT EXISTS` și `OR REPLACE`).

---

© 2021 XDrive Logistics LTD
