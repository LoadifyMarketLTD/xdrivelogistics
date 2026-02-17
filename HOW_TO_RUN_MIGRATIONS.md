# 🗄️ How to Run SQL Migrations in Supabase

## ❌ THE PROBLEM

You tried to run:
```sql
supabase-drivers-migration.sql
supabase-vehicles-migration.sql
```

**Error:** `syntax error at or near "supabase"`

**Why?** You ran the **filenames** instead of the **SQL code inside the files**.

---

## ✅ THE SOLUTION

You need to copy the **contents** of each file and run them in Supabase SQL Editor.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **xdrivelogistics**
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Drivers Migration

1. In SQL Editor, click **New query**
2. Copy the **entire contents** of `supabase-drivers-migration.sql`:

```sql
-- ============================================================
-- DRIVERS TABLE MIGRATION
-- Add drivers management for Phase 2
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON public.drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON public.drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON public.drivers(email);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view drivers in their company" ON public.drivers;
DROP POLICY IF EXISTS "Users can insert drivers in their company" ON public.drivers;
DROP POLICY IF EXISTS "Users can update drivers in their company" ON public.drivers;
DROP POLICY IF EXISTS "Users can delete drivers in their company" ON public.drivers;

-- Policy: Users can view drivers in their company
CREATE POLICY "Users can view drivers in their company"
  ON public.drivers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert drivers in their company
CREATE POLICY "Users can insert drivers in their company"
  ON public.drivers FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can update drivers in their company
CREATE POLICY "Users can update drivers in their company"
  ON public.drivers FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete drivers in their company
CREATE POLICY "Users can delete drivers in their company"
  ON public.drivers FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
```

3. Click **Run** button (or press Ctrl/Cmd + Enter)
4. Wait for success message: ✅ "Success. No rows returned"

### Step 3: Run Vehicles Migration

1. Click **New query** again
2. Copy the **entire contents** of `supabase-vehicles-migration.sql`:

```sql
-- ============================================================
-- VEHICLES TABLE MIGRATION
-- Add fleet management for Phase 2
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  registration TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  capacity_kg NUMERIC,
  notes TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_available ON public.vehicles(is_available);

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view vehicles in their company" ON public.vehicles;
CREATE POLICY "Users can view vehicles in their company"
  ON public.vehicles FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert vehicles in their company" ON public.vehicles;
CREATE POLICY "Users can insert vehicles in their company"
  ON public.vehicles FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update vehicles in their company" ON public.vehicles;
CREATE POLICY "Users can update vehicles in their company"
  ON public.vehicles FOR UPDATE
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete vehicles in their company" ON public.vehicles;
CREATE POLICY "Users can delete vehicles in their company"
  ON public.vehicles FOR DELETE
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

GRANT ALL ON public.vehicles TO authenticated;
```

3. Click **Run** button
4. Wait for success message: ✅ "Success. No rows returned"

### Step 4: Verify Tables Created

1. Go to **Table Editor** in left sidebar
2. You should see two new tables:
   - ✅ `drivers`
   - ✅ `vehicles`

3. Click on each table to verify columns and RLS policies

---

## 🔍 VERIFICATION QUERIES

After running both migrations, verify with these queries:

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('drivers', 'vehicles');
```

Expected result: 2 rows (drivers, vehicles)

### Check drivers table structure:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'drivers' 
ORDER BY ordinal_position;
```

### Check vehicles table structure:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;
```

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('drivers', 'vehicles');
```

Expected: Both should have `rowsecurity = true`

---

## ⚠️ TROUBLESHOOTING

### Error: "function update_updated_at_column() does not exist"

**Solution:** Create the function first:
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then re-run the migrations.

### Error: "relation public.companies does not exist"

**Solution:** Run the main schema migration first:
```sql
-- Run supabase-marketplace-schema.sql first
-- It creates the companies table
```

### Error: "permission denied"

**Solution:** Make sure you're logged in as the project owner or have proper permissions.

---

## 📝 QUICK REFERENCE

**What you DID (wrong):**
```sql
supabase-drivers-migration.sql  ❌
```

**What you SHOULD do (correct):**
1. Open file: `supabase-drivers-migration.sql`
2. Copy **all contents** (86 lines)
3. Paste into Supabase SQL Editor
4. Click Run ✅

**Repeat for:**
- `supabase-vehicles-migration.sql`

---

## ✅ SUCCESS INDICATORS

After running both migrations successfully, you should have:

- [x] `drivers` table exists
- [x] `vehicles` table exists
- [x] Both tables have RLS enabled
- [x] 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
- [x] Indexes created
- [x] Triggers created
- [x] Foreign keys to `companies` table
- [x] No error messages

---

## 🎯 NEXT STEPS

After migrations are complete:
1. ✅ Test the Drivers & Vehicles pages in your app
2. ✅ Try adding a driver
3. ✅ Try adding a vehicle
4. ✅ Verify RLS policies work (can only see your company's data)
5. ✅ Ready for production!

---

**Need help?** Check the error message carefully - it usually tells you exactly what's wrong!
