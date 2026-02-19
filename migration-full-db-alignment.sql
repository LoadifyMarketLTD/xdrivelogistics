-- ============================================================
-- PHASE 1 — FULL DATABASE ALIGNMENT
-- XDrive Logistics – run in Supabase SQL Editor
-- ============================================================
-- Idempotent: safe to run multiple times.
-- ============================================================

-- Extensions
create extension if not exists pgcrypto;

-- ============================================================
-- JOBS TABLE
-- ============================================================
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),

  created_by uuid null,
  company_id uuid null,
  status text not null default 'open',

  pickup_address text,
  pickup_postcode text,
  pickup_lat double precision,
  pickup_lng double precision,
  pickup_at timestamptz,

  delivery_address text,
  delivery_postcode text,
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_at timestamptz,

  vehicle_type text,
  cargo_type text,

  pallets integer default 0,
  boxes integer default 0,
  bags integer default 0,
  items integer default 0,

  weight_kg numeric(10,2) default 0,
  budget_gbp numeric(10,2) default 0,

  load_details text,
  requirements text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add optional columns that may be missing in an existing jobs table
alter table public.jobs add column if not exists load_details text;
alter table public.jobs add column if not exists pickup_lat double precision;
alter table public.jobs add column if not exists pickup_lng double precision;
alter table public.jobs add column if not exists delivery_lat double precision;
alter table public.jobs add column if not exists delivery_lng double precision;
alter table public.jobs add column if not exists budget_gbp numeric(10,2);
alter table public.jobs add column if not exists requirements text;

-- ============================================================
-- JOB BIDS — align to bidder_id / amount_gbp
-- ============================================================
create table if not exists public.job_bids (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  bidder_id uuid not null,
  amount_gbp numeric(10,2) not null,
  message text,
  status text default 'submitted',
  created_at timestamptz default now()
);

-- If the table already exists, make sure the right columns are present.
-- Handle previous migration that may have renamed bidder_id → bidder_user_id.
do $$
begin
  -- Rename bidder_user_id back to bidder_id if that migration ran
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'bidder_user_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'bidder_id'
  ) then
    alter table public.job_bids rename column bidder_user_id to bidder_id;
  end if;

  -- Add bidder_id if missing entirely
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'bidder_id'
  ) then
    alter table public.job_bids add column bidder_id uuid;
  end if;

  -- Rename quote_amount → amount_gbp if the old column exists
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'quote_amount'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'amount_gbp'
  ) then
    alter table public.job_bids rename column quote_amount to amount_gbp;
  end if;

  -- Rename amount → amount_gbp if that was the old column name
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'amount'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'amount_gbp'
  ) then
    alter table public.job_bids rename column amount to amount_gbp;
  end if;

  -- Add amount_gbp if still missing
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'amount_gbp'
  ) then
    alter table public.job_bids add column amount_gbp numeric(10,2);
  end if;

  -- Add status column if missing
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'job_bids' and column_name = 'status'
  ) then
    alter table public.job_bids add column status text default 'submitted';
  end if;
end $$;

-- Remove invalid rows before enforcing NOT NULL
delete from public.job_bids where bidder_id is null or amount_gbp is null;

-- Enforce NOT NULL
alter table public.job_bids alter column bidder_id set not null;
alter table public.job_bids alter column amount_gbp set not null;

create index if not exists idx_job_bids_job on public.job_bids(job_id);
create index if not exists idx_job_bids_bidder on public.job_bids(bidder_id);
create index if not exists idx_job_bids_status on public.job_bids(status);

-- ============================================================
-- JOB TRACKING EVENTS
-- ============================================================
create table if not exists public.job_tracking_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  actor_id uuid,
  event_type text not null,
  notes text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_job_tracking_events_job
  on public.job_tracking_events(job_id);

-- ============================================================
-- DRIVER LIVE LOCATION
-- ============================================================
create table if not exists public.driver_locations (
  driver_id uuid primary key,
  lat double precision not null,
  lng double precision not null,
  updated_at timestamptz default now()
);

create index if not exists idx_driver_locations_updated
  on public.driver_locations(updated_at);

-- ============================================================
-- AUTO-UPDATE updated_at trigger for jobs
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_jobs_updated on public.jobs;
create trigger trg_jobs_updated
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ============================================================
-- VERIFICATION
-- ============================================================
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'job_bids'
order by ordinal_position;
