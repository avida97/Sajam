"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRsd } from "@/lib/listings/params";
import type { ChatListing, ChatMessage, ChatPerson, ConversationSummary } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

/** Novi razgovor o oglasu: nastaje u bazi tek kad kupac pošalje prvu poruku. */
export type Draft = { listing: ChatListing; seller: ChatPerson; open: boolean };

type Props = {
  meId: string;
  conversations: ConversationSummary[];
  selectedId: string | null;
  messages: ChatMessage[];
  draft: Draft | null;
};

const QUICK = ["Zdravo, da li je artikal još dostupan?", "Zdravo, kako šalješ i koliko košta slanje?"];

// Ekrana nema u Figmi; napravljen od postojećih polja, dugmadi i kartica, za Ankin pregled.
export function Inbox({ meId, conversations, selectedId, messages, draft }: Props) {
  const router = useRouter();
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // Nove poruke uživo: u otvorenom razgovoru se dodaju na dno, a za ostale se osvežava spisak.
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const [incoming, setIncoming] = useState<ChatMessage[]>([]);
  useEffect(() => setIncoming([]), [selectedId]);
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("poruke")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as {
          id: number;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        if (m.conversation_id === selectedRef.current) {
          setIncoming((xs) => [
            ...xs,
            { id: m.id, senderId: m.sender_id, body: m.body, createdAt: m.created_at, readAt: m.read_at },
          ]);
          if (m.sender_id !== meId) markRead(m.conversation_id).then(() => router.refresh());
        } else router.refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [meId, router]);

  // Otvoren razgovor: poruke druge strane i obaveštenja o njima postaju pročitana.
  useEffect(() => {
    if (selected && selected.unread > 0) markRead(selected.id).then(() => router.refresh());
  }, [selected, router]);

  return (
    <div className="mx-auto max-w-site px-[72px] pb-[80px] pt-[48px] text-black">
      <h1 className="font-serif text-[36px] font-medium italic leading-none">Poruke</h1>
      <p className="mt-[14px] text-[14px] text-[#52525b]">
        Ovde se dogovaraš sa kupcima i prodavcima o ceni, slanju i preuzimanju.
      </p>

      <div className="mt-[32px] grid h-[640px] grid-cols-[340px_1fr] border-[0.5px] border-[#e1e1e1]">
        <ConversationList conversations={conversations} selectedId={draft ? null : selectedId} />
        {draft ? (
          <Thread
            key={`novi-${draft.listing.id}`}
            meId={meId}
            listing={draft.listing}
            other={draft.seller}
            role="kupac"
            messages={[]}
            draft={draft}
          />
        ) : selected ? (
          <Thread
            key={selected.id}
            meId={meId}
            conversationId={selected.id}
            listing={selected.listing}
            other={selected.other}
            role={selected.role}
            messages={dedupe([...messages, ...incoming])}
          />
        ) : (
          <div className="flex items-center justify-center px-[40px] text-center text-[14px] text-[#71717a]">
            Kad pitaš prodavca nešto o oglasu, razgovor će se pojaviti ovde.
          </div>
        )}
      </div>
    </div>
  );
}

function dedupe(xs: ChatMessage[]) {
  const seen = new Set<number>();
  return xs.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
}

async function markRead(conversationId: string) {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await Promise.all([
    supabase
      .from("messages")
      .update({ read_at: now })
      .eq("conversation_id", conversationId)
      .neq("sender_id", data.user.id)
      .is("read_at", null),
    supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("type", "nova_poruka")
      .eq("data->>conversation_id", conversationId)
      .is("read_at", null),
  ]);
}

