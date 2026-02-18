# Jobs Table Column Reference - Quick Guide

## Column Mapping (Old vs New)

This guide shows the mapping between commonly expected column names and the actual column names in the marketplace schema.

| ❌ INCORRECT (Don't Use) | ✅ CORRECT (Use This) | Type | Notes |
|--------------------------|----------------------|------|-------|
| `reference` | `id` | UUID | Auto-generated UUID |
| `pickup` | `pickup_location` | TEXT | Required - Full address with postcode |
| `pickup_postcode` | _(embedded in pickup_location)_ | - | Include postcode in location text |
| `pickup_address` | `pickup_location` | TEXT | Single field for full address |
| `delivery` | `delivery_location` | TEXT | Required - Full address with postcode |
| `delivery_postcode` | _(embedded in delivery_location)_ | - | Include postcode in location text |
| `delivery_address` | `delivery_location` | TEXT | Single field for full address |
| `price` | `budget` | NUMERIC | Optional |
| `price_gbp` | `budget` | NUMERIC | Optional |
| `cost` | _(not tracked)_ | - | Not in marketplace schema |
| `cost_gbp` | _(not tracked)_ | - | Not in marketplace schema |
| `profit` | _(not tracked)_ | - | Not in marketplace schema |
| `profit_gbp` | _(not tracked)_ | - | Not in marketplace schema |
| `created_by` | `posted_by_company_id` | UUID | Required - FK to companies |
| `company_id` | `posted_by_company_id` | UUID | Required - FK to companies |
| `customer_name` | _(not tracked)_ | - | Not in marketplace schema |
| `customer_email` | _(not tracked)_ | - | Not in marketplace schema |
| `customer_phone` | _(not tracked)_ | - | Not in marketplace schema |

## All Available Columns in Jobs Table

| Column Name | Type | Required | Default | Description |
|-------------|------|----------|---------|-------------|
| `id` | UUID | Auto | uuid_generate_v4() | Primary key |
| `created_at` | TIMESTAMP WITH TIME ZONE | Auto | NOW() | When job was created |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Auto | NOW() | Last update time |
| `posted_by_company_id` | UUID | ✅ Yes | - | Company that posted the job |
| `status` | TEXT | ✅ Yes | 'open' | One of: open, assigned, in-transit, completed, cancelled |
| `pickup_location` | TEXT | ✅ Yes | - | Full pickup address |
| `delivery_location` | TEXT | ✅ Yes | - | Full delivery address |
| `pickup_datetime` | TIMESTAMP WITH TIME ZONE | No | - | Scheduled pickup time |
| `delivery_datetime` | TIMESTAMP WITH TIME ZONE | No | - | Scheduled delivery time |
| `vehicle_type` | TEXT | No | - | Type of vehicle needed |
| `load_details` | TEXT | No | - | Description of the load |
| `pallets` | INTEGER | No | - | Number of pallets |
| `weight_kg` | NUMERIC | No | - | Weight in kilograms |
| `budget` | NUMERIC | No | - | Budget amount in GBP |
| `assigned_company_id` | UUID | No | - | Company assigned to the job |
| `accepted_bid_id` | UUID | No | - | ID of accepted bid |

## Status Values

The `status` column must be one of these values:

- `open` - Default status for new jobs
- `assigned` - Job has been assigned to a company
- `in-transit` - Job is currently being delivered
- `completed` - Job has been completed
- `cancelled` - Job was cancelled

## Common Mistakes

### ❌ Don't Do This:

```sql
INSERT INTO public.jobs (
  reference,          -- Column doesn't exist!
  pickup,            -- Wrong name!
  delivery,          -- Wrong name!
  price_gbp,         -- Wrong name!
  created_by         -- Wrong name!
) VALUES (...)
```

### ✅ Do This Instead:

```sql
INSERT INTO public.jobs (
  posted_by_company_id,  -- Correct!
  pickup_location,       -- Correct!
  delivery_location,     -- Correct!
  budget,               -- Correct!
  status                -- Optional, defaults to 'open'
) VALUES (...)
```

## Example: Complete Insert

```sql
INSERT INTO public.jobs (
  posted_by_company_id,
  pickup_location,
  pickup_datetime,
  delivery_location,
  delivery_datetime,
  budget,
  vehicle_type,
  load_details,
  pallets,
  weight_kg,
  status
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- Your company UUID
  'BB1 Blackburn, UK',                      -- Full address with postcode
  '2026-02-20 09:00:00+00',                -- Pickup date/time
  'M1 Manchester, UK',                      -- Full address with postcode
  '2026-02-20 14:00:00+00',                -- Delivery date/time
  120.00,                                   -- Budget in GBP
  'van',                                    -- Vehicle type
  'Standard delivery - 1 pallet, fragile',  -- Load details
  1,                                        -- Number of pallets
  50.0,                                     -- Weight in kg
  'open'                                    -- Status
)
RETURNING id, status, created_at;
```

## Schema Differences: Internal vs Marketplace

The repository contains **two different schemas**:

### 1. Internal Schema (`supabase-schema.sql`)
- Used for internal company operations
- Has columns: `price`, `cost`, `job_code`, `customer_name`, etc.
- Links jobs to `company_id` directly

### 2. Marketplace Schema (`supabase-marketplace-schema.sql`) ⭐ **ACTIVE**
- Used for the marketplace/public job board
- Has columns: `budget`, `posted_by_company_id`, `assigned_company_id`
- No customer details or cost tracking
- Focus on job postings and bidding

**The application currently uses the MARKETPLACE schema**, so always refer to that schema when writing queries.

## Quick Reference: Required Fields Only

Minimum required fields for a valid insert:

```sql
INSERT INTO public.jobs (
  posted_by_company_id,  -- Required: UUID of company posting job
  pickup_location,        -- Required: TEXT, full pickup address
  delivery_location       -- Required: TEXT, full delivery address
) VALUES (
  'your-company-uuid',
  'London SW1A 1AA, UK',
  'Manchester M1 1AE, UK'
)
RETURNING id;
```

All other fields are optional and have either defaults or can be NULL.

## Getting Your Company UUID

```sql
-- Method 1: By email
SELECT id FROM public.companies WHERE email = 'your@email.com';

-- Method 2: By authenticated user
SELECT company_id FROM public.profiles WHERE id = auth.uid();
```

## See Also

- Full documentation: `docs/SQL_QUERY_FIX.md`
- Working examples: `docs/sql/jobs_insert_examples.sql`
- Marketplace schema: `supabase-marketplace-schema.sql`
