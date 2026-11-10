import "server-only";
import { listingImageUrl } from "@/lib/listings/db";
import { listingHref } from "@/lib/listings/params";
import { createClient } from "@/lib/supabase/server";

export type ChatPerson = { username: string; displayName: string; avatarUrl: string | null };

export type ChatListing = {
  id: number;
  title: string;
  price: number;
  status: string;
  image: string | null;
  href: string;
};

export type ConversationSummary = {
  id: string;
  role: "kupac" | "prodavac";
  listing: ChatListing;
  other: ChatPerson;
  lastBody: string | null;
  lastAt: string;
  lastFromMe: boolean;
  unread: number;
  /** Kupac kome je prodavac označio prodaju, a još nije ostavio ocenu. */
  canReview: boolean;
};

export type ChatMessage = {
  id: number;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type ListingRow = {
  id: number;
  title: string;
  price_rsd: number;
  status: string;
  images: Array<{ path: string; position: number }> | null;
};
type PersonRow = { username: string; display_name: string; avatar_url: string | null };

export function toChatListing(l: ListingRow): ChatListing {
  const first = [...(l.images ?? [])].sort((a, b) => a.position - b.position)[0];
  return {
    id: l.id,
    title: l.title,
    price: l.price_rsd,
    status: l.status,
    image: first ? listingImageUrl(first.path) : null,
    href: listingHref(l),
  };
}

export function toChatPerson(p: PersonRow | null): ChatPerson {
  return p
    ? { username: p.username, displayName: p.display_name, avatarUrl: p.avatar_url }
    : { username: "", displayName: "Korisnik", avatarUrl: null };
}

/** Svi razgovori prijavljenog korisnika, najnoviji prvi, sa poslednjom porukom i brojem nepročitanih. */
export async function getConversations(meId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data: convs, error } = await supabase
    .from("conversations")
    .select(
      `id, buyer_id, seller_id, last_message_at,
       listing:listings ( id, title, price_rsd, status, sold_to, images:listing_images ( path, position ) ),
       buyer:profiles!conversations_buyer_id_fkey ( username, display_name, avatar_url ),
       seller:profiles!conversations_seller_id_fkey ( username, display_name, avatar_url )`,
    )
    .order("last_message_at", { ascending: false })
    .limit(200);
  if (error) console.error("Razgovori nisu učitani:", error.message);
  if (!convs?.length) return [];

  // Poslednje poruke svih razgovora odjednom; za početak je dovoljno 1000 najnovijih.
  const [{ data: msgs }, { data: reviewed }] = await Promise.all([
    supabase
      .from("messages")
      .select("conversation_id, sender_id, body, created_at, read_at")
      .in("conversation_id", convs.map((c) => c.id))
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("reviews").select("listing_id").eq("reviewer_id", meId),
  ]);
  const done = new Set((reviewed ?? []).map((r) => r.listing_id));

  return convs.flatMap((c) => {
    const listing = c.listing as unknown as (ListingRow & { sold_to: string | null }) | null;
    if (!listing) return [];
    const mine = (msgs ?? []).filter((m) => m.conversation_id === c.id);
    const last = mine[0];
    const isBuyer = c.buyer_id === meId;
    return [
      {
        id: c.id,
        role: isBuyer ? "kupac" : "prodavac",
        listing: toChatListing(listing),
        other: toChatPerson((isBuyer ? c.seller : c.buyer) as unknown as PersonRow | null),
        lastBody: last?.body ?? null,
        lastAt: last?.created_at ?? c.last_message_at,
        lastFromMe: last?.sender_id === meId,
        unread: mine.filter((m) => m.sender_id !== meId && !m.read_at).length,
        canReview: isBuyer && listing.status === "prodato" && listing.sold_to === meId && !done.has(listing.id),
      } satisfies ConversationSummary,
    ];
  });
}

/** Poruke jednog razgovora, najstarije prvo. RLS vraća prazno ako korisnik nije u razgovoru. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);
  return (data ?? []).map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at,
    readAt: m.read_at,
  }));
}
