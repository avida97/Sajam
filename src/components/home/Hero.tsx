"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// Hero početne strane: „Živi gradijent“ (odluka V 12. 11. 2026, predlog 4.1 sa dugmetom i
// linkom za prodaju). Isti gradijent i šum kao hero na stranama kategorija (Figma 500:7232),
// mrlje se polako pomeraju, 3D ikonice iz „Napravi mesta“ lebde, a pretraga sama kuca primere
// dok korisnik ne klikne u nju. Za Ankin pregled; Figma hero (412:14229) je prazan.

const GRADIENT =
  "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)";

const CATEGORIES = [
  { name: "Knjige", href: "/knjige" },
  { name: "Muzika", href: "/muzika" },
  { name: "Igre", href: "/igre" },
  { name: "Mange i stripovi", href: "/mange-i-stripovi" },
  { name: "Oprema", href: "/oprema" },
];

const EXAMPLES = ["Na Drini ćuprija", "Pink Floyd – The Wall", "Catan", "One Piece 1", "Gramofon"];

export function Hero() {
  return (
    <section className="mx-auto max-w-site px-[72px] pt-[20px]">
      <div
        className="relative flex h-[640px] flex-col items-center justify-center overflow-hidden rounded-[15px]"
        style={{ backgroundImage: GRADIENT }}
      >
        <div className="hero-blob absolute left-[8%] top-[10%] size-[380px] rounded-full bg-white/40 blur-[60px]" />
        <div
          className="hero-blob absolute right-[10%] top-[30%] size-[300px] rounded-full bg-[#88a6de]/70 blur-[50px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="hero-blob absolute bottom-[-10%] left-[40%] size-[420px] rounded-full bg-[#e9d7ff]/60 blur-[70px]"
          style={{ animationDelay: "-12s" }}
        />
        {/* Šum iz Figme (Noise, monotone, 15 %). */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-[0.15] mix-blend-multiply">
          <filter id="hero-sum">
            <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-sum)" />
        </svg>
        <Image src="/images/pocetna/oglas.png" alt="" width={209} height={209} priority className="hero-bob pointer-events-none absolute left-[110px] top-[80px]" style={{ width: 170, height: "auto" }} />
        <Image src="/images/pocetna/prodaj.png" alt="" width={228} height={245} className="hero-bob pointer-events-none absolute bottom-[60px] right-[120px]" style={{ width: 180, height: "auto", animationDelay: "-2s" }} />
        <Image src="/images/pocetna/profil.png" alt="" width={187} height={187} className="hero-bob pointer-events-none absolute bottom-[90px] left-[200px]" style={{ width: 110, height: "auto", animationDelay: "-3.5s" }} />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-center text-[69px] font-semibold leading-[0.95] tracking-[-3.45px] text-black">
            Napravi <span className="font-serif text-[79px] italic tracking-[-3.16px]">mesta</span>
            <br />
            za još knjiga
          </h1>
          <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-black/70">
            Poveži se s čitaocima i daj starim knjigama novi život.
          </p>
          <div className="mt-[30px]">
            <HeroSearch />
          </div>
          <div className="mt-[16px] flex gap-[8px]">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-full bg-white/60 px-[14px] py-[7px] text-[12px] font-medium text-black backdrop-blur transition-colors hover:bg-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-[30px] flex items-center gap-[16px]">
            <MainButton href="/knjige" size="md">
              Započni kupovinu
            </MainButton>
            <Link href="/prodaj" className="text-[13px] font-semibold text-black underline-offset-4 hover:underline">
              ili prodaj nešto svoje →
            </Link>
          </div>
        </div>
      </div>
      <style>{CSS}</style>
    </section>
  );
}

// Pretraga koja sama „kuca“ primere; čim korisnik klikne ili počne da piše, primer nestaje.
function HeroSearch() {
  const [typed, setTyped] = useState("");
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(EXAMPLES[0]);
      return;
    }
    let w = 0;
    let c = 0;
    let dir = 1;
    const t = setInterval(() => {
      const word = EXAMPLES[w];
      c += dir;
      if (c > word.length + 10) dir = -1;
      if (c <= 0 && dir === -1) {
        dir = 1;
        w = (w + 1) % EXAMPLES.length;
      }
      setTyped(word.slice(0, Math.max(0, Math.min(c, word.length))));
    }, 90);
    return () => clearInterval(t);
  }, []);

  return (
    <form
      action="/pretraga"
      role="search"
      className="flex h-[46px] w-[480px] items-center gap-[10px] rounded-full bg-white px-[8px] text-[14px] shadow-[0_10px_40px_rgba(60,60,140,0.18)]"
    >
      <button
        type="submit"
        aria-label="Pretraži"
        className="flex size-[32px] shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
      >
        <Image src="/icons/search.svg" alt="" width={18} height={17} />
      </button>
      <div className="relative h-full flex-1">
        <input
          name="q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-label="Pretraži knjigu, ploču, igru ili autora"
          className="size-full bg-transparent text-black outline-none"
        />
        {!focus && !value && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-black/60">
            Traži: <span className="ml-[4px] text-black">{typed}</span>
            <span className="hero-caret ml-px h-[18px] w-px bg-black" />
          </span>
        )}
      </div>
    </form>
  );
}

const CSS = `
@keyframes hero-bob { 0%,100% { translate: 0 0 } 50% { translate: 0 -14px } }
.hero-bob { animation: hero-bob 5s ease-in-out infinite; }
@keyframes hero-blob { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(60px,-40px) scale(1.1) } 66% { transform: translate(-50px,30px) scale(.95) } }
.hero-blob { animation: hero-blob 18s ease-in-out infinite; }
@keyframes hero-caret { 50% { opacity: 0 } }
.hero-caret { animation: hero-caret 1s step-end infinite; }
@media (prefers-reduced-motion: reduce) { .hero-bob, .hero-blob, .hero-caret { animation: none !important } }
`;
