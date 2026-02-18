-- ============================================================
-- XDRIVE LOGISTICS - JOB STATUS WORKFLOW MIGRATION
-- ============================================================
-- Purpose: Implement sequential status tracking for driver job workflow
-- Created: 2026-02-18
-- Phase: 2 - Database Schema
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CREATE JOB STATUS EVENTS TABLE
-- ============================================================
-- Tracks every status change with timestamp, actor, and location

CREATE TABLE IF NOT EXISTS public.job_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_role TEXT CHECK (changed_by_role IN ('driver', 'admin', 'system', 'company')),
  notes TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_status_events_job_id ON public.job_status_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_status_events_status ON public.job_status_events(status);
CREATE INDEX IF NOT EXISTS idx_job_status_events_created_at ON public.job_status_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_status_events_changed_by ON public.job_status_events(changed_by);

-- ============================================================
-- 2. ADD CURRENT_STATUS COLUMN TO JOBS TABLE
-- ============================================================
-- Add status tracking to jobs table with constraint

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'current_status'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN current_status TEXT DEFAULT 'ALLOCATED'
    CHECK (current_status IN (
      'ALLOCATED',
      'ON_MY_WAY_TO_PICKUP',
      'ON_SITE_PICKUP',
      'PICKED_UP',
      'ON_MY_WAY_TO_DELIVERY',
      'ON_SITE_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ));
  END IF;
END $$;

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_jobs_current_status ON public.jobs(current_status);

-- Add timestamps for status changes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'status_updated_at') THEN
    ALTER TABLE public.jobs ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ============================================================
-- 3. CREATE STATUS VALIDATION FUNCTION
-- ============================================================
-- Enforces sequential status progression

CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  status_order TEXT[] := ARRAY[
    'ALLOCATED',
    'ON_MY_WAY_TO_PICKUP',
    'ON_SITE_PICKUP',
    'PICKED_UP',
    'ON_MY_WAY_TO_DELIVERY',
    'ON_SITE_DELIVERY',
    'DELIVERED'
  ];
  old_idx INT;
  new_idx INT;
BEGIN
  -- Allow CANCELLED from any status
  IF NEW.current_status = 'CANCELLED' THEN
    RETURN NEW;
  END IF;
  
  -- Allow same status (no change)
  IF OLD.current_status = NEW.current_status THEN
    RETURN NEW;
  END IF;
  
  -- Get positions in status order
  old_idx := array_position(status_order, OLD.current_status);
  new_idx := array_position(status_order, NEW.current_status);
  
  -- If either status not in order array, allow (for backwards compatibility)
  IF old_idx IS NULL OR new_idx IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Allow forward progression only (or staying at same status)
  IF new_idx >= old_idx THEN
    -- Update status_updated_at timestamp
    NEW.status_updated_at := NOW();
    RETURN NEW;
  END IF;
  
  -- Block backwards progression
  RAISE EXCEPTION 'Invalid status transition from % to %. Status can only move forward in sequence.', 
    OLD.current_status, NEW.current_status;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. CREATE TRIGGER FOR STATUS VALIDATION
-- ============================================================

DROP TRIGGER IF EXISTS enforce_status_progression ON public.jobs;

CREATE TRIGGER enforce_status_progression
  BEFORE UPDATE OF current_status ON public.jobs
  FOR EACH ROW
  WHEN (OLD.current_status IS DISTINCT FROM NEW.current_status)
  EXECUTE FUNCTION validate_status_transition();

-- ============================================================
-- 5. CREATE FUNCTION TO LOG STATUS CHANGES
-- ============================================================
-- Automatically log status changes to job_status_events

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.current_status IS DISTINCT FROM NEW.current_status THEN
    INSERT INTO public.job_status_events (
      job_id,
      status,
      previous_status,
      changed_by_role,
      notes
    ) VALUES (
      NEW.id,
      NEW.current_status,
      OLD.current_status,
      'system',
      'Status changed via database update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. CREATE TRIGGER FOR AUTO-LOGGING
-- ============================================================

DROP TRIGGER IF EXISTS auto_log_status_change ON public.jobs;

CREATE TRIGGER auto_log_status_change
  AFTER UPDATE OF current_status ON public.jobs
  FOR EACH ROW
  WHEN (OLD.current_status IS DISTINCT FROM NEW.current_status)
  EXECUTE FUNCTION log_status_change();

-- ============================================================
-- 7. MIGRATE EXISTING DATA
-- ============================================================
-- Map old status values to new status system

DO $$
DECLARE
  job_record RECORD;
BEGIN
  -- Map existing status values to new current_status
  FOR job_record IN SELECT id, status FROM public.jobs WHERE current_status IS NULL
  LOOP
    UPDATE public.jobs
    SET current_status = CASE 
      WHEN job_record.status = 'open' THEN 'ALLOCATED'
      WHEN job_record.status = 'assigned' THEN 'ALLOCATED'
      WHEN job_record.status = 'in-transit' THEN 'ON_MY_WAY_TO_DELIVERY'
      WHEN job_record.status = 'completed' THEN 'DELIVERED'
      WHEN job_record.status = 'cancelled' THEN 'CANCELLED'
      ELSE 'ALLOCATED'
    END
    WHERE id = job_record.id;
  END LOOP;
END $$;

-- ============================================================
-- 8. ADD HELPER FUNCTIONS
-- ============================================================

-- Function to get current status display name
CREATE OR REPLACE FUNCTION get_status_display_name(status_code TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE status_code
    WHEN 'ALLOCATED' THEN 'Allocated'
    WHEN 'ON_MY_WAY_TO_PICKUP' THEN 'On My Way to Pickup'
    WHEN 'ON_SITE_PICKUP' THEN 'At Pickup Location'
    WHEN 'PICKED_UP' THEN 'Picked Up'
    WHEN 'ON_MY_WAY_TO_DELIVERY' THEN 'On My Way to Delivery'
    WHEN 'ON_SITE_DELIVERY' THEN 'At Delivery Location'
    WHEN 'DELIVERED' THEN 'Delivered'
    WHEN 'CANCELLED' THEN 'Cancelled'
    ELSE status_code
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if status transition is valid
CREATE OR REPLACE FUNCTION is_valid_status_transition(
  from_status TEXT,
  to_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  status_order TEXT[] := ARRAY[
    'ALLOCATED',
    'ON_MY_WAY_TO_PICKUP',
    'ON_SITE_PICKUP',
    'PICKED_UP',
    'ON_MY_WAY_TO_DELIVERY',
    'ON_SITE_DELIVERY',
    'DELIVERED'
  ];
  from_idx INT;
  to_idx INT;
BEGIN
  -- CANCELLED is always valid
  IF to_status = 'CANCELLED' THEN
    RETURN TRUE;
  END IF;
  
  -- Same status is valid
  IF from_status = to_status THEN
    RETURN TRUE;
  END IF;
  
  from_idx := array_position(status_order, from_status);
  to_idx := array_position(status_order, to_status);
  
  -- If either not in array, assume valid
  IF from_idx IS NULL OR to_idx IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Can only move forward
  RETURN to_idx >= from_idx;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 9. GRANT PERMISSIONS
-- ============================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT ON public.job_status_events TO authenticated;
GRANT UPDATE (current_status, status_updated_at) ON public.jobs TO authenticated;

-- ============================================================
-- 10. ADD COMMENTS
-- ============================================================

COMMENT ON TABLE public.job_status_events IS 'Tracks all status changes for jobs with timestamps and actor information';
COMMENT ON COLUMN public.job_status_events.changed_by_role IS 'Role of the user who changed the status: driver, admin, system, company';
COMMENT ON COLUMN public.jobs.current_status IS 'Current status in the driver workflow sequence';
COMMENT ON FUNCTION validate_status_transition() IS 'Ensures status can only progress forward in the defined sequence';
COMMENT ON FUNCTION get_status_display_name(TEXT) IS 'Converts status code to user-friendly display name';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verify migration
DO $$
DECLARE
  events_count INT;
  jobs_with_status INT;
BEGIN
  SELECT COUNT(*) INTO events_count FROM public.job_status_events;
  SELECT COUNT(*) INTO jobs_with_status FROM public.jobs WHERE current_status IS NOT NULL;
  
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'Status events table ready with % events', events_count;
  RAISE NOTICE 'Jobs table has % jobs with status', jobs_with_status;
  RAISE NOTICE 'Status validation triggers active';
END $$;
