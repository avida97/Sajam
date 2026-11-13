-- Odluka V 13. 11. 2026: kupac može da započne razgovor i kad je proizvod prodat
-- (npr. da pita prodavca za nešto drugo). Zabranjeno ostaje samo za uklonjene oglase.
-- Ako je migracija 20261112000100 upisana, zadržava se i provera da nalog nije blokiran.
drop policy if exists "pisem prodavcu" on public.conversations;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'is_active') then
    execute $p$
      create policy "pisem prodavcu" on public.conversations for insert to authenticated
        with check (
          buyer_id = (select auth.uid())
          and (select public.is_active())
          and exists (select 1 from public.listings l
                       where l.id = listing_id and l.status in ('dostupno', 'rezervisano', 'prodato'))
        )
    $p$;
  else
    execute $p$
      create policy "pisem prodavcu" on public.conversations for insert to authenticated
        with check (
          buyer_id = (select auth.uid())
          and exists (select 1 from public.listings l
                       where l.id = listing_id and l.status in ('dostupno', 'rezervisano', 'prodato'))
        )
    $p$;
  end if;
end $$;
