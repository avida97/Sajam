"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CatalogListing } from "@/lib/listings/types";
import { ProductCard } from "./ProductCard";

// Sekcija sa naslovom i trakom kartica iz Figme („Trenutno u trendu“, „Novo u ponudi“,
// „Slični proizvodi“…): naslov levo, „Pogledaj sve“ desno, 6 kartica u redu, strelice i
// indikator strana ispod.
export function ProductCarousel({
  title,
  href,
  listings,
}: {
  title: string;
  href?: string;
  listings: CatalogListing[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)));
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [listings.length]);

  const go = (p: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: p * (el.clientWidth + 24), behavior: "smooth" });
  };

  if (listings.length === 0) return null;

  return (
    <section className="mx-auto h-[633px] max-w-site pt-[50px]">
      <div className="flex items-start justify-between px-[72px]">
        <h2 className="trim-cap font-serif text-[36px] font-medium italic leading-[0.95] tracking-[-1.08px] text-black">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            // Hover po Figmi („Component 52“ 373:6209): linija ispod.
            className="mt-[4px] flex h-[20px] items-center gap-[8px] border-b border-transparent text-[15px] font-medium leading-[0.95] tracking-[-0.15px] text-black transition-colors hover:border-black"
          >
            Pogledaj sve
            <Image src="/icons/chevron-right.svg" alt="" width={7} height={12} />
          </Link>
        )}
      </div>

      <div className="relative mx-[48px] mt-[40px] h-[469px]">
        <div
          ref={track}
          className="mx-[24px] flex snap-x snap-mandatory gap-[24px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {listings.map((l) => (
            <div key={l.id} className="snap-start">
              <ProductCard listing={l} />
            </div>
          ))}
        </div>

        {page > 0 && (
          <button
            type="button"
            aria-label="Prethodne"
            onClick={() => go(page - 1)}
            className="absolute left-[-4.5px] top-[101.5px] size-[50px] rotate-180"
          >
            <Image src="/icons/arrow-right-round.svg" alt="" width={50} height={50} />
          </button>
        )}
        {page < pages - 1 && (
          <button
            type="button"
            aria-label="Sledeće"
            onClick={() => go(page + 1)}
            className="absolute right-[-4.5px] top-[101.5px] size-[50px]"
          >
            <Image src="/icons/arrow-right-round.svg" alt="" width={50} height={50} />
          </button>
        )}

        {pages > 1 && (
          <div className="absolute left-1/2 top-[466px] flex -translate-x-1/2 items-center gap-[9px]">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Strana ${i + 1}`}
                onClick={() => go(i)}
                className={`h-[3px] rounded-[78px] ${i === page ? "w-[42px] bg-black" : "w-[21px] bg-[#d9d9d9]"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
