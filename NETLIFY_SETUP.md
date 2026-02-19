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

## 🔄 Build Caching

### How Build Caching Works

The `@netlify/plugin-nextjs` plugin is now installed as a devDependency in `package.json`, which enables optimal build caching on Netlify.

### Expected Behavior

#### First Build After Changes
The first deployment after merging these changes may show:
```
⚠️ Build cache not found
```
This is **normal and expected** - there is no cache yet on the first build.

#### Subsequent Builds
After the first successful build:
- ✅ Build cache will be automatically restored from `.next/cache`
- ✅ Compiled pages and static assets are reused
- ✅ Build times are significantly faster (often 2-3x faster)
- ✅ No more "Build cache not found" warnings

### What Gets Cached

The Next.js build cache includes:
- Compiled pages and components
- Static assets and images
- Build artifacts from previous deployments
- Dependencies and node modules

### Cache Invalidation

The cache is automatically invalidated when:
- You change Next.js configuration (`next.config.js`)
- You update dependencies in `package.json`
- You manually trigger "Clear cache and deploy" in Netlify

### Troubleshooting Cache Issues

If builds are slower than expected:

1. **Check if plugin is installed**: Verify `@netlify/plugin-nextjs` appears in `devDependencies`
2. **Clear cache manually**: Go to Netlify → Deploys → Trigger deploy → Clear cache and deploy
3. **Check build logs**: Look for "Restoring cached Next.js build" message in deployment logs

### Why This Fix Was Needed

**Before**: The plugin was only declared in `netlify.toml` but not installed in `package.json`
- ❌ Netlify downloaded the plugin on every build
- ❌ Build cache couldn't be properly managed
- ❌ Slower build times

**After**: Plugin is installed as a devDependency
- ✅ Plugin is installed with other dependencies
- ✅ Build cache works optimally
- ✅ Faster, more efficient builds

---

*Last updated: 2024-02-16*
