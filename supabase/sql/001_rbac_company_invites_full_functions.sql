-- ============================================================
-- RBAC + Companies + Invites: Full Schema with RPC Functions
-- Run this in the Supabase SQL editor (idempotent)
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ─── Enum Types ───────────────────────────────────────────────

do $$ begin
  create type public.user_role as enum ('owner','broker','company_admin','driver');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_status as enum ('pending','active','blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.company_status as enum ('draft','pending_review','approved','rejected','suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.company_member_role as enum ('admin','driver');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invite_status as enum ('sent','accepted','expired','revoked');
exception when duplicate_object then null; end $$;

-- ─── Tables ───────────────────────────────────────────────────

create table if not exists public.profiles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  role      public.user_role   not null default 'broker',
  status    public.user_status not null default 'pending',
  full_name text,
  phone     text,
  notes     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id              uuid primary key default gen_random_uuid(),
  created_by      uuid not null references auth.users(id) on delete restrict,
  status          public.company_status not null default 'draft',
  name            text not null,
  registration_no text,
  vat_no          text,
  address_line1   text,
  address_line2   text,
  city            text,
  postcode        text,
  country         text default 'UK',
  contact_email   text,
  contact_phone   text,
  website         text,
  description     text,
  logo_url        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  member_role public.company_member_role not null default 'driver',
  created_at  timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  created_by   uuid not null references auth.users(id) on delete restrict,
  invite_email text,
  invite_phone text,
  token        text not null unique,
  status       public.invite_status not null default 'sent',
  expires_at   timestamptz not null default (now() + interval '72 hours'),
  used_by      uuid references auth.users(id) on delete set null,
  used_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- ─── RLS ──────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.companies       enable row level security;
alter table public.company_members enable row level security;
alter table public.invites         enable row level security;

-- ─── Helper Function ─────────────────────────────────────────

create or replace function public.is_owner(uid uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = uid and p.role = 'owner' and p.status = 'active'
  );
$$;

-- ─── RLS Policies ────────────────────────────────────────────

-- profiles
drop policy if exists "profiles_select_self_or_owner" on public.profiles;
create policy "profiles_select_self_or_owner"
on public.profiles for select to authenticated
using (user_id = auth.uid() or public.is_owner(auth.uid()));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "profiles_update_self_or_owner" on public.profiles;
create policy "profiles_update_self_or_owner"
on public.profiles for update to authenticated
using (user_id = auth.uid() or public.is_owner(auth.uid()))
with check (user_id = auth.uid() or public.is_owner(auth.uid()));

-- companies
drop policy if exists "companies_select_owner_or_member" on public.companies;
create policy "companies_select_owner_or_member"
on public.companies for select to authenticated
using (
  public.is_owner(auth.uid())
  or created_by = auth.uid()
  or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid()
  )
);

drop policy if exists "companies_insert_authenticated" on public.companies;
create policy "companies_insert_authenticated"
on public.companies for insert to authenticated
with check (auth.uid() is not null);

drop policy if exists "companies_update_owner_or_admin" on public.companies;
create policy "companies_update_owner_or_admin"
on public.companies for update to authenticated
using (
  public.is_owner(auth.uid())
  or created_by = auth.uid()
  or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid() and m.member_role = 'admin'
  )
)
with check (
  public.is_owner(auth.uid())
  or created_by = auth.uid()
  or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid() and m.member_role = 'admin'
  )
);

-- company_members
drop policy if exists "members_select_owner_or_company_admin" on public.company_members;
create policy "members_select_owner_or_company_admin"
on public.company_members for select to authenticated
using (
  public.is_owner(auth.uid())
  or user_id = auth.uid()
  or exists (
    select 1 from public.company_members m2
    where m2.company_id = company_members.company_id
      and m2.user_id = auth.uid()
      and m2.member_role = 'admin'
  )
);

drop policy if exists "members_insert_owner_or_company_admin" on public.company_members;
create policy "members_insert_owner_or_company_admin"
on public.company_members for insert to authenticated
with check (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m2
    where m2.company_id = company_members.company_id
      and m2.user_id = auth.uid()
      and m2.member_role = 'admin'
  )
);

drop policy if exists "members_delete_owner_or_company_admin" on public.company_members;
create policy "members_delete_owner_or_company_admin"
on public.company_members for delete to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m2
    where m2.company_id = company_members.company_id
      and m2.user_id = auth.uid()
      and m2.member_role = 'admin'
  )
);

-- invites
drop policy if exists "invites_select_owner_or_company_admin" on public.invites;
create policy "invites_select_owner_or_company_admin"
on public.invites for select to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m
    where m.company_id = invites.company_id
      and m.user_id = auth.uid()
      and m.member_role = 'admin'
  )
);

