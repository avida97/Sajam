-- Brisanje oglasa iz „Moji oglasi“: prodavac postavlja status „uklonjen“ na svom oglasu.
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

  -- Prodavac sme da obriše svoj oglas (status „uklonjen“), ali uklonjen oglas vraća samo admin.
  if tg_op = 'INSERT' and new.status = 'uklonjen' and not public.is_admin() then
    raise exception 'Oglas ne može da se objavi kao uklonjen';
  end if;
  if tg_op = 'UPDATE' and old.status = 'uklonjen' and new.status is distinct from old.status
     and not public.is_admin() then
    raise exception 'Samo administrator može da vrati uklonjen oglas';
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

-- Izmena oglasa šalje i vrstu artikla (menja se zajedno sa kategorijom; proverava listings_validate).
grant update (item_type) on public.listings to authenticated;
