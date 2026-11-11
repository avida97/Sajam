import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";
import type { CatalogListing } from "./types";

// Javni oglasi iz tabele listings, sa kategorijom, žanrom, prodavcem i slikama.
// Čita se kao gost (bez sesije), pa važe ista pravila pristupa kao za posetioca.
const SELECT = `
  id, title, author, price_rsd, price_fixed, condition, condition_note, item_type, city, description, summary,
  publisher, language, page_count, isbn, bundle_count, status, created_at, updated_at,
  shipping_methods, payment_methods,
  category:categories!inner ( slug, parent:parent_id ( slug ) ),
  genre:genres ( slug, name ),
  seller:profiles!listings_seller_id_fkey ( username, display_name, avatar_url ),
  images:listing_images ( path, position )
`;

export function listingImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/listing-images/${path}`;
}

export async function loadDbListings(): Promise<CatalogListing[]> {
  if (!isSupabaseConfigured) return [];
  // Uvek sveži oglasi: stranica se ne pravi unapred pri objavi sajta.
  await connection();
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .neq("status", "uklonjen")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) {
    console.error("Oglasi iz baze nisu učitani:", error.message);
    return [];
  }

  return (data ?? []).flatMap((r) => {
    const cat = r.category as unknown as { slug: string; parent: { slug: string } | null };
    const seller = r.seller as unknown as { username: string; display_name: string; avatar_url: string | null } | null;
    if (!cat?.parent || !seller) return [];
    const images = ((r.images ?? []) as Array<{ path: string; position: number }>)
      .sort((a, b) => a.position - b.position)
      .map((i) => listingImageUrl(i.path));
    return [
      {
        id: r.id,
        title: r.title,
        author: r.author,
        price_rsd: r.price_rsd,
        price_fixed: r.price_fixed,
        condition: r.condition,
        condition_note: r.condition_note,
        item_type: r.item_type,
        city: r.city,
        description: r.description,
        summary: r.summary,
        publisher: r.publisher,
        language: r.language,
        page_count: r.page_count,
        isbn: r.isbn,
        bundle_count: r.bundle_count,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        shipping_methods: r.shipping_methods,
        payment_methods: r.payment_methods,
        categorySlug: cat.parent.slug,
        subcategorySlug: cat.slug,
        genre: (r.genre as unknown as { slug: string; name: string } | null) ?? null,
        images,
        seller: { username: seller.username, displayName: seller.display_name, avatarUrl: seller.avatar_url },
        placeholder: false,
      },
    ];
  });
}
