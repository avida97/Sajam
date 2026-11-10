"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

// Omiljeni oglasi prijavljenog korisnika, zajednički za sva srca na stranici.
// Učitavaju se jednom iz baze; klik menja prikaz odmah, a bazu u pozadini.
type State = { ready: boolean; signedIn: boolean; ids: Set<number> };

let state: State = { ready: false, signedIn: false, ids: new Set() };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};

function load() {
  if (loading) return loading;
  loading = (async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return emit({ ready: true, signedIn: false, ids: new Set() });
    const { data } = await supabase.from("favorites").select("listing_id");
    emit({ ready: true, signedIn: true, ids: new Set((data ?? []).map((f) => f.listing_id)) });
  })().catch(() => emit({ ...state, ready: true }));
  return loading;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  load();
  return () => listeners.delete(cb);
}

const SERVER: State = { ready: false, signedIn: false, ids: new Set() };

export function useFavorites() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/** Dodaje ili uklanja oglas iz omiljenih. Vraća false ako niko nije prijavljen. */
export async function toggleFavorite(listingId: number): Promise<boolean> {
  await load();
  if (!state.signedIn) return false;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const had = state.ids.has(listingId);
  const ids = new Set(state.ids);
  if (had) ids.delete(listingId);
  else ids.add(listingId);
  emit({ ...state, ids });
  const { error } = had
    ? await supabase.from("favorites").delete().eq("user_id", auth.user.id).eq("listing_id", listingId)
    : await supabase.from("favorites").insert({ user_id: auth.user.id, listing_id: listingId });
  if (error) {
    const back = new Set(state.ids);
    if (had) back.add(listingId);
    else back.delete(listingId);
    emit({ ...state, ids: back });
  }
  return true;
}
