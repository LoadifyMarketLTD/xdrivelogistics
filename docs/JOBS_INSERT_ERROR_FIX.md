# Jobs Table Insert Errors - Complete Debugging Guide

## Problem Overview

When trying to insert a test job into the `public.jobs` table, users encounter three common errors related to the `created_by` column:

1. **NULL constraint violation** - `auth.uid()` returns NULL
2. **Invalid UUID syntax** - Using placeholder strings instead of valid UUIDs
3. **Foreign key violation** - Using a UUID that doesn't exist in the database

This guide addresses all three errors with comprehensive solutions.

---

## Error 1: NULL Value Constraint Violation

### Error Message
```
Failed to run sql query: ERROR:  23502: null value in column "created_by" of relation "jobs" violates not-null constraint
DETAIL:  Failing row contains (59319804-6a0e-4b61-bc46-62f173320c10, TEST-001, OPEN, ...)
```

### Problematic Query
```sql
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
  'TEST-001',
  'BB1 Blackburn',
  'BB1',
  NOW() + interval '1 day',
  'M1 Manchester',
  'M1',
  NOW() + interval '1 day' + interval '3 hours',
  120,
  'Test marketplace job',
  auth.uid()  -- ❌ RETURNS NULL
)
RETURNING id, reference, status;
```

### Root Cause
`auth.uid()` returns `NULL` when:
- The query is run in the SQL Editor (no authenticated session context)
- The user is not logged in
- The query is executed outside of a Supabase RPC or authenticated context

---

## Error 2: Invalid UUID Syntax

### Error Messages (Multiple Variations)

**Variation A:**
```
Failed to run sql query: ERROR:  22P02: invalid input syntax for type uuid: "AICI_PUI_UUID_UL_TAU"
LINE 22:   'AICI_PUI_UUID_UL_TAU'::uuid
```

**Variation B:**
```
Failed to run sql query: ERROR:  22P02: invalid input syntax for type uuid: "UUID_REAL_AICI"
LINE 20:   'UUID_REAL_AICI'::uuid
```

### Problematic Queries (All Invalid)
```sql
-- Example 1: Using Romanian placeholder
INSERT INTO public.jobs (
  ...
  created_by
) VALUES (
  ...
  'AICI_PUI_UUID_UL_TAU'::uuid  -- ❌ INVALID (Romanian: "put UUID here")
)
RETURNING id, reference, status;

-- Example 2: Another Romanian placeholder
INSERT INTO public.jobs (
  ...
  created_by
) VALUES (
  ...
  'UUID_REAL_AICI'::uuid  -- ❌ INVALID (Romanian: "real UUID here")
)
RETURNING id, reference, status;

-- Example 3: Common English placeholders (also invalid)
INSERT INTO public.jobs (
  ...
  created_by
) VALUES (
  ...
  'PUT_YOUR_UUID_HERE'::uuid  -- ❌ INVALID
)
RETURNING id, reference, status;
```

### Root Cause
These placeholder strings are not valid UUID formats. A valid UUID must be in the exact format:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
Where each `x` is a hexadecimal digit (0-9, a-f).

**Common placeholder strings that will fail:**
- `'AICI_PUI_UUID_UL_TAU'` (Romanian)
- `'UUID_REAL_AICI'` (Romanian)
- `'PUT_YOUR_UUID_HERE'` (English)
- `'YOUR_UUID_HERE'` (English)
- `'your-user-uuid-here'` (English - contains non-hex characters)
- Any string that doesn't match the UUID format above

---

## Error 3: Foreign Key Constraint Violation

### Error Message
```
Failed to run sql query: ERROR:  23503: insert or update on table "jobs" violates foreign key constraint "jobs_created_by_fkey"
DETAIL:  Key (created_by)=(922c7487-0bfc-48ba-8272-9da89771ef78) is not present in table "users".
```

### Problematic Query
```sql
INSERT INTO public.jobs (
  reference,
  pickup_location,
  pickup_postcode,
  pickup_datetime,
  delivery_location,
  delivery_postcode,
  delivery_datetime,
  price_gbp,
  created_by
) VALUES (
  'TEST-001',
  'BB1 Blackburn',
  'BB1',
  NOW() + interval '1 day',
  'M1 Manchester',
  'M1',
  NOW() + interval '1 day' + interval '3 hours',
  120,
  '922c7487-0bfc-48ba-8272-9da89771ef78'::uuid  -- ❌ USER DOESN'T EXIST
)
RETURNING id, reference, status, created_by;
```

### Root Cause
The UUID `922c7487-0bfc-48ba-8272-9da89771ef78` is a **valid UUID format**, but:
- This user ID doesn't exist in the `auth.users` table
- The `jobs.created_by` column has a foreign key constraint to `auth.users(id)`
- PostgreSQL prevents inserting a record with a foreign key that doesn't exist

