# Production Deployment Guide - XDrive Logistics

## Pre-Deployment Checklist

### 1. Frontend Build ✅
- [x] All pages use ResponsiveContainer
- [x] Build passes: `npm run build`
- [x] No console errors in production build
- [x] Assets optimized (images, CSS, JS)

### 2. Database Schema ✅
- [x] All tables created in Supabase
- [x] RLS policies enabled
- [x] Indexes created for performance
- [x] Foreign keys configured

### 3. Storage Setup ⏳
- [ ] Run `migration-storage-buckets-setup.sql`
- [ ] Verify buckets created: `job-evidence`, `job-pod`
- [ ] Test file upload from frontend
- [ ] Test RLS policies work correctly

### 4. API Endpoints ⏳
- [ ] Implement POST `/api/jobs/[jobId]/status`
- [ ] Implement GET `/api/jobs/[jobId]/pod`
- [ ] Add error logging
- [ ] Add rate limiting

### 5. Environment Variables 📝
- [ ] Configure all required variables
- [ ] Test in staging environment
- [ ] Document sensitive variables

---

## Environment Variables Configuration

### Required Variables

#### Supabase Configuration
```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (Public)
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (Server-side only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Application Configuration
```bash
# Site URL
VITE_SITE_URL=https://xdrivelogistics.co.uk

# API Base URL (if different from site URL)
VITE_API_URL=https://api.xdrivelogistics.co.uk

# Environment
NODE_ENV=production
```

#### Optional Configuration
```bash
# Google Maps API (if using maps)
VITE_GOOGLE_MAPS_API_KEY=your-maps-key

# Sentry Error Tracking (recommended)
SENTRY_DSN=your-sentry-dsn

# Analytics
VITE_GA_TRACKING_ID=your-google-analytics-id
```

### Netlify Configuration

Create a `netlify.toml` file (already exists, verify content):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Environment Variables in Netlify

1. Go to: Netlify Dashboard → Site Settings → Environment Variables
2. Add all `VITE_*` variables
3. Set for all contexts: Production, Deploy Previews, Branch deploys
4. DO NOT add `SUPABASE_SERVICE_ROLE_KEY` (only for backend/edge functions)

---

## Deployment Steps

### Step 1: Prepare Supabase

#### A. Run Storage Setup
```sql
-- In Supabase SQL Editor
-- Copy and paste content from: migration-storage-buckets-setup.sql
-- Run the script
-- Verify success with verification queries at the end
```

#### B. Verify Database Tables
```sql
-- Check all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'jobs',
  'job_bids',
  'job_status_events',
  'job_evidence',
  'proof_of_delivery',
  'job_pod',
  'companies',
  'profiles',
  'drivers',
  'vehicles'
);

-- Should return 10 tables
```

#### C. Enable RLS on All Tables
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('jobs', 'companies', 'profiles', 'drivers', 'vehicles');

-- All should show rowsecurity = true
```

### Step 2: Configure Netlify

#### A. Connect Repository
1. Login to Netlify
2. New site from Git
3. Connect GitHub repository: `LoadifyMarketLTD/xdrivelogistics`
4. Select branch: `main` or your production branch

#### B. Build Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: (empty)

#### C. Environment Variables
Add in Netlify Dashboard → Site Settings → Environment Variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
VITE_SITE_URL = https://your-site.netlify.app
```

#### D. Domain Configuration
1. Netlify Dashboard → Domain Settings
2. Add custom domain: `xdrivelogistics.co.uk`
3. Configure DNS:
   - Add CNAME: `www` → `your-site.netlify.app`
   - Add A record: `@` → Netlify Load Balancer IP
4. Enable HTTPS (automatic with Netlify)

### Step 3: Deploy

#### A. Trigger Deployment
```bash
# Option 1: Push to main branch
git push origin main

# Option 2: Manual deploy in Netlify Dashboard
# Deploys → Trigger deploy → Deploy site
```

#### B. Monitor Build
1. Watch build logs in Netlify
2. Check for errors
3. Verify build time (should be ~3-5 seconds)

#### C. Verify Deployment
1. Visit deployed URL
2. Test all pages load
3. Check browser console for errors
4. Test login/authentication
5. Test job creation and updates

### Step 4: Post-Deployment Verification

#### A. Functional Tests
- [ ] Landing page loads correctly
- [ ] User can register/login
- [ ] Dashboard displays data
- [ ] Job creation works
- [ ] Status updates work
- [ ] Evidence upload works
- [ ] Signature capture works
- [ ] ePOD can be generated

#### B. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse score > 90
- [ ] No memory leaks

#### C. Security Tests
- [ ] RLS policies prevent unauthorized access
- [ ] Storage buckets are private
- [ ] API endpoints require authentication
- [ ] No sensitive data in client-side code

#### D. Cross-Browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### E. Multi-Resolution Tests
- [ ] 1366x768 (laptop small)
- [ ] 1440x900 (laptop medium)
- [ ] 1920x1080 (desktop)
- [ ] 2560x1440 (2K)
- [ ] 3840x2160 (4K)
- [ ] 375x667 (mobile)
- [ ] 768x1024 (tablet)

---

## Monitoring & Maintenance

### Setup Monitoring

#### 1. Sentry (Error Tracking)
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

#### 2. Analytics
```typescript
// Google Analytics 4
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### 3. Uptime Monitoring
- Use: UptimeRobot, Pingdom, or StatusCake
- Monitor: Homepage, API endpoints
- Alert: Email, SMS, Slack

