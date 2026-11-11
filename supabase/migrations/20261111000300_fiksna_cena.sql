-- Fiksna cena: prodavac bira Da (bez pregovora) ili Ne (cena može da se dogovori).
-- Prazno kod starijih oglasa, gde prodavac to nije naveo. Odluka V 11. 11. 2026.
alter table public.listings add column price_fixed boolean;

grant update (price_fixed) on public.listings to authenticated;
