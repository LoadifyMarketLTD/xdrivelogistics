# SQL Query Fix Summary

## The Problem

There are TWO possible errors you might encounter:

### Error 1: Wrong Column Names
```
Failed to run sql query: ERROR:  42703: column "cost_gbp" of relation "jobs" does not exist
```

### Error 2: Missing Budget Column
```
Failed to run sql query: ERROR:  42703: column "budget" of relation "jobs" does not exist
```

## Root Cause

**You deployed the WRONG schema file!**

This repository has TWO different schema files:

| File | Status | Has budget? | Compatible? |
|------|--------|-------------|-------------|
| `supabase-marketplace-schema.sql` | ✅ CORRECT | ✅ Yes | ✅ Works with app |
| `supabase-schema.sql` | ❌ WRONG | ❌ No (has price/cost) | ❌ Breaks app |

**If you see "budget does not exist":** You deployed `supabase-schema.sql` instead of `supabase-marketplace-schema.sql`

**Solution Options:**
1. **Fresh start:** Drop tables and deploy correct schema (if no data yet)
2. **Migrate:** Run `migration-fix-jobs-schema.sql` to convert existing data
3. **Manual fix:** Add missing columns (see migration script)

## Visual Comparison

### ❌ BEFORE (Incorrect Query)

```sql
INSERT INTO public.jobs (
  reference,              -- ❌ Column doesn't exist
  pickup_location,        -- ✅ Correct
  pickup_postcode,        -- ❌ Column doesn't exist
  pickup_datetime,        -- ✅ Correct
  delivery_location,      -- ✅ Correct
  delivery_postcode,      -- ❌ Column doesn't exist
  delivery_datetime,      -- ✅ Correct
  price_gbp,             -- ❌ Should be "budget"
  cost_gbp,              -- ❌ Column doesn't exist
  profit_gbp,            -- ❌ Column doesn't exist
  created_by             -- ❌ Should be "posted_by_company_id"
) VALUES (
  'TEST-001',
  'BB1 Blackburn',
  'BB1',
  NOW() + interval '1 day',
  'M1 Manchester',
  'M1',
  NOW() + interval '1 day' + interval '3 hours',
  120, 80, 40,
  auth.uid()
)
RETURNING id, reference, status;
```

**Issues:** 6 incorrect columns out of 11 (55% error rate!)

---

### ✅ AFTER (Corrected Query)

```sql
INSERT INTO public.jobs (
  posted_by_company_id,   -- ✅ Correct company reference
  pickup_location,        -- ✅ Includes postcode in text
  pickup_datetime,        -- ✅ Timestamp with timezone
  delivery_location,      -- ✅ Includes postcode in text
  delivery_datetime,      -- ✅ Timestamp with timezone
  budget,                 -- ✅ Single budget field (not price/cost/profit)
  vehicle_type,           -- ✅ Optional vehicle specification
  load_details           -- ✅ Optional load description
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- Your company UUID
  'BB1 Blackburn',        -- Postcode embedded in location
  NOW() + interval '1 day',
  'M1 Manchester',        -- Postcode embedded in location
  NOW() + interval '1 day' + interval '3 hours',
  120.00,                 -- Budget in GBP
  'van',                  -- Vehicle type
  'Test delivery'         -- Load details
)
RETURNING id, status, created_at;
```

**Result:** 100% correct! Query runs successfully ✅

---

## Key Changes Made

| Issue | Original | Corrected | Why? |
|-------|----------|-----------|------|
| Reference tracking | `reference` | `id` (UUID) | No reference column; UUID is primary key |
| Postcode fields | `pickup_postcode`, `delivery_postcode` | _(embedded in location)_ | No separate postcode columns |
| Pricing model | `price_gbp`, `cost_gbp`, `profit_gbp` | `budget` | Marketplace tracks only budget, not cost/profit |
| User reference | `created_by` | `posted_by_company_id` | Must use company UUID, not user ID |

## How to Get Your Company UUID

```sql
-- Method 1: By email
SELECT id FROM public.companies WHERE email = 'your@email.com';

-- Method 2: By authenticated user
SELECT company_id FROM public.profiles WHERE id = auth.uid();
```

## Testing the Fix

1. Get your company UUID (run query above)
2. Replace `'a1b2c3d4-e5f6-7890-abcd-ef1234567890'` with your UUID
3. Run the corrected INSERT query
4. Verify: `SELECT * FROM public.jobs ORDER BY created_at DESC LIMIT 1;`

## Documentation Files

📄 **Full Guide:** `docs/SQL_QUERY_FIX.md`
📄 **Quick Reference:** `docs/JOBS_TABLE_REFERENCE.md`
📄 **SQL Examples:** `docs/sql/jobs_insert_examples.sql`

## Schema Reference

The application uses **supabase-marketplace-schema.sql** which focuses on marketplace/job board functionality, not internal company operations.

**Available columns in jobs table:**
- `id` (UUID, auto)
- `created_at` (timestamp, auto)
- `updated_at` (timestamp, auto)
- `posted_by_company_id` (UUID, required) ⭐
- `status` (text, default: 'open')
- `pickup_location` (text, required) ⭐
- `delivery_location` (text, required) ⭐
- `pickup_datetime` (timestamp)
- `delivery_datetime` (timestamp)
- `vehicle_type` (text)
- `load_details` (text)
- `pallets` (integer)
- `weight_kg` (numeric)
- `budget` (numeric) ⭐
- `assigned_company_id` (UUID)
- `accepted_bid_id` (UUID)

⭐ = Most commonly used fields

---

## If You Deployed the Wrong Schema

### Symptoms:
- Error: `column "budget" of relation "jobs" does not exist`
- Error: `column "posted_by_company_id" of relation "jobs" does not exist`
- Application can't insert or query jobs

### Quick Check:
Run this query in Supabase SQL Editor:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('budget', 'price', 'cost', 'posted_by_company_id', 'company_id');
```

**If you see:**
- `price` and `cost` but NO `budget` → You have the wrong schema ❌
- `budget` and `posted_by_company_id` → You have the correct schema ✅

### Solution 1: Fresh Start (No Data Yet)
```sql
-- Drop everything and start fresh
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.job_bids CASCADE;

-- Then run the entire supabase-marketplace-schema.sql file
```

### Solution 2: Migrate Existing Data
Use the migration script:
```sql
-- Run this file in Supabase SQL Editor:
-- migration-fix-jobs-schema.sql
```

The migration will:
1. Rename `company_id` → `posted_by_company_id`
2. Rename `pickup` → `pickup_location`
3. Rename `delivery` → `delivery_location`
4. Add `budget` column and copy from `price`
5. Drop unused columns (`price`, `cost`, `job_code`, etc.)
6. Add marketplace columns (`vehicle_type`, `load_details`, etc.)
7. Update status constraints to match marketplace schema

### Solution 3: Manual Column Add
If you just need the budget column:
```sql
ALTER TABLE public.jobs ADD COLUMN budget NUMERIC;
```

### After Migration:
Test that the application works:
1. Try creating a new job via the UI
2. Check that jobs display correctly in dashboard
3. Verify job details show properly
4. Test the loads/marketplace page

---

## Updated Documentation

- ✅ **DATABASE_SETUP.md** - Now correctly points to marketplace schema
- ✅ **migration-fix-jobs-schema.sql** - Migration script for existing databases
- ✅ **docs/SQL_QUERY_FIX.md** - Updated with schema warning
- ✅ **SQL_FIX_SUMMARY.md** - This file, now includes schema fix

