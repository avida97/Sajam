-- Broj ljudi koji su oglas sačuvali u omiljene (srce na stranici oglasa).
-- Tabela favorites je vidljiva samo vlasniku reda, pa broj daje ova funkcija.
create or replace function public.favorite_count(p_listing bigint)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.favorites f where f.listing_id = p_listing
$$;

revoke execute on function public.favorite_count(bigint) from public;
grant execute on function public.favorite_count(bigint) to anon, authenticated;
