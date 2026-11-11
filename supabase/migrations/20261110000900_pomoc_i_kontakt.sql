-- Centar za pomoć i kontakt forma.

-- „Da li ti je ovaj članak pomogao?“ Članci su u kodu (src/lib/help.ts), pa se glas vezuje za slug.
create table public.help_feedback (
  id bigint generated always as identity primary key,
  article_slug text not null check (article_slug ~ '^[a-z0-9-]{1,80}$'),
  helpful boolean not null,
  created_at timestamptz not null default now()
);

alter table public.help_feedback enable row level security;
create policy "svako glasa" on public.help_feedback for insert to anon, authenticated with check (true);
create policy "admin cita glasove" on public.help_feedback for select to authenticated using (public.is_admin());
revoke insert, update, delete on public.help_feedback from anon, authenticated;
grant insert (article_slug, helpful) on public.help_feedback to anon, authenticated;

-- Zahtevi iz kontakt forme („Imaš problem?“). Može i bez naloga; čita samo admin.
create type public.contact_topic as enum ('nalog', 'kupovina', 'bezbednost', 'prodaja');

create table public.contact_requests (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null default auth.uid(),
  first_name text not null check (length(trim(first_name)) between 1 and 80),
  last_name text check (length(last_name) <= 80),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  listing_ref text check (length(listing_ref) <= 80),
  message text not null check (length(trim(message)) between 1 and 5000),
  topics public.contact_topic[] not null default '{}',
  status text not null default 'novo' check (status in ('novo', 'u_radu', 'reseno')),
  created_at timestamptz not null default now()
);

create index contact_requests_status_idx on public.contact_requests (status, created_at);

alter table public.contact_requests enable row level security;
create policy "svako salje zahtev" on public.contact_requests for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "admin cita zahteve" on public.contact_requests for select to authenticated using (public.is_admin());
create policy "admin menja zahteve" on public.contact_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.contact_requests from anon, authenticated;
grant update (status) on public.contact_requests to authenticated;
grant insert (first_name, last_name, email, listing_ref, message, topics) on public.contact_requests to anon, authenticated;
