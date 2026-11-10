"use client";

import Link from "next/link";
import { useEffect } from "react";

// Greška na stranici: umesto praznog ekrana poruka i dugme za ponovni pokušaj.
// Opis greške je sitno ispod, da može da se pošalje kad se nešto prijavljuje.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-[20px] pb-[120px] pt-[100px] text-center text-black">
      <h1 className="font-serif text-[36px] font-medium italic leading-none">Nešto nije u redu</h1>
      <p className="mt-[16px] text-[14px] text-[#52525b]">Stranica nije mogla da se prikaže. Pokušaj ponovo.</p>
      <div className="mt-[28px] flex items-center gap-[16px]">
        <button type="button" onClick={reset} className="h-[33px] bg-ink px-[19px] text-[11px] font-bold uppercase text-white">
          Pokušaj ponovo
        </button>
        <Link href="/" className="text-[12px] font-medium underline">
          Početna strana
        </Link>
      </div>
      <p className="mt-[40px] break-all text-[11px] text-[#9a9a9a]">
        {error.message}
        {error.digest ? ` (${error.digest})` : ""}
      </p>
    </div>
  );
}
