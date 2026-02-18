-- ============================================================
-- COMPANY MEMBERSHIP RLS FIX - COMPLETE SOLUTION
-- ============================================================
-- This script fixes the is_company_member() function and adds
-- auto-triggers to ensure membership integrity
-- 
-- Compatible with BOTH schemas:
-- - Marketplace schema (profiles.company_id)
-- - Portal schema (company_memberships table)
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: DROP OLD FUNCTION (allow parameter changes)
-- ============================================================
DROP FUNCTION IF EXISTS public.is_company_member(uuid);

-- ============================================================
-- STEP 2: CREATE ROBUST is_company_member() FUNCTION
-- ============================================================
-- This function checks MULTIPLE conditions to be compatible with both schemas:
-- 1. User created the company (companies.created_by = auth.uid())
-- 2. User has active membership in company_memberships (portal schema)
-- 3. User's profile links to company (marketplace schema)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- Check if user created the company
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = p_company_id
      AND c.created_by = auth.uid()
  )
  -- OR user has active membership (portal schema)
  OR EXISTS (
    SELECT 1
    FROM public.company_memberships m
    WHERE m.company_id = p_company_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  )
  -- OR user's profile links to company (marketplace schema)
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
      AND p.company_id = p_company_id
  );
$$;

COMMENT ON FUNCTION public.is_company_member(uuid) IS 
'Returns TRUE if user has access to company via: (1) created_by, (2) active membership, or (3) profile company_id link. Compatible with both marketplace and portal schemas.';

-- ============================================================
-- STEP 3: AUTO-CREATE MEMBERSHIP WHEN COMPANY IS CREATED
-- ============================================================
-- Ensures company creator automatically gets owner membership
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_create_company_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_memberships_table BOOLEAN;
  has_profile_company_id BOOLEAN;
BEGIN
  -- Check which schema is deployed
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'company_memberships'
  ) INTO has_memberships_table;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_id'
  ) INTO has_profile_company_id;

  -- If portal schema (company_memberships table exists)
  IF has_memberships_table THEN
    -- Insert membership for creator if not exists
    INSERT INTO public.company_memberships (company_id, user_id, role_in_company, status)
    VALUES (NEW.id, NEW.created_by, 'owner', 'active')
    ON CONFLICT (company_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Auto-created membership for user % in company %', NEW.created_by, NEW.id;
  END IF;
  
  -- If marketplace schema (profiles.company_id exists)
  IF has_profile_company_id THEN
    -- Update creator's profile to link to company
    UPDATE public.profiles 
    SET company_id = NEW.id 
    WHERE (id = NEW.created_by OR user_id = NEW.created_by) 
      AND company_id IS NULL;
    
    RAISE NOTICE 'Auto-linked profile for user % to company %', NEW.created_by, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_auto_create_company_membership ON public.companies;

-- Create trigger on companies INSERT
CREATE TRIGGER trg_auto_create_company_membership
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_company_membership();

COMMENT ON FUNCTION public.auto_create_company_membership() IS 
'Automatically creates membership or profile link when company is created. Works with both schemas.';

-- ============================================================
-- STEP 4: SYNC EXISTING COMPANIES (ONE-TIME FIX)
-- ============================================================
-- For companies that already exist, ensure memberships are created
-- ============================================================

DO $$
DECLARE
  company_record RECORD;
  has_memberships_table BOOLEAN;
  has_profile_company_id BOOLEAN;
  rows_affected INTEGER := 0;
BEGIN
  -- Check which schema is deployed
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'company_memberships'
  ) INTO has_memberships_table;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_id'
  ) INTO has_profile_company_id;

  RAISE NOTICE 'Starting one-time sync...';
  RAISE NOTICE 'Has company_memberships table: %', has_memberships_table;
  RAISE NOTICE 'Has profiles.company_id column: %', has_profile_company_id;

  -- Fix portal schema (company_memberships)
  IF has_memberships_table THEN
    FOR company_record IN 
      SELECT c.id, c.created_by, c.name
      FROM public.companies c
      WHERE c.created_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.company_memberships m
          WHERE m.company_id = c.id 
            AND m.user_id = c.created_by
            AND m.status = 'active'
        )
    LOOP
      INSERT INTO public.company_memberships (company_id, user_id, role_in_company, status)
      VALUES (company_record.id, company_record.created_by, 'owner', 'active')
      ON CONFLICT (company_id, user_id) DO NOTHING;
      
      rows_affected := rows_affected + 1;
      RAISE NOTICE 'Created membership for company: % (user: %)', company_record.name, company_record.created_by;
    END LOOP;
    
    RAISE NOTICE 'Created % missing memberships', rows_affected;
  END IF;

  -- Fix marketplace schema (profiles.company_id)
  IF has_profile_company_id THEN
    rows_affected := 0;
    
    FOR company_record IN 
      SELECT c.id, c.created_by, c.name
      FROM public.companies c
      WHERE c.created_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE (p.id = c.created_by OR p.user_id = c.created_by)
            AND p.company_id = c.id
        )
    LOOP
      UPDATE public.profiles 
      SET company_id = company_record.id 
      WHERE (id = company_record.created_by OR user_id = company_record.created_by)
        AND company_id IS NULL;
      
      rows_affected := rows_affected + 1;
      RAISE NOTICE 'Linked profile to company: % (user: %)', company_record.name, company_record.created_by;
    END LOOP;
    
    RAISE NOTICE 'Linked % profiles to companies', rows_affected;
  END IF;

  RAISE NOTICE 'One-time sync completed!';
END $$;

-- ============================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================

-- Show summary of fixes
SELECT 
  'Fix Summary' AS status,
  (SELECT COUNT(*) FROM public.companies) AS total_companies,
  (SELECT COUNT(DISTINCT company_id) FROM public.company_memberships WHERE status = 'active') AS companies_with_active_memberships,
  (SELECT COUNT(DISTINCT company_id) FROM public.profiles WHERE company_id IS NOT NULL) AS companies_with_profile_links;

-- Test is_company_member for current user's companies
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.created_by = auth.uid() AS is_creator,
  public.is_company_member(c.id) AS is_member_result,
  CASE 
    WHEN public.is_company_member(c.id) THEN '✅ TRUE - Access Granted'
    ELSE '❌ FALSE - Access Denied'
  END AS rls_status
FROM public.companies c
WHERE c.created_by = auth.uid()
   OR EXISTS(SELECT 1 FROM public.profiles WHERE (id = auth.uid() OR user_id = auth.uid()) AND company_id = c.id)
   OR EXISTS(SELECT 1 FROM public.company_memberships WHERE user_id = auth.uid() AND company_id = c.id)
ORDER BY c.created_at DESC;

COMMIT;

-- ============================================================
-- POST-DEPLOYMENT VERIFICATION
-- ============================================================
-- After running this script, run diagnostic-company-membership.sql
-- to verify that is_company_member() returns TRUE for your companies
-- ============================================================

SELECT '✅ Company Membership RLS Fix Applied Successfully!' AS result;
SELECT 'Run diagnostic-company-membership.sql to verify TRUE/FALSE status' AS next_step;
