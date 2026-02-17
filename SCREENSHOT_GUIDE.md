# Screenshot Capture Guide

This guide explains how to capture authenticated screenshots of the XDrive portal for documentation and visual verification.

## Prerequisites

1. **Node.js and npm installed**
2. **Playwright installed** (included in dev dependencies)
3. **Application built and running**
4. **Valid Supabase credentials** (for authentication)

## Quick Start

### Step 1: Build the Application

```bash
npm ci
npm run build
```

### Step 2: Start the Application

In one terminal window:

```bash
npm start
```

Wait for the message: `Ready started server on 0.0.0.0:3000`

### Step 3: Run Screenshot Capture

In another terminal window:

```bash
npm run screenshots
```

### Step 4: Authenticate Manually

1. A browser window will open automatically
2. The login page will be displayed
3. **Manually enter your credentials** in the browser
4. Complete the login process
5. Wait until you're redirected to the dashboard
6. Return to the terminal and press **Enter**

### Step 5: Wait for Completion

The script will automatically:
- Capture desktop screenshots (1440x900)
- Capture mobile screenshots (390x844)
- Save all images to `docs/screenshots/`

## Screenshots Captured

### Desktop (1440x900)
- `desktop-login.png`
- `desktop-dashboard.png`
- `desktop-loads.png`
- `desktop-directory.png`

### Mobile (390x844)
- `mobile-login.png`
- `mobile-dashboard.png`
- `mobile-loads.png`
- `mobile-directory.png`

## Security Notes

### ✅ Safe Practices
- Credentials are entered **manually** in the browser
- No credentials stored in code or logs
- Session cookies managed by Playwright context
- Environment variables for Supabase keys only

### ❌ Never Do This
- Hardcode credentials in scripts
- Commit credentials to git
- Store passwords in environment variables
- Log authentication tokens

## Troubleshooting

### Browser doesn't open
```bash
# Install Playwright browsers manually
npx playwright install chromium
```

### Application not running
Make sure you started the app with `npm start` in a separate terminal.

### Screenshots are blank or show login page
This means authentication failed or session wasn't preserved. Possible causes:
1. Didn't complete login before pressing Enter
2. Redirect happened after login
3. Session cookies not persisting

**Solution**: Run the script again and wait longer after login.

### Network timeout errors
Increase the timeout in `scripts/capture-screenshots.js`:
```javascript
timeout: 60000  // 60 seconds instead of 30
```

## CI/CD Integration

For automated screenshot capture in CI:

1. Store credentials in **GitHub Secrets** (not in code)
2. Use Playwright's authentication state storage
3. Example GitHub Actions workflow:

```yaml
- name: Capture Screenshots
  env:
    SUPABASE_TEST_EMAIL: ${{ secrets.SUPABASE_TEST_EMAIL }}
    SUPABASE_TEST_PASSWORD: ${{ secrets.SUPABASE_TEST_PASSWORD }}
  run: |
    npm run build
    npm start &
    sleep 10
    # Custom script for automated auth
    node scripts/capture-screenshots-ci.js
```

## Manual Alternative

If the script doesn't work, you can capture screenshots manually:

1. Build and start the app
2. Open browser at http://localhost:3000
3. Login manually
4. Use browser DevTools to set viewport sizes:
   - Desktop: 1440x900
   - Mobile: 390x844
5. Navigate to each page and take screenshots
6. Save with the naming convention

## Output Location

All screenshots are saved to:
```
docs/screenshots/
├── README.md
├── desktop-login.png
├── desktop-dashboard.png
├── desktop-loads.png
├── desktop-directory.png
├── mobile-login.png
├── mobile-dashboard.png
├── mobile-loads.png
└── mobile-directory.png
```

## Contributing

When submitting screenshots:
1. ✅ Include the `docs/screenshots/README.md`
2. ✅ Update the README with capture date/time
3. ✅ Note which Supabase environment was used
4. ❌ Do NOT commit credentials
5. ❌ Do NOT commit sensitive data in screenshots

---

**Last Updated**: 2026-02-17
