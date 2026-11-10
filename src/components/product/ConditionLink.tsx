"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CONDITIONS } from "@/lib/conditions";

// Podvučeno stanje („Kao novo“) otvara prozor „Stanje artikala“ (Figma 689:15133).
export function ConditionLink({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="trim-cap underline">
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stanje-naslov"
            onClick={(e) => e.stopPropagation()}
            className="relative mx-auto mt-[160px] w-[512px] bg-white px-[35px] pb-[30px] pt-[30px] text-black"
          >
            <h2 id="stanje-naslov" className="font-serif text-[22px] font-medium italic">
              Stanje artikala
            </h2>
            <button type="button" aria-label="Zatvori" onClick={() => setOpen(false)} className="absolute right-[35px] top-[30px] size-[17px]">
              <Image src="/icons/close.svg" alt="" width={17} height={17} />
            </button>
            <ul className="mt-[26px]">
              {CONDITIONS.map((c, i) => (
                <li key={c.value} className={`pb-[20px] ${i < CONDITIONS.length - 1 ? "mb-[20px] border-b border-field" : ""}`}>
                  <p className="text-[14px] font-semibold">{c.label}</p>
                  <p className="mt-[2px] text-[14px] leading-[1.5]">{c.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
