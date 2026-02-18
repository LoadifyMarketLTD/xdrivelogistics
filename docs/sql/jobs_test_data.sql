-- XDrive Logistics - Jobs Test Data Helper Functions
-- Run this in your Supabase SQL Editor to create helper functions for testing
-- Generated: 2026-02-18

-- ============================================
-- 1. CREATE TEST JOB FUNCTION
-- ============================================
-- This function allows you to create test jobs by providing a user email
-- instead of having to look up UUIDs manually

CREATE OR REPLACE FUNCTION public.create_test_job(
  user_email TEXT,
  test_reference TEXT DEFAULT 'TEST-001',
  pickup_location TEXT DEFAULT 'BB1 Blackburn',
  delivery_location TEXT DEFAULT 'M1 Manchester'
)
RETURNS TABLE (
  job_id UUID,
  job_reference TEXT,
  job_status TEXT,
  created_by_email TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;

  -- Insert the test job
  RETURN QUERY
  INSERT INTO public.jobs (
    reference,
    pickup_location,
    pickup_postcode,
    pickup_datetime,
    delivery_location,
    delivery_postcode,
    delivery_datetime,
    price_gbp,
    notes,
    created_by
  ) VALUES (
    test_reference,
    pickup_location,
    SPLIT_PART(pickup_location, ' ', 1), -- Extract postcode (first word)
    NOW() + interval '1 day',
    delivery_location,
    SPLIT_PART(delivery_location, ' ', 1), -- Extract postcode (first word)
    NOW() + interval '1 day' + interval '3 hours',
    120.00,
    'Test marketplace job created via helper function',
    v_user_id
  )
  RETURNING id, reference, status, user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_test_job TO authenticated;

COMMENT ON FUNCTION public.create_test_job IS 
'Helper function to create test jobs by providing user email instead of UUID';

-- ============================================
-- 2. GET USER UUID BY EMAIL
-- ============================================
-- Simple function to look up a user UUID by email

CREATE OR REPLACE FUNCTION public.get_user_uuid(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_uuid TO authenticated;

COMMENT ON FUNCTION public.get_user_uuid IS 
'Returns the UUID for a user given their email address';

-- ============================================
-- 3. EXAMPLE USAGE
-- ============================================

-- Example 1: Create a test job using email
-- SELECT * FROM public.create_test_job('your-email@example.com', 'TEST-001');

-- Example 2: Create a test job with custom locations
-- SELECT * FROM public.create_test_job(
--   'your-email@example.com', 
--   'TEST-002',
--   'LS1 Leeds',
--   'BD1 Bradford'
-- );

-- Example 3: Get your user UUID
-- SELECT public.get_user_uuid('your-email@example.com');

-- Example 4: Insert directly with looked-up UUID
-- INSERT INTO public.jobs (
--   reference,
--   pickup_location,
--   pickup_postcode,
--   pickup_datetime,
--   delivery_location,
--   delivery_postcode,
--   delivery_datetime,
--   price_gbp,
--   notes,
--   created_by
-- ) VALUES (
--   'TEST-003',
--   'BB1 Blackburn',
--   'BB1',
--   NOW() + interval '1 day',
--   'M1 Manchester',
--   'M1',
--   NOW() + interval '1 day' + interval '3 hours',
--   120,
--   'Test marketplace job',
--   public.get_user_uuid('your-email@example.com')
-- )
-- RETURNING id, reference, status;

-- ============================================
-- 4. LIST ALL USERS (FOR REFERENCE)
-- ============================================
-- Use this to see all available users in the system

-- SELECT id, email, created_at 
-- FROM auth.users 
-- ORDER BY created_at DESC;