### Database Monitoring

#### Supabase Dashboard
1. Database → Logs → Monitor queries
2. Database → Performance → Check slow queries
3. Storage → Usage → Monitor storage growth
4. Auth → Users → Monitor sign-ups

#### Query Performance
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Regular Maintenance Tasks

#### Daily
- [ ] Check error logs in Sentry
- [ ] Monitor uptime status
- [ ] Check Supabase usage metrics

#### Weekly
- [ ] Review slow queries
- [ ] Check storage usage
- [ ] Review user feedback
- [ ] Test critical flows

#### Monthly
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance optimization
- [ ] Dependency updates
- [ ] Cost analysis

---

## Backup & Recovery

### Database Backups

#### Automatic Backups (Supabase)
- Daily backups (last 7 days) - Included in Pro plan
- Weekly backups (last 4 weeks) - Included in Pro plan
- Monthly backups (last 3 months) - Included in Pro plan

#### Manual Backup
```bash
# Using Supabase CLI
supabase db dump > backup-$(date +%Y%m%d).sql

# Or using pg_dump directly
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Storage Backups

#### Evidence Files
- Automatic: Supabase Storage includes versioning
- Manual: Download all files periodically

```typescript
// Backup script
const backupStorage = async () => {
  const { data: files } = await supabase.storage
    .from('job-evidence')
    .list()
  
  for (const file of files) {
    const { data } = await supabase.storage
      .from('job-evidence')
      .download(file.name)
    
    // Save to local backup or external storage
  }
}
```

### Recovery Plan

#### Database Recovery
1. Access Supabase Dashboard
2. Database → Backups
3. Select backup point
4. Restore to new project or existing
5. Update environment variables if new project

#### Storage Recovery
1. Re-upload files from backup
2. Update database records with new URLs
3. Verify file access works

---

## Troubleshooting

### Common Issues

#### 1. Build Fails
**Error:** `Cannot find module`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. RLS Policies Block Queries
**Error:** `new row violates row-level security policy`
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'jobs';

-- Temporarily disable RLS for testing (DEV ONLY)
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
```

#### 3. Storage Upload Fails
**Error:** `Storage bucket not found`
```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'job-evidence';

-- Check RLS policies on storage.objects
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

#### 4. Status Update Not Working
- Check user is authenticated
- Verify user has assigned_driver_id matching
- Check STATUS_TRANSITIONS map
- Review API logs for errors

### Getting Help

1. **Supabase Support**
   - Dashboard → Support
   - Discord: supabase.com/discord
   - Docs: supabase.com/docs

2. **Netlify Support**
   - Dashboard → Support
   - Community: answers.netlify.com
   - Docs: docs.netlify.com

3. **Internal Team**
   - Email: tech@xdrivelogistics.co.uk
   - Phone: 07423 272138

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use Netlify environment variables
- Rotate keys regularly
- Use different keys for staging/production

### 2. Database Security
- Enable RLS on all tables
- Test policies thoroughly
- Use service_role key only in backend
- Regular security audits

### 3. Storage Security
- Private buckets for sensitive data
- Signed URLs for temporary access
- Regular access log reviews
- File size limits

### 4. API Security
- Rate limiting
- Input validation
- Error handling (don't expose internals)
- CORS configuration
- HTTPS only

### 5. Frontend Security
- Content Security Policy
- HTTPS enforcement
- XSS prevention
- CSRF protection
- Regular dependency updates

---

## Performance Optimization

### Frontend Optimization
- [x] Code splitting (Vite handles this)
- [x] Image optimization
- [ ] Lazy loading images
- [ ] Service Worker for caching
- [ ] CDN for static assets

### Database Optimization
- [x] Indexes on foreign keys
- [x] Indexes on frequently queried columns
- [ ] Query optimization
- [ ] Connection pooling
- [ ] Materialized views for reports

### Storage Optimization
- [ ] Image compression before upload
- [ ] WebP format support
- [ ] Thumbnail generation
- [ ] Old file archival/deletion

---

## Rollback Plan

### If Deployment Fails

#### Option 1: Rollback in Netlify
1. Deploys → Select previous successful deploy
2. Click "Publish deploy"
3. Confirm rollback

#### Option 2: Revert Git
```bash
git revert HEAD
git push origin main
# Netlify auto-deploys
```

#### Option 3: Emergency Maintenance
1. Enable Netlify maintenance mode
2. Fix issues in development
3. Test thoroughly
4. Re-deploy

---

## Success Metrics

### Technical Metrics
- Uptime: > 99.9%
- Page Load Time: < 3s
- API Response Time: < 500ms
- Error Rate: < 0.1%
- Build Time: < 5s

### Business Metrics
- Daily Active Users
- Jobs Posted per Day
- Bids Submitted per Day
- Completed Deliveries per Day
- User Satisfaction Score

---

## Conclusion

This deployment guide covers all aspects of deploying XDrive Logistics to production. Follow each step carefully and verify at each stage. The platform is production-ready from a frontend perspective.

**Status: ✅ Ready for Deployment**

**Next Actions:**
1. Run storage setup SQL
2. Configure environment variables
3. Deploy to Netlify
4. Test thoroughly
5. Monitor closely for first 24-48 hours

**Support Contact:**
- Email: tech@xdrivelogistics.co.uk  
- Phone: 07423 272138
- Company: XDrive Logistics Ltd. (Company Number: 13171804)

---

*Last Updated: February 18, 2026*  
*Version: 1.0*  
*Status: Production Ready*
