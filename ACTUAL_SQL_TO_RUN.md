# 🎯 THIS IS WHAT YOU ACTUALLY NEED TO RUN

## ❌ WHAT YOU'RE DOING WRONG:

You're copying THIS (instructions):
```
File: diagnostic-company-membership.sql
Location: /home/runner/work/xdrivelogistics/xdrivelogistics/
What to do:
1. Open this file in a text editor
```

**This is NOT SQL! This is English text telling you what to do!**

---

## ✅ WHAT YOU SHOULD DO:

### FOR THE FIX (First file):

**File:** `fix-company-membership-rls.sql`

**Copy THIS (actual SQL, starts like this):**
```sql
-- ============================================================
-- COMPANY MEMBERSHIP RLS FIX - COMPLETE SOLUTION
-- ============================================================
-- This script fixes the is_company_member() function and adds
-- auto-triggers to ensure membership integrity
-- 
-- Compatible with BOTH schemas:
-- - Marketplace schema (profiles.company_id)
-- - Portal schema (company_memberships table)
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: DROP OLD FUNCTION (allow parameter changes)
-- ============================================================
DROP FUNCTION IF EXISTS public.is_company_member(uuid);

-- ============================================================
-- STEP 2: CREATE ROBUST is_company_member() FUNCTION
-- ============================================================
-- This function checks MULTIPLE conditions to be compatible with both schemas:
-- 1. User created the company (companies.created_by = auth.uid())
-- 2. User has active membership in company_memberships (portal schema)
-- 3. User's profile links to company (marketplace schema)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- Check if user created the company
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = p_company_id
      AND c.created_by = auth.uid()
  )
  -- OR user has active membership (portal schema)
  OR EXISTS (
    SELECT 1
    FROM public.company_memberships m
    WHERE m.company_id = p_company_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  )
  -- OR user's profile links to company (marketplace schema)
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
      AND p.company_id = p_company_id
  );
$$;

... (continues for 242 lines total)
```

**This is 242 lines long. You need ALL of it!**

---

### FOR THE DIAGNOSTIC (Second file):

**File:** `diagnostic-company-membership.sql`

**Copy THIS (actual SQL, starts like this):**
```sql
-- ============================================================
-- COMPANY MEMBERSHIP DIAGNOSTIC QUERY
-- ============================================================
-- This query shows EXACTLY why is_company_member() returns TRUE or FALSE
-- Run this in Supabase SQL Editor to diagnose membership issues
-- ============================================================

-- Shows current user, company associations, and membership status
SELECT
  -- 1. Current User
  auth.uid() AS current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) AS current_user_email,
  
  -- 2. Profile Info (if using marketplace schema)
  (SELECT company_id FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()) AS profile_company_id,
  (SELECT role FROM public.profiles WHERE user_id = auth.uid() OR id = auth.uid()) AS profile_role,
  
  -- 3. Companies Created by Current User
  (SELECT json_agg(json_build_object('id', id, 'name', name, 'created_at', created_at))
   FROM public.companies 
   WHERE created_by = auth.uid()) AS companies_i_created,
  
  -- 4. Company Memberships (if using portal schema with company_memberships table)
  (SELECT json_agg(json_build_object(
     'company_id', company_id, 
     'role', role_in_company, 
     'status', status,
     'created_at', created_at
   ))
   FROM public.company_memberships 
   WHERE user_id = auth.uid()) AS my_memberships,

... (continues for more lines)
```

**This is the FULL diagnostic query. You need ALL of it!**

---

## 🔥 THE CRITICAL DIFFERENCE

### ❌ WRONG (English instructions):
```
File: diagnostic-company-membership.sql
What to do:
1. Open this file
```
**This has:**
- Words like "File:", "What to do:"
- Numbered lists: "1. Open", "2. Select"
- File paths: "/home/runner/work/..."
- **This is NOT SQL!**

### ✅ RIGHT (Actual SQL code):
```sql
-- ============================================================
SELECT auth.uid() AS current_user_id;
DROP FUNCTION IF EXISTS...
CREATE OR REPLACE FUNCTION...
```
**This has:**
- SQL keywords: SELECT, DROP, CREATE, WHERE, FROM
- Comments starting with --
- Semicolons at end of statements
- **This IS SQL!**

---

## 📂 HOW TO GET THE ACTUAL SQL

### Step 1: Find the File on Your Computer
```
Path: /home/runner/work/xdrivelogistics/xdrivelogistics/
Files: 
  - fix-company-membership-rls.sql (242 lines)
  - diagnostic-company-membership.sql (about 100 lines)
```

### Step 2: Open in Text Editor
- Use Notepad, VS Code, Sublime, or any text editor
- **NOT** a word processor like Word
- **NOT** reading it in a browser or markdown viewer

### Step 3: Copy ALL Contents
- Click in the file
- Ctrl+A (or Cmd+A on Mac) to select all
- Ctrl+C (or Cmd+C on Mac) to copy

### Step 4: Paste into Supabase
- Open Supabase SQL Editor
- Ctrl+V (or Cmd+V on Mac) to paste
- Click Run

---

## 🎯 QUICK CHECK BEFORE RUNNING

Before you click "Run" in Supabase, check what you pasted:

✅ **Good signs:**
- Starts with `--` comments and `BEGIN;`
- Has SQL keywords: SELECT, CREATE, DROP, ALTER
- Has semicolons (;) at end of lines
- Looks like code, not English sentences

❌ **Bad signs:**
- Has words: "File:", "What to do:", "Location:"
- Has numbered instructions: "1. Open", "2. Copy"
- Looks like instructions you'd read, not code
- No semicolons or SQL keywords

---

## 💡 THINK OF IT THIS WAY

**Markdown/Docs (.md files)** = Recipe card that says "Add flour"
**SQL files (.sql files)** = The actual flour

You don't put the recipe card in the oven!
You don't run instructions in SQL Editor!

**Open the .sql file, copy its contents, run those contents!**

---

## ✅ YOUR ACTION ITEMS

1. Go to folder: `/home/runner/work/xdrivelogistics/xdrivelogistics/`
2. Open file: `fix-company-membership-rls.sql` (NOT a .md file!)
3. Select all the text in that file (Ctrl+A)
4. Copy it (Ctrl+C)
5. Paste into Supabase SQL Editor (Ctrl+V)
6. Click Run
7. Wait for success
8. Repeat with: `diagnostic-company-membership.sql`

**DO NOT copy from markdown files!**
**DO NOT copy instructions!**
**ONLY copy from .sql files!**

---

Need help finding the files? They're in the repository you cloned at:
```
/home/runner/work/xdrivelogistics/xdrivelogistics/
```

Look for files ending in `.sql`, NOT `.md`!
