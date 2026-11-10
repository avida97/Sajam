import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

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
};

export type ProfileReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { username: string; displayName: string; avatarUrl: string | null } | null;
  listingTitle: string | null;
};

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
  };
}

export async function getReviews(sellerId: string): Promise<ProfileReview[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await anon()
    .from("reviews")
    .select(
      "id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey ( username, display_name, avatar_url ), listing:listings ( title )",
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
      reviewer: rev ? { username: rev.username, displayName: rev.display_name, avatarUrl: rev.avatar_url } : null,
      listingTitle: (r.listing as { title: string } | null)?.title ?? null,
    };
  });
}
