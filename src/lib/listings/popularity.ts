import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

// Podaci za preporuke iz baze (funkcije trending_listings i popular_authors,
// migracija 20261111000000_preporuke). Čita se kao gost.
function client() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Bodovi interesovanja po oglasu u poslednjih 14 dana (omiljeno 2, poruka 3, otvaranje 0,1). */
export const getTrendingScores = cache(async (): Promise<Map<number, number>> => {
  if (!isSupabaseConfigured) return new Map();
  const { data, error } = await client().rpc("trending_listings", { p_days: 14, p_limit: 500 });
  if (error) {
    console.error("Trend nije učitan:", error.message);
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.listing_id, r.score]));
});

/** Autori knjiga po popularnosti u poslednjih 90 dana; isti autor sa i bez kvačica se spaja. */
export const getPopularAuthorsFromDb = cache(async (limit: number): Promise<string[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await client().rpc("popular_authors", { p_days: 90, p_limit: 200 });
  if (error) {
    console.error("Autori nisu učitani:", error.message);
    return [];
  }
  const groups = new Map<string, { names: Map<string, number>; score: number }>();
  for (const r of data ?? []) {
    const key = foldName(r.author);
    const g = groups.get(key) ?? { names: new Map(), score: 0 };
    g.score += Number(r.score);
    g.names.set(r.author, (g.names.get(r.author) ?? 0) + Number(r.score));
    groups.set(key, g);
  }
  return [...groups.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((g) => {
      // Prikazuje se najčešći oblik imena; kod jednakih, onaj sa kvačicama.
      const names = [...g.names.entries()].sort(
        (a, b) => b[1] - a[1] || diacritics(b[0]) - diacritics(a[0]),
      );
      return names[0][0];
    });
});

export function foldName(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function diacritics(s: string) {
  return (s.normalize("NFD").match(/[̀-ͯ]|đ|Đ/g) ?? []).length;
}
