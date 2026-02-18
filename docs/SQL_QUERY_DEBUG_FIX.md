# SQL Query Debugging - Fixed

## Problem Statement

The following SQL query was failing with an error:

```
Failed to run sql query: ERROR:  42703: column "polname" does not exist
LINE 15: SELECT polname
                ^
HINT:  Perhaps you meant to reference the column "pg_policies.policyname".
```

## Root Cause

The query was using an incorrect column name `polname` when querying the PostgreSQL system view `pg_policies`. The correct column name is `policyname`.

## Incorrect Query (Before Fix)

```sql
-- 3) Verify policy exists
SELECT polname
FROM pg_policies
WHERE schemaname='public' AND tablename='jobs'
ORDER BY polname;
```

## Corrected Query (After Fix)

```sql
-- 3) Verify policy exists
SELECT policyname
FROM pg_policies
WHERE schemaname='public' AND tablename='jobs'
ORDER BY policyname;
```

## Solution

The corrected SQL queries have been saved to: `docs/sql/jobs_verification.sql`

This file contains all three verification queries with the corrected column name:
1. Verify enum contains OPEN
2. Verify default on jobs.status
3. Verify policy exists (with correct `policyname` column)

## How to Use

1. Open Supabase SQL Editor
2. Open the file `docs/sql/jobs_verification.sql`
3. Copy and paste the SQL queries
4. Run the queries to verify your jobs table configuration

## Expected Results

### Query 1: Enum Values
Should list all values in the job_status enum, including 'OPEN'

### Query 2: Column Default
Should show the default value for the jobs.status column

### Query 3: Policies
Should list all RLS policies configured for the jobs table

## Reference

For more information about PostgreSQL system catalogs:
- `pg_policies`: https://www.postgresql.org/docs/current/view-pg-policies.html
- Column name is `policyname`, not `polname`
