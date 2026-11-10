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
    .select("id, title, author, price_rsd, status, created_at, images:listing_images ( path, position )")
    .eq("seller_id", me.id)
    .neq("status", "uklonjen")
    .order("created_at", { ascending: false });

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
    };
  });
  return <MyListings items={items} username={me.profile.username} />;
}
