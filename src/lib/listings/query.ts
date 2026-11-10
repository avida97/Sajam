import { PLACEHOLDER_LISTINGS } from "./placeholder";
import type { CatalogListing, ListingFilters, SortKey } from "./types";

export const PAGE_SIZE = 24;

// Jedino mesto odakle stranice kataloga dobijaju oglase.
// Za sada iz probnih podataka; kasnije isti potpis, ali upit nad Supabase tabelom listings.
export async function getListings(
  f: ListingFilters,
): Promise<{ items: CatalogListing[]; total: number; page: number; pageCount: number }> {
  let items = PLACEHOLDER_LISTINGS.filter((l) => l.status === "dostupno");
  if (f.category) items = items.filter((l) => l.categorySlug === f.category);
  if (f.subcategory) items = items.filter((l) => l.subcategorySlug === f.subcategory);
  if (f.conditions?.length) items = items.filter((l) => f.conditions!.includes(l.condition));
  if (f.minPrice != null) items = items.filter((l) => l.price_rsd >= f.minPrice!);
  if (f.maxPrice != null) items = items.filter((l) => l.price_rsd <= f.maxPrice!);
  if (f.q) {
    const q = f.q.toLowerCase();
    items = items.filter((l) => `${l.title} ${l.author ?? ""}`.toLowerCase().includes(q));
  }
  items = sortListings(items, f.sort ?? "najnovije");

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page ?? 1), pageCount);
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, page, pageCount };
}

export async function getListing(id: number): Promise<CatalogListing | null> {
  return PLACEHOLDER_LISTINGS.find((l) => l.id === id) ?? null;
}

export async function getNewestListings(limit: number): Promise<CatalogListing[]> {
  return sortListings(PLACEHOLDER_LISTINGS, "najnovije").slice(0, limit);
}

function sortListings(items: CatalogListing[], sort: SortKey): CatalogListing[] {
  const copy = [...items];
  if (sort === "cena-rastuce") copy.sort((a, b) => a.price_rsd - b.price_rsd);
  else if (sort === "cena-opadajuce") copy.sort((a, b) => b.price_rsd - a.price_rsd);
  else copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return copy;
}
