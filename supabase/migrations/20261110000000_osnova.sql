-- Sajam: osnovna šema baze za MVP (samo chat, bez korpe i plaćanja).
-- Odobreno 10. 11. 2026, vidi „Sajam – osnova sajta i baza podataka“.

create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pg_trgm with schema extensions;
grant usage on schema extensions to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Vrednosti koje baza zna unapred (iz Figme)
-- ---------------------------------------------------------------------------

create type public.item_type as enum ('knjiga', 'muzika', 'igra', 'manga_strip', 'oprema');

-- Stanja iz ekrana „Stanje artikala“, od najboljeg ka najlošijem.
create type public.item_condition as enum ('novo', 'kao_novo', 'vrlo_dobro', 'dobro', 'zadovoljavajuce');

create type public.listing_status as enum ('dostupno', 'rezervisano', 'prodato', 'uklonjen');

create type public.shipping_method as enum ('posta', 'licno');

create type public.payment_method as enum ('tekuci_racun', 'pouzece', 'gotovina');

create type public.report_status as enum ('otvorena', 'resena', 'odbacena');

create type public.help_section as enum ('kupovina', 'prodaja', 'nalog');

-- ---------------------------------------------------------------------------
-- Pomoćne funkcije
-- ---------------------------------------------------------------------------

-- Pretraga bez kvačica: „savic“ nalazi „Savić“.
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profili: jedan nalog za kupovinu i prodaju
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext not null unique
    check (username ~ '^[a-z0-9_.]{3,30}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  bio text check (char_length(bio) <= 1000),
  city text check (char_length(city) <= 80),
  -- „Usually ships in 3 days“ na profilu prodavca
  ships_within_days smallint check (ships_within_days between 1 and 30),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- Novi nalog odmah dobija profil. Korisničko ime se pravi od mejla i može se promeniti.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(public.f_unaccent(split_part(coalesce(new.email, ''), '@', 1)), '[^a-zA-Z0-9_.]', '', 'g'));
  if char_length(base) < 3 then
    base := 'korisnik';
  end if;
  base := left(base, 24);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), candidate),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Kategorije i žanrovi
-- ---------------------------------------------------------------------------

create table public.categories (
  id smallint generated always as identity primary key,
  parent_id smallint references public.categories (id) on delete restrict,
  item_type public.item_type not null,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  position smallint not null default 0,
  unique nulls not distinct (parent_id, slug)
);

create index categories_parent_idx on public.categories (parent_id);

create table public.genres (
  id smallint generated always as identity primary key,
  item_type public.item_type not null,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  position smallint not null default 0,
  unique (item_type, slug)
);

-- ---------------------------------------------------------------------------
-- Oglasi
-- ---------------------------------------------------------------------------

create table public.listings (
  id bigint generated always as identity primary key,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  item_type public.item_type not null,
  category_id smallint not null references public.categories (id),
  genre_id smallint references public.genres (id),

  title text not null check (char_length(title) between 2 and 200),
  author text check (char_length(author) <= 200),
  isbn text check (isbn ~ '^(97[89])?[0-9]{9}[0-9X]$'),
  language text check (char_length(language) <= 40),
  page_count integer check (page_count between 1 and 20000),
  publisher text check (char_length(publisher) <= 200),
  bundle_count smallint not null default 1 check (bundle_count between 1 and 500),

  condition public.item_condition not null,
  condition_note text check (char_length(condition_note) <= 500),
  description text check (char_length(description) <= 5000),
  -- Polja koja zavise od tipa artikla (npr. format ploče, platforma igre).
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),

  price_rsd integer not null check (price_rsd between 1 and 10000000),
  city text check (char_length(city) <= 80),
  shipping_methods public.shipping_method[] not null default '{posta}' check (cardinality(shipping_methods) > 0),
  payment_methods public.payment_method[] not null default '{tekuci_racun}' check (cardinality(payment_methods) > 0),

  status public.listing_status not null default 'dostupno',
  -- Kupac koga prodavac izabere iz poruka kad označi Prodato; samo on može da oceni.
  sold_to uuid references public.profiles (id) on delete set null,
  reserved_at timestamptz,
  sold_at timestamptz,
  -- Kad je poslato pitanje „Da li je prodato?“ (48 h posle rezervacije).
  status_check_sent_at timestamptz,

  search tsvector generated always as (
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(author, ''))), 'A') ||
    setweight(to_tsvector('simple', coalesce(isbn, '')), 'A') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(publisher, ''))), 'B') ||
    setweight(to_tsvector('simple', public.f_unaccent(coalesce(description, ''))), 'C')
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (sold_to is null or sold_to <> seller_id)
);

