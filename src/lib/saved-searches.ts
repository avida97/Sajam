import { CATEGORIES } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import { GENRES } from "@/lib/genres";
import type { ListingFilters } from "@/lib/listings/types";

// Sačuvane pretrage (tabela saved_searches). Filteri se čuvaju pod istim imenima kao u adresi,
// a baza ih poredi sa svakim novim oglasom (funkcija saved_search_matches) i šalje obaveštenje.
export type SavedFilters = {
  kategorija?: string;
  potkategorija?: string;
  q?: string;
  autor?: string;
  grad?: string;
  zanr?: string;
  stanje?: string[];
  jezik?: string[];
  cena_od?: number;
  cena_do?: number;
};

export function toSavedFilters(f: ListingFilters): SavedFilters {
  const out: SavedFilters = {};
  if (f.category) out.kategorija = f.category;
  if (f.subcategory) out.potkategorija = f.subcategory;
  if (f.q) out.q = f.q;
  if (f.author) out.autor = f.author;
  if (f.city) out.grad = f.city;
  if (f.genre) out.zanr = f.genre;
  if (f.conditions?.length) out.stanje = f.conditions;
  if (f.languages?.length) out.jezik = f.languages;
  if (f.minPrice != null) out.cena_od = f.minPrice;
  if (f.maxPrice != null) out.cena_do = f.maxPrice;
  return out;
}

// Adresa liste za sačuvanu pretragu (bez strane i redosleda).
export function savedSearchHref(f: SavedFilters): string {
  const path = f.kategorija ? `/${f.kategorija}${f.potkategorija ? `/${f.potkategorija}` : ""}` : "/pretraga";
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.zanr) p.set("zanr", f.zanr);
  if (f.stanje?.length) p.set("stanje", f.stanje.join(","));
  if (f.autor) p.set("autor", f.autor);
  if (f.jezik?.length) p.set("jezik", f.jezik.join(","));
  if (f.grad) p.set("grad", f.grad);
  if (f.cena_od != null) p.set("cena_od", String(f.cena_od));
  if (f.cena_do != null) p.set("cena_do", String(f.cena_do));
  const qs = p.toString();
  return qs ? `${path}?${qs}` : path;
}

// Naziv za spisak: „Knjige › Beletristika · Ivo Andrić · „na drini““.
export function savedSearchName(f: SavedFilters): string {
  const cat = CATEGORIES.find((c) => c.slug === f.kategorija);
  const sub = cat?.subcategories.find((s) => s.slug === f.potkategorija);
  const parts: string[] = [];
  parts.push(cat ? (sub ? `${cat.name} › ${sub.name}` : cat.name) : "Sve kategorije");
  if (f.q) parts.push(`„${f.q}“`);
  if (f.autor) parts.push(f.autor);
  if (f.zanr && cat) {
    const g = GENRES[cat.itemType].find((x) => x.slug === f.zanr);
    if (g) parts.push(g.name);
  }
  if (f.stanje?.length)
    parts.push(f.stanje.map((s) => CONDITIONS.find((c) => c.value === s)?.label ?? s).join(", "));
  if (f.jezik?.length) parts.push(f.jezik.join(", "));
  if (f.grad) parts.push(f.grad);
  if (f.cena_od != null || f.cena_do != null)
    parts.push(
      f.cena_od != null && f.cena_do != null
        ? `${f.cena_od}–${f.cena_do} RSD`
        : f.cena_od != null
          ? `od ${f.cena_od} RSD`
          : `do ${f.cena_do} RSD`,
    );
  return parts.join(" · ").slice(0, 100);
}

// Baza (jsonb) menja redosled ključeva, pa se filteri porede posle sortiranja.
export function sameFilters(a: unknown, b: SavedFilters): boolean {
  const norm = (x: unknown) =>
    JSON.stringify(
      Object.entries((x ?? {}) as Record<string, unknown>)
        .filter(([, v]) => v != null)
        .sort(([k1], [k2]) => k1.localeCompare(k2)),
    );
  return norm(a) === norm(b);
}
