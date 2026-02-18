# Invoice System SQL Scripts

This directory contains SQL scripts for setting up the invoice system in Supabase.

## ⚠️ IMPORTANT: How to Run These Scripts

**Always copy SQL directly from the actual `.sql` files, NOT from PR descriptions or documentation!**

## Available Scripts

### 1. INVOICE_SQL_QUICK.sql ⭐ **Start Here**

**Purpose**: Quick setup for invoice system  
**File**: [`INVOICE_SQL_QUICK.sql`](./INVOICE_SQL_QUICK.sql)

**Features**:
- ✅ Safe to run multiple times (uses `IF NOT EXISTS`)
- ✅ Idempotent operations
- ✅ Bilingual documentation (EN/RO)
- ✅ Auto-generates invoice numbers (INV-2026-1001, etc.)
- ✅ Row Level Security (RLS) enabled

**How to use**:
```bash
1. Open Supabase SQL Editor
2. Copy contents from INVOICE_SQL_QUICK.sql file
3. Paste into SQL Editor
4. Run the query
```

**Prerequisites**:
- ⚠️ Tables `companies` and `jobs` must already exist
- ⚠️ Table `profiles` must have a `company_id` column

### 2. INVOICE_SQL_WITH_CHECKS.sql

**Purpose**: Complete setup with automated prerequisite checks  
**File**: [`INVOICE_SQL_WITH_CHECKS.sql`](./INVOICE_SQL_WITH_CHECKS.sql)

**Features**:
- All features from INVOICE_SQL_QUICK.sql
- Automated prerequisite validation
- Detailed error messages if prerequisites are missing
- Recommended for production deployments

### 3. CHECK_PREREQUISITES.sql

**Purpose**: Verify prerequisites before running invoice setup  
**File**: [`CHECK_PREREQUISITES.sql`](./CHECK_PREREQUISITES.sql)

**Use this to**:
- Check if required tables exist
- Verify table structure
- Validate permissions
- Troubleshoot setup issues

## What Gets Created

When you run the invoice SQL scripts, the following will be created:

### 1. Invoices Table
- Stores invoice data
- Links to companies and jobs
- Tracks invoice status (pending, sent, paid, overdue, cancelled)
- Auto-generates unique invoice numbers

### 2. Invoice Number Sequence
- Generates sequential invoice numbers
- Format: `INV-YYYY-NNNN` (e.g., INV-2026-1001)

### 3. Auto-numbering Trigger
- Automatically assigns invoice numbers on insert
- Trigger name: `set_invoice_number`

### 4. Database Indexes
- `idx_invoices_company_id` - Fast lookup by company
- `idx_invoices_job_id` - Fast lookup by job
- `idx_invoices_status` - Fast lookup by status

### 5. Row Level Security Policies
- Users can only view invoices from their company
- Users can only manage invoices from their company
- Based on `company_id` in user's profile

## Common Errors and Solutions

### Error: `syntax error at or near "["`

**Cause**: You copied SQL from a PR description or documentation that contained placeholder text like `[Complete SQL code...]`

**Solution**: 
1. ❌ Don't copy from PR descriptions
2. ✅ Copy directly from the `.sql` files in this repository

### Error: `relation "companies" does not exist`

**Cause**: Required prerequisite tables are missing

**Solution**:
1. Run `CHECK_PREREQUISITES.sql` to see what's missing
2. Create the required tables first
3. Then run the invoice SQL scripts

### Error: `column "company_id" does not exist`

**Cause**: The `profiles` table doesn't have a `company_id` column

**Solution**:
1. Add `company_id` column to profiles table
2. Link users to their companies
3. Then run the invoice SQL scripts

## File Versions

- **QUICK**: Minimal, fast setup (recommended for most users)
- **WITH_CHECKS**: Includes prerequisite validation (recommended for production)
- **SCHEMA**: Alternative table structure (if you need customization)

## Need Help?

1. Check the prerequisites with `CHECK_PREREQUISITES.sql`
2. Read the comments in each SQL file
3. Ensure you're copying from actual `.sql` files, not documentation
4. Check that required tables (`companies`, `jobs`, `profiles`) exist

## Development Notes

These scripts are:
- Safe to run multiple times (idempotent)
- Use `IF NOT EXISTS` to avoid errors
- Use `DROP IF EXISTS` before recreating triggers/policies
- Include both English and Romanian documentation
- Organized into numbered sections for clarity
