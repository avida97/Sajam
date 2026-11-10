-- Početni podaci: kategorije iz Figme i početni spisak žanrova.
-- Isti spisak kategorija je u src/lib/categories.ts.

insert into public.categories (parent_id, item_type, slug, name, position) values
  (null, 'knjiga', 'knjige', 'Knjige', 0),
  (null, 'muzika', 'muzika', 'Muzika', 1),
  (null, 'igra', 'igre', 'Igre', 2),
  (null, 'manga_strip', 'mange-i-stripovi', 'Mange i stripovi', 3),
  (null, 'oprema', 'oprema', 'Oprema', 4);

insert into public.categories (parent_id, item_type, slug, name, position)
select c.id, 'knjiga', v.slug, v.name, v.position
from public.categories c, (values
  ('knjige-za-decu', 'Knjige za decu', 0),
  ('casopisi', 'Časopisi', 1),
  ('antikvarne-knjige', 'Antikvarne knjige', 2),
  ('strane-knjige', 'Strane knjige', 3),
  ('strucna-literatura', 'Stručna literatura', 4),
  ('udzbenici-i-lektire', 'Udžbenici i lektire', 5)
) as v (slug, name, position)
where c.parent_id is null and c.slug = 'knjige';

insert into public.categories (parent_id, item_type, slug, name, position)
select c.id, 'muzika', v.slug, v.name, v.position
from public.categories c, (values
  ('gramofonske-ploce', 'Gramofonske ploče', 0),
  ('blu-ray-dvd-koncerti', 'Blu-ray / DVD koncerti', 1),
  ('cd', 'CD-ovi', 2),
  ('merch', 'Merch', 3),
  ('audiokasete', 'Audiokasete', 4)
) as v (slug, name, position)
where c.parent_id is null and c.slug = 'muzika';

insert into public.categories (parent_id, item_type, slug, name, position)
select c.id, 'igra', v.slug, v.name, v.position
from public.categories c, (values
  ('pc-i-konzolne-igre', 'PC i konzolne igre', 0),
  ('slagalice', 'Slagalice', 1),
  ('lego', 'Lego', 2),
  ('karte-i-slicice', 'Karte i sličice', 3),
  ('drustvene-igre', 'Društvene igre', 4),
  ('kolekcionarska-izdanja', 'Kolekcionarska izdanja', 5)
) as v (slug, name, position)
where c.parent_id is null and c.slug = 'igre';

insert into public.categories (parent_id, item_type, slug, name, position)
select c.id, 'manga_strip', v.slug, v.name, v.position
from public.categories c, (values
  ('mange', 'Mange', 0),
  ('stripovi', 'Stripovi', 1),
  ('graficki-romani', 'Grafički romani', 2),
  ('kolekcionarski', 'Kolekcionarski', 3),
  ('ostalo', 'Ostalo', 4)
) as v (slug, name, position)
where c.parent_id is null and c.slug = 'mange-i-stripovi';

insert into public.categories (parent_id, item_type, slug, name, position)
select c.id, 'oprema', v.slug, v.name, v.position
from public.categories c, (values
  ('audio-oprema', 'Audio oprema', 0),
  ('racunarska-oprema', 'Računarska oprema', 1),
  ('gaming-oprema', 'Gaming oprema', 2),
  ('hi-fi-oprema', 'Hi-Fi oprema', 3),
  ('oprema-za-knjige', 'Oprema za knjige', 4),
  ('ostalo', 'Ostalo', 5)
) as v (slug, name, position)
where c.parent_id is null and c.slug = 'oprema';
-- Početni spisak žanrova za filter „Žanr“. Nije iz Figme (tamo su samo primeri, npr. Romansa);
-- admin ga menja u bazi.
insert into public.genres (item_type, slug, name, position)
select t.item_type::public.item_type, v.slug, v.name, v.position
from (values ('knjiga'), ('manga_strip')) as t (item_type),
(values
  ('roman', 'Roman', 0),
  ('romansa', 'Romansa', 1),
  ('krimi-i-triler', 'Krimi i triler', 2),
  ('fantastika', 'Fantastika', 3),
  ('naucna-fantastika', 'Naučna fantastika', 4),
  ('horor', 'Horor', 5),
  ('avantura', 'Avantura', 6),
  ('istorija', 'Istorija', 7),
  ('biografije', 'Biografije i memoari', 8),
  ('poezija', 'Poezija', 9),
  ('popularna-nauka', 'Popularna nauka', 10),
  ('filozofija', 'Filozofija', 11),
  ('psihologija-i-samopomoc', 'Psihologija i samopomoć', 12),
  ('decje', 'Za decu', 13),
  ('ostalo', 'Ostalo', 14)
) as v (slug, name, position);

insert into public.genres (item_type, slug, name, position) values
  ('muzika', 'rok', 'Rok', 0),
  ('muzika', 'pop', 'Pop', 1),
  ('muzika', 'dzez', 'Džez', 2),
  ('muzika', 'klasicna', 'Klasična', 3),
  ('muzika', 'elektronska', 'Elektronska', 4),
  ('muzika', 'hip-hop', 'Hip-hop', 5),
  ('muzika', 'narodna', 'Narodna', 6),
  ('muzika', 'ostalo', 'Ostalo', 7),
  ('igra', 'akcija', 'Akcija', 0),
  ('igra', 'avantura', 'Avantura', 1),
  ('igra', 'strategija', 'Strategija', 2),
  ('igra', 'sport', 'Sport', 3),
  ('igra', 'porodicne', 'Porodične', 4),
  ('igra', 'ostalo', 'Ostalo', 5);
