import { cache } from "react";
import { BUNDLE_RANGES } from "@/lib/genres";
import { loadDbListings } from "./db";
import { PLACEHOLDER_LISTINGS } from "./placeholder";
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
  if (f.author && l.author !== f.author) return false;
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

export async function getNewestListings(limit: number, category?: string): Promise<CatalogListing[]> {
  const items = (await available()).filter((l) => !category || l.categorySlug === category);
  return sortListings(items, "najnovije").slice(0, limit);
}

// „Trenutno u trendu“: dok nema podataka o pregledima i omiljenim, isto što i najnovije.
export async function getTrendingListings(limit: number, category?: string) {
  return getNewestListings(limit, category);
}

export async function getSimilarListings(l: CatalogListing, limit: number) {
  return (await available())
    .filter((x) => x.id !== l.id && x.subcategorySlug === l.subcategorySlug && x.categorySlug === l.categorySlug)
    .slice(0, limit);
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
