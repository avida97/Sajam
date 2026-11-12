"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// Predlozi za stranicu „O nama“ (V 12. 11. 2026; Figma okvir 873:19401 je prazan). Privremena
// stranica /predlozi/o-nama; izabrani predlog prelazi u src/app/o-nama/page.tsx, a ova se briše.
// Nema izmišljenih brojeva ni citata: samo ono što Sajam stvarno jeste i radi.

const GRADIENT =
  "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)";

const CATS = [
  { name: "Knjige", href: "/knjige", tile: "/images/kategorije/knjige.png", text: "Romani, lektire, stručne i antikvarne knjige." },
  { name: "Muzika", href: "/muzika", tile: "/images/kategorije/muzika.png", text: "Ploče, CD-ovi, kasete i merch." },
  { name: "Igre", href: "/igre", tile: "/images/kategorije/igre.png", text: "Društvene igre, video igre i Lego." },
  { name: "Mange i stripovi", href: "/mange-i-stripovi", tile: "/images/kategorije/mange-i-stripovi.png", text: "Mange, domaći i strani stripovi." },
  { name: "Oprema", href: "/oprema", tile: "/images/kategorije/oprema.png", text: "Gramofoni, konzole i sve oko hobija." },
];

const VALUES = [
  { title: "Besplatno za sve", body: "Objava oglasa i prodaja su besplatne. Nema naknade za oglas ni provizije na prodaju.", href: "/pomoc/prodaja/naknade", link: "Naknade" },
  { title: "Dogovor porukama", body: "Kupac i prodavac se dogovaraju direktno, o stanju, ceni, slanju i plaćanju.", href: "/pomoc/kupovina/pisanje-prodavcu", link: "Kako da pišem prodavcu" },
  { title: "Prave ocene", body: "Prodavca ocenjuju samo kupci kojima je artikal stvarno prodat.", href: "/pomoc/nalog/kako-rade-ocene", link: "Kako rade ocene" },
];

const STEPS = [
  { n: "01", title: "Napravi profil", body: "Ime, grad i fotografija, i spreman si.", icon: "/images/pocetna/profil.png" },
  { n: "02", title: "Postavi oglas", body: "Slikaj, opiši stanje i odredi cenu.", icon: "/images/pocetna/oglas.png" },
  { n: "03", title: "Dogovori se", body: "Kupac ti piše, a vi se dogovorite oko slanja i plaćanja.", icon: "/images/pocetna/prodaj.png" },
];

// Osnivači iz memorije projekta; slike i tačan tekst treba da potvrde Vida i Anka.
const TEAM = [
  { name: "Vida", role: "Osnivačica · posao i razvoj", initial: "V" },
  { name: "Anka", role: "Osnivačica · dizajn i izgled sajta", initial: "A" },
];

function Title({ parts, size = 56, className = "" }: { parts: Array<string | { s: string } | { br: true }>; size?: number; className?: string }) {
  return (
    <h2 className={`font-semibold leading-[1.05] text-black ${className}`} style={{ fontSize: size, letterSpacing: -size * 0.05 }}>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : "br" in p ? (
          <br key={i} />
        ) : (
          <span key={i} className="font-serif italic" style={{ fontSize: size * 1.15, letterSpacing: -size * 0.04 }}>
            {p.s}
          </span>
        ),
      )}
    </h2>
  );
}

// Element se pojavi (podigne i izoštri) kad uđe u ekran.
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(28px)",
        filter: on ? "none" : "blur(6px)",
        transition: `opacity 700ms ${delay}ms, transform 700ms ${delay}ms cubic-bezier(.2,.7,.2,1), filter 700ms ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function GradientBox({ children, className = "", inner = "", style }: { children: React.ReactNode; className?: string; inner?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative overflow-hidden rounded-[15px] ${className}`} style={{ backgroundImage: GRADIENT, ...style }}>
      <div className="ab-blob absolute left-[8%] top-[5%] size-[360px] rounded-full bg-white/40 blur-[60px]" />
      <div className="ab-blob absolute bottom-[-15%] right-[10%] size-[400px] rounded-full bg-[#e9d7ff]/60 blur-[70px]" style={{ animationDelay: "-9s" }} />
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-[0.15] mix-blend-multiply">
        <filter id="ab-sum">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ab-sum)" />
      </svg>
      <div className={`relative ${inner}`}>{children}</div>
    </div>
  );
}

