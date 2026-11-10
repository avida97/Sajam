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

  const setStatus = async (id: number, status: MyListing["status"]) => {
    const prev = items;
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));
    const now = new Date().toISOString();
    const { error } = await createClient()
      .from("listings")
      .update({
        status,
        reserved_at: status === "rezervisano" ? now : null,
        sold_at: status === "prodato" ? now : null,
      })
      .eq("id", id);
    if (error) {
      setItems(prev);
      setError("Status nije promenjen. Pokušaj ponovo.");
    } else router.refresh();
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
            <li key={l.id} className="flex items-center gap-[20px] py-[16px]">
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
              </div>

              <div className="relative h-[36px] w-[160px]">
                <select
                  aria-label={`Status oglasa ${l.title}`}
                  value={l.status}
                  onChange={(e) =>
                    setStatus(l.id, e.target.value as MyListing["status"])
                  }
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
