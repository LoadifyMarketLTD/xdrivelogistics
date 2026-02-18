# Database Migration: Delivery Tracking System

## Quick Start

### 1. Run the Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the entire contents of `migration-delivery-tracking.sql`
4. Paste into SQL Editor
5. Click **Run**

### 2. Verify Migration

After running the migration, verify these tables exist:

```sql
-- Check all new tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'job_tracking_events',
    'proof_of_delivery',
    'job_documents',
    'job_notes',
    'job_feedback',
    'job_invoices'
  );
```

Expected result: All 6 tables should be listed.

### 3. Verify New Columns

```sql
-- Check jobs table has new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN (
    'pickup_postcode',
    'delivery_postcode',
    'distance_miles',
    'agreed_rate',
    'payment_terms',
    'smartpay_enabled',
    'load_id'
  );
```

Expected result: All 7 columns should be listed.

### 4. Test Helper Functions

```sql
-- Test the tracking event function
SELECT record_tracking_event(
  (SELECT id FROM jobs LIMIT 1),
  'on_my_way_to_pickup',
  'Test event'
);
```

Expected result: Returns a UUID (the event ID).

## What Gets Created

### Tables
- ✅ `job_tracking_events` - Timeline of delivery events
- ✅ `proof_of_delivery` - POD records
- ✅ `job_documents` - Document attachments
- ✅ `job_notes` - Communication history
- ✅ `job_feedback` - Ratings and reviews
- ✅ `job_invoices` - Invoice management

### Job Table Extensions
- ✅ 30+ new columns for detailed tracking
- ✅ Location details (postcodes, cities)
- ✅ Payment information
- ✅ Customer references
- ✅ Vehicle and driver details

### Security
- ✅ RLS policies for all tables
- ✅ Company-based access control
- ✅ Internal/external note separation

### Functions
- ✅ `record_tracking_event()` - Log tracking events
- ✅ `create_proof_of_delivery()` - Record POD
- ✅ `generate_load_id()` - Auto-generate load IDs
- ✅ `generate_invoice_number()` - Auto-generate invoice numbers

### Views
- ✅ `jobs_with_tracking` - Complete job view with all related data

## Migration is Safe

The migration script uses:
- `IF NOT EXISTS` clauses - Won't break if run multiple times
- `ALTER TABLE ADD COLUMN IF NOT EXISTS` - Safe to re-run
- `DROP TRIGGER IF EXISTS` - Prevents duplicates

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Drop new tables (WARNING: This deletes data!)
DROP TABLE IF EXISTS job_tracking_events CASCADE;
DROP TABLE IF EXISTS proof_of_delivery CASCADE;
DROP TABLE IF EXISTS job_documents CASCADE;
DROP TABLE IF EXISTS job_notes CASCADE;
DROP TABLE IF EXISTS job_feedback CASCADE;
DROP TABLE IF EXISTS job_invoices CASCADE;

-- Drop added columns from jobs table
ALTER TABLE jobs 
  DROP COLUMN IF EXISTS pickup_address_line1,
  DROP COLUMN IF EXISTS pickup_postcode,
  DROP COLUMN IF EXISTS pickup_city,
  DROP COLUMN IF EXISTS delivery_address_line1,
  DROP COLUMN IF EXISTS delivery_postcode,
  DROP COLUMN IF EXISTS delivery_city,
  DROP COLUMN IF EXISTS distance_miles,
  DROP COLUMN IF EXISTS packaging,
  DROP COLUMN IF EXISTS dimensions,
  DROP COLUMN IF EXISTS requested_vehicle_type,
  DROP COLUMN IF EXISTS booked_by_company_name,
  DROP COLUMN IF EXISTS booked_by_company_ref,
  DROP COLUMN IF EXISTS booked_by_phone,
  DROP COLUMN IF EXISTS load_id,
  DROP COLUMN IF EXISTS agreed_rate,
  DROP COLUMN IF EXISTS payment_terms,
  DROP COLUMN IF EXISTS smartpay_enabled,
  DROP COLUMN IF EXISTS your_ref,
  DROP COLUMN IF EXISTS cust_ref,
  DROP COLUMN IF EXISTS items,
  DROP COLUMN IF EXISTS vehicle_ref,
  DROP COLUMN IF EXISTS assigned_driver_id,
  DROP COLUMN IF EXISTS completed_by_name,
  DROP COLUMN IF EXISTS completed_at,
  DROP COLUMN IF EXISTS load_notes,
  DROP COLUMN IF EXISTS pod_required;

-- Drop functions
DROP FUNCTION IF EXISTS record_tracking_event CASCADE;
DROP FUNCTION IF EXISTS create_proof_of_delivery CASCADE;
DROP FUNCTION IF EXISTS generate_load_id CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS load_id_seq CASCADE;
DROP SEQUENCE IF EXISTS invoice_number_seq CASCADE;

-- Drop view
DROP VIEW IF EXISTS jobs_with_tracking CASCADE;
```

## After Migration

### Update Your Application

1. **TypeScript types** are already updated in `lib/types.ts`
2. **Job detail page** is created at `app/(portal)/loads/[id]/page.tsx`
3. **Documentation** available in `DELIVERY_TRACKING_IMPLEMENTATION.md`

### Start Using New Features

The system is ready to use immediately after migration:

1. **View job details** - Navigate to `/loads/[job-id]`
2. **Record tracking events** - Use `record_tracking_event()` function
3. **Create POD** - Use `create_proof_of_delivery()` function
4. **Upload documents** - Insert into `job_documents` table
5. **Add notes** - Insert into `job_notes` table

## Sample Data (Optional)

To test the system with sample data:

```sql
-- Update an existing job with extended fields
UPDATE jobs 
SET 
  pickup_postcode = 'BB1 5QB',
  pickup_city = 'BLACKBURN',
  delivery_postcode = 'CH62 4SQ',
  delivery_city = 'BROMBOROUGH',
  distance_miles = 50.3,
  agreed_rate = 45.00,
  payment_terms = '30 Days (End Of Month)',
  smartpay_enabled = true,
  load_notes = 'Test load with all tracking features'
WHERE id = (SELECT id FROM jobs LIMIT 1);

-- Add a tracking event
SELECT record_tracking_event(
  (SELECT id FROM jobs LIMIT 1),
  'on_my_way_to_pickup',
  'Starting journey to pickup location'
);

-- Add POD
SELECT create_proof_of_delivery(
  (SELECT id FROM jobs LIMIT 1),
  'John Doe',
  'Reception',
  2,
  'Completed Delivery',
  'Delivery completed successfully'
);
```

## Troubleshooting

### Error: "relation already exists"
- **Solution:** The table already exists. This is OK - the migration is idempotent.

### Error: "column already exists"
- **Solution:** The column was already added. This is OK - the migration uses IF NOT EXISTS.

### Error: "permission denied"
- **Solution:** Make sure you're running as a superuser in Supabase SQL Editor.

### RLS Policies Not Working
- **Check:** Run `SELECT * FROM pg_policies WHERE tablename LIKE 'job%';` to verify policies exist.

## Need Help?

1. Check `DELIVERY_TRACKING_IMPLEMENTATION.md` for complete documentation
2. Review the migration SQL file for detailed comments
3. Look at `lib/types.ts` for TypeScript type definitions
4. See `app/(portal)/loads/[id]/page.tsx` for usage examples

---

**Ready to migrate?** Just copy `migration-delivery-tracking.sql` into Supabase SQL Editor and run it!