function Team({ dark }: { dark?: boolean }) {
  return (
    <div className="flex justify-center gap-[24px]">
      {TEAM.map((t, i) => (
        <Reveal key={t.name} delay={i * 120}>
          <div className={`flex w-[306px] flex-col items-center rounded-[20px] px-[24px] py-[34px] text-center ${dark ? "bg-white/50 backdrop-blur" : "bg-[#f5f6f8]"}`}>
            <span className="flex size-[96px] items-center justify-center rounded-full text-[34px] font-semibold text-white" style={{ backgroundImage: GRADIENT }}>
              {t.initial}
            </span>
            <p className="mt-[18px] text-[20px] font-semibold">{t.name}</p>
            <p className="mt-[6px] text-[13px] text-[#666]">{t.role}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function ClosingCta() {
  return (
    <GradientBox className="mx-[72px] mt-[110px] px-[60px] py-[70px] text-center">
      <Title parts={["Imaš nešto što ti ", { s: "više" }, { br: true }, "ne treba?"]} size={48} />
      <p className="mt-[20px] text-[16px] font-medium text-black/70">Neko baš to traži. Objavi oglas za par minuta, besplatno.</p>
      <div className="mt-[28px] flex justify-center gap-[12px]">
        <MainButton href="/prodaj" size="md">
          Započni prodaju
        </MainButton>
        <MainButton href="/kontakt" size="md" variant="light" className="border-white bg-white/70">
          Piši nam
        </MainButton>
      </div>
    </GradientBox>
  );
}

// 1 — Priča: urednički raspored, kao članak. Velika rečenica, priča levo i slika desno,
// vrednosti u brojevima, kategorije i osnivači.
function Story() {
  return (
    <div className="pb-[90px]">
      <section className="mx-auto max-w-[980px] px-[24px] pt-[90px] text-center">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">O nama</p>
          <Title className="mt-[22px]" size={64} parts={["Stvari koje ", { s: "volimo" }, " zaslužuju", { br: true }, "drugi ", { s: "život" }]} />
        </Reveal>
      </section>
      <section className="mx-auto mt-[90px] grid max-w-site grid-cols-[1fr_520px] items-center gap-[80px] px-[182px]">
        <Reveal>
          <h3 className="font-serif text-[30px] italic">Zašto Sajam?</h3>
          <p className="mt-[20px] text-[16px] leading-[1.7] text-[#444]">
            Svako ima policu punu knjiga koje je već pročitao, kutiju ploča koje više ne sluša ili igru koja skuplja prašinu. A negde
            je neko ko baš to traži.
          </p>
          <p className="mt-[16px] text-[16px] leading-[1.7] text-[#444]">
            Sajam spaja te ljude. Napravili smo mesto gde se polovne knjige, muzika, igre, stripovi i oprema prodaju jednostavno,
            bez naknada i bez posrednika: prodavac objavi oglas, kupac mu piše, a ostalo dogovore sami.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="relative h-[420px] overflow-hidden rounded-[20px]">
            <Image src="/images/blog/vinil-boja.png" alt="Police sa pločama" fill sizes="520px" className="object-cover" />
          </div>
        </Reveal>
      </section>
      <section className="mx-auto mt-[110px] max-w-site px-[182px]">
        <div className="grid grid-cols-3 gap-[40px] border-t border-[#e1e1e1] pt-[50px]">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <p className="font-serif text-[48px] italic leading-none text-[#a4afd8]">0{i + 1}</p>
              <h4 className="mt-[16px] text-[20px] font-semibold">{v.title}</h4>
              <p className="mt-[10px] text-[14px] leading-[1.6] text-[#555]">{v.body}</p>
              <Link href={v.href} className="mt-[14px] inline-block text-[12px] font-semibold underline-offset-4 hover:underline">
                {v.link} →
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-[110px] max-w-site text-center">
        <Title parts={["Ko stoji ", { s: "iza" }, " Sajma"]} size={44} />
        <p className="mx-auto mt-[16px] max-w-[520px] text-[15px] text-[#666]">Dve osnivačice koje vole knjige, muziku i stvari sa pričom.</p>
        <div className="mt-[40px]">
          <Team />
        </div>
      </section>
      <ClosingCta />
    </div>
  );
}

// 2 — Kako radi: tri koraka sa 3D ikonicama, pa „šta sve nađeš“ (kategorije), pa vrednosti.
function HowItWorks() {
  return (
    <div className="pb-[90px]">
      <section className="mx-auto max-w-site px-[72px] pt-[20px]">
        <GradientBox className="h-[460px] text-center" inner="flex size-full items-center justify-center">
          <Image src="/images/pocetna/oglas.png" alt="" width={209} height={209} className="ab-bob absolute left-[120px] top-[70px]" style={{ width: 150, height: "auto" }} />
          <Image src="/images/pocetna/prodaj.png" alt="" width={228} height={245} className="ab-bob absolute bottom-[50px] right-[130px]" style={{ width: 160, height: "auto", animationDelay: "-2s" }} />
          <div className="relative">
            <Title size={64} parts={["Sajam za ", { s: "sve" }, " što", { br: true }, "voliš da čuvaš"]} />
            <p className="mx-auto mt-[24px] w-[560px] text-[17px] font-medium leading-[1.5] text-black/70">
              Mesto gde ljubitelji knjiga, muzike, igara, mangi i stripova kupuju i prodaju ono što im više ne treba.
            </p>
          </div>
        </GradientBox>
      </section>
      <section className="mx-auto mt-[100px] max-w-site px-[182px] text-center">
        <Title parts={["Kako ", { s: "radi" }]} size={44} />
        <div className="mt-[50px] grid grid-cols-3 gap-[24px]">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <div className="group relative h-[300px] overflow-hidden rounded-[20px] bg-[#f5f6f8] p-[30px] text-left transition-transform duration-300 hover:-translate-y-[6px]">
                <p className="text-[12px] text-[#7c7c7c]">{s.n}</p>
                <h4 className="mt-[8px] font-serif text-[24px] italic">{s.title}</h4>
                <p className="mt-[10px] w-[200px] text-[14px] leading-[1.5] text-[#555]">{s.body}</p>
                <Image src={s.icon} alt="" width={209} height={209} className="absolute -bottom-[20px] -right-[10px] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" style={{ width: 160, height: "auto" }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-[110px] max-w-site px-[72px] text-center">
        <Title parts={["Šta sve ", { s: "nađeš" }]} size={44} />
        <div className="mt-[44px] grid grid-cols-5 gap-[20px]">
          {CATS.map((c, i) => (
            <Reveal key={c.name} delay={i * 90}>
              <Link href={c.href} className="group block text-left">
                <span className="relative block aspect-square overflow-hidden rounded-[20px] bg-[#f5f6f8]">
                  <Image src={c.tile} alt="" fill sizes="240px" className="object-cover transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110" />
                </span>
                <span className="mt-[14px] block text-[16px] font-semibold">{c.name}</span>
                <span className="mt-[4px] block text-[13px] text-[#666]">{c.text}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-[110px] max-w-site px-[182px]">
        <div className="grid grid-cols-3 gap-[24px]">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <div className="h-full rounded-[20px] border border-[#e1e1e1] p-[28px]">
                <h4 className="text-[18px] font-semibold">{v.title}</h4>
                <p className="mt-[10px] text-[14px] leading-[1.6] text-[#555]">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <ClosingCta />
    </div>
  );
}

// 3 — Manifest: velike rečenice koje se pojavljuju jedna po jedna dok se skroluje.
const MANIFEST: Array<Array<string | { s: string }>> = [
  ["Svaka knjiga zaslužuje ", { s: "drugog" }, " čitaoca."],
  ["Ploča koja stoji u ormanu ", { s: "nije" }, " muzika."],
  ["Kupovina treba da bude ", { s: "razgovor" }, ", a ne klik."],
  ["Prodaja treba da bude ", { s: "besplatna" }, "."],
  ["Ocena vredi samo kad je ", { s: "prava" }, "."],
];
function Manifest() {
  return (
    <div className="pb-[90px]">
      <section className="mx-auto flex max-w-site flex-col items-center px-[72px] pt-[110px] text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">O nama</p>
        <Title className="mt-[20px]" size={72} parts={["U šta ", { s: "verujemo" }]} />
        <p className="mt-[26px] w-[560px] text-[17px] leading-[1.5] text-[#666]">
          Sajam smo napravili jer mislimo da stvari koje volimo ne treba da završe u kutiji. Evo zašto.
        </p>
        <span className="ab-scroll mt-[50px] block h-[46px] w-px bg-black/40" />
      </section>
      <section className="mx-auto mt-[80px] flex max-w-site flex-col gap-[90px] px-[182px]">
        {MANIFEST.map((m, i) => (
          <Reveal key={i}>
            <div className={`flex items-baseline gap-[30px] ${i % 2 ? "justify-end text-right" : ""}`}>
              <span className="font-serif text-[22px] italic text-[#a4afd8]">0{i + 1}</span>
              <Title size={52} parts={m} className="max-w-[860px]" />
            </div>
          </Reveal>
        ))}
      </section>
      <section className="mx-auto mt-[130px] max-w-site px-[72px]">
        <GradientBox className="px-[60px] py-[80px] text-center">
          <Title parts={["Zato je Sajam ", { s: "jednostavan" }]} size={44} />
          <div className="mx-auto mt-[40px] grid max-w-[960px] grid-cols-3 gap-[20px] text-left">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-[20px] bg-white/55 p-[26px] backdrop-blur">
                <h4 className="text-[18px] font-semibold">{v.title}</h4>
                <p className="mt-[8px] text-[14px] leading-[1.6] text-black/70">{v.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-[60px]">
            <Team dark />
          </div>
        </GradientBox>
      </section>
      <div className="mt-[80px] flex justify-center gap-[12px]">
        <MainButton href="/prodaj" size="md">
          Započni prodaju
        </MainButton>
        <MainButton href="/knjige" size="md" variant="light" className="border-[#e1e1e1]">
          Pogledaj oglase
        </MainButton>
      </div>
    </div>
  );
}

// 4 — Kolaž: naslov u sredini, kategorije raspoređene okolo kao kartice koje se razlete pri
// skrolovanju; ispod priča u dve kolone, vrednosti i osnivači.
function Collage() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const pos = [
    { x: -480, y: -120, r: -8, s: 200 },
    { x: 470, y: -150, r: 7, s: 180 },
    { x: -400, y: 170, r: 6, s: 170 },
    { x: 420, y: 160, r: -6, s: 210 },
    { x: 0, y: 290, r: 3, s: 140 },
  ];
  const k = Math.min(y / 400, 1);
  return (
    <div className="pb-[90px]">
      <section className="relative mx-auto flex h-[720px] max-w-site items-center justify-center overflow-hidden">
        {CATS.map((c, i) => {
          const p = pos[i];
          return (
            <Link
              key={c.name}
              href={c.href}
              className="group absolute left-1/2 top-1/2"
              style={{ transform: `translate(${p.x * (1 + k * 0.5) - p.s / 2}px, ${p.y * (1 + k * 0.5) - p.s / 2}px) rotate(${p.r * (1 + k)}deg)` }}
            >
              <span className="ab-bob block" style={{ animationDelay: `${-i * 1.1}s` }}>
                <span className="relative block overflow-hidden rounded-[18px] bg-[#f5f6f8] shadow-[0_14px_40px_rgba(60,60,140,0.12)] transition-transform duration-300 group-hover:scale-105" style={{ width: p.s, height: p.s }}>
                  <Image src={c.tile} alt={c.name} fill sizes="220px" className="object-cover" />
                </span>
                <span className="mt-[8px] block text-center text-[12px] font-semibold opacity-0 transition-opacity group-hover:opacity-100">{c.name}</span>
              </span>
            </Link>
          );
        })}
        <div className="relative z-10 text-center">
          <Title size={72} parts={["Mesto za stvari", { br: true }, "sa ", { s: "pričom" }]} />
          <p className="mx-auto mt-[24px] w-[520px] text-[17px] font-medium leading-[1.5] text-[#666]">
            Knjige, ploče, igre, stripovi i oprema koji traže novog vlasnika. Bez naknada, bez posrednika.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-site grid-cols-2 gap-[80px] px-[182px] pt-[40px]">
        <Reveal>
          <h3 className="font-serif text-[30px] italic">Kako je počelo</h3>
          <p className="mt-[18px] text-[16px] leading-[1.7] text-[#444]">
            Sajam su pokrenule dve prijateljice kojima je bilo žao da dobre knjige i ploče stoje neiskorišćene, a da je teško naći
            kupca kome će značiti.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <h3 className="font-serif text-[30px] italic">Kako radi danas</h3>
          <p className="mt-[18px] text-[16px] leading-[1.7] text-[#444]">
            Prodavac besplatno objavi oglas, kupac mu piše porukom, a dogovor o ceni, slanju i plaćanju ostaje između njih. Posle
            prodaje kupac ostavlja ocenu.
          </p>
        </Reveal>
      </section>
      <section className="mx-auto mt-[100px] max-w-site px-[182px]">
        <div className="grid grid-cols-3 gap-[24px]">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <div className="h-full rounded-[20px] bg-[#f5f6f8] p-[28px]">
                <h4 className="text-[18px] font-semibold">{v.title}</h4>
                <p className="mt-[10px] text-[14px] leading-[1.6] text-[#555]">{v.body}</p>
                <Link href={v.href} className="mt-[14px] inline-block text-[12px] font-semibold underline-offset-4 hover:underline">
                  {v.link} →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-[100px] max-w-site text-center">
        <Title parts={["Ko stoji ", { s: "iza" }, " Sajma"]} size={44} />
        <div className="mt-[40px]">
          <Team />
        </div>
      </section>
      <ClosingCta />
    </div>
  );
}

const OPTIONS = [
  { n: 1, name: "Priča", note: "Kao članak: velika rečenica, „Zašto Sajam?“ sa slikom, tri vrednosti, osnivači i poziv na prodaju.", C: Story },
  { n: 2, name: "Kako radi", note: "Gradijent kao na početnoj, tri koraka sa 3D ikonicama, „Šta sve nađeš“ (kategorije) i vrednosti.", C: HowItWorks },
  { n: 3, name: "Manifest", note: "Velike rečenice „u šta verujemo“ pojavljuju se jedna po jedna dok skroluješ; vrednosti i osnivači u gradijentu.", C: Manifest },
  { n: 4, name: "Kolaž", note: "Kategorije lebde oko naslova i razmiču se kad skroluješ; ispod priča, vrednosti i osnivači.", C: Collage },
];

export function AboutLab({ initial }: { initial: number }) {
  const [v, setV] = useState(initial);
  const cur = OPTIONS.find((o) => o.n === v) ?? OPTIONS[0];
  const C = cur.C;
  return (
    <>
      <style>{CSS}</style>
      <div className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-site items-center gap-[8px] px-[72px] py-[12px] text-[13px]">
          <span className="mr-[8px] font-semibold">Predlozi za O nama:</span>
          {OPTIONS.map((o) => (
            <Link
              key={o.n}
              href={`/predlozi/o-nama?v=${o.n}`}
              onClick={() => setV(o.n)}
              className={`rounded-full px-[12px] py-[6px] ${o.n === v ? "bg-black text-white" : "bg-[#f5f6f8] hover:bg-[#e8e9ec]"}`}
            >
              {o.n}. {o.name}
            </Link>
          ))}
        </div>
        <p className="mx-auto max-w-site px-[72px] pb-[10px] text-[12px] text-[#737373]">{cur.note}</p>
      </div>
      <C key={v} />
    </>
  );
}

const CSS = `
@keyframes ab-bob { 0%,100% { translate: 0 0 } 50% { translate: 0 -12px } }
.ab-bob { animation: ab-bob 5s ease-in-out infinite; }
@keyframes ab-blob { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(60px,-30px) scale(1.1) } }
.ab-blob { animation: ab-blob 18s ease-in-out infinite; }
@keyframes ab-scroll { 0% { transform: scaleY(0); transform-origin: top } 50% { transform: scaleY(1); transform-origin: top } 51% { transform-origin: bottom } 100% { transform: scaleY(0); transform-origin: bottom } }
.ab-scroll { animation: ab-scroll 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ab-bob,.ab-blob,.ab-scroll { animation: none !important } }
`;
