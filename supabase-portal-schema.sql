-- XDrive Portal - ONE SHOT DB SETUP (idempotent)
-- Run in Supabase SQL Editor (public schema)

begin;

-- 0) Extensions (uuid generator)
create extension if not exists "pgcrypto";

-- 1) Helpers: updated_at trigger
-- NOTE: also aliased as set_updated_at() in some older schema files —
-- update_updated_at_column() is the canonical name used across all files.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Core tables
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'user' check (role in ('user','driver','company','admin')),
  company_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  phone text,
  email text,
  vat_number text,
  company_number text,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Memberships: enables multi-user per company (owner/admin/member)
create table if not exists public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_in_company text not null default 'member' check (role_in_company in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited','disabled')),
  created_at timestamptz not null default now(),
  unique(company_id, user_id)
);

-- Keep profiles.company_id synced is optional; we don't force it here.

-- 3) Fleet tables
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  license_number text,
  notes text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_type text not null,
  registration text not null,
  make text,
  model text,
  year integer,
  capacity_kg numeric,
  notes text,
  is_available boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_vehicle_assignments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  active_from timestamptz default now(),
  active_to timestamptz,
  created_at timestamptz not null default now(),
  unique(driver_id, vehicle_id, active_from)
);

-- 4) Loads / Jobs

-- Marketplace job postings (queried by the app as public.jobs)
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  posted_by_company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'open'
    check (status in ('open', 'assigned', 'in-transit', 'completed', 'cancelled')),
  pickup_location text not null,
  delivery_location text not null,
  pickup_datetime timestamptz,
  delivery_datetime timestamptz,
  vehicle_type text,
  load_details text,
  pallets integer,
  weight_kg numeric,
  budget numeric,
  assigned_company_id uuid references public.companies(id),
  accepted_bid_id uuid
);

create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_jobs_created_at on public.jobs(created_at desc);
create index if not exists idx_jobs_posted_by on public.jobs(posted_by_company_id);
create index if not exists idx_jobs_assigned_to on public.jobs(assigned_company_id);

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,

  title text,
  notes text,

  pickup_location text,
  pickup_date timestamptz,
  delivery_location text,
  delivery_date timestamptz,

  vehicle_type text,
  distance_miles numeric,

  target_price numeric,
  currency text default 'GBP',

  status text not null default 'draft'
    check (status in ('draft','published','assigned','completed','cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_bids (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete cascade,

  bidder_company_id uuid not null references public.companies(id) on delete cascade,
  bidder_user_id uuid not null references auth.users(id) on delete restrict,

  quote_amount numeric,
  currency text default 'GBP',
  message text,

  status text not null default 'submitted'
    check (status in ('submitted','accepted','rejected','withdrawn')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(load_id, bidder_company_id)  -- one bid per company per load
);

-- 5) Pages: Live Availability / Return Journeys / Diary / Quotes (optional)
create table if not exists public.live_availability (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete set null,

  location text,
  radius_miles numeric,
  available_from timestamptz,
  available_to timestamptz,
  notes text,

  status text not null default 'active' check (status in ('active','inactive')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.return_journeys (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,

  from_location text,
  to_location text,
  date_from timestamptz,
  date_to timestamptz,

  vehicle_type text,
  notes text,

  status text not null default 'active' check (status in ('active','inactive','completed','cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text,
  body text,
  entry_date date default current_date,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If your app uses a separate quotes table, keep it. Otherwise, job_bids is enough.
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  load_id uuid references public.loads(id) on delete set null,
  amount numeric,
  currency text default 'GBP',
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6) Documents / Feedback / Notifications (basic)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null default 'documents',
  path text not null,
  mime text,
  size_bytes bigint,
  doc_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  rating int check (rating between 1 and 5),
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- 7) Add missing columns safely (in case tables already existed)
do $$
begin
  -- job_bids.quote_amount
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='job_bids' and column_name='quote_amount'
  ) then
    alter table public.job_bids add column quote_amount numeric;
  end if;

  -- job_bids.status
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='job_bids' and column_name='status'
  ) then
    alter table public.job_bids add column status text not null default 'submitted'
      check (status in ('submitted','accepted','rejected','withdrawn'));
  end if;
end $$;

-- 8) Indexes (performance)
create index if not exists idx_companies_created_by on public.companies(created_by);
create index if not exists idx_memberships_company_user on public.company_memberships(company_id, user_id);

create index if not exists idx_loads_company_status on public.loads(company_id, status);
create index if not exists idx_loads_status on public.loads(status);
create index if not exists idx_job_bids_load on public.job_bids(load_id);
create index if not exists idx_job_bids_company on public.job_bids(bidder_company_id);
create index if not exists idx_job_bids_status on public.job_bids(status);

create index if not exists idx_drivers_company on public.drivers(company_id);
create index if not exists idx_vehicles_company on public.vehicles(company_id);

-- 9) updated_at triggers (only where column exists)
do $$
declare
  t text;
