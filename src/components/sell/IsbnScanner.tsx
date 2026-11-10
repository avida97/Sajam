"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cleanIsbn, isValidIsbn } from "@/lib/isbn";

type Detector = { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
declare global {
  interface Window {
    BarcodeDetector?: new (opts: { formats: string[] }) => Detector;
  }
}

// Prozor sa kamerom koji čita bar-kod sa zadnje strane knjige (EAN-13 = ISBN-13).
// Koristi ugrađeni BarcodeDetector gde postoji (Android Chrome), a inače biblioteku ZXing (iPhone).
export function IsbnScanner({ onDetected, onClose }: { onDetected: (isbn: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    const video = videoRef.current!;

    const found = (raw: string) => {
      const isbn = cleanIsbn(raw);
      if (doneRef.current || !isValidIsbn(isbn)) return;
      doneRef.current = true;
      navigator.vibrate?.(80);
      onDetected(isbn);
    };

    (async () => {
      try {
        if (window.BarcodeDetector) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          if (cancelled) return stream.getTracks().forEach((t) => t.stop());
          video.srcObject = stream;
          await video.play();
          const detector = new window.BarcodeDetector({ formats: ["ean_13", "isbn_13", "isbn_10"] });
          let timer = 0;
          const tick = async () => {
            if (cancelled || doneRef.current) return;
            try {
              const codes = await detector.detect(video);
              codes.forEach((c) => found(c.rawValue));
            } catch {}
            timer = window.setTimeout(tick, 200);
          };
          tick();
          stop = () => {
            clearTimeout(timer);
            stream.getTracks().forEach((t) => t.stop());
          };
        } else {
          const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
            import("@zxing/browser"),
            import("@zxing/library"),
          ]);
          const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]]]);
          const reader = new BrowserMultiFormatReader(hints);
          const controls = await reader.decodeFromConstraints(
            { video: { facingMode: "environment" }, audio: false },
            video,
            (result) => result && found(result.getText()),
          );
          if (cancelled) return controls.stop();
          stop = () => controls.stop();
        }
      } catch (e) {
        const name = (e as Error)?.name;
        setError(
          name === "NotAllowedError"
            ? "Pristup kameri nije dozvoljen. Dozvoli kameru u podešavanjima pregledača pa pokušaj ponovo."
            : "Kamera nije dostupna na ovom uređaju. Upiši ISBN ručno.",
        );
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" role="dialog" aria-label="Skeniranje ISBN-a">
      <div className="relative w-[min(92vw,420px)] overflow-hidden rounded-[10px] bg-black">
        <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover" />
        {/* Okvir u koji se namešta bar-kod */}
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-[38%] h-[24%] rounded-[6px] border-2 border-white/90" />
        <p className="absolute inset-x-0 bottom-0 bg-black/60 px-[16px] py-[12px] text-center text-[13px] leading-[1.4] text-white">
          {error ?? "Usmeri kameru na bar-kod sa zadnje strane knjige."}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zatvori"
          className="absolute right-[12px] top-[12px] flex size-[32px] items-center justify-center rounded-full bg-white"
        >
          <Image src="/icons/modal-close.svg" alt="" width={12} height={12} />
        </button>
      </div>
    </div>
  );
}
