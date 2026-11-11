-- Preporuke: brojanje otvaranja oglasa, „Trenutno u trendu“ i „Najpopularniji autori“.

-- Otvaranja oglasa po danu. Bez podataka o osobi: samo broj.
create table public.listing_views (
  listing_id bigint not null references public.listings (id) on delete cascade,
  day date not null default current_date,
  views integer not null default 0,
  primary key (listing_id, day)
);

alter table public.listing_views enable row level security;
-- Niko ne čita ni ne piše direktno; samo kroz funkcije ispod.
revoke all on public.listing_views from anon, authenticated;

-- Poziva se jednom po otvaranju stranice oglasa. Prodavčeva otvaranja svog oglasa se ne broje.
create or replace function public.record_listing_view(p_listing bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.listing_views (listing_id, day, views)
  select l.id, current_date, 1
  from public.listings l
  where l.id = p_listing
    and l.status in ('dostupno', 'rezervisano')
    and l.seller_id is distinct from auth.uid()
  on conflict (listing_id, day) do update set views = public.listing_views.views + 1
$$;

-- Bodovi interesovanja za dostupne oglase u poslednjih p_days dana:
-- omiljeno 2, prva poruka prodavcu 3, otvaranje 0,1. Stariji signal vredi manje
-- (vrednost se prepolovi na svakih 7 dana).
create or replace function public.trending_listings(p_days integer default 14, p_limit integer default 60)
returns table (listing_id bigint, score double precision)
language sql
stable
security definer
set search_path = ''
as $$
  with signals as (
    select f.listing_id, 2.0 as points, f.created_at as at
    from public.favorites f
    where f.created_at > now() - make_interval(days => p_days)
    union all
    select c.listing_id, 3.0, c.created_at
    from public.conversations c
    where c.created_at > now() - make_interval(days => p_days)
    union all
    select v.listing_id, 0.1 * v.views, v.day::timestamptz + interval '12 hours'
    from public.listing_views v
    where v.day > current_date - p_days
  )
  select s.listing_id,
         sum(s.points * power(0.5, extract(epoch from (now() - s.at)) / 86400.0 / 7.0)) as score
  from signals s
  join public.listings l on l.id = s.listing_id and l.status = 'dostupno'
  group by s.listing_id
  order by score desc
  limit p_limit
$$;

-- Autori knjiga po zbiru: aktivni oglasi + dodavanja u omiljene + prodaje u poslednjih p_days dana.
create or replace function public.popular_authors(p_days integer default 90, p_limit integer default 16)
returns table (author text, score bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with books as (
    select l.id, trim(l.author) as author, l.status, l.sold_at
    from public.listings l
    where l.item_type = 'knjiga' and l.author is not null and trim(l.author) <> ''
  ),
  points as (
    select b.author, 1 as p from books b where b.status in ('dostupno', 'rezervisano')
    union all
    select b.author, 1 from books b
      join public.favorites f on f.listing_id = b.id
      where f.created_at > now() - make_interval(days => p_days)
    union all
    select b.author, 1 from books b
      where b.status = 'prodato' and b.sold_at > now() - make_interval(days => p_days)
  )
  select p.author, sum(p.p)::bigint as score
  from points p
  where exists (select 1 from books b where b.author = p.author and b.status in ('dostupno', 'rezervisano'))
  group by p.author
  order by score desc, p.author
  limit p_limit
$$;

revoke execute on function public.record_listing_view(bigint) from public;
revoke execute on function public.trending_listings(integer, integer) from public;
revoke execute on function public.popular_authors(integer, integer) from public;
grant execute on function public.record_listing_view(bigint) to anon, authenticated;
grant execute on function public.trending_listings(integer, integer) to anon, authenticated;
grant execute on function public.popular_authors(integer, integer) to anon, authenticated;
