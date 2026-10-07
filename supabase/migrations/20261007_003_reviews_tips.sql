-- Spec 009 · Reviews & tips. Idempotent: safe to re-run.
-- Public read of visible rows; members write their own; the owner can hide/restore anything.

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  hike_slug text not null check (hike_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  trail_slug text check (trail_slug is null or trail_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  rating smallint not null check (rating between 1 and 5),
  hiked_on date check (hiked_on is null or hiked_on <= current_date),
  body text not null check (char_length(body) between 20 and 2000),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_target on public.reviews (hike_slug, trail_slug, created_at desc);

create table if not exists public.tips (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  hike_slug text not null check (hike_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  trail_slug text check (trail_slug is null or trail_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind text not null check (kind in ('water', 'permits', 'transport', 'stay', 'gear', 'safety', 'other')),
  body text not null check (char_length(body) between 10 and 500),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists tips_target on public.tips (hike_slug, trail_slug, created_at desc);

-- Public name comes from the profile at write time (profiles themselves stay private).
create or replace function public.set_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.author_name := coalesce((select display_name from public.profiles where id = auth.uid()), 'Hiker');
  if tg_op = 'INSERT' then
    new.status := 'visible';
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_author on public.reviews;
create trigger reviews_author before insert on public.reviews for each row execute function public.set_author_name();
drop trigger if exists tips_author on public.tips;
create trigger tips_author before insert on public.tips for each row execute function public.set_author_name();

alter table public.reviews enable row level security;
alter table public.tips enable row level security;

do $$
declare t text;
begin
  foreach t in array array['reviews', 'tips'] loop
    execute format('drop policy if exists "%1$s: read visible" on public.%1$s', t);
    execute format('create policy "%1$s: read visible" on public.%1$s for select using (status = ''visible'' or auth.uid() = user_id or public.is_owner())', t);
    execute format('drop policy if exists "%1$s: add own" on public.%1$s', t);
    execute format('create policy "%1$s: add own" on public.%1$s for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s: delete own" on public.%1$s', t);
    execute format('create policy "%1$s: delete own" on public.%1$s for delete using (auth.uid() = user_id or public.is_owner())', t);
    execute format('drop policy if exists "%1$s: owner moderates" on public.%1$s', t);
    execute format('create policy "%1$s: owner moderates" on public.%1$s for update using (public.is_owner()) with check (public.is_owner())', t);
  end loop;
end $$;

-- Owners may change only the status column.
revoke update on public.reviews, public.tips from authenticated, anon;
grant update (status) on public.reviews, public.tips to authenticated;
