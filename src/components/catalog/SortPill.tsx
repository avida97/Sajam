"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { SortKey } from "@/lib/listings/types";

// „Sortiraj po“ iz Figme (Component 90, 520:8201 / 520:8200): siva kapsula koja se
// klikom širi ulevo i nudi Cena, Azbučno, Najnovije. Ponovni klik na „Cena“ menja smer.
export function SortPill({ current }: { current: SortKey }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const choose = (sort: SortKey) => {
    const next = new URLSearchParams(params.toString());
    if (sort === "najnovije") next.delete("sort");
    else next.set("sort", sort);
    next.delete("strana");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const isPrice = current === "cena-rastuce" || current === "cena-opadajuce";
  const options: Array<{ label: string; on: boolean; pick: () => void }> = [
    {
      label: current === "cena-opadajuce" ? "Cena ↓" : current === "cena-rastuce" ? "Cena ↑" : "Cena",
      on: isPrice,
      pick: () => choose(current === "cena-rastuce" ? "cena-opadajuce" : "cena-rastuce"),
    },
    { label: "Azbučno", on: current === "azbucno", pick: () => choose("azbucno") },
    { label: "Najnovije", on: current === "najnovije", pick: () => choose("najnovije") },
  ];

  return (
    <div
      className={`flex h-[40px] items-center justify-end overflow-hidden rounded-[140px] bg-field text-[13px] font-medium text-black transition-[width] ${
        open ? "w-[381px] pl-[20px]" : "w-[105px]"
      }`}
    >
      {open && (
        <div className="mr-auto flex items-center gap-[28px]">
          {options.map((o) => (
            <button key={o.label} type="button" onClick={o.pick} aria-pressed={o.on} className="flex items-center gap-[7px] whitespace-nowrap">
              <span className="flex size-[12px] items-center justify-center rounded-full bg-white">
                {o.on && <span className="size-[6px] rounded-full bg-black" />}
              </span>
              {o.label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="h-full whitespace-nowrap px-[20px]"
      >
        Sortiraj po
      </button>
    </div>
  );
}
