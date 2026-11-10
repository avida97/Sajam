import { CONDITIONS, type Condition } from "@/lib/conditions";
import type { ListingFilters, SortKey } from "./types";

// Filteri žive u adresi (?stanje=novo,dobro&jezik=Srpski&sort=cena-rastuce&strana=2),
// da se lista može podeliti linkom i da „nazad“ u pregledaču radi.
export type SearchParams = Record<string, string | string[] | undefined>;

export const SORTS: SortKey[] = ["najnovije", "azbucno", "cena-rastuce", "cena-opadajuce"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => (one(v) ?? "").split(",").filter(Boolean);
const num = (v: string | undefined) => {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseFilters(sp: SearchParams): ListingFilters {
  const valid = new Set<string>(CONDITIONS.map((c) => c.value));
  const conditions = list(sp.stanje).filter((c): c is Condition => valid.has(c));
  const sort = one(sp.sort) as SortKey | undefined;
  return {
    genre: one(sp.zanr) || undefined,
    conditions: conditions.length ? conditions : undefined,
    bundles: list(sp.broj).length ? list(sp.broj) : undefined,
    author: one(sp.autor) || undefined,
    languages: list(sp.jezik).length ? list(sp.jezik) : undefined,
    city: one(sp.grad) || undefined,
    minPrice: num(one(sp.cena_od)),
    maxPrice: num(one(sp.cena_do)),
    q: one(sp.q)?.trim() || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num(one(sp.strana)),
  };
}

// Adresa oglasa: /oglas/[id]-[naslov-bez-dijakritika]
export function listingHref(l: { id: number; title: string }): string {
  return `/oglas/${l.id}-${slugify(l.title)}`;
}

export function parseListingId(param: string): number | null {
  const n = Number(param.split("-")[0]);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const formatRsd = (n: number) => `${n.toLocaleString("sr-Latn-RS")} RSD`;
