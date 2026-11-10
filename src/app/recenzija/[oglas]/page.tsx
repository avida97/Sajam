import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/account/ReviewForm";
import { MainButton } from "@/components/ui/MainButton";
import { toChatListing, toChatPerson } from "@/lib/messages";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Oceni prodavca" };

type Props = { params: Promise<{ oglas: string }> };

// Ocena prodavca posle kupovine. Ocenjuje samo kupac koga je prodavac izabrao kad je
// označio Prodato (pravilo je i u bazi). Ekrana nema u Figmi; napravljen od polja i
// dugmadi iz forme za prodaju i oznaka iz recenzija, za Ankin pregled.
export default async function ReviewPage({ params }: Props) {
  const { oglas } = await params;
  const id = Number(oglas);
  const me = await getCurrentUser();
  if (!me?.profile) redirect(`/?nalog=prijava&posle=${encodeURIComponent(`/recenzija/${oglas}`)}`);

  const supabase = await createClient();
  const { data: l } = await supabase
    .from("listings")
    .select(
      `id, title, price_rsd, status, sold_to, seller_id, images:listing_images ( path, position ),
       seller:profiles!listings_seller_id_fkey ( username, display_name, avatar_url )`,
    )
    .eq("id", Number.isInteger(id) ? id : -1)
    .maybeSingle();
  if (!l) redirect("/");

  const seller = toChatPerson(l.seller as unknown as Parameters<typeof toChatPerson>[0]);
  const listing = toChatListing(l);
  const { data: existing } = await supabase.from("reviews").select("id").eq("listing_id", l.id).maybeSingle();
  const allowed = l.status === "prodato" && l.sold_to === me.id;

  if (!allowed || existing) {
    return (
      <div className="mx-auto flex w-[636px] flex-col items-center pb-[120px] pt-[100px] text-center text-black">
        <h1 className="font-serif text-[36px] font-medium italic leading-none">
          {existing ? "Recenzija je već ostavljena" : "Ovaj artikal ne može da se oceni"}
        </h1>
        <p className="mt-[16px] max-w-[460px] text-[14px] leading-[1.5] text-[#52525b]">
          {existing
            ? "Za svaku kupovinu može da se ostavi jedna recenzija."
            : "Prodavca ocenjuje kupac koga je prodavac izabrao kad je označio artikal kao prodat."}
        </p>
        <MainButton href={`/prodavac/${seller.username}?tab=recenzije`} className="mt-[28px]">
          Recenzije prodavca
        </MainButton>
      </div>
    );
  }

  return <ReviewForm listing={listing} seller={seller} sellerId={l.seller_id} meId={me.id} />;
}
