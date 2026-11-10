# Sajam

Marketplace za polovne knjige, muziku, igre, mange i stripove i opremu. Više prodavaca, jedan nalog za kupovinu i prodaju. U MVP-u se kupac i prodavac dogovaraju kroz poruke; korpe i plaćanja kroz sajt nema.

Dizajn: Figma fajl „Books“, stranica Website. Sve stranice se rade po njemu.

## Tehnologija

- Next.js 15 (App Router, TypeScript, Tailwind CSS 4)
- Supabase: baza (Postgres), prijava (mejl i Google), skladište slika, poruke uživo
- Vercel za objavu

## Pokretanje

```bash
npm install
cp .env.example .env.local   # upiši URL i anon ključ Supabase projekta
npm run dev
```

Bez Supabase ključeva sajt radi, ali niko ne može da se prijavi.

## Baza

Šema je u `supabase/migrations`, redom:

1. `…_osnova.sql` – tabele, pravila pristupa (RLS), okidači za obaveštenja i proveru oglasa
2. `…_storage.sql` – bucketi za fotografije oglasa i profilne slike
3. `…_pocetni_podaci.sql` – kategorije iz Figme i početni žanrovi

Primena na Supabase projekat:

```bash
npx supabase login
npx supabase link --project-ref <ref projekta>
npx supabase db push
npm run db:types   # osveži src/lib/supabase/database.types.ts
```

## Struktura

- `src/app` – stranice
- `src/components/layout` – nav bar sa menijima i footer
- `src/components/ui` – komponente iz Figme
- `src/lib/categories.ts`, `src/lib/nav-menu.ts`, `src/lib/conditions.ts` – kategorije, tekstovi menija i stanja artikala iz Figme
- `src/lib/supabase` – veza sa bazom
