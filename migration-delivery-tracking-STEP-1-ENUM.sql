-- ============================================================
-- XDrive Logistics LTD - DELIVERY TRACKING SYSTEM
-- STEP 1: Add ENUM Value (MUST RUN FIRST, SEPARATELY)
-- 
-- IMPORTANT: This MUST be run in a separate transaction BEFORE
-- the main migration. Run this, wait for success, then run
-- the main migration file.
-- 
-- This fixes PostgreSQL error:
-- "unsafe use of new value of enum type - must be committed first"
-- ============================================================

-- Check if job_status enum type exists and add 'completed' if missing
DO $$
BEGIN
  -- Check if job_status enum type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    -- Add 'completed' to enum if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'job_status' AND e.enumlabel = 'completed'
    ) THEN
      -- Add the new enum value
      ALTER TYPE job_status ADD VALUE 'completed';
      RAISE NOTICE '✅ Added ''completed'' to job_status enum';
      RAISE NOTICE '⚠️  Now COMMIT this transaction and run the main migration';
    ELSE
      RAISE NOTICE '✅ Enum value ''completed'' already exists';
      RAISE NOTICE '👉 You can proceed with the main migration';
    END IF;
  ELSE
    -- If no enum exists, this means status is TEXT with CHECK constraint
    RAISE NOTICE '✅ No job_status enum found - status column uses TEXT';
    RAISE NOTICE '👉 You can proceed directly with the main migration';
  END IF;
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Verify the enum value was added (if enum exists)
DO $$
DECLARE
  has_enum BOOLEAN;
  has_completed BOOLEAN;
BEGIN
  -- Check if enum exists
  SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') INTO has_enum;
  
  IF has_enum THEN
    -- Check if completed value exists
    SELECT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'job_status' AND e.enumlabel = 'completed'
    ) INTO has_completed;
    
    IF has_completed THEN
      RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      RAISE NOTICE '✅ SUCCESS: Enum value is ready';
      RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      RAISE NOTICE '';
      RAISE NOTICE '📋 NEXT STEP:';
      RAISE NOTICE '   Run the main migration file:';
      RAISE NOTICE '   migration-delivery-tracking-STEP-2-MAIN.sql';
      RAISE NOTICE '';
    ELSE
      RAISE NOTICE '⚠️  Enum value NOT added yet';
    END IF;
  END IF;
END $$;
