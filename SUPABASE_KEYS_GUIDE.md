# Supabase API Keys - Complete Guide

## 🔑 Understanding Supabase Keys

Supabase provides **two different types of keys** for authentication. It's critical to use the correct one.

### Key Types Comparison

| Key Type | Format | Starts With | Use Case | Used in XDrive? |
|----------|--------|-------------|----------|-----------------|
| **Anon/Public Key** | JWT Token | `eyJhbGc...` | ✅ Client-side apps (browser) | ✅ **YES - THIS ONE** |
| **Publishable Key** | Simple string | `sb_publishable_...` | ❌ Newer Supabase features | ❌ Not used |
| **Secret Key** | Simple string | `sb_secret_...` | 🔒 Server-side only (NEVER expose) | ❌ Not used |

## ✅ Correct Configuration for XDrive Logistics

### The Anon/Public Key (JWT)

**This is the key you need!**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

**Format**: JWT token with three parts separated by periods (`.`)
- **Header**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Payload**: `eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0`
- **Signature**: `yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO`

## ❌ Common Mistake: Using Publishable Key

**WRONG** - This will NOT work:
```
sb_publishable_yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
```

This is the **publishable key** format introduced by Supabase for newer features, but the standard `@supabase/supabase-js` client (used in this project) requires the **JWT anon key**, not the publishable key.

## 📍 Where to Find the Correct Key

### In Supabase Dashboard:

1. Go to: https://app.supabase.com/project/jqxlauexhkonixtjvljw/settings/api
2. Look for the section: **"Project API keys"**
3. Find the key labeled: **"anon public"**
4. This is the JWT token you need - it starts with `eyJhbGc...`

### Visual Guide:

```
Supabase Dashboard → Settings → API

┌─────────────────────────────────────────────────────────┐
│ Project API keys                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ anon public                                             │
│ This key is safe to use in a browser if you have       │
│ enabled Row Level Security for your tables and         │
│ configured policies.                                    │
│                                                         │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...     │
│                                            👆 USE THIS! │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ service_role                                            │
│ This key has the ability to bypass Row Level Security. │
│ Never share it publicly.                                │
│                                                         │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...     │
│                                            ⚠️ DON'T USE │
└─────────────────────────────────────────────────────────┘

Different Section (Management API):

┌─────────────────────────────────────────────────────────┐
│ Management API keys                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Publishable keys                                        │
│ Can be safely shared publicly                           │
│                                                         │
│ sb_publishable_yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO         │
│                                            ❌ DON'T USE │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Required Environment Variables in Netlify

Set these **6 variables** in Netlify with the correct JWT anon key:

```bash
# Vite (landing page)
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
VITE_SITE_URL=https://xdrivelogistics.co.uk

# Next.js (portal)
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

## 🚨 Security Notes

### Safe to Expose (Public Keys):
- ✅ **anon public** JWT key - Safe in browser, protected by Row Level Security
- ✅ **publishable** key - Safe but not used in this project

### NEVER Expose (Secret Keys):
- 🔒 **service_role** key - Has full database access, bypass RLS
- 🔒 **secret** key (sb_secret_*) - Server-side only

## 🧪 How to Verify You Have the Right Key

### Test 1: Format Check
```javascript
// Correct JWT anon key has 3 parts separated by dots
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO"
const parts = key.split('.')
console.log(parts.length) // Should be 3

// Wrong publishable key format
const wrongKey = "sb_publishable_yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO"
console.log(wrongKey.startsWith('sb_')) // ❌ Wrong format!
```

### Test 2: Supabase Client Test
```javascript
import { createClient } from '@supabase/supabase-js'

// ✅ This works with JWT anon key
const supabase = createClient(
  'https://jqxlauexhkonixtjvljw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

// ❌ This will fail with publishable key
const supabase = createClient(
  'https://jqxlauexhkonixtjvljw.supabase.co',
  'sb_publishable_...'  // Error: Invalid JWT
)
```

## 📝 Quick Fix Checklist

If you're currently using the wrong key in Netlify:

- [ ] Go to Supabase Dashboard → Settings → API
- [ ] Copy the **"anon public"** key (JWT format, starts with `eyJhbGc...`)
- [ ] Update `VITE_SUPABASE_ANON_KEY` in Netlify with the JWT
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify with the same JWT
- [ ] Verify both are set for all deploy contexts (Production, Previews, Branch)
- [ ] Clear cache and redeploy: Netlify → Deploys → Trigger deploy → Clear cache and deploy
- [ ] Test login functionality after deployment

## 🎯 Expected Results After Fix

### Before (with wrong key):
```
❌ Authentication fails
❌ "Invalid API key" errors in console
❌ Cannot sign in or access protected routes
```

### After (with correct JWT key):
```
✅ Authentication works
✅ Users can sign in successfully
✅ Protected routes are accessible
✅ No API key errors
```

## 📚 Additional Resources

- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Client Library Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: 2026-02-19  
**Project**: XDrive Logistics  
**Supabase Project**: jqxlauexhkonixtjvljw
