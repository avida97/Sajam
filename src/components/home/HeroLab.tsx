"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// Predlozi za hero početne strane (za Ankin izbor, 12. 11. 2026). Stranica /predlozi/hero
// nije u meniju; kad se izabere jedan predlog, on prelazi u Hero.tsx, a ova stranica se briše.

const ICONS = {
  knjige: "/images/kategorije/knjige.png",
  muzika: "/images/kategorije/muzika.png",
  igre: "/images/kategorije/igre.png",
  mange: "/images/kategorije/mange-i-stripovi.png",
  oprema: "/images/kategorije/oprema.png",
  profil: "/images/pocetna/profil.png",
  oglas: "/images/pocetna/oglas.png",
  prodaj: "/images/pocetna/prodaj.png",
};
const PHOTOS = ["knjige", "muzika", "igre", "mange-i-stripovi", "oprema"].map((n) => `/images/nav/${n}.jpg`);
const BLOG = ["/images/blog/vinil-boja.png"];

const SUB = "Poveži se s čitaocima i daj starim knjigama novi život.";

function Title({ word = "knjiga", size = 69 }: { word?: React.ReactNode; size?: number }) {
  return (
    <h1
      className="text-center font-semibold leading-[0.95] text-black"
      style={{ fontSize: size, letterSpacing: -size * 0.05 }}
    >
      Napravi{" "}
      <span className="font-serif italic" style={{ fontSize: size * 1.145, letterSpacing: -size * 0.046 }}>
        mesta
      </span>
      <br />
      za još {word}
    </h1>
  );
}

function Copy({ word, cta = true }: { word?: React.ReactNode; cta?: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center">
      <Title word={word} />
      <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-[#7c7c7c]">{SUB}</p>
      {cta && (
        <MainButton href="/knjige" size="md" className="mt-[30px]">
          Započni kupovinu
        </MainButton>
      )}
    </div>
  );
}

// 1 — Kolaž koji lebdi: ikonice izlete iz sredine, pa lagano lebde i prate miša.
function Floating() {
  const ref = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ x: 0, y: 0 });
  const items = [
    { src: ICONS.knjige, x: -470, y: -150, s: 230, r: -8, d: 1 },
    { src: ICONS.mange, x: -400, y: 130, s: 170, r: 10, d: 2 },
    { src: ICONS.profil, x: -250, y: -210, s: 110, r: 0, d: 3 },
    { src: ICONS.igre, x: 380, y: -190, s: 150, r: -6, d: 1.5 },
    { src: ICONS.muzika, x: 330, y: 110, s: 210, r: 8, d: 2.5 },
    { src: ICONS.oprema, x: 520, y: 40, s: 140, r: -12, d: 0.5 },
    { src: ICONS.oglas, x: 170, y: 230, s: 110, r: 14, d: 3.5 },
    { src: ICONS.prodaj, x: -170, y: 240, s: 100, r: -10, d: 4 },
  ];
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setM({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      onMouseLeave={() => setM({ x: 0, y: 0 })}
      className="relative flex h-[694px] items-center justify-center overflow-hidden"
    >
      {items.map((it, i) => (
        <div
          key={i}
          className="hl-fly absolute left-1/2 top-1/2"
          style={{ ["--x" as string]: `${it.x}px`, ["--y" as string]: `${it.y}px`, animationDelay: `${i * 70}ms` }}
        >
          <div
            style={{
              transform: `translate(${m.x * (it.s / 6)}px, ${m.y * (it.s / 6)}px)`,
              transition: "transform 600ms cubic-bezier(.2,.7,.2,1)",
            }}
          >
            <div className="hl-bob" style={{ animationDelay: `${-it.d}s` }}>
              <Image
                src={it.src}
                alt=""
                width={196}
                height={196}
                className="rounded-[15px]"
                style={{ width: it.s, height: "auto", maxWidth: "none", transform: `translate(-50%,-50%) rotate(${it.r}deg)` }}
              />
            </div>
          </div>
        </div>
      ))}
      <Copy />
    </div>
  );
}

