# Fix: "cannot change name of input parameter" Error

## Error Message
```
Failed to run sql query: ERROR:  42P13: cannot change name of input parameter "_company_id"
HINT:  Use DROP FUNCTION is_company_member(uuid) first.
```

## Problem

When running the database setup SQL, PostgreSQL throws an error when trying to create the `is_company_member` function. This happens because:

1. **An existing function exists** with parameter name `_company_id` (with underscore)
2. **The new SQL tries to create it** with parameter name `p_company_id` (with `p_` prefix)
3. **PostgreSQL doesn't allow parameter name changes** with `CREATE OR REPLACE FUNCTION` alone

## Root Cause

PostgreSQL considers the parameter name as part of the function signature. When you try to change a parameter name using `CREATE OR REPLACE FUNCTION`, it fails with error `42P13`.

From PostgreSQL documentation:
> "CREATE OR REPLACE FUNCTION will not let you change the name or argument types of existing function"

Parameter names are considered part of the "argument types" metadata.

## Solution

Add an explicit `DROP FUNCTION IF EXISTS` before `CREATE OR REPLACE FUNCTION`:

```sql
-- 10) RLS Helper function: "is company member?"
-- FIX: Drop function first to allow parameter name changes
drop function if exists public.is_company_member(uuid);

create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.company_memberships m
    where m.company_id = p_company_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
  or exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and c.created_by = auth.uid()
  );
$$;
```

## Changes Made

**Before (causing error):**
```sql
create or replace function public.is_company_member(p_company_id uuid)
```

**After (fixed):**
```sql
drop function if exists public.is_company_member(uuid);

create or replace function public.is_company_member(p_company_id uuid)
```

## Why This Works

1. `DROP FUNCTION IF EXISTS` safely removes the old function if it exists
2. The `IF EXISTS` clause prevents errors if the function doesn't exist yet
3. Then `CREATE OR REPLACE FUNCTION` creates the new version with the new parameter name
4. This approach is **idempotent** - you can run the script multiple times safely

## Fixed File

The corrected SQL script is now available as:
```
supabase-portal-schema.sql
```

This file includes the fix and can be run multiple times safely (idempotent).

## How to Use

1. Open Supabase SQL Editor
2. Copy the entire contents of `supabase-portal-schema.sql`
3. Run it
4. The script will now complete successfully

## Verification

After running the fixed script, verify the function was created:

```sql
-- Check function exists
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'is_company_member' 
  AND pronamespace = 'public'::regnamespace;

-- Should return:
-- function_name     | arguments
-- ------------------+------------------
-- is_company_member | p_company_id uuid
```

## Additional Notes

### Why Parameter Names Matter

While parameter names don't affect how you call the function (you pass values by position), they are important for:
- **Named parameter calls**: `SELECT is_company_member(p_company_id => 'uuid-here')`
- **Function overloading**: Different parameter names help distinguish similar functions
- **Code readability**: Good parameter names make the function body clearer

### Alternative Solutions

If you prefer to keep the underscore convention:

```sql
drop function if exists public.is_company_member(uuid);

create or replace function public.is_company_member(_company_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.company_memberships m
    where m.company_id = _company_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
  or exists (
    select 1
    from public.companies c
    where c.id = _company_id
      and c.created_by = auth.uid()
  );
$$;
```

Both work equally well. The fix provided uses `p_company_id` as it's a common convention (prefix `p_` for "parameter").

## Related PostgreSQL Documentation

- [CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [DROP FUNCTION](https://www.postgresql.org/docs/current/sql-dropfunction.html)
- [Function Overloading](https://www.postgresql.org/docs/current/xfunc-overload.html)

## Summary

✅ **Issue:** Cannot change function parameter name with CREATE OR REPLACE  
✅ **Fix:** Add `DROP FUNCTION IF EXISTS` before function creation  
✅ **Result:** Script is now idempotent and runs successfully  
✅ **File:** `supabase-portal-schema.sql` (fixed version)
