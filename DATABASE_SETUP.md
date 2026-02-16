# Database Setup Guide

## Overview

This guide will help you set up the XDrive Logistics database with multi-tenant support in Supabase.

## Prerequisites

- A Supabase account and project
- Access to your Supabase SQL Editor

## Step 1: Run the Schema SQL

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor** from the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql` into the editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for the success message: ✅ "Success. No rows returned"

This will create:
- `profiles` table (extends auth.users)
- `companies` table (for multi-tenant support)
- `drivers` table (company drivers)
- `jobs` table (transport jobs)
- `invoices` table (billing)
- RPC function `create_company()` (for auto-creating companies)
- Row Level Security (RLS) policies (for data isolation)
- Auto-generated codes (JOB-1001, INV-2026-1001, etc.)

## Step 2: Create Your First User

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Check **Auto Confirm User**
5. Click **Create user**

## Step 3: How It Works

### Automatic Company Creation

When a user logs in for the first time:

1. The app checks if their profile has a `company_id`
2. If not, it automatically calls the `create_company('XDrive Logistics')` RPC function
3. This creates a new company and links it to the user's profile
4. All subsequent data (jobs, drivers, invoices) will be linked to this company

### Multi-Tenant Architecture

Each user belongs to one company. All data is filtered by `company_id`:

- **Jobs**: Only show jobs for the user's company
- **Drivers**: Only show drivers for the user's company
- **Invoices**: Only show invoices for the user's company

This is enforced at the database level using Row Level Security (RLS) policies.

## Step 4: Verify Setup

After running the SQL and creating a user:

1. Log in to the application at http://localhost:3000/login
2. You should be redirected to the dashboard
3. The dashboard will show "No jobs yet" initially
4. Click "Create Job" to add your first job
5. The KPI cards will update with real data

## Environment Variables

Make sure these are set in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For production, set these in your Netlify environment variables.

## Troubleshooting

### Error: "Missing Supabase credentials"

Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your environment variables.

### Error: "relation does not exist"

You need to run the `supabase-schema.sql` file in your Supabase SQL Editor.

### Error: "User not authenticated"

Make sure you're logged in. Go to http://localhost:3000/login to log in.

### Error: "User already belongs to a company"

This is expected if you try to create a company when one already exists. The app handles this automatically.

## Data Flow

```
1. User signs up/logs in
   ↓
2. Auth creates user in auth.users
   ↓
3. Trigger auto-creates profile in public.profiles
   ↓
4. App checks if profile.company_id is null
   ↓
5. If null, call create_company() RPC
   ↓
6. RPC creates company and updates profile
   ↓
7. App fetches jobs/drivers/invoices filtered by company_id
```

## API Reference

### RPC Functions

#### `create_company(company_name TEXT) RETURNS UUID`

Creates a new company and links it to the current user.

```javascript
const { data, error } = await supabase
  .rpc('create_company', { company_name: 'XDrive Logistics' })
```

#### `get_user_company_id() RETURNS UUID`

Returns the company_id for the current user.

```javascript
const { data, error } = await supabase
  .rpc('get_user_company_id')
```

## Table Structure

### profiles
- `id` (UUID, PK) - References auth.users
- `email` (TEXT)
- `full_name` (TEXT)
- `phone` (TEXT)
- `company_id` (UUID) - FK to companies
- `role` (TEXT) - admin, dispatcher, driver, viewer

### companies
- `id` (UUID, PK)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `address` (TEXT)
- `created_by` (UUID) - FK to auth.users

### jobs
- `id` (UUID, PK)
- `company_id` (UUID, FK) - **REQUIRED**
- `job_code` (VARCHAR) - Auto-generated (JOB-1001)
- `pickup` (TEXT)
- `delivery` (TEXT)
- `price` (DECIMAL)
- `status` (TEXT) - pending, confirmed, in-transit, delivered, cancelled

### drivers
- `id` (UUID, PK)
- `company_id` (UUID, FK) - **REQUIRED**
- `full_name` (TEXT)
- `phone` (TEXT)
- `is_active` (BOOLEAN)

### invoices
- `id` (UUID, PK)
- `company_id` (UUID, FK) - **REQUIRED**
- `invoice_number` (VARCHAR) - Auto-generated (INV-2026-1001)
- `job_id` (UUID, FK) - Links to job
- `amount` (DECIMAL)
- `status` (TEXT) - pending, sent, paid, overdue, cancelled

## Security

All tables use Row Level Security (RLS) to ensure:

1. Users can only see data for their company
2. Users cannot access data from other companies
3. All queries are automatically filtered by `company_id`

This is enforced at the database level, making it impossible to bypass through the application.
