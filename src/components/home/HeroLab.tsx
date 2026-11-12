"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// Varijante heroa „Živi gradijent“ (odluka V 12. 11. 2026: ide predlog 4). Stranica
// /predlozi/hero nije u meniju; kad Anka izabere varijantu, ona prelazi u Hero.tsx, a ova
// stranica se briše.

const ICONS = {
  oglas: { src: "/images/pocetna/oglas.png", w: 209, h: 209 },
  prodaj: { src: "/images/pocetna/prodaj.png", w: 228, h: 245 },
  profil: { src: "/images/pocetna/profil.png", w: 187, h: 187 },
};
const CATS = [
  { name: "Knjige", href: "/knjige", tile: "/images/kategorije/knjige.png", photo: "/images/nav/knjige.jpg", ex: "Na Drini ćuprija", tint: ["#88a6de", "#cdbcec"] },
  { name: "Muzika", href: "/muzika", tile: "/images/kategorije/muzika.png", photo: "/images/nav/muzika.jpg", ex: "Pink Floyd – The Wall", tint: ["#a99be6", "#e6c6ef"] },
  { name: "Igre", href: "/igre", tile: "/images/kategorije/igre.png", photo: "/images/nav/igre.jpg", ex: "Catan", tint: ["#8fb8e8", "#c9d8f5"] },
  { name: "Mange i stripovi", href: "/mange-i-stripovi", tile: "/images/kategorije/mange-i-stripovi.png", photo: "/images/nav/mange-i-stripovi.jpg", ex: "One Piece 1", tint: ["#b4a3e6", "#f0c9e0"] },
  { name: "Oprema", href: "/oprema", tile: "/images/kategorije/oprema.png", photo: "/images/nav/oprema.jpg", ex: "Gramofon", tint: ["#93aee0", "#d3c7f0"] },
];
const EXAMPLES = CATS.map((c) => c.ex);
const GRADIENT =
  "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)";
const SUB = "Poveži se s čitaocima i daj starim knjigama novi život.";

function Title({ size = 69, className = "", align = "center" }: { size?: number; className?: string; align?: "center" | "left" }) {
  return (
    <h1
      className={`font-semibold leading-[0.95] text-black ${align === "center" ? "text-center" : "text-left"} ${className}`}
      style={{ fontSize: size, letterSpacing: -size * 0.05 }}
    >
      Napravi{" "}
      <span className="font-serif italic" style={{ fontSize: size * 1.145, letterSpacing: -size * 0.046 }}>
        mesta
      </span>
      <br />
      za još knjiga
    </h1>
  );
}

// Pretraga koja sama „kuca“ primere dok korisnik ne klikne u nju.
function useTyping(words: string[], speed = 90) {
  const [text, setText] = useState("");
  useEffect(() => {
    let w = 0, c = 0, dir = 1;
    const t = setInterval(() => {
      const word = words[w];
      c += dir;
      if (c > word.length + 10) dir = -1;
      if (c <= 0 && dir === -1) { dir = 1; w = (w + 1) % words.length; }
      setText(word.slice(0, Math.max(0, Math.min(c, word.length))));
    }, speed);
    return () => clearInterval(t);
  }, [words, speed]);
  return text;
}

function Search({ width = 480, height = 46, words = EXAMPLES, shadow = true }: { width?: number; height?: number; words?: string[]; shadow?: boolean }) {
  const typed = useTyping(words);
  const [focus, setFocus] = useState(false);
  const [val, setVal] = useState("");
  return (
    <form
      action="/pretraga"
      role="search"
      className={`flex items-center gap-[10px] rounded-full bg-white px-[8px] text-[14px] ${shadow ? "shadow-[0_10px_40px_rgba(60,60,140,0.18)]" : ""}`}
      style={{ width, height }}
    >
      <button type="submit" aria-label="Pretraži" className="flex size-[32px] shrink-0 items-center justify-center rounded-full hover:bg-black/5">
        <Image src="/icons/search.svg" alt="" width={18} height={17} />
      </button>
      <div className="relative h-full flex-1">
        <input
          name="q"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-label="Pretraga"
          className="size-full bg-transparent text-black outline-none"
        />
        {!focus && !val && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-black/60">
            Traži: <span className="ml-[4px] text-black">{typed}</span>
            <span className="hl-caret ml-px h-[18px] w-px bg-black" />
          </span>
        )}
      </div>
    </form>
  );
}

