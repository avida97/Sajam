-- 12. 11. 2026, popravke posle provere sajta:
-- 1) Pravila pristupa pozivaju auth.uid() i is_admin() jednom po upitu, a ne za svaki red
--    (Supabase upozorenje „auth_rls_initplan“): (select auth.uid()).
-- 2) Blokiranje naloga: admin blokira korisnika, blokiran korisnik ne može da objavi oglas,
--    piše poruke, ocenjuje ni prijavljuje, a njegovi oglasi se ne vide.
-- 3) Sačuvane pretrage: kad se objavi oglas koji odgovara sačuvanoj pretrazi, vlasnik pretrage
--    dobija obaveštenje (tip „sacuvana_pretraga“).

-- ---------------------------------------------------------------- blokiranje

alter table public.profiles add column blocked_at timestamptz;
-- Da li je nalog blokiran vidi svako (profil prikazuje obaveštenje); razlog vidi samo admin.
grant select (blocked_at) on public.profiles to anon, authenticated;

create table public.account_blocks (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  blocked boolean not null,
  reason text,
  admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index account_blocks_user_idx on public.account_blocks (user_id);
alter table public.account_blocks enable row level security;
create policy "admin vidi blokade" on public.account_blocks
  for select to authenticated using ((select public.is_admin()));
grant select on public.account_blocks to authenticated;

create or replace function public.is_blocked(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select blocked_at is not null from public.profiles where id = uid), false)
$$;

create or replace function public.is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not public.is_blocked(auth.uid())
$$;

create or replace function public.admin_set_blocked(target uuid, block boolean, reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Samo admin može da blokira naloge.';
  end if;
  if target = auth.uid() then
    raise exception 'Ne možeš da blokiraš svoj nalog.';
  end if;
  update public.profiles
     set blocked_at = case when block then coalesce(blocked_at, now()) else null end
   where id = target;
  insert into public.account_blocks (user_id, blocked, reason, admin_id)
  values (target, block, nullif(trim(reason), ''), auth.uid());
end;
$$;

revoke execute on function public.admin_set_blocked(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_blocked(uuid, boolean, text) to authenticated;
revoke execute on function public.is_active() from public, anon;
grant execute on function public.is_active() to authenticated;
grant execute on function public.is_blocked(uuid) to anon, authenticated;

-- ---------------------------------------------------------------- pravila pristupa

drop policy "svako salje zahtev" on public.contact_requests;
create policy "svako salje zahtev" on public.contact_requests for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

drop policy "moji razgovori" on public.conversations;
create policy "moji razgovori" on public.conversations for select to authenticated
  using ((select auth.uid()) = buyer_id or (select auth.uid()) = seller_id);

drop policy "pisem prodavcu" on public.conversations;
create policy "pisem prodavcu" on public.conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and (select public.is_active())
    and exists (
      select 1 from public.listings l
       where l.id = listing_id and l.status in ('dostupno', 'rezervisano')
    )
  );

drop policy "moje omiljeno" on public.favorites;
create policy "moje omiljeno" on public.favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "slike svog oglasa" on public.listing_images;
create policy "slike svog oglasa" on public.listing_images for all to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())));

drop policy "brisem svoj oglas" on public.listings;
create policy "brisem svoj oglas" on public.listings for delete to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()));

drop policy "menjam svoj oglas" on public.listings;
create policy "menjam svoj oglas" on public.listings for update to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()))
  with check (seller_id = (select auth.uid()) or (select public.is_admin()));

drop policy "objavljujem svoj oglas" on public.listings;
create policy "objavljujem svoj oglas" on public.listings for insert to authenticated
  with check (seller_id = (select auth.uid()) and (select public.is_active()));

-- Oglasi blokiranog prodavca se ne vide (osim njemu i adminu).
drop policy "oglasi su javni" on public.listings;
create policy "oglasi su javni" on public.listings for select to public
  using (
    (status <> 'uklonjen' and not public.is_blocked(seller_id))
    or seller_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy "oznacavam procitano" on public.messages;
create policy "oznacavam procitano" on public.messages for update to authenticated
  using (public.is_conversation_participant(conversation_id) and sender_id <> (select auth.uid()))
  with check (public.is_conversation_participant(conversation_id) and sender_id <> (select auth.uid()));

drop policy "saljem poruku" on public.messages;
create policy "saljem poruku" on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and (select public.is_active())
    and public.is_conversation_participant(conversation_id)
  );

drop policy "moja obavestenja" on public.notifications;
create policy "moja obavestenja" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

drop policy "oznacavam obavestenje" on public.notifications;
create policy "oznacavam obavestenje" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "menjam svoj profil" on public.profiles;
create policy "menjam svoj profil" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

drop policy "moje prijave" on public.reports;
create policy "moje prijave" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));

drop policy "prijavljujem" on public.reports;
create policy "prijavljujem" on public.reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'otvorena'
    and resolved_by is null
    and resolved_at is null
    and (select public.is_active())
  );

drop policy "ocenjujem prodavca" on public.reviews;
create policy "ocenjujem prodavca" on public.reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and (select public.is_active())
    and public.can_review(listing_id, seller_id)
  );

drop policy "moje pretrage" on public.saved_searches;
create policy "moje pretrage" on public.saved_searches for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Prijave i sačuvane pretrage ne treba da menja niko neprijavljen.
revoke insert, update, delete on public.reports from anon;
revoke insert, update, delete on public.saved_searches from anon;

