-- ============================================================
-- XDrive Logistics LTD - SUPABASE DATABASE SETUP
-- Complete SQL Script for Initial Setup
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('driver', 'admin', 'client')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================
-- 2. QUOTES TABLE (customer quote requests)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_name TEXT,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('same-day', 'next-day', 'dedicated', 'pallet', 'multi-drop', 'eu-international')),
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('small-van', 'medium-van', 'large-van-luton', '7.5-tonne')),
  scheduled_date DATE NOT NULL,
  load_details TEXT,
  weight_kg DECIMAL(10,2),
  dimensions TEXT,
  contact_method TEXT CHECK (contact_method IN ('phone', 'email', 'whatsapp')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'converted', 'declined')),
  quoted_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_email ON public.quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);

-- ============================================================
-- 3. JOBS TABLE (confirmed transport orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_postcode TEXT,
  pickup_contact TEXT,
  dropoff_location TEXT NOT NULL,
  dropoff_postcode TEXT,
  dropoff_contact TEXT,
  service_type TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  profit DECIMAL(10,2) GENERATED ALWAYS AS (price - COALESCE(cost, 0)) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-transit', 'delivered', 'cancelled', 'failed')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  driver_notes TEXT,
  load_details TEXT,
  pod_signature TEXT, -- Proof of delivery signature (base64 or URL)
  pod_photo TEXT, -- Proof of delivery photo URL
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generate job code
CREATE OR REPLACE FUNCTION generate_job_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_code IS NULL THEN
    NEW.job_code := 'JOB-' || LPAD(NEXTVAL('job_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS job_code_seq START 1000;

CREATE TRIGGER set_job_code
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_code();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_driver_id ON public.jobs(driver_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON public.jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- ============================================================
-- 4. INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + COALESCE(vat_amount, 0)) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT CHECK (payment_method IN ('bank-transfer', 'card', 'cash', 'other')),
  notes TEXT,
  pdf_url TEXT, -- Link to generated PDF
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- ============================================================
-- 5. AUDIT LOG TABLE (track important actions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);

-- ============================================================
-- 6. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quotes table policies
CREATE POLICY "Anyone can insert quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all quotes"
  ON public.quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update quotes"
  ON public.quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs table policies
CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = driver_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage jobs"
  ON public.jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Drivers can update assigned jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = driver_id);

-- Invoices table policies
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 9. INITIAL DATA (Admin User)
-- ============================================================

-- Insert first admin user entry (the user must be created in Supabase Auth first)
-- Replace 'your-user-id' with the actual UUID from auth.users after creating the user
-- INSERT INTO public.users (id, email, full_name, role)
-- VALUES (
--   'your-user-id-from-auth-users',
--   'xdrivelogisticsltd@gmail.com',
--   'XDrive Admin',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================================
-- 10. VIEWS FOR REPORTING
-- ============================================================

-- View for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.jobs WHERE status = 'pending') AS pending_jobs,
  (SELECT COUNT(*) FROM public.jobs WHERE status = 'in-transit') AS active_jobs,
  (SELECT COUNT(*) FROM public.jobs WHERE status = 'delivered' AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days') AS weekly_deliveries,
  (SELECT COALESCE(SUM(price), 0) FROM public.jobs WHERE status = 'delivered' AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days') AS weekly_revenue,
  (SELECT COALESCE(SUM(profit), 0) FROM public.jobs WHERE status = 'delivered' AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days') AS weekly_profit,
  (SELECT COALESCE(AVG(profit), 0) FROM public.jobs WHERE status = 'delivered' AND scheduled_date >= CURRENT_DATE - INTERVAL '30 days') AS avg_profit_per_job,
  (SELECT COUNT(*) FROM public.quotes WHERE status = 'new') AS pending_quotes,
  (SELECT COUNT(*) FROM public.invoices WHERE status = 'overdue') AS overdue_invoices;

-- ============================================================
-- SETUP COMPLETE!
-- ============================================================

-- Next Steps:
-- 1. Create your first admin user in Supabase Auth Dashboard
-- 2. Update the INSERT statement above (line 355) with the actual user ID
-- 3. Configure Email Templates in Supabase Auth settings
-- 4. Set up Storage buckets if needed (for documents, PODs)
-- 5. Configure Supabase URL redirects for password reset

COMMENT ON TABLE public.users IS 'Extended user profiles for authenticated users';
COMMENT ON TABLE public.quotes IS 'Customer quote requests from contact form';
COMMENT ON TABLE public.jobs IS 'Confirmed transport jobs/orders';
COMMENT ON TABLE public.invoices IS 'Billing and payment tracking';
COMMENT ON TABLE public.audit_logs IS 'System audit trail for compliance';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';
