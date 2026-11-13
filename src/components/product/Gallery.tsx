"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Galerija iz Figme (Component 124, 575:16289): velika slika 416×554 i niz sličica 86×86,
// izabrana ima crni okvir. Probni oglasi nemaju slike, pa se vide prazna polja.
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const thumbs = images.length ? images : Array.from({ length: 5 }, () => "");
  const many = images.length > 1;
  const go = (d: number) => setActive((a) => (a + d + images.length) % images.length);

  // Izabrana sličica ostaje vidljiva u nizu kad se slike menjaju strelicama.
  useEffect(() => {
    const el = strip.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <div className="relative h-[660px] w-[436px]">
      <div
        className="relative ml-[10px] h-[554px] w-[416px] overflow-hidden bg-[#f5f6f8]"
        tabIndex={many ? 0 : undefined}
        aria-label={many ? `Slika ${active + 1} od ${images.length}` : undefined}
        onKeyDown={(e) => {
          if (!many) return;
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        {images[active] && <Image src={images[active]} alt={title} fill sizes="416px" className="object-cover" priority />}
        {many && (
          <>
            <Arrow dir="prev" onClick={() => go(-1)} />
            <Arrow dir="next" onClick={() => go(1)} />
            <span className="absolute bottom-[14px] left-1/2 -translate-x-1/2 rounded-[97px] bg-white/90 px-[10px] py-[4px] text-[11px] font-medium text-black">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      <div className="relative mt-[20px] h-[86px]">
        <div ref={strip} className="ml-[10px] flex w-[416px] gap-[12px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {thumbs.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slika ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative size-[86px] shrink-0 overflow-hidden bg-[#f5f6f8] ${i === active ? "border-[1.5px] border-black" : ""}`}
            >
              {src && <Image src={src} alt="" fill sizes="86px" className="object-cover" />}
            </button>
          ))}
        </div>
        {thumbs.length > 4 && (
          <button
            type="button"
            aria-label="Sledeće slike"
            onClick={() => strip.current?.scrollBy({ left: 98 * 4, behavior: "smooth" })}
            className="absolute left-[416px] top-[33px] size-[20px]"
          >
            <Image src="/icons/thumb-next.svg" alt="" width={20} height={20} />
          </button>
        )}
      </div>
    </div>
  );
}

// Strelice preko velike slike: bela kružnica sa strelicom, kao na karticama u Figmi.
function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Prethodna slika" : "Sledeća slika"}
      onClick={onClick}
      className={`absolute top-1/2 flex size-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] ${
        dir === "prev" ? "left-[12px]" : "right-[12px]"
      }`}
    >
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden className={dir === "prev" ? "rotate-180" : ""}>
        <path d="M2 2l6 6-6 6" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
