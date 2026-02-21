-- ─── Migration: bootstrap owner profile by email ─────────────────────────────
-- Ensures xdrivelogisticsltd@gmail.com always has role='owner', status='active'.
--
-- To change the owner email, update v_owner_email below — it is the ONLY place
-- the email literal appears in this file.
--
-- 1. Builds the trigger function with the email baked in (single source of truth).
-- 2. Runs the immediate fix for any existing auth user with that email.

do $$
declare
  v_owner_email constant text := 'xdrivelogisticsltd@gmail.com';
begin

  -- Build the trigger function with the owner email interpolated via %L so the
  -- literal only appears once in this migration.
  execute format($func$
    create or replace function public.auto_create_owner_profile()
    returns trigger
    language plpgsql
    security definer
    set search_path = public
    as $t$
    begin
      if lower(new.email) = lower(%L) then
        insert into public.profiles (user_id, role, status, full_name)
        values (
          new.id,
          'owner',
          'active',
          coalesce(new.raw_user_meta_data->>'full_name', 'Site Owner')
        )
        on conflict (user_id) do update
          set role       = 'owner',
              status     = 'active',
              updated_at = now();
      end if;
      return new;
    end;
    $t$;
  $func$, v_owner_email);

  -- Immediate fix: upsert the profile for the owner email if the auth user exists.
  insert into public.profiles (user_id, role, status, full_name)
  select
    id,
    'owner',
    'active',
    coalesce(raw_user_meta_data->>'full_name', 'Site Owner')
  from auth.users
  where lower(email) = lower(v_owner_email)
  on conflict (user_id) do update
    set role       = 'owner',
        status     = 'active',
        updated_at = now();

end;
$$;

-- ── Attach trigger to auth.users ──────────────────────────────────────────────
drop trigger if exists trg_auto_create_owner_profile on auth.users;
create trigger trg_auto_create_owner_profile
  after insert on auth.users
  for each row execute function public.auto_create_owner_profile();
