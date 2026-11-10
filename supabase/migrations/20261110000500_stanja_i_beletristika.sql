-- Odluke V, 10. 11. 2026:
-- 1) Stanja artikla su samo Novo, Kao novo i Korišćeno.
-- 2) Knjige dobijaju potkategoriju za obične knjige: „Beletristika“.

-- Stara stanja „Dobro“ i „Zadovoljavajuće“ prelaze u „Vrlo dobro“, koje se preimenuje u „korisceno“.
-- Vrednosti dobro i zadovoljavajuce ostaju u tipu (Postgres ih ne briše bez pravljenja tipa iznova),
-- ali ih pravilo ispod više ne dozvoljava.
update public.listings set condition = 'vrlo_dobro' where condition in ('dobro', 'zadovoljavajuce');
alter type public.item_condition rename value 'vrlo_dobro' to 'korisceno';
alter table public.listings add constraint listings_condition_mvp
  check (condition in ('novo', 'kao_novo', 'korisceno'));

-- Beletristika na prvo mesto, ostale potkategorije knjiga pomeraju se za jedno.
update public.categories c set position = c.position + 1
from public.categories p
where c.parent_id = p.id and p.parent_id is null and p.slug = 'knjige';

insert into public.categories (parent_id, item_type, slug, name, position)
select p.id, 'knjiga', 'beletristika', 'Beletristika', 0
from public.categories p
where p.parent_id is null and p.slug = 'knjige'
on conflict do nothing;
