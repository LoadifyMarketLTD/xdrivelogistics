-- ============================================================
-- COMPANY MEMBERSHIP DIAGNOSTIC QUERY
-- ============================================================
-- This query shows EXACTLY why is_company_member() returns TRUE or FALSE
-- Run this in Supabase SQL Editor to diagnose membership issues
-- ============================================================

-- Shows current user, company associations, and membership status
SELECT
  -- 1. Current User
  auth.uid() AS current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) AS current_user_email,
  
  -- 2. Profile Info (if using marketplace schema)
  (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AS profile_company_id,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) AS profile_role,
  
  -- 3. Companies Created by Current User
  (SELECT json_agg(json_build_object('id', id, 'name', name, 'created_at', created_at))
   FROM public.companies 
   WHERE created_by = auth.uid()) AS companies_i_created,
  
  -- 4. Company Memberships (if using portal schema with company_memberships table)
  (SELECT json_agg(json_build_object(
     'company_id', company_id, 
     'role', role_in_company, 
     'status', status,
     'created_at', created_at
   ))
   FROM public.company_memberships 
   WHERE user_id = auth.uid()) AS my_memberships,
  
  -- 5. Test is_company_member() for each company
  (SELECT json_agg(json_build_object(
     'company_id', c.id,
     'company_name', c.name,
     'is_member', public.is_company_member(c.id),
     'created_by_me', c.created_by = auth.uid(),
     'in_profile', EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = c.id),
     'in_memberships', EXISTS(SELECT 1 FROM public.company_memberships WHERE user_id = auth.uid() AND company_id = c.id AND status = 'active')
   ))
   FROM public.companies c
   WHERE c.created_by = auth.uid() 
      OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = c.id)
      OR EXISTS(SELECT 1 FROM public.company_memberships WHERE user_id = auth.uid() AND company_id = c.id)
  ) AS company_membership_status;

-- ============================================================
-- QUICK CHECKS
-- ============================================================

-- Check if company_memberships table exists (portal schema)
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'company_memberships'
) AS has_company_memberships_table;

-- Check if profiles.company_id column exists (marketplace schema)
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'company_id'
) AS has_profiles_company_id_column;

-- Show current is_company_member function definition
SELECT 
  pg_get_functiondef(oid) AS function_definition
FROM pg_proc 
WHERE proname = 'is_company_member' 
  AND pronamespace = 'public'::regnamespace;

-- ============================================================
-- EXPECTED RESULTS
-- ============================================================
-- If is_company_member returns TRUE, you should see:
-- - Either: profile_company_id matches a company you have access to
-- - Or: companies_i_created contains at least one company
-- - Or: my_memberships shows an 'active' membership
--
-- If is_company_member returns FALSE, one of these is missing:
-- - Profile not linked to company (if using marketplace schema)
-- - No active membership (if using portal schema)
-- - Company not created by user
-- ============================================================
