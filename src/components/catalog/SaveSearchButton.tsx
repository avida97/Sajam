"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SavedFilters } from "@/lib/saved-searches";

// „Sačuvaj pretragu“ iznad liste (Figma „Products Knjige“). Čuva trenutne filtere; kad se pojavi
// novi oglas koji im odgovara, korisnik dobija obaveštenje. Spisak je na /sacuvane-pretrage.
export function SaveSearchButton({
  filters,
  name,
  loggedIn,
  alreadySaved,
}: {
  filters: SavedFilters;
  name: string;
  loggedIn: boolean;
  alreadySaved: boolean;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(alreadySaved ? "saved" : "idle");
  const [error, setError] = useState("");
  const cls = "flex items-center gap-[9px] text-[13px] font-medium leading-[1.5] text-black hover:underline";

  if (!loggedIn) {
    const here = `${pathname}${search.size ? `?${search}` : ""}`;
    const sep = search.size ? "&" : "?";
    return (
      <Link href={`${here}${sep}nalog=prijava&posle=${encodeURIComponent(here)}`} scroll={false} className={cls}>
        <Image src="/icons/bookmark.svg" alt="" width={12} height={16} />
        Sačuvaj pretragu
      </Link>
    );
  }

  if (state === "saved") {
    return (
      <span className="flex items-center gap-[9px] text-[13px] font-medium leading-[1.5] text-black">
        <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
          <path d="M0.5 14V0.5H11.5V14L6 8.5L0.5 14Z" fill="black" stroke="black" />
        </svg>
        Pretraga je sačuvana
        <Link href="/sacuvane-pretrage" className="font-normal text-[#737373] underline-offset-2 hover:text-black hover:underline">
          Pogledaj sve
        </Link>
      </span>
    );
  }

  async function save() {
    setState("saving");
    setError("");
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setState("error");
      setError("Prijavi se ponovo.");
      return;
    }
    const { error: err } = await supabase.from("saved_searches").insert({ user_id: auth.user.id, name, filters });
    if (err) {
      setState("error");
      setError(err.message.includes("najviše") ? "Možeš da sačuvaš najviše 20 pretraga." : "Pretraga nije sačuvana. Pokušaj ponovo.");
      return;
    }
    setState("saved");
  }

  return (
    <span className="flex items-center gap-[12px]">
      <button type="button" onClick={save} disabled={state === "saving"} className={`${cls} disabled:opacity-60`}>
        <Image src="/icons/bookmark.svg" alt="" width={12} height={16} />
        Sačuvaj pretragu
      </button>
      {error && <span className="text-[12px] text-[#b42318]">{error}</span>}
    </span>
  );
}
