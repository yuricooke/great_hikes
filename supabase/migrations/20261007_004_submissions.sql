-- Spec 010 · Community submissions ("Share your hike"). Idempotent: safe to re-run.
-- Uploads go to a private bucket; the owner approves, and the server copies the photo to the
-- public `community` bucket. Only approved rows are public.

create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  hike_slug text check (hike_slug is null or hike_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  trail_slug text check (trail_slug is null or trail_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  place_name text check (place_name is null or char_length(place_name) between 2 and 120),
  country text check (country is null or char_length(country) between 2 and 80),
  credit_name text not null check (char_length(credit_name) between 2 and 80),
  instagram_handle text check (instagram_handle is null or instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  story text check (story is null or char_length(story) <= 1000),
  image_path text not null,
  width int,
  height int,
  license_accepted boolean not null check (license_accepted),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  public_url text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check (hike_slug is not null or place_name is not null)
);
create index if not exists submissions_status on public.submissions (status, created_at desc);
create index if not exists submissions_hike on public.submissions (hike_slug) where status = 'approved';

create or replace function public.submission_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.status := 'pending';
  new.public_url := null;
  new.reviewed_at := null;
  return new;
end;
$$;
drop trigger if exists submissions_defaults on public.submissions;
create trigger submissions_defaults before insert on public.submissions for each row execute function public.submission_defaults();

alter table public.submissions enable row level security;
drop policy if exists "submissions: read approved or own" on public.submissions;
create policy "submissions: read approved or own" on public.submissions for select
  using (status = 'approved' or auth.uid() = user_id or public.is_owner());
drop policy if exists "submissions: add own" on public.submissions;
create policy "submissions: add own" on public.submissions for insert to authenticated
  with check (auth.uid() = user_id and image_path like auth.uid()::text || '/%');
drop policy if exists "submissions: delete own pending" on public.submissions;
create policy "submissions: delete own pending" on public.submissions for delete
  using ((auth.uid() = user_id and status = 'pending') or public.is_owner());
revoke update on public.submissions from authenticated, anon;

-- Storage buckets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 12582912, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community', 'community', true, 12582912, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

-- Members upload only into their own folder of the private bucket; owners can read all.
drop policy if exists "submissions bucket: upload own" on storage.objects;
create policy "submissions bucket: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "submissions bucket: read own or owner" on storage.objects;
create policy "submissions bucket: read own or owner" on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));
drop policy if exists "submissions bucket: delete own" on storage.objects;
create policy "submissions bucket: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