create index listings_seller_idx on public.listings (seller_id, created_at desc);
create index listings_browse_idx on public.listings (category_id, status, created_at desc);
create index listings_status_idx on public.listings (status, created_at desc);
create index listings_search_idx on public.listings using gin (search);
create index listings_title_trgm_idx on public.listings using gin (public.f_unaccent(title) extensions.gin_trgm_ops);
create index listings_isbn_idx on public.listings (isbn) where isbn is not null;

create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

-- Pravila za oglas koja se ne mogu izraziti jednim CHECK-om.
create or replace function public.listings_validate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cat record;
begin
  select c.parent_id, c.item_type into cat from public.categories c where c.id = new.category_id;
  if cat.parent_id is null then
    raise exception 'Oglas mora biti u potkategoriji, ne u glavnoj kategoriji';
  end if;
  if cat.item_type <> new.item_type then
    raise exception 'Potkategorija ne odgovara tipu artikla';
  end if;
  if new.genre_id is not null and not exists (
    select 1 from public.genres g where g.id = new.genre_id and g.item_type = new.item_type
  ) then
    raise exception 'Žanr ne odgovara tipu artikla';
  end if;

  -- Samo admin može da ukloni oglas ili da ga vrati.
  if (new.status = 'uklonjen' or (tg_op = 'UPDATE' and old.status = 'uklonjen'))
     and (tg_op = 'INSERT' or new.status is distinct from old.status)
     and not public.is_admin() then
    raise exception 'Samo administrator može da ukloni oglas';
  end if;

  if new.status = 'prodato' then
    if new.sold_to is not null and not exists (
      select 1 from public.conversations c
      where c.listing_id = new.id and c.buyer_id = new.sold_to
    ) then
      raise exception 'Kupac mora biti neko ko je pisao prodavcu o ovom oglasu';
    end if;
    new.sold_at := coalesce(new.sold_at, now());
  else
    new.sold_to := null;
    new.sold_at := null;
  end if;

  if new.status = 'rezervisano' then
    if tg_op = 'INSERT' or old.status <> 'rezervisano' then
      new.reserved_at := now();
      new.status_check_sent_at := null;
    end if;
  else
    new.reserved_at := null;
  end if;

  return new;
end;
$$;

create table public.listing_images (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings (id) on delete cascade,
  -- Putanja u Storage bucketu „listing-images“: <seller_id>/<listing_id>/<ime fajla>
  path text not null,
  position smallint not null check (position between 0 and 6), -- do 7 fotografija
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

-- ---------------------------------------------------------------------------
-- Omiljeno i sačuvane pretrage
-- ---------------------------------------------------------------------------

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id bigint not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index favorites_listing_idx on public.favorites (listing_id);

create table public.saved_searches (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  category_id smallint references public.categories (id) on delete cascade,
  -- Filteri sa liste proizvoda: tekst pretrage, žanr, stanje, jezik, lokacija...
  filters jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  created_at timestamptz not null default now()
);

create index saved_searches_user_idx on public.saved_searches (user_id);

-- ---------------------------------------------------------------------------
-- Poruke: jedan razgovor po oglasu i kupcu
-- ---------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id bigint not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create index conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);
create index conversations_seller_idx on public.conversations (seller_id, last_message_at desc);

-- Prodavac u razgovoru je uvek vlasnik oglasa, bez obzira šta je poslato.
create or replace function public.conversations_set_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select l.seller_id into new.seller_id from public.listings l where l.id = new.listing_id;
  if new.seller_id is null then
    raise exception 'Oglas ne postoji';
  end if;
  return new;
end;
$$;

create trigger conversations_set_seller before insert on public.conversations
  for each row execute function public.conversations_set_seller();

-- Sada kada tabela razgovora postoji, može se uključiti provera oglasa.
create trigger listings_validate before insert or update on public.listings
  for each row execute function public.listings_validate();

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function public.is_conversation_participant(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = conv and auth.uid() in (c.buyer_id, c.seller_id)
  )
$$;

