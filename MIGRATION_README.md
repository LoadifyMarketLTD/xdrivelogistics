# Database Migration Instructions

## Overview
This migration adds the Company Settings flow with extended company fields and fixes the onboarding loop bug.

## Changes Included

### 1. Database Schema Changes
- Added new columns to `companies` table:
  - `vat_number` (TEXT)
  - `company_number` (TEXT)
  - `address_line1` (TEXT)
  - `address_line2` (TEXT)
  - `city` (TEXT)
  - `postcode` (TEXT)
  - `country` (TEXT)
- Removed deprecated `address` column

### 2. RPC Function Update
- Updated `create_company` function signature:
  - **Old**: `create_company(company_name TEXT)`
  - **New**: `create_company(company_name TEXT, phone TEXT DEFAULT NULL)`
- Function now accepts phone number during company creation
- Returns company UUID properly

### 3. RLS Policy Updates
- Changed policies to use `created_by` column directly instead of profile-based checks
- Added UPDATE policy for company owners

## How to Apply This Migration

### Option 1: Using Supabase SQL Editor (Recommended)
1. Log in to your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `migration-company-settings.sql`
4. Paste into a new query
5. Click **Run** to execute the migration
6. Verify success (should see "Success. No rows returned")

### Option 2: Using Supabase CLI
```bash
# If you have supabase CLI installed
supabase db push migration-company-settings.sql
```

## Verification Steps

After running the migration, verify it worked:

1. **Check table structure**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

You should see all new columns (vat_number, company_number, address_line1, etc.)

2. **Check RPC function**:
```sql
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_company'
AND routine_schema = 'public';
```

Should show the function accepts 2 parameters: company_name and phone

3. **Check RLS policies**:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'companies';
```

Should show three policies: companies_select_owner, companies_insert_owner, companies_update_owner

## Frontend Changes Included

### 1. Fixed Onboarding Loop Bug
- **File**: `app/onboarding/company/page.tsx`
- **Changes**:
  - Now passes `phone` parameter to RPC function
  - Removed workaround phone update logic
  - Added validation for null company ID

### 2. Fixed AuthContext 406 Errors
- **File**: `lib/AuthContext.tsx`
- **Changes**:
  - Changed `.single()` to `.maybeSingle()` to prevent errors when profile doesn't exist
  - Gracefully handles missing profiles

### 3. New Company Settings Page
- **File**: `app/company/settings/page.tsx`
- **Features**:
  - Edit all company fields
  - Fetches company by `created_by` (owner)
  - Auto-saves with success notification
  - Full validation and error handling

### 4. Updated Dashboard
- **File**: `app/dashboard/page.tsx`
- **Changes**:
  - Added "Company Settings" button in Quick Actions

## Testing the Changes

### 1. Test Onboarding
1. Create a new user account
2. After signup, you should be redirected to `/onboarding/company`
3. Fill in Company Name and Phone Number
4. Click "Create Company & Continue"
5. Should successfully redirect to `/dashboard` without looping back

### 2. Test Company Settings
1. From dashboard, click "Company Settings" button
2. Form should be pre-filled with your company data
3. Update any fields (email, VAT number, address, etc.)
4. Click "Save Changes"
5. Should see green success message
6. Refresh page - changes should persist

### 3. Test RLS Security
Try to access another user's company:
```javascript
// Should fail with permission denied
const { data, error } = await supabase
  .from('companies')
  .select('*')
  .eq('id', 'some-other-company-id')
  .single()
```

## Rollback Instructions

If you need to rollback this migration:

```sql
-- 1. Rollback RLS policies
DROP POLICY IF EXISTS "companies_select_owner" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_owner" ON public.companies;
DROP POLICY IF EXISTS "companies_update_owner" ON public.companies;

-- Restore old policies (adjust as needed for your original setup)
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 2. Rollback RPC function
DROP FUNCTION IF EXISTS public.create_company(text, text);
CREATE OR REPLACE FUNCTION public.create_company(company_name TEXT)
RETURNS UUID AS $$
-- ... original function code ...
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Rollback table structure (WARNING: This will lose data in new columns!)
ALTER TABLE public.companies
DROP COLUMN IF EXISTS vat_number,
DROP COLUMN IF EXISTS company_number,
DROP COLUMN IF EXISTS address_line1,
DROP COLUMN IF EXISTS address_line2,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS postcode,
DROP COLUMN IF EXISTS country,
ADD COLUMN IF NOT EXISTS address TEXT;
```

## Support

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify your PostgreSQL version is compatible (9.5+)
3. Ensure you have the required permissions to modify tables and functions
4. Review the frontend console for any JavaScript errors

## Notes

- **Backward Compatibility**: The phone parameter in `create_company` has a DEFAULT NULL, so old code without phone will still work
- **Data Preservation**: Existing company data is preserved; new columns are nullable
- **Performance**: All queries use indexed columns (created_by) for optimal performance
