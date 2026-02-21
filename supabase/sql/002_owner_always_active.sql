-- ─── Migration: owner profiles are always active ─────────────────────────────
-- Owners never require approval. This trigger enforces that any profile row
-- with role = 'owner' is automatically set to status = 'active'.

create or replace function public.enforce_owner_active()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'owner' then
    new.status := 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_owner_always_active on public.profiles;
create trigger trg_owner_always_active
  before insert or update on public.profiles
  for each row execute function public.enforce_owner_active();

-- Also fix any existing owner profiles that are incorrectly set to pending.
update public.profiles
set status = 'active', updated_at = now()
where role = 'owner' and status = 'pending';
