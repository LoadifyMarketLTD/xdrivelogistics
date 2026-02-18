# SQL Query Fix - Jobs Table Insert

## Problem

The SQL query was failing with the following error:

```
ERROR: 42703: column "cost_gbp" of relation "jobs" does not exist
LINE 10: cost_gbp,
```

## Root Cause

The SQL query was using column names that don't exist in the actual database schema. The application uses the **marketplace schema** (`supabase-marketplace-schema.sql`), which has a different structure than what was assumed in the original query.

### Original Query (INCORRECT)

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
  cost_gbp,
  profit_gbp,
  created_by
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

### Issues with Original Query

1. **`reference`** - Column doesn't exist in marketplace schema
2. **`pickup_postcode`** - Column doesn't exist (pickup location includes postcode in the text)
3. **`delivery_postcode`** - Column doesn't exist (delivery location includes postcode in the text)
4. **`price_gbp`** - Column doesn't exist (use `budget` instead)
5. **`cost_gbp`** - Column doesn't exist (not tracked in marketplace schema)
6. **`profit_gbp`** - Column doesn't exist (not tracked in marketplace schema)
7. **`created_by`** - Column doesn't exist (use `posted_by_company_id` instead)

## Actual Jobs Table Schema

Based on `supabase-marketplace-schema.sql`, the `jobs` table has these columns:

```sql
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posted_by_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-transit', 'completed', 'cancelled')),
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  pickup_datetime TIMESTAMP WITH TIME ZONE,
  delivery_datetime TIMESTAMP WITH TIME ZONE,
  vehicle_type TEXT,
  load_details TEXT,
  pallets INTEGER,
  weight_kg NUMERIC,
  budget NUMERIC,
  assigned_company_id UUID REFERENCES public.companies(id),
  accepted_bid_id UUID
);
```

## Corrected Query

Here's the corrected SQL query that matches the actual schema:

```sql
-- First, get your company_id (replace with actual company ID or use a query to get it)
-- You can get your company_id by running:
-- SELECT id FROM public.companies WHERE email = 'your-email@example.com';

INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  pickup_datetime,
  delivery_location,
  delivery_datetime,
  budget,
  vehicle_type,
  load_details,
  status
) VALUES (
  'YOUR_COMPANY_UUID_HERE',  -- Replace with actual company UUID
  'BB1 Blackburn',
  NOW() + interval '1 day',
  'M1 Manchester',
  NOW() + interval '1 day' + interval '3 hours',
  120,  -- Budget in GBP
  'van',  -- Optional: specify vehicle type
  'Test load - 1 pallet, 50kg',  -- Optional: load details
  'open'  -- Status (defaults to 'open' if not specified)
)
RETURNING id, status, created_at;
```

## Alternative: Using Auth Context

If you want to automatically use the logged-in user's company:

```sql
-- First, ensure you have a company_id in your profile
-- This query gets the company_id from the current authenticated user

WITH user_company AS (
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
)
INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  pickup_datetime,
  delivery_location,
  delivery_datetime,
  budget,
  vehicle_type,
  load_details
) 
SELECT 
  company_id,
  'BB1 Blackburn',
  NOW() + interval '1 day',
  'M1 Manchester',
  NOW() + interval '1 day' + interval '3 hours',
  120,
  'van',
  'Test load - 1 pallet, 50kg'
FROM user_company
WHERE company_id IS NOT NULL
RETURNING id, status, created_at;
```

## Notes

1. **No Price/Cost/Profit Tracking**: The marketplace schema focuses on `budget` (what the customer is willing to pay). Individual cost and profit tracking is not part of the jobs table in this schema.

2. **No Reference Column**: The marketplace schema uses UUID `id` as the primary identifier. If you need human-readable references, consider adding them to the `load_details` field or create a separate reference system.

3. **Postcode Embedded in Location**: The schema stores full location text (e.g., "BB1 Blackburn") instead of separate address and postcode fields. Include the postcode in the location text.

4. **Company Association**: The `posted_by_company_id` is required and must reference an existing company in the `companies` table.

## Getting Your Company ID

To find your company ID, run:

```sql
-- If you know your company email:
SELECT id, name, email FROM public.companies WHERE email = 'your-company@example.com';

-- Or if you're logged in and have a profile:
SELECT c.id, c.name, c.email 
FROM public.companies c
JOIN public.profiles p ON p.company_id = c.id
WHERE p.id = auth.uid();
```

## Testing the Corrected Query

1. First get your company ID using one of the queries above
2. Replace `'YOUR_COMPANY_UUID_HERE'` with your actual company UUID
3. Run the corrected INSERT query
4. Verify the job was created by checking:

```sql
SELECT * FROM public.jobs WHERE posted_by_company_id = 'YOUR_COMPANY_UUID';
```

## Summary

The key changes needed:
- Use `posted_by_company_id` instead of `created_by`
- Use `budget` instead of `price_gbp`
- Remove `cost_gbp` and `profit_gbp` (not in schema)
- Remove `reference`, `pickup_postcode`, and `delivery_postcode` (not in schema)
- Include postcode information within the location text fields
- Use proper UUID for company reference
