"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MainButton } from "@/components/ui/MainButton";
import { formatRsd, listingHref } from "@/lib/listings/params";
import { createClient } from "@/lib/supabase/client";

export type MyListing = {
  id: number;
  title: string;
  author: string | null;
  price: number;
  status: "dostupno" | "rezervisano" | "prodato";
  createdAt: string;
  image: string | null;
  soldTo: string | null;
  /** Ko je pisao o ovom oglasu (najskoriji prvi). */
  buyers: Array<{ id: string; username: string; displayName: string }>;
};

const STATUSES: Array<{ value: MyListing["status"]; label: string }> = [
  { value: "dostupno", label: "Dostupno" },
  { value: "rezervisano", label: "Rezervisano" },
  { value: "prodato", label: "Prodato" },
];

// Ekrana nema u Figmi; napravljen od kartica, polja i dugmadi iz dizajna, za Ankin pregled.
export function MyListings({
  items: initial,
  username,
}: {
  items: MyListing[];
  username: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kad se bira Prodato, a o oglasu je neko pisao, prvo se pita kome je prodato.
  const [picking, setPicking] = useState<number | null>(null);
  const [buyer, setBuyer] = useState<string>("");

  // Vremena rezervacije i prodaje upisuje baza.
  const setStatus = async (id: number, status: MyListing["status"], soldTo: string | null = null) => {
    const prev = items;
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status, soldTo } : x)));
    setPicking(null);
    const { error } = await createClient()
      .from("listings")
      .update({ status, sold_to: status === "prodato" ? soldTo : null })
      .eq("id", id);
    if (error) {
      setItems(prev);
      setError("Status nije promenjen. Pokušaj ponovo.");
    } else router.refresh();
  };

  const onStatus = (l: MyListing, status: MyListing["status"]) => {
    setError(null);
    if (status === "prodato" && l.buyers.length) {
      setBuyer(l.soldTo ?? l.buyers[0].id);
      setPicking(l.id);
    } else setStatus(l.id, status);
  };

  // Brisanje = status „uklonjen“: oglas nestaje sa sajta, a razgovori i recenzije ostaju.
  const remove = async (id: number) => {
    const { error } = await createClient()
      .from("listings")
      .update({ status: "uklonjen" })
      .eq("id", id);
    setConfirm(null);
    if (error) return setError("Oglas nije obrisan. Pokušaj ponovo.");
    setItems((xs) => xs.filter((x) => x.id !== id));
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-site px-[182px] pb-[80px] pt-[68px] text-black">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[36px] font-medium italic leading-none">
            Moji oglasi
          </h1>
          <p className="mt-[14px] text-[14px] text-[#52525b]">
            Kad se dogovoriš sa kupcem, označi oglas kao Rezervisano, a posle
            prodaje kao Prodato.
          </p>
        </div>
        <div className="flex gap-[10px]">
          <MainButton href={`/prodavac/${username}`} variant="light">
            Moj profil
          </MainButton>
          <MainButton href="/prodaj">Započni prodaju</MainButton>
        </div>
      </div>

      {error && (
        <p role="status" className="mt-[20px] text-[13px] text-alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-[60px] text-center text-[14px] text-[#71717a]">
          Još nemaš nijedan oglas.
        </p>
      ) : (
        <ul className="mt-[40px] divide-y-[0.5px] divide-[#e1e1e1] border-y-[0.5px] border-[#e1e1e1]">
          {items.map((l) => (
            <li key={l.id} className="py-[16px]">
             <div className="flex items-center gap-[20px]">
              <Link
                href={listingHref(l)}
                className="relative block h-[96px] w-[74px] shrink-0 overflow-hidden bg-[#f5f6f8]"
              >
                {l.image && (
                  <Image
                    src={l.image}
                    alt=""
                    fill
                    sizes="74px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={listingHref(l)}
                  className="block truncate text-[15px] font-semibold hover:underline"
                >
                  {l.title}
                </Link>
                {l.author && (
                  <p className="mt-[4px] truncate text-[13px]">{l.author}</p>
                )}
                <p className="mt-[8px] text-[13px] font-medium">
                  {formatRsd(l.price)}
                </p>
                {l.status === "prodato" && picking !== l.id && (
                  <p className="mt-[6px] text-[12px] text-[#52525b]">
                    {l.soldTo
                      ? `Kupac: ${l.buyers.find((b) => b.id === l.soldTo)?.displayName ?? "sa Sajma"}. Poziv za ocenu je poslat.`
                      : "Prodato van Sajma."}
                    {l.buyers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onStatus(l, "prodato")}
                        className="ml-[8px] font-medium text-black underline"
                      >
                        Promeni
                      </button>
                    )}
                  </p>
                )}
              </div>

              <div className="relative h-[36px] w-[160px]">
                <select
                  aria-label={`Status oglasa ${l.title}`}
                  value={picking === l.id ? "prodato" : l.status}
                  onChange={(e) => onStatus(l, e.target.value as MyListing["status"])}
                  className="sell-field h-[36px] w-[160px] appearance-none border border-black bg-white pl-[11px] pr-[30px] text-[14px] focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <Image
                  src="/icons/chevron-down.svg"
                  alt=""
                  width={9}
                  height={5}
                  className="pointer-events-none absolute right-[12px] top-[16px]"
                />
              </div>

              <MainButton href={`/prodaj?izmeni=${l.id}`} variant="light">
                Izmeni
              </MainButton>
              <span className="flex w-[180px] justify-end">
                {confirm === l.id ? (
                  <span className="flex items-center gap-[8px]">
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
                      className="h-[33px] bg-alert px-[14px] text-[11px] font-bold uppercase text-white"
                    >
                      Obriši oglas
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm(null)}
                      className="text-[12px] font-medium underline"
                    >
                      Odustani
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirm(l.id)}
                    className="h-[33px] px-[10px] text-[12px] font-medium underline"
                  >
                    Obriši
                  </button>
                )}
              </span>
             </div>
              {picking === l.id && (
                <fieldset className="ml-[94px] mt-[14px] max-w-[520px] bg-[#f5f6f8] p-[18px]">
                  <legend className="sr-only">Kome je prodato</legend>
                  <p className="text-[14px] font-semibold">Kome je prodato?</p>
                  <p className="mt-[4px] text-[12px] text-[#52525b]">
                    Poziv za ocenu dobija izabrani kupac, i samo taj kupac može da te oceni.
                  </p>
                  <div className="mt-[12px] flex flex-col gap-[8px] text-[14px]">
                    {[...l.buyers, { id: "", username: "", displayName: "Nekom van Sajma" }].map((b) => (
                      <label key={b.id || "van"} className="flex cursor-pointer items-center gap-[10px]">
                        <input
                          type="radio"
                          name={`kupac-${l.id}`}
                          checked={buyer === b.id}
                          onChange={() => setBuyer(b.id)}
                          className="size-[16px] accent-black"
                        />
                        {b.displayName}
                        {b.username && <span className="text-[12px] text-[#71717a]">@{b.username}</span>}
                      </label>
                    ))}
                  </div>
                  <div className="mt-[16px] flex items-center gap-[14px]">
                    <button
                      type="button"
                      onClick={() => setStatus(l.id, "prodato", buyer || null)}
                      className="h-[33px] bg-ink px-[19px] text-[11px] font-bold uppercase text-white"
                    >
                      Označi kao prodato
                    </button>
                    <button type="button" onClick={() => setPicking(null)} className="text-[12px] font-medium underline">
                      Odustani
                    </button>
                  </div>
                </fieldset>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
