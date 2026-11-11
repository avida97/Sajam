"use client";

import { useLayoutEffect, useRef, useState } from "react";

const LINES = 6;

// Opis oglasa: pasusi sa razmakom, prelomi redova kako ih je prodavac napisao.
// „Prikaži više“ se pojavljuje samo kad tekst ne staje u 6 redova (Figma 575:15685).
export function ReadMore({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      if (open) return;
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);

  if (!paragraphs.length) return null;

  return (
    <>
      <div
        ref={ref}
        className="flex flex-col gap-[10px] overflow-hidden text-[14px] leading-[1.6] text-[#333]"
        style={open ? undefined : { maxHeight: `${LINES * 1.6}em` }}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line break-words">
            {p}
          </p>
        ))}
      </div>
      {(overflows || open) && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mt-[14px] text-[12px] font-medium leading-[1.5] underline"
        >
          {open ? "Prikaži manje" : "Prikaži više"}
        </button>
      )}
    </>
  );
}