// 2 — Reč koja se menja: „za još knjiga / ploča / igara / stripova / opreme“, sa ikonicom.
const WORDS = [
  { w: "knjiga", icon: ICONS.knjige, href: "/knjige" },
  { w: "ploča", icon: ICONS.muzika, href: "/muzika" },
  { w: "igara", icon: ICONS.igre, href: "/igre" },
  { w: "stripova", icon: ICONS.mange, href: "/mange-i-stripovi" },
  { w: "opreme", icon: ICONS.oprema, href: "/oprema" },
];
function Rotating() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  const cur = WORDS[i];
  return (
    <div className="relative flex h-[694px] items-center justify-center overflow-hidden">
      <div className="absolute left-[150px] top-1/2 -translate-y-1/2">
        <Image key={`l${i}`} src={cur.icon} alt="" width={196} height={196} className="hl-pop rounded-[20px]" style={{ width: 260, height: "auto" }} />
      </div>
      <div className="absolute right-[150px] top-1/2 -translate-y-1/2">
        <Image
          key={`r${i}`}
          src={WORDS[(i + 2) % WORDS.length].icon}
          alt=""
          width={196}
          height={196}
          className="hl-pop rounded-[20px]"
          style={{ width: 200, height: "auto", animationDelay: "120ms" }}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <Title
          word={
            <span className="inline-flex h-[1.1em] min-w-[330px] overflow-hidden align-top leading-[1.1]">
              <span key={cur.w} className="hl-word block">
                {cur.w}
              </span>
            </span>
          }
        />
        <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-[#7c7c7c]">
          Poveži se s ljudima koji vole iste stvari i daj im novi život.
        </p>
        <MainButton href={cur.href} size="md" className="mt-[30px]">
          Započni kupovinu
        </MainButton>
      </div>
    </div>
  );
}

