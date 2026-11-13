import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";
import { listingImageUrl } from "@/lib/listings/db";
import { listingHref } from "@/lib/listings/params";

// Javni profil prodavca i njegove recenzije, čitano kao gost (iste dozvole kao posetilac).

export type PublicProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  shipsWithinDays: number | null;
  createdAt: string;
  blocked: boolean;
};

export type ProfileReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  tags: string[];
  reviewer: { username: string; displayName: string; avatarUrl: string | null } | null;
  listing: { title: string; author: string | null; image: string | null; href: string } | null;
};

export type SellerStats = { sold: number; reviews: number; avg: number | null; positivePct: number | null };

function anon() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getProfile(username: string): Promise<PublicProfile | null> {
  if (!isSupabaseConfigured) return null;
  await connection();
  const { data } = await anon().from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    city: data.city,
    shipsWithinDays: data.ships_within_days,
    createdAt: data.created_at,
    blocked: !!data.blocked_at,
  };
}

export async function getReviews(sellerId: string): Promise<ProfileReview[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await anon()
    .from("reviews")
    .select(
      `id, rating, comment, tags, created_at,
       reviewer:profiles!reviews_reviewer_id_fkey ( username, display_name, avatar_url ),
       listing:listings ( id, title, author, images:listing_images ( path, position ) )`,
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("Recenzije nisu učitane:", error.message);
    return [];
  }
  return (data ?? []).map((r) => {
    const rev = r.reviewer as { username: string; display_name: string; avatar_url: string | null } | null;
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      tags: r.tags ?? [],
      reviewer: rev ? { username: rev.username, displayName: rev.display_name, avatarUrl: rev.avatar_url } : null,
      listing: toReviewListing(r.listing as unknown as ReviewListingRow | null),
    };
  });
}

type ReviewListingRow = {
  id: number;
  title: string;
  author: string | null;
  images: Array<{ path: string; position: number }> | null;
};

function toReviewListing(l: ReviewListingRow | null): ProfileReview["listing"] {
  if (!l) return null;
  const first = [...(l.images ?? [])].sort((a, b) => a.position - b.position)[0];
  return { title: l.title, author: l.author, image: first ? listingImageUrl(first.path) : null, href: listingHref(l) };
}

/** Brojevi u kartici prodavca na oglasu: prodato, broj ocena i procenat pozitivnih (4 i 5 zvezdica). */
export async function getSellerStats(username: string): Promise<SellerStats | null> {
  if (!isSupabaseConfigured) return null;
  const db = anon();
  const { data: p } = await db.from("profiles").select("id").eq("username", username).maybeSingle();
  if (!p) return null;
  const { data } = await db.from("seller_stats").select("*").eq("seller_id", p.id).maybeSingle();
  if (!data) return null;
  return {
    sold: Number(data.sold_count ?? 0),
    reviews: Number(data.review_count ?? 0),
    avg: data.rating_avg == null ? null : Number(data.rating_avg),
    positivePct: data.positive_pct == null ? null : Number(data.positive_pct),
  };
}

/** Koliko ljudi je oglas sačuvalo u omiljene. */
export async function getFavoriteCount(listingId: number): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { data } = await anon().rpc("favorite_count", { p_listing: listingId });
  return data ?? 0;
}