drop policy if exists "invites_insert_company_admin" on public.invites;
create policy "invites_insert_company_admin"
on public.invites for insert to authenticated
with check (
  exists (
    select 1 from public.company_members m
    where m.company_id = invites.company_id
      and m.user_id = auth.uid()
      and m.member_role = 'admin'
  )
);

-- Allow anonymous read for invite acceptance (validate token without auth)
-- NOTE: The accept_driver_invite RPC validates the token server-side.
-- This policy is intentionally not added to avoid exposing invite tokens to anonymous users.
-- Token validation is handled exclusively by the accept_driver_invite RPC function.

-- ─── RPC: register_broker_pending ────────────────────────────
-- Called after Supabase auth signup. Creates/upserts the profile row.

create or replace function public.register_broker_pending(
  p_full_name text default null,
  p_phone     text default null
)
returns void
language plpgsql security definer
as $$
begin
  insert into public.profiles (user_id, role, status, full_name, phone)
  values (auth.uid(), 'broker', 'pending', p_full_name, p_phone)
  on conflict (user_id) do update
    set role      = 'broker',
        status    = 'pending',
        full_name = coalesce(excluded.full_name, profiles.full_name),
        phone     = coalesce(excluded.phone, profiles.phone),
        updated_at = now();
end;
$$;

-- ─── RPC: register_company_pending ───────────────────────────
-- Called after Supabase auth signup for company_admin.
-- Returns the newly created company row.

create or replace function public.register_company_pending(
  p_company_name text,
  p_full_name    text default null,
  p_phone        text default null
)
returns json
language plpgsql security definer
as $$
declare
  v_company public.companies;
begin
  -- Upsert profile as company_admin / pending
  insert into public.profiles (user_id, role, status, full_name, phone)
  values (auth.uid(), 'company_admin', 'pending', p_full_name, p_phone)
  on conflict (user_id) do update
    set role      = 'company_admin',
        status    = 'pending',
        full_name = coalesce(excluded.full_name, profiles.full_name),
        phone     = coalesce(excluded.phone, profiles.phone),
        updated_at = now();

  -- Create company in draft state
  insert into public.companies (created_by, status, name)
  values (auth.uid(), 'draft', p_company_name)
  returning * into v_company;

  return row_to_json(v_company);
end;
$$;

-- ─── RPC: submit_company_for_review ──────────────────────────

create or replace function public.submit_company_for_review(
  p_company_id uuid
)
returns void
language plpgsql security definer
as $$
begin
  -- Only the company creator or admin member may submit
  if not exists (
    select 1 from public.companies c
    where c.id = p_company_id
      and (c.created_by = auth.uid() or exists (
        select 1 from public.company_members m
        where m.company_id = c.id and m.user_id = auth.uid() and m.member_role = 'admin'
      ))
  ) then
    raise exception 'Unauthorized: you do not manage this company';
  end if;

  update public.companies
  set status = 'pending_review', updated_at = now()
  where id = p_company_id
    and status in ('draft', 'pending_review');
end;
$$;

-- ─── RPC: approve_broker ─────────────────────────────────────

create or replace function public.approve_broker(
  p_user_id uuid,
  p_notes   text default null
)
returns void
language plpgsql security definer
as $$
begin
  if not public.is_owner(auth.uid()) then
    raise exception 'Unauthorized: owner only';
  end if;

  update public.profiles
  set status = 'active', notes = p_notes, updated_at = now()
  where user_id = p_user_id and role = 'broker';
end;
$$;

-- ─── RPC: reject_broker ──────────────────────────────────────

create or replace function public.reject_broker(
  p_user_id uuid,
  p_notes   text default null
)
returns void
language plpgsql security definer
as $$
begin
  if not public.is_owner(auth.uid()) then
    raise exception 'Unauthorized: owner only';
  end if;

  update public.profiles
  set status = 'blocked', notes = p_notes, updated_at = now()
  where user_id = p_user_id and role = 'broker';
end;
$$;

-- ─── RPC: approve_company ────────────────────────────────────
-- Activates profile, approves company, inserts admin member.

create or replace function public.approve_company(
  p_user_id    uuid,
  p_company_id uuid default null,
  p_notes      text default null
)
returns void
language plpgsql security definer
as $$
declare
  v_company_id uuid;
