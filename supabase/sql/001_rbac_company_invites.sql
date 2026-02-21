create extension if not exists "pgcrypto";

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

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'broker',
  status public.user_status not null default 'pending',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  status public.company_status not null default 'draft',
  name text not null,
  registration_no text,
  vat_no text,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  country text default 'UK',
  contact_email text,
  contact_phone text,
  website text,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role public.company_member_role not null default 'driver',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  invite_email text,
  invite_phone text,
  token text not null unique,
  status public.invite_status not null default 'sent',
  expires_at timestamptz not null default (now() + interval '72 hours'),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.invites enable row level security;

create or replace function public.is_owner(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = uid and p.role = 'owner' and p.status = 'active'
  );
$$;

create policy "profiles_select_self_or_owner"
on public.profiles for select
to authenticated
using (user_id = auth.uid() or public.is_owner(auth.uid()));

create policy "profiles_update_self_or_owner"
on public.profiles for update
to authenticated
using (user_id = auth.uid() or public.is_owner(auth.uid()))
with check (user_id = auth.uid() or public.is_owner(auth.uid()));

create policy "companies_select_owner_or_member"
on public.companies for select
to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid()
  )
);

create policy "companies_insert_authenticated"
on public.companies for insert
to authenticated
with check (auth.uid() is not null);

create policy "companies_update_owner_or_admin"
on public.companies for update
to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid() and m.member_role = 'admin'
  )
)
with check (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = auth.uid() and m.member_role = 'admin'
  )
);

create policy "members_select_owner_or_company_admin"
on public.company_members for select
to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m2
    where m2.company_id = company_members.company_id
      and m2.user_id = auth.uid()
      and m2.member_role = 'admin'
  )
);

create policy "members_insert_owner_or_company_admin"
on public.company_members for insert
to authenticated
with check (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m2
    where m2.company_id = company_members.company_id
      and m2.user_id = auth.uid()
      and m2.member_role = 'admin'
  )
);

create policy "members_delete_owner_or_company_admin"
on public.company_members for delete
to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m2
    where m2.company_id = company_members.company_id
      and m2.user_id = auth.uid()
      and m2.member_role = 'admin'
  )
);

create policy "invites_select_owner_or_company_admin"
on public.invites for select
to authenticated
using (
  public.is_owner(auth.uid())
  or exists (
    select 1 from public.company_members m
    where m.company_id = invites.company_id
      and m.user_id = auth.uid()
      and m.member_role = 'admin'
  )
);

create policy "invites_insert_company_admin"
on public.invites for insert
to authenticated
with check (
  exists (
    select 1 from public.company_members m
    where m.company_id = invites.company_id
      and m.user_id = auth.uid()
      and m.member_role = 'admin'
  )
);