-- ---------------------------------------------------------------------------
-- Recenzije: samo kupac koga je prodavac izabrao, jednom po prodaji
-- ---------------------------------------------------------------------------

create table public.reviews (
  id bigint generated always as identity primary key,
  listing_id bigint not null unique references public.listings (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  check (reviewer_id <> seller_id)
);

create index reviews_seller_idx on public.reviews (seller_id, created_at desc);

create or replace function public.can_review(p_listing bigint, p_seller uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listings l
    where l.id = p_listing
      and l.seller_id = p_seller
      and l.status = 'prodato'
      and l.sold_to = auth.uid()
  )
$$;

-- ---------------------------------------------------------------------------
-- Obaveštenja (zvonce)
-- ---------------------------------------------------------------------------

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- nova_poruka, poziv_za_recenziju, nova_recenzija, provera_prodaje, oglas_uklonjen
  type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- Nova poruka: osveži razgovor i obavesti drugu stranu.
create or replace function public.messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  conv public.conversations;
  recipient uuid;
begin
  update public.conversations set last_message_at = new.created_at
  where id = new.conversation_id
  returning * into conv;

  recipient := case when new.sender_id = conv.buyer_id then conv.seller_id else conv.buyer_id end;

  insert into public.notifications (user_id, type, data)
  values (recipient, 'nova_poruka', jsonb_build_object(
    'conversation_id', conv.id,
    'listing_id', conv.listing_id,
    'sender_id', new.sender_id
  ));
  return new;
end;
$$;

create trigger messages_after_insert after insert on public.messages
  for each row execute function public.messages_after_insert();

-- Prodato: kupac dobija poziv da oceni prodavca.
create or replace function public.listings_after_sold()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'prodato' and new.sold_to is not null
     and (old.status is distinct from 'prodato' or old.sold_to is distinct from new.sold_to) then
    insert into public.notifications (user_id, type, data)
    values (new.sold_to, 'poziv_za_recenziju', jsonb_build_object('listing_id', new.id, 'seller_id', new.seller_id));
  end if;
  return new;
end;
$$;

create trigger listings_after_sold after update on public.listings
  for each row execute function public.listings_after_sold();

create or replace function public.reviews_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, data)
  values (new.seller_id, 'nova_recenzija', jsonb_build_object('listing_id', new.listing_id, 'review_id', new.id, 'rating', new.rating));
  return new;
end;
$$;

create trigger reviews_after_insert after insert on public.reviews
  for each row execute function public.reviews_after_insert();

-- Pitanje „Da li je prodato?“ za oglase rezervisane duže od 48 h.
-- Pokreće se periodično (pg_cron u Supabase-u, podešava se u niti za oglase).
create or replace function public.send_status_checks()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  with due as (
    update public.listings
    set status_check_sent_at = now()
    where status = 'rezervisano'
      and reserved_at < now() - interval '48 hours'
      and status_check_sent_at is null
    returning id, seller_id
  )
  insert into public.notifications (user_id, type, data)
  select seller_id, 'provera_prodaje', jsonb_build_object('listing_id', id) from due;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke execute on function public.send_status_checks() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Prijave i centar za pomoć
-- ---------------------------------------------------------------------------

create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  listing_id bigint references public.listings (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 100),
  details text check (char_length(details) <= 2000),
  status public.report_status not null default 'otvorena',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check (num_nonnulls(listing_id, reported_user_id) = 1)
);

create index reports_status_idx on public.reports (status, created_at);

