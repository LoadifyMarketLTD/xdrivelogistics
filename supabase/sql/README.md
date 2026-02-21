# RBAC + Companies + Invites Schema

Run `001_rbac_company_invites.sql` in the Supabase SQL editor.

## Owner Bootstrap

After running the migration, create the owner user normally via Supabase Auth (email/password), then run:

```sql
-- Replace <owner-user-id> with the UUID from auth.users
UPDATE public.profiles
SET role = 'owner', status = 'active'
WHERE user_id = '<owner-user-id>';
```

If using the legacy profiles table (column `id` instead of `user_id`):

```sql
UPDATE public.profiles
SET role = 'owner', status = 'active'
WHERE id = '<owner-user-id>';
```

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=https://xdrivelogistics.co.uk
```

## How Invites Work (No Email Needed)

1. Company admin goes to `/dashboard/company/drivers`
2. Clicks "Create Invite" — a token URL is generated and shown
3. Copy the URL: `https://xdrivelogistics.co.uk/invite/accept?token=<token>`
4. Send it to the driver via WhatsApp, SMS, or email manually
5. Driver opens the link, signs up with email/password
6. Driver is immediately active and added to the company
7. Token is marked used — cannot be reused

## Role Routing

| Role          | Status  | Redirects to              |
|---------------|---------|---------------------------|
| owner         | active  | /admin/approvals           |
| broker        | pending | /pending                  |
| broker        | active  | /dashboard/broker          |
| company_admin | pending | /pending (can edit /dashboard/company/profile) |
| company_admin | active  | /dashboard/company         |
| driver        | active  | /dashboard/driver          |
