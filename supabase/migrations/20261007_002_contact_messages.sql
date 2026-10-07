-- Spec 004: messages from the /contact form. Written by the server (service role) only;
-- RLS is on with no policies, so visitors can neither read nor write it directly.
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null check (topic in ('hiker', 'photographer', 'partner', 'privacy', 'other')),
  message text not null check (char_length(message) between 10 and 5000),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

alter table public.contact_messages enable row level security;
