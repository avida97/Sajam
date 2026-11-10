-- Oznake u recenziji iz Figme („Fast shipper“, „Item as described“, „Quick replies“).
alter table public.reviews
  add column tags text[] not null default '{}'
  check (tags <@ array['brzo_slanje', 'kao_u_opisu', 'brzi_odgovori']::text[]);
