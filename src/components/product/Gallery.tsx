"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Galerija iz Figme (Component 124, 575:16289): velika slika 416×554 i niz sličica 86×86,
// izabrana ima crni okvir. Probni oglasi nemaju slike, pa se vide prazna polja.
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const thumbs = images.length ? images : Array.from({ length: 5 }, () => "");

  return (
    <div className="relative h-[660px] w-[436px]">
      <div className="relative ml-[10px] h-[554px] w-[416px] overflow-hidden bg-[#f5f6f8]">
        {images[active] && <Image src={images[active]} alt={title} fill sizes="416px" className="object-cover" priority />}
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
