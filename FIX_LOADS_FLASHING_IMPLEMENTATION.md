# Fix Implementation: Loads Page Flashing + Quotes Error

**Date:** 2026-02-17  
**Issue:** Loads page flashing/lagging + Quotes error (Supabase schema mismatch)  
**Status:** ✅ Code Fixed | 🔄 Migration Pending

---

## Summary of Issues

### 1. Loads Page Flashing/Lagging ✅ FIXED
**Root Cause:** Duplicate `useEffect` hooks causing infinite re-render loop

The loads page had TWO separate useEffect hooks:
- First useEffect (lines 91-100): Called `fetchLoads()` with dependencies `[fetchLoads, companyId]`
- Second useEffect (lines 102-156): Defined its own `fetchData()` with empty dependencies `[]`

**Problem:** The first useEffect created an infinite loop because:
1. `fetchLoads` was defined as a regular function (recreated on every render)
2. useEffect depended on `fetchLoads`
3. Each render → new fetchLoads → triggers useEffect → state update → re-render → repeat

**Solution Applied:**
- ✅ Removed duplicate first useEffect completely
- ✅ Consolidated logic into single useEffect with empty dependencies `[]`
- ✅ Moved `fetchLoads` outside useEffect so it's accessible to Refresh button
- ✅ Used `timeoutRef` instead of local variable for proper cleanup
- ✅ Added timeout protection to prevent hanging loading state

### 2. Quotes Error: `column job_bids.status does not exist` 🔄 MIGRATION REQUIRED
**Root Cause:** Database schema out of sync with code

The frontend code queries `job_bids.status` in:
- `/app/(portal)/quotes/page.tsx` (lines 65, 117)
- `/app/(portal)/loads/page.tsx` (line 289)
- `/app/(portal)/dashboard/page.tsx` (lines 57, 66)
- `/app/(portal)/freight-vision/page.tsx` (line 35)
- `/components/layout/PortalLayout.tsx` (line 73)

The `supabase-marketplace-schema.sql` file defines this column (line 129):
```sql
status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'))
```

However, the production database doesn't have this column.

**Solution:** Apply migration SQL to add the missing column.

---

## Files Changed

### Modified Files

#### 1. `/app/(portal)/loads/page.tsx`
**Changes:**
- Removed duplicate first useEffect with `[fetchLoads, companyId]` dependency
- Consolidated into single useEffect with `[]` dependencies
- Moved `fetchLoads` function outside useEffect scope
- Added `timeoutRef` for proper timeout cleanup
- Ensured fetchLoads is accessible for Refresh button onClick handler

**Before (problematic code):**
```typescript
const fetchLoads = async () => { /* ... */ }

// First useEffect - CAUSED INFINITE LOOP
useEffect(() => {
  fetchLoads()
  const interval = setInterval(() => fetchLoads(), 30000)
  return () => clearInterval(interval)
}, [fetchLoads, companyId]) // ❌ fetchLoads dependency causes infinite loop

// Second useEffect
useEffect(() => {
  const fetchData = async () => { /* duplicate logic */ }
  fetchData()
  const interval = setInterval(() => fetchData(), 30000)
  return () => { /* cleanup */ }
}, [])
```

**After (fixed code):**
```typescript
const timeoutRef = useRef<NodeJS.Timeout | null>(null)

// Single function accessible throughout component
const fetchLoads = async () => {
  // ... fetch logic with timeout protection
}

// Single useEffect with empty dependencies
useEffect(() => {
  mountedRef.current = true
  fetchLoads() // Initial fetch
  const interval = setInterval(() => {
    if (mountedRef.current) fetchLoads()
  }, 30000)
  return () => {
    mountedRef.current = false
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    clearInterval(interval)
  }
}, []) // ✅ Empty dependencies - runs once
```

### Created Files

#### 2. `/migration-job-bids-status.sql`
**Purpose:** Add missing `status` column to `job_bids` table

**Contents:**
```sql
-- Add status column if it doesn't exist
ALTER TABLE public.job_bids
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';

-- Add check constraint for valid status values
ALTER TABLE public.job_bids 
ADD CONSTRAINT job_bids_status_check 
CHECK (status IN ('submitted', 'withdrawn', 'rejected', 'accepted'));

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_job_bids_status ON public.job_bids(status);

-- Update any existing rows that might have NULL status
UPDATE public.job_bids 
SET status = 'submitted' 
WHERE status IS NULL;
```

---

## How to Apply Fixes

### Step 1: Code Changes ✅ DONE
The code changes are already committed and pushed to the branch.

### Step 2: Apply Database Migration 🔄 REQUIRED

**Option A: Via Supabase Dashboard (Recommended)**
1. Log into Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `/migration-job-bids-status.sql`
5. Paste and run the SQL
6. Verify: Run `SELECT * FROM job_bids LIMIT 1;` to confirm `status` column exists

**Option B: Via Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push migration-job-bids-status.sql
```

### Step 3: Deploy to Production
```bash
# If using Netlify
git push origin main  # Triggers automatic deployment