begin
  foreach t in array array['profiles','companies','drivers','vehicles','driver_vehicle_assignments','jobs','loads','job_bids','live_availability','return_journeys','diary_entries','quotes']
  loop
    -- create trigger only if table exists
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      execute format('drop trigger if exists trg_%s_updated_at on public.%I;', t, t);
      execute format('create trigger trg_%s_updated_at before update on public.%I for each row execute function public.update_updated_at_column();', t, t);
    end if;
  end loop;
end $$;

-- 10) RLS Helper function: "is company member?"
-- FIX: Drop function first to allow parameter name changes
drop function if exists public.is_company_member(uuid);

create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.company_memberships m
    where m.company_id = p_company_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
  or exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and c.created_by = auth.uid()
  );
$$;

-- 11) Enable RLS
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;

alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.driver_vehicle_assignments enable row level security;

alter table public.jobs enable row level security;
alter table public.loads enable row level security;
alter table public.job_bids enable row level security;

alter table public.live_availability enable row level security;
alter table public.return_journeys enable row level security;
alter table public.diary_entries enable row level security;
alter table public.quotes enable row level security;

alter table public.documents enable row level security;
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;

-- 12) Policies (drop/create to keep idempotent)
-- PROFILES: user can read/update own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- COMPANIES: owner + members can view; owner can update
drop policy if exists "companies_select_member_or_owner" on public.companies;
create policy "companies_select_member_or_owner"
on public.companies for select
using (public.is_company_member(id));

drop policy if exists "companies_insert_owner" on public.companies;
create policy "companies_insert_owner"
on public.companies for insert
with check (created_by = auth.uid());

drop policy if exists "companies_update_owner" on public.companies;
create policy "companies_update_owner"
on public.companies for update
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- MEMBERSHIPS: members can read memberships of their company; owner/admin can manage
drop policy if exists "memberships_select_company" on public.company_memberships;
create policy "memberships_select_company"
on public.company_memberships for select
using (public.is_company_member(company_id));

drop policy if exists "memberships_insert_owner_admin" on public.company_memberships;
create policy "memberships_insert_owner_admin"
on public.company_memberships for insert
with check (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = company_memberships.company_id
      and m.user_id = auth.uid()
      and m.status='active'
      and m.role_in_company in ('owner','admin')
  )
  or exists (
    select 1 from public.companies c
    where c.id = company_memberships.company_id
      and c.created_by = auth.uid()
  )
);

drop policy if exists "memberships_update_owner_admin" on public.company_memberships;
create policy "memberships_update_owner_admin"
on public.company_memberships for update
using (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = company_memberships.company_id
      and m.user_id = auth.uid()
      and m.status='active'
      and m.role_in_company in ('owner','admin')
  )
  or exists (
    select 1 from public.companies c
    where c.id = company_memberships.company_id
      and c.created_by = auth.uid()
  )
)
with check (true);

-- FLEET: company members can CRUD their own company items
do $$
declare
  tbl text;
