"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { IsbnScanner } from "@/components/sell/IsbnScanner";
import { cleanIsbn, isValidIsbn, type BookInfo } from "@/lib/isbn";

type Status = { tone: "info" | "ok" | "warn"; text: string } | null;

// Polje ISBN: kad se upiše ili skenira ispravan broj, podaci o knjizi se traže u javnim
// bazama i popunjavaju formu. Na telefonu je tu dugme „Skeniraj“, a na računaru QR kod
// koji otvara istu formu na telefonu, sa kamerom spremnom za skeniranje.
export function IsbnField({ className, onFound }: { className: string; onFound: (info: BookInfo) => void }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [touch, setTouch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastRef = useRef<string | null>(null);

  const search = useCallback(
    async (isbn: string) => {
      if (lastRef.current === isbn) return;
      lastRef.current = isbn;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setStatus({ tone: "info", text: "Tražim knjigu po ISBN-u..." });
      // 404 = knjige nema u bazama; sve drugo (server ili mreža ne rade) = „error“.
      const info: BookInfo | null | "error" = await fetch(`/api/isbn/${isbn}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : r.status === 404 ? null : "error"))
        .catch(() => "error");
      if (ctrl.signal.aborted) return;
      if (info === "error") {
        lastRef.current = null;
        setStatus({ tone: "warn", text: "Pretraga po ISBN-u trenutno ne radi. Popuni podatke ručno." });
      } else if (info?.title) {
        onFound(info);
        setStatus({ tone: "ok", text: "Podaci o knjizi su popunjeni. Proveri ih pre objave." });
      } else {
        setStatus({ tone: "warn", text: "Knjiga nije pronađena. Popuni podatke ručno." });
      }
    },
    [onFound],
  );

  const onChange = (raw: string) => {
    setValue(raw);
    const isbn = cleanIsbn(raw);
    if (isValidIsbn(isbn)) search(isbn);
    else {
      lastRef.current = null;
      abortRef.current?.abort();
      const looksDone = isbn.length === 13 || (isbn.length === 10 && !isbn.startsWith("97"));
      setStatus(looksDone ? { tone: "warn", text: "Proveri broj, ovaj ISBN nije ispravan." } : null);
    }
  };

  const onDetected = useCallback(
    (isbn: string) => {
      setScanning(false);
      setValue(isbn);
      search(isbn);
    },
    [search],
  );
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
    return () => abortRef.current?.abort();
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
      <div className="relative">
        <input
          name="isbn"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="npr. 978-86-10-02436-4"
          className={`${className} pr-[96px]`}
        />
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
      </div>

      {status && (
        <p
          role="status"
          className={`mt-[8px] text-[12px] leading-[1.4] ${
            status.tone === "ok" ? "text-[#15803d]" : status.tone === "warn" ? "text-[#b45309]" : "text-[#7c7c7c]"
          }`}
        >
          {status.text}
        </p>
      )}

      {showQr && (
        <div className="absolute left-0 top-[44px] z-30 w-[306px] border border-[#dfdfdf] bg-white p-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <p className="text-[14px] font-semibold leading-[1.3] text-black">Skeniraj bar-kod telefonom</p>
          <p className="mt-[6px] text-[12px] leading-[1.4] text-[#7c7c7c]">
            Skeniraj ovaj QR kod kamerom telefona. Otvoriće se ista forma, sa kamerom spremnom da pročita bar-kod
            sa knjige, pa oglas možeš da završiš na telefonu.
          </p>
          <div className="mt-[12px] flex justify-center">
            {qr ? (
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
