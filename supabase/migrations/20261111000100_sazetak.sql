-- Sažetak knjige (o čemu se radi), odvojen od opisa (stanje i oštećenja artikla).
-- Odluka V 11. 11. 2026: sažetak imaju samo knjige; popunjava se iz baze knjiga ili uz pomoć AI.
alter table public.listings
  add column summary text check (summary is null or char_length(summary) <= 5000);

grant update (summary) on public.listings to authenticated;
