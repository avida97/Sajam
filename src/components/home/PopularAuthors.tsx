"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// „Najpopularniji autori“ (Figma 412:13218): 8 autora po strani.
// Spisak se računa iz baze (getPopularAuthorsFromDb); dok nema bar 8 autora sa oglasima,
// prikazuje se spisak iz dizajna (src/lib/authors.ts).
// Strane se menjaju crticama, strelicama (kao u „Trenutno u trendu“), prevlačenjem prstom
// ili mišem i strelicama na tastaturi (odluka V 11. 11. 2026).
const PER_PAGE = 8;
const WIDTH = 856;

export function PopularAuthors({ authors }: { authors: string[] }) {
  const [page, setPage] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const pages = Math.ceil(authors.length / PER_PAGE);
  const groups = Array.from({ length: pages }, (_, i) => authors.slice(i * PER_PAGE, (i + 1) * PER_PAGE));

  const go = (i: number) => {
    const p = Math.max(0, Math.min(pages - 1, i));
    track.current?.scrollTo({ left: p * WIDTH, behavior: "smooth" });
    setPage(p);
  };

  const endDrag = (clientX: number) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !track.current) return;
    dragged.current = d.moved;
    track.current.style.scrollSnapType = "";
    const dx = clientX - d.x;
    go(Math.abs(dx) > 60 ? page + (dx < 0 ? 1 : -1) : page);
  };

  // Strana prati pomeranje (prevlačenje prstom ili točkićem po horizontali).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setPage(Math.round(el.scrollLeft / WIDTH));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="bg-[#f5f6f8]">
      <div className="mx-auto flex h-[383px] w-[856px] flex-col items-center pt-[59px]">
        <h2 className="trim-cap font-serif text-[36px] font-medium italic leading-[0.95] tracking-[-1.08px] text-black">
          Najpopularniji autori
        </h2>
        <div className="relative mt-[47px] w-[856px]">
          <div
            ref={track}
            tabIndex={0}
            aria-label="Najpopularniji autori"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(page + 1);
              if (e.key === "ArrowLeft") go(page - 1);
            }}
            // Prevlačenje mišem: pomera traku, pa je na pusti poravna na najbližu stranu.
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse" || !track.current) return;
              drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || !track.current) return;
              const dx = e.clientX - d.x;
              if (Math.abs(dx) > 5) d.moved = true;
              if (!d.moved) return;
              track.current.style.scrollSnapType = "none";
              track.current.scrollLeft = d.left - dx;
            }}
            onPointerUp={(e) => endDrag(e.clientX)}
            onPointerLeave={(e) => endDrag(e.clientX)}
            onClickCapture={(e) => {
              // Posle prevlačenja klik ne otvara autora.
              if (dragged.current) {
                e.preventDefault();
                e.stopPropagation();
                dragged.current = false;
              }
            }}
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
          >
            {groups.map((g, i) => (
              <ul key={i} className="grid w-[856px] shrink-0 snap-start grid-cols-4 gap-[16px]">
                {g.map((a) => (
                  <li key={a}>
                    <Link
                      href={`/knjige?autor=${encodeURIComponent(a)}`}
                      draggable={false}
                      className="flex h-[45px] w-[202px] items-center justify-center rounded-[8px] bg-white text-[12px] font-medium leading-[0.95] tracking-[-0.36px] text-black transition-shadow hover:shadow-[0_0_4.5px_rgba(0,0,0,0.2)]"
                    >
                      {a}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          {page > 0 && (
            <button
              type="button"
              aria-label="Prethodni autori"
              onClick={() => go(page - 1)}
              className="absolute left-[-66px] top-[33px] size-[50px] rotate-180"
            >
              <Image src="/icons/arrow-right-round.svg" alt="" width={50} height={50} />
            </button>
          )}
          {page < pages - 1 && (
            <button
              type="button"
              aria-label="Sledeći autori"
              onClick={() => go(page + 1)}
              className="absolute right-[-66px] top-[33px] size-[50px]"
            >
              <Image src="/icons/arrow-right-round.svg" alt="" width={50} height={50} />
            </button>
          )}
        </div>
        <div className="mt-[26px] flex items-center gap-[9px]">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Strana ${i + 1}`}
              onClick={() => go(i)}
              className="flex h-[15px] items-center"
            >
              <span
                className={`block h-[3px] rounded-[78px] transition-all ${i === page ? "w-[41px] bg-black" : "w-[21px] bg-[#d9d9d9] hover:bg-[#a1a1aa]"}`}
              />
            </button>
          ))}
        </div>
        <MainButton href="/knjige" size="md" className="mt-[19px] font-semibold">
          Prikaži sve autore
        </MainButton>
      </div>
    </section>
  );
}
