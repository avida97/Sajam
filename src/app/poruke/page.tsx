import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox, type Draft } from "@/components/messages/Inbox";
import { getConversations, getMessages, toChatListing, toChatPerson } from "@/lib/messages";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Poruke" };

type Props = { searchParams: Promise<{ oglas?: string; r?: string }> };

// Poruke između kupca i prodavca. Ekrana nema u Figmi; napravljen od postojećih
// komponenti (polja, dugmad, kartice), za Ankin pregled.
// ?oglas=<id> otvara razgovor o oglasu (ili postojeći, ili novi koji nastaje prvom porukom),
// ?r=<id> otvara izabrani razgovor.
export default async function MessagesPage({ searchParams }: Props) {
  const { oglas, r } = await searchParams;
  const me = await getCurrentUser();
  if (!me?.profile) {
    const back = oglas ? `/poruke?oglas=${oglas}` : "/poruke";
    redirect(`/?nalog=prijava&posle=${encodeURIComponent(back)}`);
  }

  const conversations = await getConversations(me.id);
  let draft: Draft | null = null;

  if (oglas) {
    const id = Number(oglas);
    const existing = conversations.find((c) => c.listing.id === id && c.role === "kupac");
    if (existing) redirect(`/poruke?r=${existing.id}`);

    const supabase = await createClient();
    const { data: l } = await supabase
      .from("listings")
      .select(
        `id, title, price_rsd, status, seller_id, images:listing_images ( path, position ),
         seller:profiles!listings_seller_id_fkey ( username, display_name, avatar_url )`,
      )
      .eq("id", Number.isInteger(id) ? id : -1)
      .maybeSingle();
    if (!l || l.seller_id === me.id || l.status === "uklonjen") redirect("/poruke");
    draft = {
      listing: toChatListing(l),
      seller: toChatPerson(l.seller as unknown as Parameters<typeof toChatPerson>[0]),
      // Odluka V 13. 11. 2026: razgovor može da se započne i kad je proizvod prodat.
      open: true,
    };
  }

  const selected = draft ? null : (conversations.find((c) => c.id === r) ?? conversations[0] ?? null);
  const messages = selected ? await getMessages(selected.id) : [];

  return (
    <Inbox
      meId={me.id}
      conversations={conversations}
      selectedId={selected?.id ?? null}
      messages={messages}
      draft={draft}
    />
  );
}
