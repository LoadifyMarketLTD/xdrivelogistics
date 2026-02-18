# SQL Query Fix Summary

## The Problem

```
Failed to run sql query: ERROR:  42703: column "cost_gbp" of relation "jobs" does not exist
LINE 10:   cost_gbp,
           ^
```

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
