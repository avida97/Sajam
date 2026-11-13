"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const SORTS = [
  { value: "najnovije", label: "Najnovije" },
  { value: "cena-rastuce", label: "Cena rastuće" },
  { value: "cena-opadajuce", label: "Cena opadajuće" },
  { value: "azbucno", label: "Azbučno" },
];

// „Kategorija“ i „Sortiraj po“ iz Figme (Omiljeni proizvodi): bela polja sa strelicom.
export function FavoritesControls({
  categories,
  kategorija,
  sort,
}: {
  categories: Array<{ value: string; label: string }>;
  kategorija: string;
  sort: string;
}) {
  const router = useRouter();
  const go = (k: string, s: string) => {
    const q = new URLSearchParams();
    if (k) q.set("kategorija", k);
    if (s && s !== "najnovije") q.set("sort", s);
    router.push(q.size ? `/omiljeno?${q}` : "/omiljeno", { scroll: false });
  };
  return (
    <div className="flex gap-[14px]">
      <Select label="Kategorija" value={kategorija} onChange={(v) => go(v, sort)} width={194}>
        <option value="">Kategorija</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>
      <Select label="Sortiraj po" value={sort} onChange={(v) => go(kategorija, v)} width={207}>
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            Sortiraj po: {s.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  width,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <span className="relative block h-[33px]" style={{ width }}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full appearance-none border-[0.5px] border-[#ccc] bg-white pl-[12px] pr-[30px] text-[13px] text-black focus:outline-none"
      >
        {children}
      </select>
      <Image src="/icons/chevron-down.svg" alt="" width={9} height={5} className="pointer-events-none absolute right-[12px] top-[14px]" />
    </span>
  );
}