function Chips({ onHover, active, light = true }: { onHover?: (i: number) => void; active?: number; light?: boolean }) {
  return (
    <div className="flex gap-[8px]">
      {CATS.map((c, i) => (
        <Link
          key={c.name}
          href={c.href}
          onMouseEnter={() => onHover?.(i)}
          className={`rounded-full px-[14px] py-[7px] text-[12px] font-medium backdrop-blur transition-colors ${
            active === i ? "bg-black text-white" : light ? "bg-white/60 text-black hover:bg-white" : "bg-[#f5f6f8] hover:bg-[#e8e9ec]"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}

function Grain() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-[0.15] mix-blend-multiply">
      <filter id="hl-sum">
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#hl-sum)" />
    </svg>
  );
}

function Blobs() {
  return (
    <>
      <div className="hl-blob absolute left-[8%] top-[10%] size-[380px] rounded-full bg-white/40 blur-[60px]" />
      <div className="hl-blob absolute right-[10%] top-[30%] size-[300px] rounded-full bg-[#88a6de]/70 blur-[50px]" style={{ animationDelay: "-6s" }} />
      <div className="hl-blob absolute bottom-[-10%] left-[40%] size-[420px] rounded-full bg-[#e9d7ff]/60 blur-[70px]" style={{ animationDelay: "-12s" }} />
    </>
  );
}

// 4.1 — osnovni: zaobljen okvir kao na stranama kategorija, mrlje se pomeraju, 3D ikonice lebde.
function Base() {
  return (
    <div className="px-[72px] pt-[20px]">
      <div className="relative flex h-[640px] flex-col items-center justify-center overflow-hidden rounded-[15px]" style={{ backgroundImage: GRADIENT }}>
        <Blobs />
        <Grain />
        <Image src={ICONS.oglas.src} alt="" width={209} height={209} className="hl-bob absolute left-[110px] top-[80px]" style={{ width: 170, height: "auto" }} />
        <Image src={ICONS.prodaj.src} alt="" width={228} height={245} className="hl-bob absolute bottom-[60px] right-[120px]" style={{ width: 180, height: "auto", animationDelay: "-2s" }} />
        <Image src={ICONS.profil.src} alt="" width={187} height={187} className="hl-bob absolute bottom-[90px] left-[200px]" style={{ width: 110, height: "auto", animationDelay: "-3.5s" }} />
        <div className="relative z-10 flex flex-col items-center">
          <Title />
          <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-black/70">{SUB}</p>
          <div className="mt-[30px]">
            <Search />
          </div>
          <div className="mt-[16px]">
            <Chips />
          </div>
          {/* V 12. 11. 2026: dugme za kupovinu i link za prodaju kao u 4.3. */}
          <div className="mt-[30px] flex items-center gap-[16px]">
            <MainButton href="/knjige" size="md">
              Započni kupovinu
            </MainButton>
            <Link href="/prodaj" className="text-[13px] font-semibold underline-offset-4 hover:underline">
              ili prodaj nešto svoje →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4.2 — cela širina, a jedna mrlja prati miša (kao svetlo ispod kursora).
function FullBleed() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 720, y: 330 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setP({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      className="relative flex h-[694px] flex-col items-center justify-center overflow-hidden"
      style={{ backgroundImage: GRADIENT }}
    >
      <Blobs />
      <div
        className="pointer-events-none absolute size-[520px] rounded-full bg-white/45 blur-[80px]"
        style={{ left: p.x - 260, top: p.y - 260, transition: "left 900ms cubic-bezier(.2,.7,.2,1), top 900ms cubic-bezier(.2,.7,.2,1)" }}
      />
      <Grain />
      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-[26px] rounded-full bg-white/50 px-[14px] py-[6px] text-[12px] font-medium backdrop-blur">
          Polovne knjige, ploče, igre, stripovi i oprema
        </p>
        <Title size={84} />
        <p className="mt-[30px] text-[18px] font-medium tracking-[-0.7px] text-black/70">{SUB}</p>
        <div className="mt-[34px]">
          <Search width={560} height={54} />
        </div>
        <div className="mt-[18px]">
          <Chips />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}

// 4.3 — podeljen: levo naslov i pretraga, desno špil kartica oglasa koji se sam meša.
function Split() {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTop((x) => (x + 1) % CATS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="px-[72px] pt-[20px]">
      <div className="relative flex h-[640px] items-center overflow-hidden rounded-[15px] pl-[110px]" style={{ backgroundImage: GRADIENT }}>
        <Blobs />
        <Grain />
        <div className="relative z-10 w-[560px]">
          <Title size={72} align="left" />
          <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-black/70">{SUB}</p>
          <div className="mt-[30px]">
            <Search width={470} />
          </div>
          <div className="mt-[16px] flex items-center gap-[16px]">
            <MainButton href="/knjige" size="md">
              Započni kupovinu
            </MainButton>
            <Link href="/prodaj" className="text-[13px] font-semibold underline-offset-4 hover:underline">
              ili prodaj nešto svoje →
            </Link>
          </div>
        </div>
        <div className="absolute right-[150px] top-1/2 h-[380px] w-[300px] -translate-y-1/2">
          {CATS.map((c, i) => {
            const d = (i - top + CATS.length) % CATS.length; // 0 = gore
            return (
              <div
                key={c.name}
                className="absolute inset-0 overflow-hidden rounded-[18px] bg-white shadow-[0_20px_50px_rgba(50,50,120,0.18)]"
                style={{
                  transform: `translate(${d * 22}px, ${d * -14}px) rotate(${d * 4 - 4}deg) scale(${1 - d * 0.04})`,
                  zIndex: CATS.length - d,
                  opacity: d > 3 ? 0 : 1,
                  transition: "transform 700ms cubic-bezier(.2,.8,.2,1), opacity 500ms",
                }}
              >
                <div className="relative h-[250px] bg-[#f5f6f8]">
                  <Image src={c.photo} alt="" fill sizes="300px" className="object-cover" />
                </div>
                <div className="p-[16px]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#737373]">{c.name}</p>
                  <p className="mt-[6px] text-[16px] font-semibold">{c.ex}</p>
                  <p className="mt-[8px] text-[14px]">od 800 RSD</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 4.4 — aurora: boje se polako prelivaju u krug, a ikonice kategorija kruže oko naslova.
function Aurora() {
  return (
    <div className="px-[72px] pt-[20px]">
      <div className="relative flex h-[640px] items-center justify-center overflow-hidden rounded-[15px] bg-[#a4afd8]">
        <div
          className="hl-spin absolute left-1/2 top-1/2 size-[1600px] -translate-x-1/2 -translate-y-1/2 opacity-90 blur-[80px]"
          style={{ backgroundImage: "conic-gradient(from 0deg, #88a6de, #cdbcec, #a3b4dc, #e6d2f5, #90a5d5, #c5c0e7, #88a6de)" }}
        />
        <Grain />
        <div className="hl-orbit pointer-events-none absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2">
          {CATS.map((c, i) => {
            const a = (i / CATS.length) * Math.PI * 2;
            return (
              <div key={c.name} className="absolute left-1/2 top-1/2" style={{ transform: `translate(${Math.cos(a) * 430 - 55}px, ${Math.sin(a) * 250 - 55}px)` }}>
                <div className="hl-counter flex size-[110px] items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/30 backdrop-blur-md">
                  <Image src={c.tile} alt="" width={196} height={196} className="size-[110px] mix-blend-multiply" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative z-10 flex flex-col items-center rounded-[24px] bg-white/35 px-[56px] py-[44px] backdrop-blur-md">
          <Title />
          <p className="mt-[26px] text-[17px] font-medium tracking-[-0.68px] text-black/70">{SUB}</p>
          <div className="mt-[28px]">
            <Search width={460} shadow={false} />
          </div>
          <p className="mt-[16px] text-[12px] text-black/70">
            Najtraženije danas:{" "}
            {["Andrić", "vinil", "Catan", "One Piece"].map((w, i) => (
              <Link key={w} href={`/pretraga?q=${encodeURIComponent(w)}`} className="font-semibold text-black underline-offset-2 hover:underline">
                {i > 0 ? ", " : ""}
                {w}
              </Link>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

// 4.5 — boja po kategoriji: gradijent i ikonica se menjaju sa kategorijom (sami ili na hover čipa).
function PerCategory() {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold) return;
    const t = setInterval(() => setI((x) => (x + 1) % CATS.length), 3000);
    return () => clearInterval(t);
  }, [hold]);
  const c = CATS[i];
  return (
    <div className="px-[72px] pt-[20px]">
      <div className="relative flex h-[640px] items-center justify-center overflow-hidden rounded-[15px]">
        {CATS.map((x, k) => (
          <div
            key={x.name}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: k === i ? 1 : 0, backgroundImage: `linear-gradient(110deg, ${x.tint[0]} 0%, ${x.tint[1]} 100%)` }}
          />
        ))}
        <Blobs />
        <Grain />
        <div className="absolute left-[90px] top-1/2 -translate-y-1/2">
          <Image key={c.tile} src={c.tile} alt="" width={196} height={196} className="hl-pop rounded-[24px] mix-blend-multiply" style={{ width: 250, height: "auto" }} />
        </div>
        <div className="absolute right-[90px] top-1/2 -translate-y-1/2">
          <div key={c.photo} className="hl-pop relative h-[300px] w-[230px] overflow-hidden rounded-[18px] shadow-[0_20px_50px_rgba(50,50,120,0.2)]" style={{ animationDelay: "120ms" }}>
            <Image src={c.photo} alt="" fill sizes="230px" className="object-cover" />
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Title />
          <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-black/70">{SUB}</p>
          <div className="mt-[30px]">
            <Search key={c.name} words={[c.ex]} />
          </div>
          <div className="mt-[16px]" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
            <Chips active={i} onHover={setI} />
          </div>
        </div>
      </div>
    </div>
  );
}

const OPTIONS = [
  { n: 1, name: "Osnovni", note: "Zaobljen okvir kao na stranama kategorija; mrlje se polako pomeraju, ikonice lebde, pretraga sama kuca primere.", C: Base },
  { n: 2, name: "Cela širina", note: "Gradijent preko cele širine, veći naslov, a svetla mrlja prati miša. Dole se pretapa u belo.", C: FullBleed },
  { n: 3, name: "Podeljen", note: "Levo naslov i pretraga, desno špil kartica oglasa koji se sam meša.", C: Split },
  { n: 4, name: "Aurora", note: "Boje se polako okreću u krug, ikonice kategorija kruže oko naslova, „Najtraženije danas“ ispod pretrage.", C: Aurora },
  { n: 5, name: "Boja po kategoriji", note: "Gradijent, ikonica i fotografija se menjaju po kategoriji; pređi mišem preko čipova.", C: PerCategory },
];

export function HeroLab({ initial }: { initial: number }) {
  const [v, setV] = useState(initial);
  const [k, setK] = useState(0);
  const cur = OPTIONS.find((o) => o.n === v) ?? OPTIONS[0];
  const C = cur.C;
  return (
    <>
      <style>{CSS}</style>
      <div className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-site items-center gap-[8px] px-[72px] py-[12px] text-[13px]">
          <span className="mr-[8px] font-semibold">Živi gradijent:</span>
          {OPTIONS.map((o) => (
            <Link
              key={o.n}
              href={`/predlozi/hero?v=${o.n}`}
              scroll={false}
              onClick={() => setV(o.n)}
              className={`rounded-full px-[12px] py-[6px] ${o.n === v ? "bg-black text-white" : "bg-[#f5f6f8] hover:bg-[#e8e9ec]"}`}
            >
              4.{o.n} {o.name}
            </Link>
          ))}
          <button type="button" onClick={() => setK((x) => x + 1)} className="ml-auto text-[#737373] underline-offset-2 hover:text-black hover:underline">
            Pusti ponovo
          </button>
        </div>
        <p className="mx-auto max-w-site px-[72px] pb-[10px] text-[12px] text-[#737373]">{cur.note}</p>
      </div>
      <section className="mx-auto max-w-site">
        <C key={`${v}-${k}`} />
      </section>
    </>
  );
}

const CSS = `
@keyframes hl-bob { 0%,100% { translate: 0 0 } 50% { translate: 0 -14px } }
.hl-bob { animation: hl-bob 5s ease-in-out infinite; }
@keyframes hl-pop { from { transform: scale(.7) rotate(-10deg); opacity: 0 } to { transform: scale(1) rotate(0); opacity: 1 } }
.hl-pop { animation: hl-pop 650ms cubic-bezier(.2,.8,.2,1.15) both; }
@keyframes hl-blob { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(60px,-40px) scale(1.1) } 66% { transform: translate(-50px,30px) scale(.95) } }
.hl-blob { animation: hl-blob 18s ease-in-out infinite; }
@keyframes hl-caret { 50% { opacity: 0 } }
.hl-caret { animation: hl-caret 1s step-end infinite; }
@keyframes hl-spin { to { rotate: 360deg } }
.hl-spin { animation: hl-spin 30s linear infinite; }
.hl-orbit { animation: hl-spin 60s linear infinite; }
.hl-counter { animation: hl-spin 60s linear infinite reverse; }
@media (prefers-reduced-motion: reduce) { .hl-bob,.hl-pop,.hl-blob,.hl-spin,.hl-orbit,.hl-counter { animation: none !important } }
`;
