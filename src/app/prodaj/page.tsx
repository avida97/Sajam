import type { Metadata } from "next";
import { SellForm, type SellRefs } from "@/components/sell/SellForm";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Prodaja artikla" };

// Forma „Prodaja artikla“ iz Figme (922:32648). Objavljuje oglas u bazu;
// neprijavljenom posetiocu „Objavi oglas“ otvara prijavu, a popunjena forma ostaje.
export default async function ProdajPage() {
  let refs: SellRefs | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const [{ data: cats }, { data: genres }] = await Promise.all([
      supabase.from("categories").select("id, slug, parent_id, item_type"),
      supabase.from("genres").select("id, slug, item_type"),
    ]);
    if (cats?.length) {
      const parents = new Map(cats.filter((c) => c.parent_id === null).map((c) => [c.id, c.slug]));
      refs = {
        subcategories: Object.fromEntries(
          cats.filter((c) => c.parent_id !== null).map((c) => [`${parents.get(c.parent_id!)}/${c.slug}`, c.id]),
        ),
        genres: Object.fromEntries((genres ?? []).map((g) => [`${g.item_type}/${g.slug}`, g.id])),
      };
    }
  }
  const user = await getCurrentUser();
  return <SellForm refs={refs} signedIn={!!user} />;
}