begin
  foreach tbl in array array['drivers','vehicles','driver_vehicle_assignments','live_availability','return_journeys','diary_entries','quotes','documents','feedback']
  loop
    execute format('drop policy if exists "%s_select_company" on public.%I;', tbl, tbl);
    execute format('create policy "%s_select_company" on public.%I for select using (public.is_company_member(company_id));', tbl, tbl);

    execute format('drop policy if exists "%s_insert_company" on public.%I;', tbl, tbl);
    execute format('create policy "%s_insert_company" on public.%I for insert with check (public.is_company_member(company_id));', tbl, tbl);

    execute format('drop policy if exists "%s_update_company" on public.%I;', tbl, tbl);
    execute format('create policy "%s_update_company" on public.%I for update using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));', tbl, tbl);

    execute format('drop policy if exists "%s_delete_company" on public.%I;', tbl, tbl);
    execute format('create policy "%s_delete_company" on public.%I for delete using (public.is_company_member(company_id));', tbl, tbl);
  end loop;
end $$;

-- JOBS: poster company can manage their own jobs; all authenticated users can view open jobs
drop policy if exists "jobs_select_open_or_company" on public.jobs;
create policy "jobs_select_open_or_company"
on public.jobs for select
using (
  status = 'open'
  or public.is_company_member(posted_by_company_id)
  or public.is_company_member(assigned_company_id)
);

drop policy if exists "jobs_insert_company" on public.jobs;
create policy "jobs_insert_company"
on public.jobs for insert
with check (public.is_company_member(posted_by_company_id));

drop policy if exists "jobs_update_company" on public.jobs;
create policy "jobs_update_company"
on public.jobs for update
using (public.is_company_member(posted_by_company_id))
with check (public.is_company_member(posted_by_company_id));

drop policy if exists "jobs_delete_company" on public.jobs;
create policy "jobs_delete_company"
on public.jobs for delete
using (public.is_company_member(posted_by_company_id));

-- LOADS: members can create/update/delete their company loads;
-- select rule: allow members to see published loads + their own company loads
drop policy if exists "loads_select_published_or_company" on public.loads;
create policy "loads_select_published_or_company"
on public.loads for select
using (
  status = 'published'
  or public.is_company_member(company_id)
);

drop policy if exists "loads_insert_company" on public.loads;
create policy "loads_insert_company"
on public.loads for insert
with check (public.is_company_member(company_id) and created_by = auth.uid());

drop policy if exists "loads_update_company" on public.loads;
create policy "loads_update_company"
on public.loads for update
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists "loads_delete_company" on public.loads;
create policy "loads_delete_company"
on public.loads for delete
using (public.is_company_member(company_id));

-- JOB_BIDS:
-- select: poster company can see bids on their loads; bidder company can see own bids
drop policy if exists "job_bids_select_poster_or_bidder" on public.job_bids;
create policy "job_bids_select_poster_or_bidder"
on public.job_bids for select
using (
  public.is_company_member(bidder_company_id)
  or exists (
    select 1
    from public.loads l
    where l.id = job_bids.load_id
      and public.is_company_member(l.company_id)
  )
);

-- insert: bidder must be member of bidder_company_id
drop policy if exists "job_bids_insert_bidder" on public.job_bids;
create policy "job_bids_insert_bidder"
on public.job_bids for insert
with check (
  public.is_company_member(bidder_company_id)
  and bidder_user_id = auth.uid()
);

-- update: bidder can withdraw/update while pending; poster can accept/reject
drop policy if exists "job_bids_update_bidder_or_poster" on public.job_bids;
create policy "job_bids_update_bidder_or_poster"
on public.job_bids for update
using (
  public.is_company_member(bidder_company_id)
  or exists (
    select 1 from public.loads l
    where l.id = job_bids.load_id
      and public.is_company_member(l.company_id)
  )
)
with check (true);

-- delete: only bidder company (optional)
drop policy if exists "job_bids_delete_bidder" on public.job_bids;
create policy "job_bids_delete_bidder"
on public.job_bids for delete
using (public.is_company_member(bidder_company_id));

-- NOTIFICATIONS: user can read/update own notifications
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

commit;

-- Quick check: show tables & key columns
-- select table_name from information_schema.tables where table_schema='public' order by table_name;