### How to Fix
You must use a UUID that **actually exists** in your database. See "Solution 1: Use a Real User UUID" below to find valid user UUIDs.

---

## Solution 1: Use a Real User UUID

### Step 1: Get Your User UUID
Run this query first to find your authenticated user's UUID:
```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

### Step 2: Use the Real UUID
Replace `'your-user-uuid-here'` with the actual UUID from Step 1:
```sql
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
  'TEST-001',
  'BB1 Blackburn',
  'BB1',
  NOW() + interval '1 day',
  'M1 Manchester',
  'M1',
  NOW() + interval '1 day' + interval '3 hours',
  120,
  'Test marketplace job',
  'your-user-uuid-here'::uuid  -- ✅ Use actual UUID from Step 1
)
RETURNING id, reference, status;
```

---

## Solution 2: Create a Test via Application

Instead of inserting directly via SQL, use the application's job creation form:
1. Log into the XDrive portal
2. Navigate to "Post a Load" or similar
3. Fill in the form with test data
4. Submit the form

This ensures:
- ✅ Proper authentication context (`auth.uid()` works)
- ✅ All required fields are populated
- ✅ RLS policies are respected
- ✅ Triggers and constraints are properly executed

---

## Solution 3: Use a Stored Procedure (Recommended for Testing)

Create a helper function that can be called from the SQL Editor:

```sql
-- Create a test job function
CREATE OR REPLACE FUNCTION public.create_test_job(
  user_email TEXT,
  test_reference TEXT DEFAULT 'TEST-001'
)
RETURNS TABLE (
  job_id UUID,
  job_reference TEXT,
  job_status TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_email;
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
    'BB1 Blackburn',
    'BB1',
    NOW() + interval '1 day',
    'M1 Manchester',
    'M1',
    NOW() + interval '1 day' + interval '3 hours',
    120,
    'Test marketplace job',
    v_user_id
  )
  RETURNING id, reference, status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_test_job TO authenticated;
```

### Usage
```sql
-- Call the function with your email
SELECT * FROM public.create_test_job('your-email@example.com', 'TEST-001');
```

---

## Understanding UUID Format

### Valid UUID Examples
```
550e8400-e29b-41d4-a716-446655440000  ✅ Valid
123e4567-e89b-12d3-a456-426614174000  ✅ Valid
00000000-0000-0000-0000-000000000000  ✅ Valid (nil UUID)
```

### Invalid UUID Examples
```
AICI_PUI_UUID_UL_TAU                   ❌ Not hexadecimal
12345                                  ❌ Too short
not-a-uuid                             ❌ Not hexadecimal
123e4567e89b12d3a456426614174000       ❌ Missing dashes
```

---

## Quick Reference: Get User UUIDs

### Get All Users
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### Get Current User (if authenticated context exists)
```sql
SELECT auth.uid() as my_user_id;
```

### Get User by Email
```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'user@example.com';
```

---

## Verification Queries

After successfully inserting a job, verify it:

```sql
-- 1. Check the job was created
SELECT id, reference, status, created_by, created_at
FROM public.jobs
WHERE reference = 'TEST-001';

-- 2. Verify the creator
SELECT 
  j.id,
  j.reference,
  j.status,
  u.email as created_by_email
FROM public.jobs j
JOIN auth.users u ON u.id = j.created_by
WHERE j.reference = 'TEST-001';

-- 3. Check created_by is not null
SELECT COUNT(*) as jobs_with_null_created_by
FROM public.jobs
WHERE created_by IS NULL;
```

---

## Common Mistakes to Avoid

1. ❌ Using placeholder text as UUID: `'PUT_UUID_HERE'::uuid`, `'UUID_REAL_AICI'::uuid`
2. ❌ Using `auth.uid()` in SQL Editor (no auth context)
3. ❌ Forgetting the `::uuid` cast when using string literals
4. ❌ Using invalid UUID format (must be 32 hex digits with 4 dashes)
5. ❌ Using a valid UUID format but for a non-existent user
6. ❌ Trying to insert with a UUID that doesn't exist in `auth.users` table

---

## Best Practices

1. ✅ Always verify the user exists before inserting
2. ✅ Use stored procedures for complex test data creation
3. ✅ Test job creation through the application UI first
4. ✅ Keep test data queries in version control
5. ✅ Use transactions for test data that should be rolled back

---

## Related Files

- `docs/sql/jobs_verification.sql` - Job table verification queries
- `docs/sql/jobs_test_data.sql` - Helper functions for test data
- `supabase-marketplace-schema.sql` - Jobs table schema definition

---

**Last Updated:** 2026-02-18  
**Status:** ✅ Documented & Verified
