import type { Database } from "@/lib/supabase/database.types";

type Row = Database["public"]["Tables"]["listings"]["Row"];

// Oglas kako ga prikazuju stranice kataloga (kartica, lista, stranica proizvoda).
// Polja su podskup tabele listings, plus podaci o kategoriji, žanru i prodavcu.
export type CatalogListing = Pick<
  Row,
  | "id"
  | "title"
  | "author"
  | "price_rsd"
  | "condition"
  | "condition_note"
  | "item_type"
  | "city"
  | "description"
  | "summary"
  | "publisher"
  | "language"
  | "page_count"
  | "isbn"
  | "bundle_count"
  | "status"
  | "created_at"
  | "updated_at"
  | "shipping_methods"
  | "payment_methods"
> & {
  categorySlug: string;
  subcategorySlug: string;
  genre: { slug: string; name: string } | null;
  images: string[];
  seller: { username: string; displayName: string; avatarUrl: string | null };
  // Probni oglas bez pravih podataka (dok baza ne bude povezana).
  placeholder: boolean;
};

export type SortKey = "najnovije" | "azbucno" | "cena-rastuce" | "cena-opadajuce";

export type ListingFilters = {
  category?: string;
  subcategory?: string;
  genre?: string;
  conditions?: Row["condition"][];
  bundles?: string[];
  author?: string;
  languages?: string[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: SortKey;
  page?: number;
};
