"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Broji otvaranje oglasa za „Trenutno u trendu“: jednom po oglasu u toku posete (sesija pregledača).
// Čuva se samo broj po danu, bez podataka o osobi.
export function ViewCounter({ listingId }: { listingId: number }) {
  useEffect(() => {
    const key = `pregled-${listingId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    createClient()
      .rpc("record_listing_view", { p_listing: listingId })
      .then(({ error }) => error && console.error("Otvaranje nije zabeleženo:", error.message));
  }, [listingId]);
  return null;
}
