# Netlify Setup Guide - XDrive Logistics

## 🚨 CRITICAL: Environment Variables Setup

For the application to work correctly in Netlify, you **MUST** set environment variables for **ALL deploy contexts**.

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

**Note**: These are `NEXT_PUBLIC_*` variables - they are NOT secrets and are safe to expose in the browser.

---

## 📋 Step-by-Step Setup

### Step 1: Access Netlify Environment Variables

1. Go to your Netlify Dashboard
2. Select your site: **xdrivelogistics**
3. Navigate to: **Site settings** → **Environment variables**

### Step 2: Add Each Variable

For **EACH** of the three variables above:

1. Click **Add a variable** or **Add single variable**
2. **Key**: Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. **Values**: Enter the value
4. **Scopes**: ✅ **CHECK ALL THREE**:
   - ✅ **Production** (main branch deploys)
   - ✅ **Deploy Previews** (PR preview deploys)
   - ✅ **Branch deploys** (all branch deploys)

5. **DO NOT** check "Keep this value secret" - these are public client keys
6. Click **Add variable**

### Step 3: Verify All Variables Are Set

After adding all three variables, verify:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` → All 3 contexts
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → All 3 contexts  
- ✅ `NEXT_PUBLIC_SITE_URL` → All 3 contexts

**Common mistake**: Setting variables only for Production. This causes PR preview deploys to fail!

### Step 4: Clear Cache and Redeploy

1. Go to: **Deploys** tab
2. Click: **Trigger deploy** button
3. Select: **Clear cache and deploy**

This ensures:
- Old cached builds are discarded
- Fresh build uses new environment variables
- No stale configuration issues

---

## ✅ Verification

After redeploying, verify the deployment succeeded:

### Check 1: Build Logs
In the deploy logs, you should see:
```
✓ Compiled successfully
✓ Generating static pages (7/7)
✅ Build completed
```

### Check 2: Netlify Checks (PR)
If deploying a PR, verify these checks pass:
- ✅ **Header rules** - PASS
- ✅ **Redirect rules** - PASS  
- ✅ **Pages changed** - PASS

### Check 3: Runtime Functionality
Visit the deployed site and test:
- ✅ Login page loads without errors
- ✅ Authentication works
- ✅ Dashboard accessible after login
- ✅ No console errors about missing Supabase credentials

### Check 4: Console Verification
Open browser console on any page:
- ✅ Should NOT see: "Missing Supabase credentials" error
- ✅ Should NOT see: Connection errors to placeholder.supabase.co

---

## 🔧 Troubleshooting

### Problem: Build succeeds but login doesn't work

**Cause**: Environment variables not set, app using placeholder values.

**Solution**:
1. Check if env vars are set in Netlify UI
2. Verify they're set for the correct deploy context (Production/Preview/Branch)
3. Check variable names are exactly correct (case-sensitive)
4. Trigger "Clear cache and deploy"

### Problem: PR preview deploy fails

**Cause**: Environment variables only set for Production context.

**Solution**:
1. Go back to Environment variables in Netlify
2. Edit each variable
3. Ensure "Deploy Previews" is checked
4. Save and redeploy

### Problem: "Missing Supabase credentials" error in browser

**Cause**: Correct! The app is working as intended - env vars are missing.

**Solution**: Follow Step 2 above to add the variables.

### Problem: Build fails with "supabaseUrl is required"

**Cause**: This should NOT happen anymore with the improved client code.

**If it does**:
1. Check `lib/supabaseClient.ts` has the latest code
2. The code should use placeholders during build
3. Only throw errors at runtime in browser

---

## 🎯 Quick Reference

### Variable Details

| Variable | Value | Secret? | All Contexts? |
|----------|-------|---------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqxlauexhkonixtjvljw.supabase.co` | ❌ No | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (JWT token) | ❌ No | ✅ Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://xdrivelogistics.co.uk` | ❌ No | ✅ Yes |

### Deploy Contexts Explained

- **Production**: Deploys from main/master branch
- **Deploy Previews**: Deploys from pull requests
- **Branch deploys**: Deploys from all other branches

**Important**: Always set variables for ALL contexts to avoid surprises!

---

## 📚 Additional Resources

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [Supabase Auth Setup](https://supabase.com/docs/guides/auth)

---

## ✨ After Setup

Once environment variables are properly configured:

1. ✅ Build will succeed
2. ✅ All Netlify checks will pass
3. ✅ Authentication will work in production
4. ✅ No mysterious errors
5. ✅ PR previews will work correctly

**You're ready to merge your PR!** 🎉

---

## 🚀 Build Caching Configuration

### Next.js Build Cache

The application uses the `@netlify/plugin-nextjs` plugin to enable Next.js-specific features and build caching. This plugin:

- Automatically caches the `.next/cache` directory between builds
- Speeds up subsequent builds by reusing compiled assets
- Enables features like ISR (Incremental Static Regeneration), Server Actions, and image optimization

### Plugin Configuration

The plugin is configured in two places:

1. **netlify.toml**: Specifies the plugin to use
   ```toml
   [[plugins]]
   package = "@netlify/plugin-nextjs"
   ```

2. **package.json**: Installed as a devDependency for better performance
   ```json
   "@netlify/plugin-nextjs": "^5.15.8"
   ```

### Understanding Build Cache Warnings

On the **first build** or after a cache clear, you might see:
```
⚠ No build cache found. Please configure build caching for faster rebuilds.
```

**This is normal!** It means:
- This is the first build, so no cache exists yet
- The cache was manually cleared
- Dependencies changed significantly

**On subsequent builds**, you should see:
```
✓ Restored Next.js cache
✓ Build completed in [faster time]
```

The cache will be automatically restored and used for faster builds.

### Cache Management

Netlify manages caching automatically. If you need to force a clean build:

1. Go to **Deploys** tab
2. Click **Trigger deploy**
3. Select **Clear cache and deploy**

This is useful when:
- Troubleshooting build issues
- After updating build dependencies
- After changing build configuration

---

*Last updated: 2026-02-19*