-- ---------------------------------------------------------------- sačuvane pretrage

-- Ista pravila poređenja kao na sajtu (src/lib/listings/query.ts): bez velikih slova i kvačica.
create or replace function public.fold_text(s text)
returns text
language sql
immutable
set search_path = ''
as $$
  select translate(replace(lower(coalesce(s, '')), 'đ', 'dj'), 'čćšžàáâäèéêëìíîïòóôöùúûü-', 'ccszaaaaeeeeiiiioooouuuu')
$$;

-- filters: { kategorija, potkategorija, q, autor, grad, zanr, stanje[], jezik[], cena_od, cena_do }
create or replace function public.saved_search_matches(f jsonb, l public.listings)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
  sub_slug text;
  cat_slug text;
  genre_slug text;
  hay text;
  w text;
begin
  select c.slug, p.slug into sub_slug, cat_slug
    from public.categories c left join public.categories p on p.id = c.parent_id
   where c.id = l.category_id;
  if f ? 'kategorija' and f->>'kategorija' is distinct from cat_slug then return false; end if;
  if f ? 'potkategorija' and f->>'potkategorija' is distinct from sub_slug then return false; end if;
  if f ? 'zanr' then
    select g.slug into genre_slug from public.genres g where g.id = l.genre_id;
    if f->>'zanr' is distinct from genre_slug then return false; end if;
  end if;
  if f ? 'autor' and public.fold_text(f->>'autor') <> public.fold_text(l.author) then return false; end if;
  if f ? 'grad' and f->>'grad' is distinct from l.city then return false; end if;
  if f ? 'stanje' and not (l.condition::text in (select jsonb_array_elements_text(f->'stanje'))) then return false; end if;
  if f ? 'jezik' and not (coalesce(l.language, '') in (select jsonb_array_elements_text(f->'jezik'))) then return false; end if;
  if f ? 'cena_od' and l.price_rsd < (f->>'cena_od')::int then return false; end if;
  if f ? 'cena_do' and l.price_rsd > (f->>'cena_do')::int then return false; end if;
  if f ? 'q' then
    hay := public.fold_text(concat_ws(' ', l.title, l.author, l.publisher, l.isbn));
    foreach w in array regexp_split_to_array(public.fold_text(f->>'q'), '\s+') loop
      if w <> '' and position(w in hay) = 0 then return false; end if;
    end loop;
  end if;
  return true;
end;
$$;

create or replace function public.notify_saved_searches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'dostupno' or public.is_blocked(new.seller_id) then
    return new;
  end if;
  insert into public.notifications (user_id, type, data)
  select distinct on (s.user_id) s.user_id, 'sacuvana_pretraga',
         jsonb_build_object('listing_id', new.id, 'search_id', s.id, 'search_name', s.name)
    from public.saved_searches s
   where s.user_id <> new.seller_id
     and public.saved_search_matches(coalesce(s.filters, '{}'::jsonb), new)
   order by s.user_id, s.created_at;
  return new;
end;
$$;

revoke execute on function public.notify_saved_searches() from public, anon, authenticated;
revoke execute on function public.saved_search_matches(jsonb, public.listings) from public, anon;

create trigger listings_notify_saved_searches after insert on public.listings
  for each row execute function public.notify_saved_searches();

-- Najviše 20 sačuvanih pretraga po korisniku.
create or replace function public.limit_saved_searches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.saved_searches where user_id = new.user_id) >= 20 then
    raise exception 'Možeš da sačuvaš najviše 20 pretraga.';
  end if;
  return new;
end;
$$;
revoke execute on function public.limit_saved_searches() from public, anon, authenticated;
create trigger saved_searches_limit before insert on public.saved_searches
  for each row execute function public.limit_saved_searches();

-- ---------------------------------------------------------------- admin

-- Admin uklanja oglas (npr. posle prijave); prodavac dobija obaveštenje „oglas_uklonjen“.
create or replace function public.admin_remove_listing(p_listing bigint, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  seller uuid;
begin
  if not public.is_admin() then
    raise exception 'Samo admin može da ukloni oglas.';
  end if;
  update public.listings set status = 'uklonjen' where id = p_listing returning seller_id into seller;
  if seller is not null then
    insert into public.notifications (user_id, type, data)
    values (seller, 'oglas_uklonjen', jsonb_build_object('listing_id', p_listing, 'reason', nullif(trim(p_reason), '')));
  end if;
end;
$$;

-- Admin zatvara prijavu: „resena“ (preduzete mere) ili „odbacena“.
create or replace function public.admin_resolve_report(p_report bigint, p_status public.report_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Samo admin može da zatvori prijavu.';
  end if;
  update public.reports
     set status = p_status,
         resolved_by = case when p_status = 'otvorena' then null else auth.uid() end,
         resolved_at = case when p_status = 'otvorena' then null else now() end
   where id = p_report;
end;
$$;

revoke execute on function public.admin_remove_listing(bigint, text) from public, anon;
revoke execute on function public.admin_resolve_report(bigint, public.report_status) from public, anon;
grant execute on function public.admin_remove_listing(bigint, text) to authenticated;
grant execute on function public.admin_resolve_report(bigint, public.report_status) to authenticated;
