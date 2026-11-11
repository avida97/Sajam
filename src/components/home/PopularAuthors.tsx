"use client";

import Link from "next/link";
import { useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// „Najpopularniji autori“ (Figma 412:13218): 8 autora po strani, dve strane.
// Spisak se računa iz baze (getPopularAuthorsFromDb); dok nema bar 8 autora sa oglasima,
// prikazuje se spisak iz dizajna (src/lib/authors.ts).
const PER_PAGE = 8;

export function PopularAuthors({ authors }: { authors: string[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(authors.length / PER_PAGE);
  const shown = authors.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <section className="bg-[#f5f6f8]">
      <div className="mx-auto flex h-[383px] w-[856px] flex-col items-center pt-[59px]">
        <h2 className="trim-cap font-serif text-[36px] font-medium italic leading-[0.95] tracking-[-1.08px] text-black">
          Najpopularniji autori
        </h2>
        <ul className="mt-[47px] grid w-[856px] grid-cols-4 gap-[16px]">
          {shown.map((a) => (
            <li key={a}>
              <Link
                href={`/knjige?autor=${encodeURIComponent(a)}`}
                className="flex h-[45px] w-[202px] items-center justify-center rounded-[8px] bg-white text-[12px] font-medium leading-[0.95] tracking-[-0.36px] text-black"
              >
                {a}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-[26px] flex items-center gap-[9px]">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Strana ${i + 1}`}
              onClick={() => setPage(i)}
              className={`h-[3px] rounded-[78px] ${i === page ? "w-[41px] bg-black" : "w-[21px] bg-[#d9d9d9]"}`}
            />
          ))}
        </div>
        <MainButton href="/knjige" size="md" className="mt-[31px] font-semibold">
          Prikaži sve autore
        </MainButton>
      </div>
    </section>
  );
}
