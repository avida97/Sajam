import { CATEGORIES } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import type { CatalogListing } from "./types";

// Prazni probni oglasi dok Supabase projekat ne postoji (odluka V, 10. 11. 2026).
// Namerno bez izmišljenih naslova i autora: samo mesto za oglas.
// Kad baza bude povezana, query.ts čita iz tabele listings i ovaj fajl se briše.
const PER_SUBCATEGORY = 4;

function build(): CatalogListing[] {
  const out: CatalogListing[] = [];
  let id = 1;
  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (let i = 0; i < PER_SUBCATEGORY; i++) {
        const condition = CONDITIONS[(id + i) % CONDITIONS.length].value;
        out.push({
          id,
          title: "Naziv artikla",
          author: cat.itemType === "igra" || cat.itemType === "oprema" ? null : "Autor",
          price_rsd: 0,
          condition,
          item_type: cat.itemType,
          city: null,
          description: null,
          publisher: null,
          language: null,
          page_count: null,
          isbn: null,
          status: "dostupno",
          // Datumi unazad, da sortiranje „najnovije“ ima smisla.
          created_at: new Date(Date.UTC(2026, 10, 10) - id * 3_600_000).toISOString(),
          shipping_methods: ["posta", "licno"],
          payment_methods: ["pouzece"],
          categorySlug: cat.slug,
          subcategorySlug: sub.slug,
          imageUrl: null,
          seller: { username: "prodavac", displayName: "Prodavac" },
        });
        id++;
      }
    }
  }
  return out;
}

export const PLACEHOLDER_LISTINGS = build();
