# FIX: SQL Migration Error - Invalid Enum Value "completed"

## 🔴 Error Message
```
Failed to run sql query: ERROR: 22P02: invalid input value for enum job_status: "completed"
```

## 🔍 Root Cause
The `jobs` table has a `status` column that uses either:
1. A PostgreSQL **ENUM type** that doesn't include "completed" as a valid value, OR
2. A **TEXT column with CHECK constraint** that doesn't include "completed"

The migration tries to set `status = 'completed'` in the `update_job_pod()` function, which fails.

## ✅ Solution

### Step 1: Run Diagnostic Script (OPTIONAL but recommended)
To understand your database configuration, run this in Supabase SQL Editor:

```sql
-- Copy and run: diagnostic-jobs-status.sql
```

This will show you:
- Whether status is an ENUM or TEXT
- What values are currently allowed
- Any CHECK constraints

### Step 2: Run the Fixed Migration
Use the **FIXED** version of the migration which automatically handles both scenarios:

```sql
-- Copy and run: migration-delivery-tracking-FIXED.sql
```

## 📁 Files Provided

### 1. `diagnostic-jobs-status.sql` (OPTIONAL)
- **Purpose**: Diagnose the exact issue with your status column
- **When to use**: If you want to understand what's wrong before fixing
- **Safe**: Read-only queries, won't change anything

### 2. `migration-delivery-tracking-FIXED.sql` (REQUIRED)
- **Purpose**: Fixed migration that handles the enum/constraint issue
- **Changes from original**:
  - Adds Section 0: Auto-fixes the status column before migration
  - Handles both ENUM and TEXT CHECK constraint scenarios
  - Uses `DROP POLICY IF EXISTS` to avoid duplicate policy errors
  - Adds success notification at the end

### 3. `migration-delivery-tracking.sql` (UPDATED)
- **Purpose**: Original migration updated with enum fix
- **Note**: Use the -FIXED version instead for cleaner code

## 🚀 Quick Start

**Just run this in Supabase SQL Editor:**

```sql
-- Copy the entire contents of: migration-delivery-tracking-FIXED.sql
-- Paste into Supabase SQL Editor
-- Click "Run"
```

The script will:
1. ✅ Check if 'completed' exists in the status enum/constraint
2. ✅ Add 'completed' if missing
3. ✅ Create all tracking tables (job_tracking_events, etc.)
4. ✅ Add 60+ new fields to jobs table
5. ✅ Create helper functions
6. ✅ Set up RLS policies
7. ✅ Display success message

## 🔧 What the Fix Does

### For ENUM Types:
```sql
-- If jobs.status uses an ENUM type, the fix adds 'completed':
ALTER TYPE job_status ADD VALUE 'completed';
```

### For TEXT with CHECK Constraint:
```sql
-- If jobs.status uses TEXT, the fix updates the constraint:
ALTER TABLE public.jobs DROP CONSTRAINT old_constraint;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('open', 'assigned', 'in-transit', 'completed', 'cancelled'));
```

## ⚠️ Important Notes

1. **Idempotent**: The fixed migration can be run multiple times safely
2. **No Data Loss**: Only adds/modifies schema, doesn't delete data
3. **Backwards Compatible**: Existing status values remain valid
4. **Complete Solution**: Includes all original migration features

## 📊 What Gets Created

### Tables (5 new):
- `job_tracking_events` - Event timeline
- `job_documents` - POD, invoices, photos
- `job_notes` - Job notes and comments
- `job_feedback` - Ratings and reviews
- `job_invoices` - Invoice tracking

### Fields Added to jobs (60+):
- Tracking timestamps (on_my_way, loaded_at, etc.)
- POD fields (received_by, delivery_status, etc.)
- Payment fields (payment_terms, smartpay_enabled, agreed_rate)
- Full addresses (pickup/delivery with postcodes)
- Dimensions (length_cm, width_cm, height_cm)
- References (vehicle_ref, your_ref, cust_ref)

### Functions (3 new):
- `add_tracking_event()` - Add timeline events
- `update_job_pod()` - Update proof of delivery
- `update_job_status()` - Change job status with tracking

### Views (1 new):
- `jobs_with_tracking` - Jobs with all tracking info

### Security:
- RLS policies on all new tables
- Company-scoped access control

## 🆘 Still Having Issues?

If you still get errors after running the fixed migration:

1. **Check if jobs table exists:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'jobs' AND table_schema = 'public';
   ```

2. **Check status column type:**
   ```sql
   SELECT data_type, udt_name 
   FROM information_schema.columns 
   WHERE table_name = 'jobs' AND column_name = 'status';
   ```

3. **Manual fix for persistent ENUM:**
   ```sql
   -- If the enum type is named something else, adjust this:
   ALTER TYPE your_enum_name ADD VALUE IF NOT EXISTS 'completed';
   ```

## 📝 Summary

**Problem**: Migration failed because 'completed' wasn't a valid status value  
**Solution**: Run `migration-delivery-tracking-FIXED.sql`  
**Result**: Full delivery tracking system with all features working  

---

**Need Help?** Check the diagnostic script output or contact support with the results.