begin
  if not public.is_owner(auth.uid()) then
    raise exception 'Unauthorized: owner only';
  end if;

  -- Resolve company_id: use explicit param or find latest by created_by
  if p_company_id is not null then
    v_company_id := p_company_id;
  else
    select id into v_company_id
    from public.companies
    where created_by = p_user_id
    order by created_at desc
    limit 1;
  end if;

  if v_company_id is null then
    raise exception 'No company found for user %', p_user_id;
  end if;

  -- Activate profile
  update public.profiles
  set status = 'active', notes = p_notes, updated_at = now()
  where user_id = p_user_id and role = 'company_admin';

  -- Approve company
  update public.companies
  set status = 'approved', updated_at = now()
  where id = v_company_id;

  -- Add user as company admin member (idempotent)
  insert into public.company_members (company_id, user_id, member_role)
  values (v_company_id, p_user_id, 'admin')
  on conflict (company_id, user_id) do update
    set member_role = 'admin';
end;
$$;

-- ─── RPC: reject_company ─────────────────────────────────────

create or replace function public.reject_company(
  p_user_id    uuid,
  p_company_id uuid default null,
  p_notes      text default null
)
returns void
language plpgsql security definer
as $$
declare
  v_company_id uuid;
begin
  if not public.is_owner(auth.uid()) then
    raise exception 'Unauthorized: owner only';
  end if;

  if p_company_id is not null then
    v_company_id := p_company_id;
  else
    select id into v_company_id
    from public.companies
    where created_by = p_user_id
    order by created_at desc
    limit 1;
  end if;

  -- Block profile
  update public.profiles
  set status = 'blocked', notes = p_notes, updated_at = now()
  where user_id = p_user_id and role = 'company_admin';

  -- Reject company
  if v_company_id is not null then
    update public.companies
    set status = 'rejected', updated_at = now()
    where id = v_company_id;
  end if;
end;
$$;

-- ─── RPC: create_driver_invite ───────────────────────────────
-- Approved company admin creates a token invite link (no email required).

create or replace function public.create_driver_invite(
  p_company_id    uuid,
  p_invite_email  text    default null,
  p_invite_phone  text    default null,
  p_token         text    default null,
  p_expires_hours integer default 72
)
returns json
language plpgsql security definer
as $$
declare
  v_invite public.invites;
  v_token  text;
begin
  -- Must be admin member of an approved company
  if not exists (
    select 1 from public.company_members m
    join public.companies c on c.id = m.company_id
    where m.company_id = p_company_id
      and m.user_id    = auth.uid()
      and m.member_role = 'admin'
      and c.status     = 'approved'
  ) then
    raise exception 'Unauthorized: must be approved company admin';
  end if;

  -- Use supplied token or generate one
  v_token := coalesce(nullif(trim(p_token), ''), encode(gen_random_bytes(24), 'hex'));

  insert into public.invites (
    company_id, created_by, invite_email, invite_phone,
    token, status, expires_at
  )
  values (
    p_company_id, auth.uid(), p_invite_email, p_invite_phone,
    v_token, 'sent', now() + (p_expires_hours || ' hours')::interval
  )
  returning * into v_invite;

  return row_to_json(v_invite);
end;
$$;

-- ─── RPC: accept_driver_invite ───────────────────────────────
-- Called after the driver has an auth session (signed up or signed in).
-- Validates the token, creates/updates profile, adds company membership.

create or replace function public.accept_driver_invite(
  p_token     text,
  p_full_name text default null,
  p_phone     text default null
)
returns json
language plpgsql security definer
as $$
declare
  v_invite   public.invites;
  v_result   json;
begin
  -- Fetch and validate invite
  select * into v_invite
  from public.invites
  where token = p_token
    and status = 'sent'
    and expires_at > now();

  if v_invite.id is null then
    raise exception 'Invalid or expired invite token';
  end if;

  -- Create/update driver profile (active immediately via invite)
  insert into public.profiles (user_id, role, status, full_name, phone)
  values (auth.uid(), 'driver', 'active', p_full_name, p_phone)
  on conflict (user_id) do update
    set role      = 'driver',
        status    = 'active',
        full_name = coalesce(excluded.full_name, profiles.full_name),
        phone     = coalesce(excluded.phone, profiles.phone),
        updated_at = now();

  -- Add to company as driver (idempotent)
  insert into public.company_members (company_id, user_id, member_role)
  values (v_invite.company_id, auth.uid(), 'driver')
  on conflict (company_id, user_id) do nothing;

  -- Mark invite as used
  update public.invites
  set status = 'accepted', used_by = auth.uid(), used_at = now()
  where id = v_invite.id;

  v_result := json_build_object(
    'company_id', v_invite.company_id,
    'invite_id',  v_invite.id
  );
  return v_result;
end;
$$;

-- ─── Owner Bootstrap Note ─────────────────────────────────────
-- After running this SQL, create the owner account via Supabase Auth,
-- then run:
--   INSERT INTO public.profiles (user_id, role, status, full_name)
--   VALUES ('<auth-user-uuid>', 'owner', 'active', 'Site Owner')
--   ON CONFLICT (user_id) DO UPDATE SET role='owner', status='active';
