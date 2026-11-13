"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRsd } from "@/lib/listings/params";
import type { ChatListing, ChatPerson } from "@/lib/messages";
import { REVIEW_TAGS, type ReviewTag } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/client";

const STAR = "M8 .8l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L.8 6.1l5-.7z";
const WORDS = ["", "Loše", "Može bolje", "Dobro", "Vrlo dobro", "Odlično"];

// Forma za ocenu prodavca: zvezdice (obavezno), oznake iz Figme i komentar.
export function ReviewForm({
  listing,
  seller,
  sellerId,
  meId,
}: {
  listing: ChatListing;
  seller: ChatPerson;
  sellerId: string;
  meId: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [comment, setComment] = useState("");
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shown = hover || rating;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setMissing(true);
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      listing_id: listing.id,
      reviewer_id: meId,
      seller_id: sellerId,
      rating,
      tags,
      comment: comment.trim() || null,
    });
    if (error) {
      setSaving(false);
      return setError("Recenzija nije sačuvana. Pokušaj ponovo.");
    }
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("type", "poziv_za_recenziju")
      .eq("data->>listing_id", String(listing.id))
      .is("read_at", null);
    router.push(`/prodavac/${seller.username}?tab=recenzije`);
    router.refresh();
  };

  return (
    <form noValidate onSubmit={submit} className="mx-auto flex w-[636px] flex-col pb-[100px] pt-[80px] text-black">
      <h1 className="text-center font-serif text-[36px] font-medium italic leading-none">Oceni prodavca</h1>
      <p className="mt-[14px] text-center text-[14px] text-[#52525b]">
        Tvoja ocena pomaže drugim kupcima da izaberu prodavca.
      </p>

      <Link href={listing.href} className="mt-[40px] flex items-center gap-[16px] bg-[#f5f6f8] p-[16px]">
        <span className="relative h-[78px] w-[60px] shrink-0 overflow-hidden bg-white">
          {listing.image && <Image src={listing.image} alt="" fill sizes="60px" className="object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{listing.title}</span>
          <span className="mt-[4px] block text-[13px]">{formatRsd(listing.price)}</span>
          <span className="mt-[6px] block text-[12px] text-[#666]">
            Prodavac: {seller.displayName} @{seller.username}
          </span>
        </span>
      </Link>

      <fieldset className="mt-[36px]">
        <legend className="text-[14px] font-semibold">Ocena</legend>
        <div
          role="radiogroup"
          aria-label="Ocena od 1 do 5"
          aria-invalid={missing}
          onMouseLeave={() => setHover(0)}
          className={`mt-[12px] inline-flex items-center gap-[6px] border p-[10px] ${missing ? "border-alert" : "border-transparent"}`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} od 5`}
              onMouseEnter={() => setHover(n)}
              onClick={() => {
                setRating(n);
                setMissing(false);
              }}
            >
              <svg width="34" height="34" viewBox="0 0 16 16" aria-hidden>
                <path d={STAR} fill={n <= shown ? "#000" : "#dbdee1"} />
              </svg>
            </button>
          ))}
          <span className="ml-[10px] w-[90px] text-[14px] font-medium">{WORDS[shown]}</span>
        </div>
      </fieldset>

      <fieldset className="mt-[28px]">
        <legend className="text-[14px] font-semibold">Šta ti se svidelo?</legend>
        <div className="mt-[12px] flex gap-[9px]">
          {REVIEW_TAGS.map((t) => {
            const on = tags.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((xs) => (on ? xs.filter((x) => x !== t.value) : [...xs, t.value]))}
                className={`h-[33px] rounded-[2px] border px-[12px] text-[12px] ${
                  on ? "border-black bg-black text-white" : "border-[#e1e1e1] bg-white text-black"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-[28px] flex flex-col">
        <span className="text-[14px] font-semibold">Komentar</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Kako je prošao dogovor, slanje i da li je proizvod bio kao u opisu?"
          className={`sell-field mt-[12px] resize-none border px-[12px] py-[10px] text-[14px] leading-[1.5] focus:outline-none ${
            comment ? "border-black" : "border-[#e1e1e1]"
          }`}
        />
        <span className="mt-[6px] self-end text-[11px] text-[#71717a]">{comment.length}/2000</span>
      </label>

      {error && (
        <p role="status" className="mt-[12px] text-[13px] text-alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="mt-[24px] h-[39px] bg-ink text-[13px] font-bold uppercase text-white disabled:opacity-50"
      >
        {saving ? "Objavljujem…" : "Objavi recenziju"}
      </button>
    </form>
  );
}
