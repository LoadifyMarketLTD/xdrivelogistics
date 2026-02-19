# 📋 Quick Reference: Environment Variables Setup

## For Netlify Dashboard

### Step 1: Go to Environment Variables
**Site settings** → **Environment variables** → **Add a variable**

### Step 2: Add These Three Variables

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO` |
| `NEXT_PUBLIC_SITE_URL` | `https://xdrivelogistics.co.uk` |

### Step 3: Set Scopes for EACH Variable
✅ **Check ALL three boxes:**
- Production
- Deploy Previews
- Branch deploys

### Step 4: Deploy Settings
- **DO NOT** mark as "Secret"
- Click **"Add variable"** for each one

### Step 5: Clear Cache
**Deploys** tab → **Trigger deploy** → **Clear cache and deploy**

---

## For Local Development

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Edit .env.local and set:
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. Run development server
npm run dev
```

---

## Quick Checks

✅ **After Setup - Verify:**
- All 3 variables show "All" under deploy contexts
- No variables marked as "Secret"
- Build logs show "✓ Compiled successfully"
- Visit `/diagnostics` to verify env vars loaded
- No "Missing Supabase credentials" errors in console

❌ **Common Mistakes:**
- Setting variables only for Production (missing Deploy Previews)
- Using old `VITE_*` prefix instead of `NEXT_PUBLIC_*`
- Marking variables as "Secret" (they're public client keys)
- Forgetting to clear cache after adding variables

---

## Troubleshooting

**Problem:** Login doesn't work after deployment
**Solution:** Check variables are set in Netlify UI for ALL contexts, then clear cache and redeploy

**Problem:** PR preview fails
**Solution:** Edit each variable and ensure "Deploy Previews" is checked

**Problem:** Build succeeds but app doesn't work
**Solution:** Verify variable names are exactly `NEXT_PUBLIC_*` (not `VITE_*`)

---

## 📚 Full Documentation

- 🇷🇴 Romanian: `SETARI_MEDIU_RO.md`
- 🇬🇧 English: `ENVIRONMENT_VARIABLES.md`
- 🚀 Netlify: `NETLIFY_SETUP.md`

---

*These are public client keys - NOT secrets. Safe to share and expose.*
