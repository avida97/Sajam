"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

// Srce iz Figme: na kartici (bela kružnica 30px) i na oglasu (malo srce sa brojem).
// Neprijavljenom posetiocu otvara prijavu.
export function HeartButton({
  listingId,
  variant = "card",
  count,
  className = "",
}: {
  listingId: number;
  variant?: "card" | "page";
  count?: number;
  className?: string;
}) {
  const fav = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const on = fav.ids.has(listingId);
  // Broj na oglasu: početni iz baze, pa se menja kad korisnik klikne.
  const [delta, setDelta] = useState(0);
  const shown = (count ?? 0) + delta;

  const click = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listingId <= 0) return;
    const was = on;
    const ok = await toggleFavorite(listingId);
    if (!ok) {
      const q = new URLSearchParams(window.location.search);
      q.set("nalog", "prijava");
      q.set("posle", pathname);
      router.replace(`${pathname}?${q}`, { scroll: false });
      return;
    }
    setDelta((d) => d + (was ? -1 : 1));
    if (pathname === "/omiljeno") router.refresh();
  };

  const label = on ? "Ukloni iz omiljenih" : "Dodaj u omiljene";
  if (variant === "page")
    return (
      <button type="button" aria-label={label} aria-pressed={on} onClick={click} className={`flex h-[28px] w-[16px] flex-col items-center ${className}`}>
        <Image src={on ? "/icons/heart-small-filled.svg" : "/icons/heart-outline.svg"} alt="" width={16} height={14} />
        <span className="mt-[2px] text-[11px] font-semibold leading-none">{Math.max(0, shown)}</span>
      </button>
    );
  return (
    // Hover po Figmi („Component 21“ 314:409): srce se popuni.
    <button type="button" aria-label={label} aria-pressed={on} onClick={click} className={`group/heart size-[30px] ${className}`}>
      <Image src="/icons/heart-filled.svg" alt="" width={30} height={30} className={on ? "" : "hidden group-hover/heart:block"} />
      {!on && <Image src="/icons/heart.svg" alt="" width={30} height={30} className="group-hover/heart:hidden" />}
    </button>
  );
}
