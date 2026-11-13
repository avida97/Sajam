import { cache } from "react";
import { BUNDLE_RANGES } from "@/lib/genres";
import { loadDbListings } from "./db";
import { PLACEHOLDER_LISTINGS } from "./placeholder";
import { foldName, getTrendingScores } from "./popularity";
import type { CatalogListing, ListingFilters, SortKey } from "./types";

// 4 reda po 5 kartica, kao u Figmi (Products Knjige).
export const PAGE_SIZE = 20;

// Jedino mesto odakle stranice kataloga dobijaju oglase: iz baze, a dok u bazi
// nema nijednog oglasa, iz probnih podataka. Za početak se oglasi učitavaju jednom po
// zahtevu i filtriraju ovde; kad ih bude više hiljada, filteri prelaze u SQL upit.
const all = cache(async (): Promise<CatalogListing[]> => {
  const fromDb = await loadDbListings();
  return fromDb.length ? fromDb : PLACEHOLDER_LISTINGS;
});

async function available(): Promise<CatalogListing[]> {
  return (await all()).filter((l) => l.status === "dostupno");
}

function inScope(l: CatalogListing, f: ListingFilters) {
  if (f.category && l.categorySlug !== f.category) return false;
  if (f.subcategory && l.subcategorySlug !== f.subcategory) return false;
  if (f.q) {
    // Svaka reč iz pretrage mora da se nađe u naslovu, autoru, izdavaču ili ISBN-u,
    // bez obzira na velika slova i kvačice („andric“ nalazi „Andrić“).
    const hay = fold(`${l.title} ${l.author ?? ""} ${l.publisher ?? ""} ${l.isbn ?? ""}`);
    if (!fold(f.q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  return true;
}

const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "");

function matches(l: CatalogListing, f: ListingFilters) {
  if (!inScope(l, f)) return false;
  if (f.genre && l.genre?.slug !== f.genre) return false;
  if (f.conditions?.length && !f.conditions.includes(l.condition)) return false;
  if (f.bundles?.length) {
    const ok = BUNDLE_RANGES.some(
      (r) => f.bundles!.includes(r.value) && l.bundle_count >= r.min && l.bundle_count <= r.max,
    );
    if (!ok) return false;
  }
  // Autor se poredi bez kvačica i velikih slova („Majic“ = „Majić“).
  if (f.author && foldName(l.author ?? "") !== foldName(f.author)) return false;
  if (f.languages?.length && !(l.language && f.languages.includes(l.language))) return false;
  if (f.city && l.city !== f.city) return false;
  if (f.minPrice != null && l.price_rsd < f.minPrice) return false;
  if (f.maxPrice != null && l.price_rsd > f.maxPrice) return false;
  return true;
}

export async function getListings(f: ListingFilters) {
  const items = sortListings((await available()).filter((l) => matches(l, f)), f.sort ?? "najnovije");
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page ?? 1), pageCount);
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, page, pageCount };
}

// Brojevi pored opcija filtera („Novo (28)“) i spiskovi autora i gradova, za trenutnu kategoriju.
export async function getFacets(f: ListingFilters) {
  const scope = (await available()).filter((l) => inScope(l, f));
  const count = (pred: (l: CatalogListing) => boolean) => scope.filter(pred).length;
  const uniq = (xs: Array<string | null>) =>
    [...new Set(xs.filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, "sr"));
  return {
    condition: (c: string) => count((l) => l.condition === c),
    bundle: (value: string) => {
      const r = BUNDLE_RANGES.find((b) => b.value === value)!;
      return count((l) => l.bundle_count >= r.min && l.bundle_count <= r.max);
    },
    language: (lang: string) => count((l) => l.language === lang),
    // Probni oglasi nemaju pravog autora ni grad, pa se ne nude u padajućim listama.
    authors: uniq(scope.filter((l) => !l.placeholder).map((l) => l.author)),
    cities: uniq(scope.map((l) => l.city)),
  };
}

