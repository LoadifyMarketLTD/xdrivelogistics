# 🚨 STOP! YOU'RE COPYING EXAMPLES, NOT ACTUAL SQL! 🚨

## ❌ ERROR: syntax error at or near ".."

You tried to run:
```sql
BEGIN;
CREATE OR REPLACE FUNCTION...
SELECT * FROM...
COMMIT;
```

**THIS IS NOT REAL SQL!** The `...` (three dots) means **"more code goes here"** - it's a PLACEHOLDER!

---

## 🎯 WHAT YOU DID WRONG

You copied an **EXAMPLE** that shows the **STRUCTURE** of SQL:

```sql
BEGIN;                          ← This is real
CREATE OR REPLACE FUNCTION...   ← The ... is a PLACEHOLDER, not real code!
SELECT * FROM...                ← The ... is a PLACEHOLDER, not real code!
COMMIT;                         ← This is real
```

**The `...` is like saying "blah blah blah" or "etc." - it's not actual code!**

---

## ✅ WHAT TO DO INSTEAD

You need to copy the **COMPLETE SQL** from the actual .sql files!

### 🔥 FINAL ANSWER: Do This RIGHT NOW

**Step 1:** Open this file on your computer:
```
fix-company-membership-rls.sql
```

**Step 2:** You'll see REAL SQL that looks like:
```sql
-- ============================================================
-- COMPANY MEMBERSHIP RLS FIX - COMPLETE SOLUTION
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: UPDATE is_company_member() FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = p_company_id
      AND c.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.company_memberships m
    WHERE m.company_id = p_company_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id = p_company_id
  );
$$;

COMMENT ON FUNCTION public.is_company_member(uuid) IS 
'Returns TRUE if user has access to company via: (1) created_by, (2) active membership, or (3) profile company_id link. Compatible with both marketplace and portal schemas.';

CREATE OR REPLACE FUNCTION public.auto_create_company_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_memberships_table BOOLEAN;
  has_profile_company_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'company_memberships'
  ) INTO has_memberships_table;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_id'
  ) INTO has_profile_company_id;

  IF has_memberships_table THEN
    INSERT INTO public.company_memberships (company_id, user_id, role_in_company, status)
    VALUES (NEW.id, NEW.created_by, 'owner', 'active')
    ON CONFLICT (company_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Auto-created membership for user % in company %', NEW.created_by, NEW.id;
  END IF;
  
  IF has_profile_company_id THEN
    UPDATE public.profiles 
    SET company_id = NEW.id 
    WHERE id = NEW.created_by 
      AND company_id IS NULL;
    
    RAISE NOTICE 'Auto-linked profile for user % to company %', NEW.created_by, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_company_membership ON public.companies;

CREATE TRIGGER trg_auto_create_company_membership
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_company_membership();

COMMENT ON FUNCTION public.auto_create_company_membership() IS 
'Automatically creates membership or profile link when company is created. Works with both schemas.';

DO $$
DECLARE
  company_record RECORD;
  has_memberships_table BOOLEAN;
  has_profile_company_id BOOLEAN;
  rows_affected INTEGER := 0;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'company_memberships'
  ) INTO has_memberships_table;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_id'
  ) INTO has_profile_company_id;

  RAISE NOTICE 'Starting one-time sync...';
  RAISE NOTICE 'Has company_memberships table: %', has_memberships_table;
  RAISE NOTICE 'Has profiles.company_id column: %', has_profile_company_id;

  IF has_memberships_table THEN
    FOR company_record IN 
      SELECT c.id, c.created_by, c.name
      FROM public.companies c
      WHERE c.created_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.company_memberships m
          WHERE m.company_id = c.id 
            AND m.user_id = c.created_by
            AND m.status = 'active'
        )
    LOOP
      INSERT INTO public.company_memberships (company_id, user_id, role_in_company, status)
      VALUES (company_record.id, company_record.created_by, 'owner', 'active')
      ON CONFLICT (company_id, user_id) DO NOTHING;
      
      rows_affected := rows_affected + 1;
      RAISE NOTICE 'Created membership for company: % (user: %)', company_record.name, company_record.created_by;
    END LOOP;
    
    RAISE NOTICE 'Created % missing memberships', rows_affected;
  END IF;

  IF has_profile_company_id THEN
    rows_affected := 0;
    
    FOR company_record IN 
      SELECT c.id, c.created_by, c.name
      FROM public.companies c
      WHERE c.created_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = c.created_by
            AND p.company_id = c.id
        )
    LOOP
      UPDATE public.profiles 
      SET company_id = company_record.id 
      WHERE id = company_record.created_by
        AND company_id IS NULL;
      
      rows_affected := rows_affected + 1;
      RAISE NOTICE 'Linked profile to company: % (user: %)', company_record.name, company_record.created_by;
    END LOOP;
    
    RAISE NOTICE 'Linked % profiles to companies', rows_affected;
  END IF;

  RAISE NOTICE 'One-time sync completed!';
END $$;

SELECT 
  'Fix Summary' AS status,
  (SELECT COUNT(*) FROM public.companies) AS total_companies,
  (SELECT COUNT(DISTINCT company_id) FROM public.company_memberships WHERE status = 'active') AS companies_with_active_memberships,
  (SELECT COUNT(DISTINCT company_id) FROM public.profiles WHERE company_id IS NOT NULL) AS companies_with_profile_links;

SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.created_by = auth.uid() AS is_creator,
  public.is_company_member(c.id) AS is_member_result,
  CASE 
    WHEN public.is_company_member(c.id) THEN '✅ TRUE - Access Granted'
    ELSE '❌ FALSE - Access Denied'
  END AS rls_status
FROM public.companies c
WHERE c.created_by = auth.uid()
   OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND company_id = c.id)
   OR EXISTS(SELECT 1 FROM public.company_memberships WHERE user_id = auth.uid() AND company_id = c.id)
ORDER BY c.created_at DESC;

COMMIT;

SELECT '✅ Company Membership RLS Fix Applied Successfully!' AS result;
SELECT 'Run diagnostic-company-membership.sql to verify TRUE/FALSE status' AS next_step;
```

