-- Spec 003 · Accounts & favorites (docs/architecture/database.md)
-- Idempotent: safe to re-run.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  instagram_handle text,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'owner')),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  hike_slug text not null check (hike_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  primary key (user_id, hike_slug)
);

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;

-- Profiles: each user reads and updates only their own row (role is not user-editable).
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Favorites: private to their owner.
drop policy if exists "favorites: read own" on public.favorites;
create policy "favorites: read own" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "favorites: add own" on public.favorites;
create policy "favorites: add own" on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "favorites: remove own" on public.favorites;
create policy "favorites: remove own" on public.favorites for delete using (auth.uid() = user_id);

-- Create a profile for every new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
