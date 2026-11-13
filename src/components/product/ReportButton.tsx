"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// „Prijavi oglas“ / „Prijavi korisnika“. Ekrana nema u Figmi; prozor je napravljen kao
// „Stanje proizvoda“ (isti okvir, naslov i dugme), za Ankin pregled. Prijava ide u tabelu
// reports, a rešava je admin na /admin.
const REASONS = {
  oglas: [
    "Lažan ili obmanjujući oglas",
    "Zabranjen ili ukraden proizvod",
    "Pogrešna kategorija ili duplikat",
    "Neprimeren sadržaj ili slike",
    "Drugo",
  ],
  korisnik: [
    "Prevara ili pokušaj prevare",
    "Uvredljive ili neprimerene poruke",
    "Neispunjen dogovor",
    "Lažno predstavljanje",
    "Drugo",
  ],
};

type Props =
  | { kind: "oglas"; listingId: number; userId?: string; loggedIn: boolean }
  | { kind: "korisnik"; userId: string; listingId?: undefined; loggedIn: boolean };

export function ReportButton({ kind, listingId, userId, loggedIn }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = kind === "oglas" ? "Prijavi oglas" : "Prijavi korisnika";
  const linkClass = "inline-flex items-center gap-[6px] text-[12px] text-[#737373] underline-offset-2 hover:text-black hover:underline";

  if (!loggedIn) {
    return (
      <Link href={`${pathname}?nalog=prijava&posle=${encodeURIComponent(pathname)}`} scroll={false} className={linkClass}>
        <FlagIcon />
        {label}
      </Link>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Izaberi razlog prijave.");
      return;
    }
    setState("saving");
    setError("");
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setState("error");
      setError("Prijavi se ponovo, pa pokušaj još jednom.");
      return;
    }
    const { error: err } = await supabase.from("reports").insert({
      reporter_id: auth.user.id,
      // Prijava je ili za oglas ili za korisnika (baza dozvoljava tačno jedno).
      listing_id: kind === "oglas" ? listingId : null,
      reported_user_id: kind === "korisnik" ? userId : null,
      reason,
      details: details.trim() || null,
    });
    if (err) {
      setState("error");
      setError("Prijava nije poslata. Pokušaj ponovo za nekoliko minuta.");
      return;
    }
    setState("done");
  }

  const close = () => {
    setOpen(false);
    if (state === "done") {
      setReason("");
      setDetails("");
      setState("idle");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={linkClass}>
        <FlagIcon />
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prijava-naslov"
            onClick={(e) => e.stopPropagation()}
            className="relative mx-auto mt-[120px] w-[512px] bg-white px-[35px] pb-[30px] pt-[30px] text-black"
          >
            <h2 id="prijava-naslov" className="font-serif text-[22px] font-medium italic">
              {label}
            </h2>
            <button type="button" aria-label="Zatvori" onClick={close} className="absolute right-[35px] top-[30px] size-[17px]">
              <Image src="/icons/close.svg" alt="" width={17} height={17} />
            </button>

            {state === "done" ? (
              <>
                <p className="mt-[22px] text-[14px] leading-[1.5]">
                  Hvala, prijava je poslata. Tim Sajma će je pregledati i preduzeti mere ako je potrebno.
                </p>
                <button type="button" onClick={close} className="mt-[26px] h-[39px] w-full bg-black text-[13px] font-bold text-white hover:bg-[#232222]">
                  ZATVORI
                </button>
              </>
            ) : (
              <form onSubmit={submit}>
                <p className="mt-[14px] text-[13px] leading-[1.5] text-[#666]">
                  {kind === "oglas"
                    ? "Reci nam šta nije u redu sa ovim oglasom. Prodavac neće videti ko je poslao prijavu."
                    : "Reci nam šta se desilo. Korisnik neće videti ko je poslao prijavu."}
                </p>
                <fieldset className="mt-[20px]">
                  <legend className="text-[14px] font-semibold">Razlog</legend>
                  <div className="mt-[10px] flex flex-col gap-[10px]">
                    {REASONS[kind].map((r) => (
                      <label key={r} className="flex cursor-pointer items-center gap-[10px] text-[14px]">
                        <input
                          type="radio"
                          name="razlog"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="size-[16px] accent-black"
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-[20px] block text-[14px] font-semibold" htmlFor="prijava-detalji">
                  Detalji <span className="font-normal text-[#737373]">(nije obavezno)</span>
                </label>
                <textarea
                  id="prijava-detalji"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="mt-[8px] w-full resize-none border border-field px-[12px] py-[10px] text-[14px] outline-none focus:border-black"
                />
                {error && <p className="mt-[10px] text-[13px] text-[#b42318]">{error}</p>}
                <button
                  type="submit"
                  disabled={state === "saving"}
                  className="mt-[20px] h-[39px] w-full bg-black text-[13px] font-bold text-white hover:bg-[#232222] disabled:opacity-60"
                >
                  {state === "saving" ? "ŠALJE SE..." : "POŠALJI PRIJAVU"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FlagIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" aria-hidden="true">
      <path d="M1 11.5V1m0 0h7.5L7 3.75 8.5 6.5H1" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
