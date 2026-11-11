"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Brzi linkovi: naslovi odeljaka članka, aktivan je onaj koji se trenutno čita.
export function QuickLinks({ links }: { links: Array<{ id: string; label: string }> }) {
  const [active, setActive] = useState(links[0]?.id);

  useEffect(() => {
    const els = links.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [links]);

  return (
    <ul className="mt-[50px] flex flex-col gap-[20px] border-l border-[#e1e1e1] text-[14px] leading-[20px]">
      {links.map((l) => (
        <li key={l.id}>
          <a
            href={`#${l.id}`}
            onClick={() => setActive(l.id)}
            className={`-ml-px block border-l-2 pl-[15px] ${
              active === l.id ? "border-black font-medium text-black" : "border-transparent text-[#666] hover:text-black"
            }`}
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// „Da li ti je ovaj članak pomogao?“ Glas se čuva u bazi (može i bez naloga), jednom po članku na uređaju.
export function ArticleHelpful({ slug }: { slug: string }) {
  const key = `pomoc-glas-${slug}`;
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(key)) setVoted(true);
    } catch {}
  }, [key]);

  const vote = async (helpful: boolean) => {
    setVoted(true);
    try {
      localStorage.setItem(key, helpful ? "da" : "ne");
    } catch {}
    await createClient().from("help_feedback").insert({ article_slug: slug, helpful });
  };

  return (
    <div className="mt-[50px]">
      <p className="text-[16px] font-semibold">Da li ti je ovaj članak pomogao?</p>
      {voted ? (
        <p role="status" className="mt-[14px] text-[13px] text-[#666]">
          Hvala na odgovoru!
        </p>
      ) : (
        <div className="mt-[14px] flex">
          {[
            { label: "Da", value: true },
            { label: "Ne", value: false },
          ].map((b, i) => (
            <button
              key={b.label}
              type="button"
              onClick={() => vote(b.value)}
              className={`h-[35px] w-[64px] border border-[#666] text-[13px] hover:bg-black hover:text-white ${i ? "-ml-px" : ""}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