export async function getListing(id: number): Promise<CatalogListing | null> {
  return (await all()).find((l) => l.id === id) ?? null;
}

// „Novo u ponudi“: najnoviji dostupni oglasi, s tim da jedan prodavac ima najviše 3 oglasa zaredom.
export async function getNewestListings(limit: number, category?: string): Promise<CatalogListing[]> {
  const items = (await available()).filter((l) => !category || l.categorySlug === category);
  return limitRuns(sortListings(items, "najnovije"), 3).slice(0, limit);
}

// „Trenutno u trendu“: bodovi interesovanja iz poslednjih 14 dana (omiljeno 2, prva poruka 3,
// otvaranje 0,1; stariji signal vredi manje). Oglasi bez bodova idu posle, od najnovijeg.
export async function getTrendingListings(limit: number, category?: string) {
  const items = (await available()).filter((l) => !category || l.categorySlug === category);
  const scores = await getTrendingScores();
  const newest = sortListings(items, "najnovije");
  const rank = new Map(newest.map((l, i) => [l.id, i]));
  return [...items]
    .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) || rank.get(a.id)! - rank.get(b.id)!)
    .slice(0, limit);
}

// „Slični proizvodi“: isti autor 3 boda, isti žanr 2, ista potkategorija 1; kod jednakih bodova
// noviji prvi. Dopunjava se oglasima iz iste kategorije. Oglasi istog prodavca imaju svoj red.
export async function getSimilarListings(l: CatalogListing, limit: number) {
  const author = l.author ? foldName(l.author) : null;
  const score = (x: CatalogListing) =>
    (author && x.author && foldName(x.author) === author ? 3 : 0) +
    (l.genre && x.genre?.slug === l.genre.slug ? 2 : 0) +
    (x.subcategorySlug === l.subcategorySlug ? 1 : 0);
  const pool = (await available()).filter(
    (x) => x.id !== l.id && x.categorySlug === l.categorySlug && x.seller.username !== l.seller.username,
  );
  const newest = sortListings(pool, "najnovije");
  const rank = new Map(newest.map((x, i) => [x.id, i]));
  return pool.sort((a, b) => score(b) - score(a) || rank.get(a.id)! - rank.get(b.id)!).slice(0, limit);
}

// Zadržava redosled, ali odlaže oglas kad bi isti prodavac imao više od `max` zaredom.
function limitRuns(items: CatalogListing[], max: number): CatalogListing[] {
  const out: CatalogListing[] = [];
  const waiting: CatalogListing[] = [];
  const fits = (x: CatalogListing) =>
    out.length < max || !out.slice(-max).every((y) => y.seller.username === x.seller.username);
  const flush = () => {
    for (let i = 0; i < waiting.length; ) {
      if (fits(waiting[i])) {
        out.push(waiting.splice(i, 1)[0]);
        i = 0;
      } else i++;
    }
  };
  for (const x of items) {
    flush();
    if (fits(x)) out.push(x);
    else waiting.push(x);
  }
  flush();
  return [...out, ...waiting];
}

export async function getSellerListings(l: CatalogListing, limit: number) {
  return (await available())
    .filter((x) => x.id !== l.id && x.seller.username === l.seller.username)
    .slice(0, limit);
}

function sortListings(items: CatalogListing[], sort: SortKey): CatalogListing[] {
  const copy = [...items];
  if (sort === "cena-rastuce") copy.sort((a, b) => a.price_rsd - b.price_rsd);
  else if (sort === "cena-opadajuce") copy.sort((a, b) => b.price_rsd - a.price_rsd);
  else if (sort === "azbucno") copy.sort((a, b) => a.title.localeCompare(b.title, "sr"));
  else copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return copy;
}

/** Svi oglasi prodavca (i rezervisani i prodati), za njegov profil. */
export async function getListingsBySeller(username: string) {
  const items = (await all()).filter((l) => l.seller.username === username && !l.placeholder);
  return sortListings(items, "najnovije");
}