// 3 — Polica: knjige uskoče na policu, a u sredini je prazno mesto. Na hover dugmeta
// („Započni prodaju“) knjiga sklizne u prazno mesto.
const SPINES = [
  ["#88a6de", 210, "Prokleta avlija"], ["#09090b", 240, "Na Drini ćuprija"], ["#cdbcec", 190, "Seobe"],
  ["#f5f6f8", 230, "Derviš i smrt"], ["#a4afd8", 260, "Hazarski rečnik"], ["#c5c0e7", 200, "Kad su cvetale tikve"],
  ["#232222", 220, "Tvrđava"], ["#90a5d5", 180, "Rani jadi"], ["#e1e1e1", 250, "Gospođica"],
  ["#b9bce2", 215, "Prozračni"], ["#7c7c7c", 235, "Beograd"], ["#a3b4dc", 195, "Sobe"],
] as const;
function Shelf() {
  const [fill, setFill] = useState(false);
  const gap = 6;
  return (
    <div className="relative flex h-[694px] flex-col items-center overflow-hidden pt-[90px]">
      <Copy cta={false} />
      <div className="mt-[30px] flex gap-[12px]" onMouseEnter={() => setFill(true)} onMouseLeave={() => setFill(false)}>
        <MainButton href="/knjige" size="md">
          Započni kupovinu
        </MainButton>
        <MainButton href="/prodaj" size="md" variant="light">
          Napravi mesta
        </MainButton>
      </div>
      <div className="absolute bottom-[70px] left-1/2 flex -translate-x-1/2 items-end gap-[4px]">
        {SPINES.map(([c, h, t], i) => (
          <div key={t} className="contents">
            {i === gap && (
              <div className="relative h-[230px] w-[46px] rounded-[3px] border border-dashed border-[#bbb]">
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-[3px] bg-black text-white transition-all duration-500"
                  style={{ transform: fill ? "translateY(0)" : "translateY(-140%)", opacity: fill ? 1 : 0 }}
                >
                  <span className="rotate-180 text-[11px] font-semibold [writing-mode:vertical-rl]">Tvoja knjiga</span>
                </div>
              </div>
            )}
            <div
              className="hl-drop group flex w-[46px] cursor-pointer items-center justify-center rounded-[3px] transition-transform duration-300 hover:-translate-y-[22px]"
              style={{ height: h, background: c, animationDelay: `${i * 60}ms` }}
            >
              <span
                className="rotate-180 font-serif text-[13px] italic [writing-mode:vertical-rl]"
                style={{ color: ["#09090b", "#232222", "#7c7c7c"].includes(c) ? "#fff" : "#000" }}
              >
                {t}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[58px] left-1/2 h-[12px] w-[760px] -translate-x-1/2 rounded-[2px] bg-[#e7e3dc]" />
    </div>
  );
}

// 4 — Živi gradijent: mrlje se polako pomeraju, pretraga sama „kuca“ primere.
const EXAMPLES = ["Na Drini ćuprija", "Pink Floyd ploča", "Catan", "One Piece 1", "Gramofon"];
function LiveGradient() {
  const [text, setText] = useState("");
  useEffect(() => {
    let w = 0, c = 0, dir = 1;
    const t = setInterval(() => {
      const word = EXAMPLES[w];
      c += dir;
      if (c > word.length + 8) dir = -1;
      if (c <= 0 && dir === -1) { dir = 1; w = (w + 1) % EXAMPLES.length; }
      setText(word.slice(0, Math.max(0, Math.min(c, word.length))));
    }, 90);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="px-[72px] pt-[20px]">
      <div
        className="relative flex h-[640px] flex-col items-center justify-center overflow-hidden rounded-[15px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)",
        }}
      >
        <div className="hl-blob absolute left-[8%] top-[10%] size-[380px] rounded-full bg-white/40 blur-[60px]" />
        <div className="hl-blob absolute right-[10%] top-[30%] size-[300px] rounded-full bg-[#88a6de]/70 blur-[50px]" style={{ animationDelay: "-6s" }} />
        <div className="hl-blob absolute bottom-[-10%] left-[40%] size-[420px] rounded-full bg-[#e9d7ff]/60 blur-[70px]" style={{ animationDelay: "-12s" }} />
        <Image src={ICONS.oglas} alt="" width={209} height={209} className="hl-bob absolute left-[110px] top-[80px]" style={{ width: 170, height: "auto" }} />
        <Image src={ICONS.prodaj} alt="" width={228} height={245} className="hl-bob absolute bottom-[60px] right-[120px]" style={{ width: 180, height: "auto", animationDelay: "-2s" }} />
        <Image src={ICONS.profil} alt="" width={187} height={187} className="hl-bob absolute bottom-[90px] left-[200px]" style={{ width: 110, height: "auto", animationDelay: "-3.5s" }} />
        <div className="relative z-10 flex flex-col items-center">
          <Title />
          <p className="mt-[28px] text-[17px] font-medium tracking-[-0.68px] text-black/70">{SUB}</p>
          <div className="mt-[30px] flex h-[46px] w-[480px] items-center gap-[10px] rounded-full bg-white px-[18px] text-[14px] shadow-[0_8px_30px_rgba(60,60,120,0.15)]">
            <Image src="/icons/search.svg" alt="" width={18} height={17} />
            <span className="text-black">{text}</span>
            <span className="hl-caret -ml-[8px] h-[18px] w-px bg-black" />
          </div>
          <div className="mt-[16px] flex gap-[8px]">
            {["Knjige", "Muzika", "Igre", "Mange i stripovi", "Oprema"].map((c) => (
              <span key={c} className="rounded-full bg-white/60 px-[14px] py-[7px] text-[12px] font-medium backdrop-blur transition-colors hover:bg-white">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5 — Dve trake: fotografije i ikonice teku u suprotnim smerovima, staju na hover.
function Marquee() {
  const row1 = [...PHOTOS, ...BLOG, ...PHOTOS, ...BLOG];
  const row2 = Object.values(ICONS);
  const Row = ({ items, reverse, photo }: { items: string[]; reverse?: boolean; photo?: boolean }) => (
    <div className="hl-row flex w-max gap-[18px]" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
      {[...items, ...items].map((src, i) => (
        <div
          key={i}
          className={`relative shrink-0 overflow-hidden rounded-[15px] ${photo ? "h-[170px] w-[230px]" : "flex h-[170px] w-[170px] items-center justify-center bg-[#f5f6f8]"}`}
        >
          {photo ? (
            <Image src={src} alt="" fill sizes="230px" className="object-cover grayscale transition-[filter] duration-300 hover:grayscale-0" />
          ) : (
            <Image src={src} alt="" width={196} height={196} style={{ width: 130, height: "auto" }} />
          )}
        </div>
      ))}
    </div>
  );
  return (
    <div className="relative h-[760px] overflow-hidden pt-[70px]">
      <Copy />
      <div className="hl-pause mt-[56px] flex flex-col gap-[18px]">
        <Row items={row1} photo />
        <Row items={row2} reverse />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[200px] bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[200px] bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

// 6 — Reflektor: crno-beli kolaž fotografija, a gde je miš, pojavi se boja (kao na blogu).
function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 50, y: 50, on: false });
  const tiles = [...PHOTOS, ...BLOG, ...BLOG, ...PHOTOS].slice(0, 12);
  const Grid = ({ color }: { color?: boolean }) => (
    <div className={`absolute inset-0 grid grid-cols-6 grid-rows-2 gap-[14px] p-[14px] ${color ? "" : "grayscale opacity-40"}`}>
      {tiles.map((src, i) => (
        <div key={i} className="relative overflow-hidden rounded-[15px]">
          <Image src={src} alt="" fill sizes="240px" className="object-cover" />
        </div>
      ))}
    </div>
  );
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setP({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
      }}
      onMouseLeave={() => setP((q) => ({ ...q, on: false }))}
      className="relative mx-[72px] mt-[20px] h-[640px] overflow-hidden rounded-[15px] bg-white"
    >
      <Grid />
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: p.on ? 1 : 0,
          WebkitMaskImage: `radial-gradient(circle 170px at ${p.x}px ${p.y}px, #000 60%, transparent 100%)`,
          maskImage: `radial-gradient(circle 170px at ${p.x}px ${p.y}px, #000 60%, transparent 100%)`,
        }}
      >
        <Grid color />
      </div>
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-white/90 px-[60px] py-[50px] backdrop-blur-sm">
        <Copy />
      </div>
    </div>
  );
}

const OPTIONS = [
  { n: 1, name: "Kolaž koji lebdi", note: "Ikonice izlete iz sredine, lebde i prate miša.", C: Floating },
  { n: 2, name: "Reč koja se menja", note: "Knjiga, ploča, igara, stripova, opreme, sa ikonicom kategorije.", C: Rotating },
  { n: 3, name: "Polica", note: "Knjige uskoče na policu; pređi mišem preko dugmadi, pa preko knjiga.", C: Shelf },
  { n: 4, name: "Živi gradijent", note: "Gradijent sa strana kategorija koji se polako pomera i pretraga koja sama kuca.", C: LiveGradient },
  { n: 5, name: "Dve trake", note: "Fotografije i ikonice teku u suprotnim smerovima, staju kad je miš na njima.", C: Marquee },
  { n: 6, name: "Reflektor", note: "Crno-beli kolaž, a boja se pojavi gde je miš (kao slike na blogu).", C: Spotlight },
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
          <span className="mr-[8px] font-semibold">Predlozi za hero:</span>
          {OPTIONS.map((o) => (
            <Link
              key={o.n}
              href={`/predlozi/hero?v=${o.n}`}
              scroll={false}
              onClick={() => setV(o.n)}
              className={`rounded-full px-[12px] py-[6px] ${o.n === v ? "bg-black text-white" : "bg-[#f5f6f8] hover:bg-[#e8e9ec]"}`}
            >
              {o.n}. {o.name}
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
@keyframes hl-fly { from { transform: translate(0,0) scale(.2); opacity: 0 } to { transform: translate(var(--x), var(--y)) scale(1); opacity: 1 } }
.hl-fly { animation: hl-fly 900ms cubic-bezier(.2,.8,.2,1.15) both; }
@keyframes hl-bob { 0%,100% { translate: 0 0 } 50% { translate: 0 -14px } }
.hl-bob { animation: hl-bob 5s ease-in-out infinite; }
@keyframes hl-pop { from { transform: scale(.6) rotate(-18deg); opacity: 0 } to { transform: scale(1) rotate(0); opacity: 1 } }
.hl-pop { animation: hl-pop 600ms cubic-bezier(.2,.8,.2,1.2) both; }
@keyframes hl-word { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
.hl-word { animation: hl-word 450ms cubic-bezier(.2,.8,.2,1) both; }
@keyframes hl-drop { from { transform: translateY(-420px); opacity: 0 } 70% { opacity: 1 } to { transform: translateY(0); opacity: 1 } }
.hl-drop { animation: hl-drop 700ms cubic-bezier(.3,1.3,.5,1) both; }
@keyframes hl-blob { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(60px,-40px) scale(1.1) } 66% { transform: translate(-50px,30px) scale(.95) } }
.hl-blob { animation: hl-blob 18s ease-in-out infinite; }
@keyframes hl-caret { 50% { opacity: 0 } }
.hl-caret { animation: hl-caret 1s step-end infinite; }
@keyframes hl-row { from { transform: translateX(0) } to { transform: translateX(-50%) } }
.hl-row { animation: hl-row 40s linear infinite; }
.hl-pause:hover .hl-row { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .hl-fly,.hl-bob,.hl-pop,.hl-word,.hl-drop,.hl-blob,.hl-row { animation: none !important } }
`;
