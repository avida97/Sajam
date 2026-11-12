import "server-only";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ListingFilters } from "@/lib/listings/types";
import { sameFilters, savedSearchName, toSavedFilters } from "@/lib/saved-searches";

// Podaci za dugme „Sačuvaj pretragu“: filteri, naziv i da li je ista pretraga već sačuvana.
export async function saveSearchProps(f: ListingFilters) {
  const filters = toSavedFilters(f);
  const name = savedSearchName(filters);
  const me = await getCurrentUser();
  if (!me?.profile) return { filters, name, loggedIn: false, alreadySaved: false };
  const supabase = await createClient();
  const { data } = await supabase.from("saved_searches").select("filters").eq("user_id", me.id);
  return { filters, name, loggedIn: true, alreadySaved: (data ?? []).some((r) => sameFilters(r.filters, filters)) };
}
