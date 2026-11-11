"use client";

import Image from "next/image";
import { useState } from "react";

// Slike na kartici proizvoda (Figma „Subject“ 412:6221 i varijante 412:6149/6173/6197):
// na hover se pojavljuju strelice (bela 60 %, na hover pune bele) i listaju do 3 slike,
// a crtice ispod pokazuju koja je slika prikazana.
export function CardImages({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const go = (e: React.MouseEvent, d: number) => {
    e.preventDefault();
    e.stopPropagation();
    setI((x) => Math.max(0, Math.min(images.length - 1, x + d)));
  };

  return (
    <div className="group/img relative h-[253px] w-[196px] overflow-hidden bg-[#f5f6f8]">
      {images[i] && <Image src={images[i]} alt={alt} fill sizes="196px" className="object-cover" />}
      {images.length > 1 && (
        <>
          {i > 0 && <Arrow dir="left" onClick={(e) => go(e, -1)} />}
          {i < images.length - 1 && <Arrow dir="right" onClick={(e) => go(e, 1)} />}
          <div className="absolute left-1/2 top-[234px] flex -translate-x-1/2 items-center gap-[9px]">
            {images.map((src, k) => (
              <span
                key={src}
                className={`h-[3px] rounded-[87px] transition-all ${k === i ? "w-[41px] bg-black" : "w-[21px] bg-[#e5e5e5]"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "left" | "right"; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Prethodna slika" : "Sledeća slika"}
      onClick={onClick}
      className={`absolute top-[114px] flex size-[26px] items-center justify-center rounded-full bg-white/60 opacity-0 transition-[opacity,background-color] hover:bg-white focus-visible:opacity-100 group-hover/img:opacity-100 ${
        dir === "left" ? "left-[8px] rotate-180" : "left-[162px]"
      }`}
    >
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <path d="M11 18L16 13L11 8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
