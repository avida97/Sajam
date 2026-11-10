"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { BookSuggest } from "@/components/sell/BookSuggest";
import { IsbnScanner } from "@/components/sell/IsbnScanner";
import type { BookHit } from "@/lib/isbn";

// Polje ISBN: upisan ili skeniran broj otvara listu knjiga sa tim brojem. Na telefonu je
// tu dugme „Skeniraj“, a na računaru „Telefonom“ sa QR kodom koji otvara istu formu na
// telefonu, sa kamerom spremnom za skeniranje.
export function IsbnField({ className, onPick }: { className: string; onPick: (hit: BookHit) => void }) {
  const [touch, setTouch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [trigger, setTrigger] = useState<{ value: string; n: number } | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDetected = useCallback((isbn: string) => {
    setScanning(false);
    setTrigger((t) => ({ value: isbn, n: (t?.n ?? 0) + 1 }));
  }, []);
  const closeScanner = useCallback(() => setScanning(false), []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setTouch(coarse);
    // Telefon je otvorio formu preko QR koda sa računara: odmah pali kameru.
    const params = new URLSearchParams(window.location.search);
    if (coarse && params.get("skeniraj") === "1") {
      setScanning(true);
      params.delete("skeniraj");
      const q = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
    }
  }, []);

  const openQr = async () => {
    setShowQr((s) => !s);
    if (!qr) {
      setQr(
        await QRCode.toDataURL(`${window.location.origin}/prodaj?skeniraj=1`, {
          width: 320,
          margin: 1,
          color: { dark: "#09090b", light: "#ffffff" },
        }),
      );
    }
  };

  return (
    <div className="relative">
      <BookSuggest
        by="isbn"
        name="isbn"
        placeholder="npr. 978-86-10-02436-4"
        className={className}
        padRight={96}
        enabled
        inputRef={inputRef}
        trigger={trigger}
        onPick={onPick}
      >
        {touch ? (
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="absolute right-[4px] top-[4px] flex h-[28px] items-center gap-[6px] bg-[#09090b] px-[10px] text-[11px] font-bold uppercase text-white"
          >
            <Image src="/icons/camera.svg" alt="" width={14} height={13} className="invert" />
            Skeniraj
          </button>
        ) : (
          <button
            type="button"
            onClick={openQr}
            aria-expanded={showQr}
            className="absolute right-[4px] top-[4px] flex h-[28px] items-center gap-[6px] border border-[#dfdfdf] bg-white px-[8px] text-[11px] font-semibold text-black hover:border-black"
          >
            <Image src="/icons/camera.svg" alt="" width={14} height={13} />
            Telefonom
          </button>
        )}
      </BookSuggest>

      {showQr && (
        <div className="absolute left-0 top-[44px] z-30 w-[306px] border border-[#dfdfdf] bg-white p-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <p className="text-[14px] font-semibold leading-[1.3] text-black">Skeniraj bar-kod telefonom</p>
          <p className="mt-[6px] text-[12px] leading-[1.4] text-[#7c7c7c]">
            Skeniraj ovaj QR kod kamerom telefona. Otvoriće se ista forma, sa kamerom spremnom da pročita bar-kod
            sa knjige, pa oglas možeš da završiš na telefonu.
          </p>
          <div className="mt-[12px] flex justify-center">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR kod za nastavak na telefonu" width={180} height={180} />
            ) : (
              <div className="size-[180px] bg-field" />
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowQr(false)}
            className="mt-[12px] w-full text-center text-[12px] font-medium text-black underline"
          >
            Zatvori
          </button>
        </div>
      )}

      {scanning && <IsbnScanner onDetected={onDetected} onClose={closeScanner} />}
    </div>
  );
}
