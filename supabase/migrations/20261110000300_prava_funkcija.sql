-- Funkcije okidača ne smeju da se pozivaju preko API-ja (/rest/v1/rpc/...).
-- Okidači rade i dalje, jer ih pokreće baza, a ne korisnik.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.conversations_set_seller() from public, anon, authenticated;
revoke execute on function public.listings_validate() from public, anon, authenticated;
revoke execute on function public.listings_after_sold() from public, anon, authenticated;
revoke execute on function public.messages_after_insert() from public, anon, authenticated;
revoke execute on function public.reviews_after_insert() from public, anon, authenticated;

-- Pomoćne funkcije iz pravila pristupa: samo prijavljeni korisnici.
-- is_admin ostaje i za goste, jer ga koristi pravilo „oglasi su javni“ (vraća samo podatak o pozivaocu).
revoke execute on function public.is_conversation_participant(uuid) from public, anon;
revoke execute on function public.can_review(bigint, uuid) from public, anon;

-- Supabase-ova funkcija za automatski RLS (uključena pri pravljenju projekta) radi kao okidač događaja.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