create table public.help_articles (
  id bigint generated always as identity primary key,
  section public.help_section not null,
  topic text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  body text not null default '', -- Markdown
  position smallint not null default 0,
  published boolean not null default false,
  helpful_yes integer not null default 0,
  helpful_no integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger help_articles_updated_at before update on public.help_articles
  for each row execute function public.set_updated_at();

-- „Da li je pomoglo?“ — može i bez naloga.
create or replace function public.vote_help_article(p_article bigint, p_helpful boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.help_articles
  set helpful_yes = helpful_yes + (case when p_helpful then 1 else 0 end),
      helpful_no = helpful_no + (case when p_helpful then 0 else 1 end)
  where id = p_article and published
$$;

-- ---------------------------------------------------------------------------
-- Statistika prodavca (ocena, % pozitivnih, prodato, na prodaju)
-- ---------------------------------------------------------------------------

create view public.seller_stats
with (security_invoker = true) as
select
  p.id as seller_id,
  (select count(*) from public.listings l where l.seller_id = p.id and l.status in ('dostupno', 'rezervisano')) as for_sale_count,
  (select count(*) from public.listings l where l.seller_id = p.id and l.status = 'prodato') as sold_count,
  (select count(*) from public.reviews r where r.seller_id = p.id) as review_count,
  (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.seller_id = p.id) as rating_avg,
  (select round(100.0 * count(*) filter (where r.rating >= 4) / nullif(count(*), 0)) from public.reviews r where r.seller_id = p.id) as positive_pct
from public.profiles p;

-- ---------------------------------------------------------------------------
-- Pravila pristupa (Row Level Security)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.genres enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_searches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.help_articles enable row level security;

-- Profili: javni; svako menja samo svoj, bez polja is_admin.
create policy "profili su javni" on public.profiles for select using (true);
create policy "menjam svoj profil" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, display_name, avatar_url, bio, city, ships_within_days) on public.profiles to authenticated;

-- Kategorije i žanrovi: javni, menja admin.
create policy "kategorije su javne" on public.categories for select using (true);
create policy "admin menja kategorije" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "zanrovi su javni" on public.genres for select using (true);
create policy "admin menja zanrove" on public.genres for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Oglasi: uklonjeni oglasi vide samo vlasnik i admin.
create policy "oglasi su javni" on public.listings for select
  using (status <> 'uklonjen' or seller_id = auth.uid() or public.is_admin());
create policy "objavljujem svoj oglas" on public.listings for insert to authenticated
  with check (seller_id = auth.uid());
create policy "menjam svoj oglas" on public.listings for update to authenticated
  using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());
create policy "brisem svoj oglas" on public.listings for delete to authenticated
  using (seller_id = auth.uid() or public.is_admin());
revoke update on public.listings from anon, authenticated;
grant update (category_id, genre_id, title, author, isbn, language, page_count, publisher, bundle_count,
  condition, condition_note, description, attributes, price_rsd, city, shipping_methods, payment_methods,
  status, sold_to) on public.listings to authenticated;

create policy "slike oglasa su javne" on public.listing_images for select
  using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "slike svog oglasa" on public.listing_images for all to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- Omiljeno i sačuvane pretrage: samo vlasnik.
create policy "moje omiljeno" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "moje pretrage" on public.saved_searches for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Razgovori i poruke: samo kupac i prodavac u tom razgovoru.
create policy "moji razgovori" on public.conversations for select to authenticated
  using (auth.uid() in (buyer_id, seller_id));
create policy "pisem prodavcu" on public.conversations for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (select 1 from public.listings l where l.id = listing_id and l.status in ('dostupno', 'rezervisano'))
  );
revoke update on public.conversations from anon, authenticated;

create policy "poruke u mojim razgovorima" on public.messages for select to authenticated
  using (public.is_conversation_participant(conversation_id));
create policy "saljem poruku" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));
create policy "oznacavam procitano" on public.messages for update to authenticated
  using (public.is_conversation_participant(conversation_id) and sender_id <> auth.uid())
  with check (public.is_conversation_participant(conversation_id) and sender_id <> auth.uid());
revoke update, delete on public.messages from anon, authenticated;
grant update (read_at) on public.messages to authenticated;

-- Recenzije: javne; piše samo izabrani kupac.
create policy "recenzije su javne" on public.reviews for select using (true);
create policy "ocenjujem prodavca" on public.reviews for insert to authenticated
  with check (reviewer_id = auth.uid() and public.can_review(listing_id, seller_id));
create policy "admin brise recenziju" on public.reviews for delete to authenticated
  using (public.is_admin());
revoke update on public.reviews from anon, authenticated;

-- Obaveštenja: pravi ih baza, korisnik ih čita i označava pročitanim.
create policy "moja obavestenja" on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy "oznacavam obavestenje" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke insert, update, delete on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Prijave: vidi onaj ko je prijavio i admin; rešava admin.
create policy "prijavljujem" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'otvorena');
create policy "moje prijave" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());
create policy "admin resava prijave" on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Pomoć: objavljeni članci su javni, piše admin.
create policy "clanci su javni" on public.help_articles for select
  using (published or public.is_admin());
create policy "admin pise clanke" on public.help_articles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Poruke uživo (Supabase Realtime)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages, public.notifications;
  end if;
end;
$$;
