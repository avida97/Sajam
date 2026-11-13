import { CATEGORIES } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import type { CatalogListing } from "./types";

// Prazni probni oglasi dok Supabase projekat ne postoji (odluka V, 10. 11. 2026).
// Namerno bez izmišljenih naslova, autora i slika: samo mesto za oglas.
// Kad baza bude povezana, query.ts čita iz tabele listings i ovaj fajl se briše.
const PER_SUBCATEGORY = 6;

function build(): CatalogListing[] {
  const out: CatalogListing[] = [];
  let id = 1;
  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (let i = 0; i < PER_SUBCATEGORY; i++) {
        const created = new Date(Date.UTC(2026, 10, 10) - id * 3_600_000).toISOString();
        out.push({
          id,
          title: "Naziv proizvoda",
          author: cat.itemType === "igra" || cat.itemType === "oprema" ? null : "Autor",
          price_rsd: 0,
          condition: CONDITIONS[(id + i) % CONDITIONS.length].value,
          condition_note: null,
          item_type: cat.itemType,
          city: null,
          description: null,
    summary: null,
    price_fixed: null,
          publisher: null,
          language: null,
          page_count: null,
          isbn: null,
          bundle_count: 1,
          status: "dostupno",
          created_at: created,
          updated_at: created,
          shipping_methods: [],
          payment_methods: [],
          categorySlug: cat.slug,
          subcategorySlug: sub.slug,
          genre: null,
          images: [],
          seller: { username: "prodavac", displayName: "Prodavac", avatarUrl: null },
          placeholder: true,
        });
        id++;
      }
    }
  }
  return out;
}

export const PLACEHOLDER_LISTINGS = build();
