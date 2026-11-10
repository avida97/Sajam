import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Notifications, type NotificationItem } from "@/components/account/Notifications";
import { listingImageUrl } from "@/lib/listings/db";
import { listingHref } from "@/lib/listings/params";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Obaveštenja" };

type Data = { listing_id?: number; conversation_id?: string; sender_id?: string; seller_id?: string; rating?: number };

// Obaveštenja (zvonce u nav baru). Ekrana nema u Figmi; napravljen kao „Moji oglasi“
// (red sa slikom artikla, tekst i dugme za sledeći korak), za Ankin pregled.
export default async function NotificationsPage() {
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/?nalog=prijava&posle=/obavestenja");
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("notifications")
    .select("id, type, data, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const list = (rows ?? []).map((r) => ({ ...r, data: (r.data ?? {}) as Data }));

  const listingIds = [...new Set(list.map((n) => n.data.listing_id).filter((x): x is number => !!x))];
  const peopleIds = [
    ...new Set(list.flatMap((n) => [n.data.sender_id, n.data.seller_id]).filter((x): x is string => !!x)),
  ];
  const [{ data: listings }, { data: people }, { data: reviewed }] = await Promise.all([
    listingIds.length
      ? supabase.from("listings").select("id, title, images:listing_images ( path, position )").in("id", listingIds)
      : Promise.resolve({ data: [] as Array<{ id: number; title: string; images: Array<{ path: string; position: number }> }> }),
    peopleIds.length
      ? supabase.from("profiles").select("id, username, display_name").in("id", peopleIds)
      : Promise.resolve({ data: [] as Array<{ id: string; username: string; display_name: string }> }),
    supabase.from("reviews").select("listing_id").eq("reviewer_id", me.id),
  ]);
  const listing = (id?: number) => listings?.find((l) => l.id === id);
  const person = (id?: string) => people?.find((p) => p.id === id);
  const done = new Set((reviewed ?? []).map((r) => r.listing_id));

  const items: NotificationItem[] = list.map((n) => {
    const l = listing(n.data.listing_id);
    const first = l ? [...(l.images ?? [])].sort((a, b) => a.position - b.position)[0] : undefined;
    const title = l ? `„${l.title}“` : "oglas";
    const base = {
      id: n.id,
      createdAt: n.created_at,
      unread: !n.read_at,
      image: first ? listingImageUrl(first.path) : null,
      imageHref: l ? listingHref(l) : null,
    };
    switch (n.type) {
      case "nova_poruka": {
        const from = person(n.data.sender_id)?.display_name ?? "Korisnik";
        return {
          ...base,
          text: `Nova poruka od ${from} o oglasu ${title}.`,
          action: { label: "Odgovori", href: `/poruke?r=${n.data.conversation_id}` },
        };
      }
      case "poziv_za_recenziju": {
        const seller = person(n.data.seller_id)?.display_name ?? "prodavca";
        const reviewedAlready = n.data.listing_id ? done.has(n.data.listing_id) : false;
        return {
          ...base,
          text: `Artikal ${title} je označen kao prodat tebi. Kako je prošla kupovina kod prodavca ${seller}?`,
          action: reviewedAlready
            ? { label: "Ocena je ostavljena", href: null }
            : { label: "Oceni prodavca", href: `/recenzija/${n.data.listing_id}` },
        };
      }
      case "nova_recenzija":
        return {
          ...base,
          text: `Nova ocena za ${title}: ${"★".repeat(n.data.rating ?? 0)}${"☆".repeat(5 - (n.data.rating ?? 0))}`,
          action: { label: "Pogledaj", href: `/prodavac/${me.profile!.username}?tab=recenzije` },
        };
      case "provera_prodaje":
        return {
          ...base,
          text: `Oglas ${title} je rezervisan duže od dva dana. Da li je prodat? Ažuriraj status da kupci znaju.`,
          action: { label: "Moji oglasi", href: "/moji-oglasi" },
        };
      case "oglas_uklonjen":
        return { ...base, text: `Oglas ${title} je uklonjen sa Sajma.`, action: { label: "Moji oglasi", href: "/moji-oglasi" } };
      default:
        return { ...base, text: "Novo obaveštenje.", action: null };
    }
  });

  return <Notifications items={items} />;
}
