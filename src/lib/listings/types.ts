import type { Database } from "@/lib/supabase/database.types";

type Row = Database["public"]["Tables"]["listings"]["Row"];

// Oglas kako ga prikazuju stranice kataloga (kartica, lista, stranica proizvoda).
// Polja su podskup tabele listings, plus podaci o kategoriji i prodavcu.
export type CatalogListing = Pick<
  Row,
  | "id"
  | "title"
  | "author"
  | "price_rsd"
  | "condition"
  | "item_type"
  | "city"
  | "description"
  | "publisher"
  | "language"
  | "page_count"
  | "isbn"
  | "status"
  | "created_at"
  | "shipping_methods"
  | "payment_methods"
> & {
  categorySlug: string;
  subcategorySlug: string;
  imageUrl: string | null;
  seller: { username: string; displayName: string };
};

export type SortKey = "najnovije" | "cena-rastuce" | "cena-opadajuce";

export type ListingFilters = {
  category?: string;
  subcategory?: string;
  conditions?: Row["condition"][];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: SortKey;
  page?: number;
};