# Or manually trigger deployment in Netlify dashboard
```

### Step 4: Verify Fixes

#### A. Loads Page (should not flash)
1. Open: https://xdrivelogistics.co.uk/loads
2. Open DevTools → Network tab
3. Observe: Should see only 1 request to `/rest/v1/jobs` on page load
4. Wait 30 seconds: Should see 1 more request (auto-refresh)
5. Click "Refresh" button: Should see 1 request
6. ✅ Expected: No flashing, no repeated requests, smooth loading

#### B. Quotes Page (should load without error)
1. Open: https://xdrivelogistics.co.uk/quotes
2. Open DevTools → Console
3. ✅ Expected: No "column job_bids.status does not exist" error
4. ✅ Expected: Quotes load successfully
5. Test "Withdraw" button: Should update status to 'withdrawn'

#### C. Console Errors
1. Open any page in portal
2. Check Console for errors
3. ✅ Expected: No critical errors related to job_bids or infinite loops

---

## Testing Checklist

### Desktop Testing
- [ ] Open `/loads` page - no flashing
- [ ] Network tab shows 1 request on load, 1 every 30s
- [ ] Click Refresh button - triggers single request
- [ ] Open `/quotes` page - loads without error
- [ ] Console shows no critical errors
- [ ] Test withdrawing a quote - status updates

### Mobile Testing (DevTools Device Emulation)
- [ ] Open `/loads` on mobile viewport - no flashing
- [ ] Scroll performance is smooth
- [ ] Open `/quotes` on mobile viewport - loads correctly
- [ ] Layout doesn't overflow or break

### Performance Testing
- [ ] Record Performance profile (5-10 seconds)
- [ ] Verify no excessive re-renders
- [ ] Check memory doesn't grow continuously
- [ ] Verify frame rate stays stable

---

## Expected Outcomes

### Before Fixes
- ❌ Loads page flashes/blinks repeatedly
- ❌ Network tab shows multiple rapid-fire requests
- ❌ Quotes page shows error: "column job_bids.status does not exist"
- ❌ Console shows errors on every page load
- ❌ Performance is degraded due to re-render loop

### After Fixes
- ✅ Loads page loads smoothly without flashing
- ✅ Network tab shows single request on load + periodic refresh
- ✅ Quotes page loads successfully
- ✅ Console is clean of critical errors
- ✅ Performance is stable, no re-render loops

---

## Technical Details

### Why the Infinite Loop Happened

React's useEffect hook runs when its dependencies change. The problematic code was:

```typescript
const fetchLoads = async () => { /* ... */ }

useEffect(() => {
  fetchLoads()
}, [fetchLoads]) // ❌ Problem: fetchLoads changes on every render
```

**Sequence of events:**
1. Component renders → `fetchLoads` function is created
2. useEffect sees new `fetchLoads` → runs effect
3. Effect calls `setLoading(true)` → triggers re-render
4. Component re-renders → NEW `fetchLoads` function is created
5. useEffect sees different `fetchLoads` → runs effect again
6. **Repeat steps 3-5 infinitely** 🔄

### Why the Fix Works

```typescript
const fetchLoads = async () => { /* ... */ }

useEffect(() => {
  fetchLoads()
}, []) // ✅ Empty dependencies - runs only once
```

**Sequence of events:**
1. Component mounts → useEffect runs once
2. Sets up interval for periodic refresh (every 30s)
3. State updates (setLoading, setLoads) cause re-renders
4. But useEffect doesn't re-run (empty dependencies)
5. **No infinite loop** ✅

The fetchLoads function can still be called manually (e.g., from Refresh button) without triggering the useEffect.

---

## Related Files Reference

### Files That Query `job_bids.status`
- `/app/(portal)/quotes/page.tsx` - Main quotes listing and withdraw functionality
- `/app/(portal)/loads/page.tsx` - Bid submission sets status to 'submitted'
- `/app/(portal)/dashboard/page.tsx` - Dashboard stats for bids
- `/app/(portal)/freight-vision/page.tsx` - Freight vision page bids
- `/components/layout/PortalLayout.tsx` - Portal layout stats

### Schema Files
- `/supabase-marketplace-schema.sql` - Full marketplace schema (correct version)
- `/supabase-schema.sql` - Older schema (doesn't include marketplace features)
- `/migration-job-bids-status.sql` - **NEW** Migration to fix production database

---

## Rollback Plan (If Needed)

If the fixes cause issues, rollback steps:

### Rollback Code Changes
```bash
git revert HEAD
git push origin main
```

### Rollback Database Changes
```sql
-- Only if the migration causes issues
ALTER TABLE public.job_bids DROP COLUMN IF EXISTS status;
DROP INDEX IF EXISTS idx_job_bids_status;
```

**Note:** Only rollback database if absolutely necessary. The status column is required by the frontend code.

---

## Build Verification

Build completed successfully:
```
✓ Compiled successfully in 4.2s
✓ Finished TypeScript in 4.2s 
✓ Collecting page data using 3 workers in 459.1ms 
✓ Generating static pages using 3 workers (23/23) in 366.1ms
✓ Finalizing page optimization in 3.9ms 
```

All routes built successfully, including:
- `/loads` ✅
- `/quotes` ✅
- `/dashboard` ✅
- `/freight-vision` ✅

---

## Next Actions Required

1. **Apply Database Migration** 🔄
   - Go to Supabase Dashboard
   - Run `/migration-job-bids-status.sql`
   - Verify column exists

2. **Deploy to Production** 🔄
   - Merge this branch to main
   - Automatic deployment via Netlify

3. **Test Production** 🔄
   - Follow testing checklist above
   - Capture before/after screenshots
   - Verify console errors are gone

4. **Document Results** 🔄
   - Add screenshots to PR
   - Confirm all acceptance criteria met
   - Close related issues

---

**Last Updated:** 2026-02-17  
**Branch:** copilot/fix-loads-page-flashing  
**Status:** Ready for Migration + Deployment