function ConversationList({
  conversations,
  selectedId,
}: {
  conversations: ConversationSummary[];
  selectedId: string | null;
}) {
  if (!conversations.length)
    return (
      <div className="border-r-[0.5px] border-[#e1e1e1] px-[24px] py-[28px] text-[13px] leading-[1.5] text-[#71717a]">
        Još nemaš poruka.
      </div>
    );
  return (
    <ul aria-label="Razgovori" className="overflow-y-auto border-r-[0.5px] border-[#e1e1e1]">
      {conversations.map((c) => (
        <li key={c.id} className="border-b-[0.5px] border-[#e1e1e1]">
          <Link
            href={`/poruke?r=${c.id}`}
            aria-current={c.id === selectedId ? "true" : undefined}
            className={`flex gap-[12px] px-[16px] py-[14px] hover:bg-[#f5f6f8] ${c.id === selectedId ? "bg-[#f5f6f8]" : ""}`}
          >
            <Thumb src={c.listing.image} className="h-[62px] w-[48px]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-[8px]">
                <span className="truncate text-[14px] font-semibold">{c.other.displayName}</span>
                <span className="shrink-0 text-[11px] text-[#71717a]">{shortTime(c.lastAt)}</span>
              </span>
              <span className="mt-[3px] block truncate text-[12px] text-[#71717a]">{c.listing.title}</span>
              <span className="mt-[6px] flex items-center gap-[8px]">
                <span className={`min-w-0 flex-1 truncate text-[13px] ${c.unread ? "font-semibold" : ""}`}>
                  {c.lastBody ? `${c.lastFromMe ? "Ti: " : ""}${c.lastBody}` : "Nema poruka"}
                </span>
                {c.unread > 0 && (
                  <span
                    aria-label={`${c.unread} nepročitanih`}
                    className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-alert text-[10px] font-medium text-white"
                  >
                    {c.unread > 9 ? "9+" : c.unread}
                  </span>
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Thread({
  meId,
  conversationId,
  listing,
  other,
  role,
  messages,
  draft,
}: {
  meId: string;
  conversationId?: string;
  listing: ChatListing;
  other: ChatPerson;
  role: "kupac" | "prodavac";
  messages: ChatMessage[];
  draft?: Draft;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sent, setSent] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const all = dedupe([...messages, ...sent]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const closed = draft ? !draft.open : false;

  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [all.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const supabase = createClient();
    let convId = conversationId;
    if (!convId) {
      // Prodavca upisuje baza (vlasnik oglasa); ovde se šalje samo da bi polje bilo popunjeno.
      const { data, error } = await supabase
        .from("conversations")
        .insert({ listing_id: listing.id, buyer_id: meId, seller_id: meId })
        .select("id")
        .single();
      if (error || !data) {
        setSending(false);
        return setError("Poruka nije poslata. Pokušaj ponovo.");
      }
      convId = data.id;
    }
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: convId, sender_id: meId, body })
      .select("id, sender_id, body, created_at, read_at")
      .single();
    setSending(false);
    if (error || !data) return setError("Poruka nije poslata. Pokušaj ponovo.");
    setText("");
    if (!conversationId) {
      router.replace(`/poruke?r=${convId}`);
      return router.refresh();
    }
    setSent((xs) => [
      ...xs,
      { id: data.id, senderId: data.sender_id, body: data.body, createdAt: data.created_at, readAt: data.read_at },
    ]);
    router.refresh();
    input.current?.focus();
  };

  const lastMine = [...all].reverse().find((m) => m.senderId === meId);

  return (
    <section aria-label={`Razgovor sa ${other.displayName}`} className="flex min-h-0 flex-col">
      <header className="flex items-center gap-[14px] border-b-[0.5px] border-[#e1e1e1] px-[20px] py-[14px]">
        <Link href={listing.href} className="shrink-0">
          <Thumb src={listing.image} className="h-[56px] w-[44px]" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={listing.href} className="block truncate text-[14px] font-semibold hover:underline">
            {listing.title}
          </Link>
          <p className="mt-[4px] flex items-center gap-[10px] text-[13px] font-medium">
            {formatRsd(listing.price)}
            {listing.status !== "dostupno" && (
              <span className="bg-[#f5f6f8] px-[8px] py-[3px] text-[11px] font-semibold">
                {listing.status === "prodato" ? "Prodato" : listing.status === "rezervisano" ? "Rezervisano" : "Uklonjen"}
              </span>
            )}
          </p>
        </div>
        <Link
          href={other.username ? `/prodavac/${other.username}` : "#"}
          className="flex shrink-0 items-center gap-[10px] text-right"
        >
          <span>
            <span className="block text-[13px] font-semibold">{other.displayName}</span>
            <span className="block text-[11px] text-[#71717a]">{role === "kupac" ? "Prodavac" : "Kupac"}</span>
          </span>
          <span className="block size-[34px] overflow-hidden rounded-full bg-field">
            {other.avatarUrl && (
              <Image src={other.avatarUrl} alt="" width={34} height={34} className="size-full object-cover" />
            )}
          </span>
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[20px]" aria-live="polite">
        {draft && (
          <div className="mx-auto max-w-[420px] py-[30px] text-center text-[13px] leading-[1.6] text-[#52525b]">
            {draft.open ? (
              <>
                <p>
                  Pišeš prodavcu <span className="font-semibold text-black">{other.displayName}</span> o ovom
                  oglasu. Pitaj za stanje, slanje ili lično preuzimanje.
                </p>
                <div className="mt-[18px] flex flex-wrap justify-center gap-[8px]">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setText(q);
                        input.current?.focus();
                      }}
                      className="rounded-[97px] bg-field px-[14px] py-[8px] text-[12px] font-medium text-black"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p>Ovaj artikal je prodat, pa prodavcu više ne može da se piše o njemu.</p>
            )}
          </div>
        )}
        <ol className="flex flex-col gap-[6px]">
          {all.map((m, i) => {
            const mine = m.senderId === meId;
            const day = dayLabel(m.createdAt);
            const showDay = i === 0 || dayLabel(all[i - 1].createdAt) !== day;
            return (
              <li key={m.id} className="flex flex-col">
                {showDay && (
                  <span className="my-[12px] self-center text-[11px] font-medium text-[#71717a]">{day}</span>
                )}
                <span
                  className={`max-w-[70%] whitespace-pre-wrap break-words px-[14px] py-[10px] text-[14px] leading-[1.45] ${
                    mine ? "self-end bg-ink text-white" : "self-start bg-[#f5f6f8]"
                  }`}
                >
                  {m.body}
                </span>
                <span className={`mt-[3px] text-[10px] text-[#71717a] ${mine ? "self-end" : "self-start"}`}>
                  {clock(m.createdAt)}
                  {mine && m.id === lastMine?.id && m.readAt ? " · Pročitano" : ""}
                </span>
              </li>
            );
          })}
        </ol>
        <div ref={bottom} />
      </div>

      {!closed && (
        <form
          className="border-t-[0.5px] border-[#e1e1e1] px-[20px] py-[14px]"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {error && (
            <p role="status" className="mb-[8px] text-[12px] text-alert">
              {error}
            </p>
          )}
          <div className="flex items-end gap-[10px]">
            <textarea
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              maxLength={4000}
              aria-label="Poruka"
              placeholder="Napiši poruku…"
              className="min-h-[46px] flex-1 resize-none border border-black px-[12px] py-[10px] text-[14px] leading-[1.4] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="h-[46px] bg-ink px-[22px] text-[11px] font-bold uppercase text-white disabled:opacity-40"
            >
              {sending ? "Šaljem…" : "Pošalji"}
            </button>
          </div>
          <p className="mt-[8px] text-[11px] text-[#71717a]">
            Enter šalje poruku, Shift + Enter prelazi u novi red.
          </p>
        </form>
      )}
    </section>
  );
}

function Thumb({ src, className }: { src: string | null; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-[#f5f6f8] ${className}`}>
      {src && <Image src={src} alt="" fill sizes="48px" className="object-cover" />}
    </span>
  );
}

const TZ = "Europe/Belgrade";
const sameDay = (a: Date, b: Date) =>
  a.toLocaleDateString("sr-Latn-RS", { timeZone: TZ }) === b.toLocaleDateString("sr-Latn-RS", { timeZone: TZ });

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

function shortTime(iso: string) {
  const d = new Date(iso);
  return sameDay(d, new Date())
    ? clock(iso)
    : d.toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "numeric", timeZone: TZ });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (sameDay(d, now)) return "Danas";
  if (sameDay(d, new Date(now.getTime() - 86400000))) return "Juče";
  return d.toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}