**↑ SEE? No `...` dots! This is REAL CODE with REAL functions and REAL queries! ↑**

**Step 3:** Select ALL that code (Ctrl+A)

**Step 4:** Copy it (Ctrl+C)

**Step 5:** Paste into Supabase SQL Editor (Ctrl+V)

**Step 6:** Click Run

---

## 🎓 LESSON LEARNED

### ❌ WRONG: Template/Example SQL
```sql
BEGIN;
CREATE OR REPLACE FUNCTION...   ← NOT REAL! The ... is a placeholder
SELECT * FROM...                ← NOT REAL! The ... is a placeholder
COMMIT;
```

### ✅ RIGHT: Actual Complete SQL
```sql
BEGIN;
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = p_company_id
      AND c.created_by = auth.uid()
  )
  ...
$$;
COMMIT;
```

**See the difference?** The second one has ACTUAL CODE with table names, column names, logic!

---

## 📋 TYPES OF THINGS YOU SHOULD NEVER COPY

### ❌ Don't Copy:
1. **Numbered instructions**: `1. Copy this file`
2. **Examples with dots**: `CREATE FUNCTION...`
3. **Placeholders**: `<YOUR_VALUE_HERE>`
4. **Templates**: `INSERT INTO table_name...`
5. **Pseudocode**: `// Do something here`

### ✅ Do Copy:
1. **Complete SQL statements**: `CREATE OR REPLACE FUNCTION public.is_company_member(...)`
2. **From .sql files**: Files ending in `.sql`
3. **Real code**: Has actual table names, column names, values

---

## 🎯 QUICK CHECK

Before running, ask:
- **Q: Does it have `...` (three dots)?**
  - YES → Don't run! It's a template!
  - NO → Check next question

- **Q: Does it have actual table/column names?**
  - YES → Probably OK to run!
  - NO → Don't run! It's a template!

- **Q: Did I copy from a .sql file?**
  - YES → Good!
  - NO → Go find the .sql file!

---

## 🔥 FINAL INSTRUCTIONS

**IGNORE ALL DOCUMENTATION FILES (.md files)**

**ONLY USE THESE TWO FILES:**
1. `fix-company-membership-rls.sql` ← Open this, copy ALL of it, run in Supabase
2. `diagnostic-company-membership.sql` ← Open this, copy ALL of it, run in Supabase

**That's it! Nothing else!**

---

## ✅ SUCCESS LOOKS LIKE

When you copy from the ACTUAL .sql file and run it, you'll see:
```
✅ Company Membership RLS Fix Applied Successfully!
```

Not:
```
ERROR: syntax error at or near ".."
```

---

**Now go open the ACTUAL .sql file and copy the REAL code!** 🚀
