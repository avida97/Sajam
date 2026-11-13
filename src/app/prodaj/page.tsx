import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SellForm, type EditListing, type SellRefs } from "@/components/sell/SellForm";
import type { ItemType } from "@/lib/categories";
import { listingImageUrl } from "@/lib/listings/db";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Prodaja proizvoda" };

type Props = { searchParams: Promise<{ izmeni?: string }> };

// Forma „Prodaja proizvoda“ iz Figme (922:32648). Objavljuje oglas u bazu;
// neprijavljenom posetiocu „Objavi oglas“ otvara prijavu, a popunjena forma ostaje.
// Sa ?izmeni=<id> ista forma menja postojeći oglas prijavljenog prodavca.
export default async function ProdajPage({ searchParams }: Props) {
  const { izmeni } = await searchParams;
  let refs: SellRefs | null = null;
  let editing: EditListing | null = null;
  const user = await getCurrentUser();

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

    const id = Number(izmeni);
    if (izmeni) {
      if (!user) redirect(`/prodaj?izmeni=${izmeni}&nalog=prijava&posle=${encodeURIComponent(`/prodaj?izmeni=${izmeni}`)}`);
      const { data: l } = await supabase
        .from("listings")
        .select("*, images:listing_images ( path, position )")
        .eq("id", id)
        .eq("seller_id", user.id)
        .maybeSingle();
      if (!l) redirect("/moji-oglasi");
      const slug = (cid: number | null) => cats?.find((c) => c.id === cid)?.slug ?? "";
      const genreSlug = genres?.find((g) => g.id === l.genre_id)?.slug ?? "";
      editing = {
        id: l.id,
        type: l.item_type as ItemType,
        values: {
          potkategorija: slug(l.category_id),
          zanr: genreSlug,
          broj: String(l.bundle_count),
          stanje: l.condition,
          naziv: l.title,
          autor: l.author ?? "",
          isbn: l.isbn ?? "",
          jezik: l.language ?? "",
          broj_stranica: l.page_count ? String(l.page_count) : "",
          izdavac: l.publisher ?? "",
          opis: l.description ?? "",
          sazetak: l.summary ?? "",
          grad: l.city ?? "",
        },
        price: String(l.price_rsd),
        priceFixed: l.price_fixed,
        shipping: l.shipping_methods,
        payment: l.payment_methods,
        images: [...(l.images ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((i) => ({ path: i.path, url: listingImageUrl(i.path) })),
      };
    }
  }
  return <SellForm refs={refs} signedIn={!!user} editing={editing} defaultCity={user?.profile?.city ?? null} />;
}
