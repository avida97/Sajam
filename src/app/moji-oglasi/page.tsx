import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyListings, type MyListing } from "@/components/account/MyListings";
import { listingImageUrl } from "@/lib/listings/db";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Moji oglasi" };

// Moji oglasi: svi oglasi prijavljenog prodavca, sa promenom statusa, izmenom i brisanjem.
export default async function MyListingsPage() {
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/?nalog=prijava&posle=/moji-oglasi");
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, author, price_rsd, status, sold_to, created_at, images:listing_images ( path, position )")
    .eq("seller_id", me.id)
    .neq("status", "uklonjen")
    .order("created_at", { ascending: false });

  // Ko je pisao o kom oglasu: među njima prodavac bira kupca kad označi Prodato.
  const { data: convs } = await supabase
    .from("conversations")
    .select("listing_id, buyer_id, last_message_at, buyer:profiles!conversations_buyer_id_fkey ( username, display_name )")
    .eq("seller_id", me.id)
    .order("last_message_at", { ascending: false });

  const items: MyListing[] = (data ?? []).map((l) => {
    const first = [...(l.images ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: l.id,
      title: l.title,
      author: l.author,
      price: l.price_rsd,
      status: l.status as MyListing["status"],
      createdAt: l.created_at,
      image: first ? listingImageUrl(first.path) : null,
      soldTo: l.sold_to,
      buyers: (convs ?? [])
        .filter((c) => c.listing_id === l.id)
        .map((c) => {
          const b = c.buyer as unknown as { username: string; display_name: string } | null;
          return { id: c.buyer_id, username: b?.username ?? "", displayName: b?.display_name ?? "Kupac" };
        }),
    };
  });
  return <MyListings items={items} username={me.profile.username} />;
}
