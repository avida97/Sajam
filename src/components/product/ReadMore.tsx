"use client";

import { useState } from "react";

// „Read more“ ispod opisa (Figma 575:15685): skraćeni opis se klikom otvara ceo.
export function ReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 230;
  return (
    <>
      <p className={`text-[14px] leading-[1.5] whitespace-pre-line ${open || !long ? "" : "line-clamp-4"}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-[18px] text-[12px] font-medium leading-[1.5] underline">
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </>
  );
}
