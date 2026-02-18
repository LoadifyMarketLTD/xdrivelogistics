# Schema Fix Guide - "budget column does not exist" Error

## Quick Diagnosis

Run this query in your Supabase SQL Editor:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('budget', 'price', 'cost', 'posted_by_company_id', 'company_id');
```

### What you should see:

✅ **CORRECT SCHEMA:**
```
column_name
-------------------
budget
posted_by_company_id
```

❌ **WRONG SCHEMA:**
```
column_name
-------------------
price
cost
company_id
```

If you see `price` and `cost` instead of `budget`, you deployed the wrong schema file!

---

## The Problem

This repository has **TWO** different database schema files:

| File | Purpose | Status |
|------|---------|--------|
| `supabase-marketplace-schema.sql` | Marketplace/job board features | ✅ **CORRECT - Use this!** |
| `supabase-schema.sql` | Legacy internal operations schema | ❌ **WRONG - Don't use!** |

**What went wrong:**
- Old documentation (DATABASE_SETUP.md) pointed to the wrong file
- Users deployed `supabase-schema.sql` which lacks the `budget` column
- Application code expects `budget` column from marketplace schema
- Result: Runtime errors when creating/viewing jobs

---

## Solution Options

### Option 1: Fresh Start (Recommended if NO data yet)

**Best for:** New projects, development environments, or when you haven't added real data yet.

1. **Drop the existing tables:**
```sql
DROP TABLE IF EXISTS public.job_bids CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
```

2. **Deploy the correct schema:**
   - Open Supabase SQL Editor
   - Copy entire contents of `supabase-marketplace-schema.sql`
   - Run it
   - Wait for "Success. No rows returned"

3. **Verify:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'budget';
-- Should return 'budget'
```

**Pros:** Clean, no migration headaches  
**Cons:** Loses any existing data

---

### Option 2: Migrate Existing Data

**Best for:** Production environments or when you have data to preserve.

1. **Backup your data first!**
```sql
-- Export jobs data
SELECT * FROM public.jobs;
-- Save the results somewhere safe
```

2. **Run the migration script:**
   - Open Supabase SQL Editor
   - Copy entire contents of `migration-fix-jobs-schema.sql`
   - Run it
   - Check for any errors

3. **Verify the migration:**
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('budget', 'posted_by_company_id', 'pickup_location', 'delivery_location')
ORDER BY column_name;

-- Check data was preserved
SELECT COUNT(*) as total_jobs FROM public.jobs;
```

4. **Test the application:**
   - Try creating a new job
   - Check dashboard displays jobs correctly
   - Verify loads page works

**What the migration does:**
- ✅ Renames `company_id` → `posted_by_company_id`
- ✅ Renames `pickup` → `pickup_location`
- ✅ Renames `delivery` → `delivery_location`
- ✅ Adds `budget` column (copies value from `price`)
- ✅ Removes obsolete columns (`price`, `cost`, `job_code`, etc.)
- ✅ Adds marketplace columns (`vehicle_type`, `pallets`, etc.)
- ✅ Updates status values (`pending` → `open`, `delivered` → `completed`)

**Pros:** Keeps your data  
**Cons:** More complex, need to test thoroughly

---

### Option 3: Quick Column Fix (NOT RECOMMENDED)

**Only use if:** You're in a hurry and understand the risks.

```sql
ALTER TABLE public.jobs ADD COLUMN budget NUMERIC;
ALTER TABLE public.jobs RENAME COLUMN company_id TO posted_by_company_id;
ALTER TABLE public.jobs RENAME COLUMN pickup TO pickup_location;
ALTER TABLE public.jobs RENAME COLUMN delivery TO delivery_location;
```

**Warning:** This doesn't remove conflicting columns or update constraints. You may still have issues.

---

## After Fixing

### 1. Update your documentation reference
Make sure you're following the correct schema:
- ✅ Use: `supabase-marketplace-schema.sql`
- ❌ Don't use: `supabase-schema.sql`

### 2. Test these features:
- [ ] Create a new job via UI (`/jobs/new`)
- [ ] View jobs in dashboard (`/dashboard`)
- [ ] View loads/marketplace (`/loads`)
- [ ] Check job details display correctly
- [ ] Verify budget amounts show properly

### 3. Update any custom SQL queries
If you wrote custom queries, update them to use:
- `budget` instead of `price` or `cost`
- `posted_by_company_id` instead of `company_id`
- `pickup_location` instead of `pickup`
- `delivery_location` instead of `delivery`

---

## Common Errors After Migration

### Error: "Foreign key constraint violation"
**Solution:** Make sure your `companies` table exists and has records.

```sql
SELECT COUNT(*) FROM public.companies;
-- Should return at least 1
```

### Error: "RLS policy prevents access"
**Solution:** Check Row Level Security policies:

```sql
-- View current policies
SELECT * FROM pg_policies WHERE tablename = 'jobs';

-- You may need to update policies to use new column names
```

### Jobs not showing in UI
**Solution:** Check your company_id:

```sql
SELECT id FROM public.companies WHERE email = 'your@email.com';
-- Use this ID in your profile
```

---

## Prevention

To avoid this issue in future:

1. **Always** use `supabase-marketplace-schema.sql` for new deployments
2. **Check** DATABASE_SETUP.md points to correct schema
3. **Test** schema after deployment with diagnosis query (top of this file)
4. **Backup** before making schema changes

---

## Support Files

- 📄 `DATABASE_SETUP.md` - Updated setup instructions (now correct)
- 📄 `migration-fix-jobs-schema.sql` - Full migration script
- 📄 `SQL_FIX_SUMMARY.md` - Quick reference for SQL queries
- 📄 `docs/SQL_QUERY_FIX.md` - Detailed SQL troubleshooting
- 📄 `docs/JOBS_TABLE_REFERENCE.md` - Column reference guide

---

## Still Having Issues?

1. Check Supabase logs for detailed error messages
2. Verify all required tables exist (companies, profiles, jobs)
3. Make sure you're using the latest application code
4. Check that environment variables are set correctly
5. Try the fresh start approach if migration fails

---

**Last Updated:** 2026-02-18  
**Issue Fixed:** Column "budget" of relation "jobs" does not exist  
**Root Cause:** Wrong schema file deployed (supabase-schema.sql instead of supabase-marketplace-schema.sql)
