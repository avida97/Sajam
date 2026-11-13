"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

const GRADIENT =
  "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)";

const STEPS = [
  { title: "Objavi ili pronađi", body: "Prodavac objavi oglas za par minuta: skenira ISBN, a Sajam sam popuni podatke. Kupac ga nađe pretragom ili kroz kategorije.", href: "/pomoc/prodaja/kako-da-objavim-oglas", link: "Kako da objavim oglas" },
  { title: "Dogovorite se porukama", body: "Kupac piše prodavcu, pa se zajedno dogovore o stanju, ceni, slanju i plaćanju.", href: "/pomoc/kupovina/pisanje-prodavcu", link: "Kako da pišem prodavcu" },
  { title: "Preuzmi i oceni", body: "Kad artikal stigne, kupac oceni prodavca, da i drugi znaju kako je prošlo.", href: "/pomoc/nalog/kako-rade-ocene", link: "Kako rade ocene" },
];

const FAQ = [
  { q: "Šta mogu da prodam na Sajmu?", a: "Polovne i nove knjige, muziku, igre, mange i stripove i opremu za te hobije. Oglas mora da opisuje stvaran artikal koji imaš.", href: "/pomoc/prodaja/kako-da-objavim-oglas" },
  { q: "Kako se plaća?", a: "Način plaćanja dogovaraš sa prodavcem: pouzećem, uplatom na račun ili gotovinom pri preuzimanju.", href: "/pomoc/kupovina/kako-se-placa" },
  { q: "Kako stiže artikal?", a: "Prodavac šalje poštom ili kurirskom službom, ili se dogovorite za lično preuzimanje.", href: "/pomoc/kupovina/nacini-slanja" },
  { q: "Šta ako artikal nije kao u opisu?", a: "Prvo piši prodavcu. Ostavi iskrenu ocenu, a ozbiljan problem prijavi timu Sajma.", href: "/pomoc/kupovina/artikal-nije-kao-u-opisu" },
];

function Title({ parts, size = 56, className = "", as: Tag = "h2" }: { parts: Array<string | { s: string } | { br: true }>; size?: number; className?: string; as?: "h1" | "h2" }) {
  return (
    <Tag className={`font-semibold leading-[1.05] ${className}`} style={{ fontSize: size, letterSpacing: -size * 0.05 }}>
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
    </Tag>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.15 });
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

function GradientBox({ children, className = "", inner = "" }: { children: React.ReactNode; className?: string; inner?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[15px] ${className}`} style={{ backgroundImage: GRADIENT }}>
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

function Opener({ eyebrow = "O nama" }: { eyebrow?: string }) {
  return (
    <section className="mx-auto max-w-[980px] px-[24px] pt-[90px] text-center">
      <Reveal>
        <p className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">{eyebrow}</p>
        <Title as="h1" className="mt-[22px]" size={64} parts={["Stvari koje ", { s: "volimo" }, " zaslužuju", { br: true }, "drugi ", { s: "život" }]} />
      </Reveal>
    </section>
  );
}

function WhyText() {
  return (
    <>
      <h3 className="font-serif text-[30px] italic">Zašto Sajam?</h3>
      <p className="mt-[20px] text-[16px] leading-[1.7] text-[#444]">
        Svako ima policu punu knjiga koje je već pročitao, kutiju ploča koje više ne sluša ili igru koja skuplja prašinu. A negde je
        neko ko baš to traži.
      </p>
      <p className="mt-[16px] text-[16px] leading-[1.7] text-[#444]">
        Sajam spaja te ljude. To je mesto gde se polovne knjige, muzika, igre, stripovi i oprema prodaju jednostavno i bez
        posrednika: prodavac objavi oglas, kupac mu piše, a ostalo dogovore sami.
      </p>
    </>
  );
}

function Why() {
  return (
    <section className="mx-auto mt-[120px] grid max-w-site grid-cols-[1fr_520px] items-center gap-[80px] px-[182px]">
      <Reveal>
        <WhyText />
      </Reveal>
      <Reveal delay={150}>
        <div className="relative h-[420px] overflow-hidden rounded-[20px]">
          <Image src="/images/blog/vinil-boja.png" alt="Police sa pločama" fill sizes="520px" className="object-cover" />
        </div>
      </Reveal>
    </section>
  );
}

function Faq({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(0);
  return (
    <section className={`mx-auto grid max-w-site grid-cols-[360px_1fr] gap-[80px] px-[182px] ${className}`}>
      <Reveal>
        <Title parts={["Česta ", { s: "pitanja" }]} size={44} />
        <p className="mt-[16px] text-[15px] leading-[1.6] text-[#666]">Sve ostalo je u Centru za pomoć.</p>
        <MainButton href="/pomoc" size="md" variant="light" className="mt-[24px] border-[#e1e1e1]">
          Centar za pomoć
        </MainButton>
      </Reveal>
      <div className="border-t border-[#e1e1e1]">
        {FAQ.map((f, i) => (
          <div key={f.q} className="border-b border-[#e1e1e1]">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-[22px] text-left text-[17px] font-semibold">
              {f.q}
              <span className="text-[22px] font-light transition-transform duration-300" style={{ transform: open === i ? "rotate(45deg)" : "none" }}>
                +
              </span>
            </button>
            <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <p className="pb-[22px] text-[15px] leading-[1.6] text-[#555]">
                  {f.a}{" "}
                  <Link href={f.href} className="font-semibold text-black underline-offset-4 hover:underline">
                    Više →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingCta({ className = "mt-[110px]" }: { className?: string }) {
  return (
    <GradientBox className={`mx-[72px] px-[60px] py-[70px] text-center ${className}`}>
      <Title parts={["Imaš nešto što ti ", { s: "više" }, { br: true }, "ne treba?"]} size={48} />
      <p className="mt-[20px] text-[16px] font-medium text-black/70">Neko baš to traži. Oglas objaviš za par minuta.</p>
      <div className="mt-[28px] flex justify-center gap-[12px]">
        <MainButton href="/prodaj" size="md">
          Započni prodaju
        </MainButton>
        <MainButton href="/knjige" size="md" variant="light" className="border-white bg-white/70">
          Pogledaj oglase
        </MainButton>
      </div>
    </GradientBox>
  );
}

// „Šta nam je važno“ (V 13. 11. 2026, predlog 2): misija kao veliki citat na gradijentu.
function Important() {
  return (
    <section className="mx-auto mt-[90px] max-w-site px-[72px]">
      <Reveal>
        <GradientBox className="px-[100px] py-[100px] text-center" inner="flex flex-col items-center">
          <p className="text-[13px] font-semibold uppercase tracking-[2px] text-black/60">Šta nam je važno</p>
          <p className="mt-[28px] max-w-[900px] text-[44px] font-semibold leading-[1.15] tracking-[-2px]">
            Da <span className="font-serif text-[50px] italic">knjigoljupci</span> i{" "}
            <span className="font-serif text-[50px] italic">knjigofili</span> imaju svoje mesto na internetu.
          </p>
          <p className="mt-[28px] max-w-[620px] text-[16px] leading-[1.7] text-black/70">
            Mesto gde se ne prodaje roba, nego stvari koje nekome nešto znače, i gde je sa druge strane uvek neko ko ih
            voli isto koliko i ti.
          </p>
        </GradientBox>
      </Reveal>
    </section>
  );
}

// Stranica „O nama“ (V 13. 11. 2026): elementi koje je V izabrala iz varijacija „Priče“, ovim redom:
// naslov → šta nam je važno → zašto Sajam → kako funkcioniše → česta pitanja → ostanimo u kontaktu
// (utisci + blog) → poziv. Bez osnivača kao osoba i bez naglaska da je Sajam besplatan.
export function AboutPage() {
  return (
    <div className="pb-[90px] text-black">
      <style>{CSS}</style>
      {/* 1. Ko smo: naslov, misija, priča */}
      <Opener />
      <Important />
      <Why />

      {/* 2. Kako radi */}
      <section className="mx-auto mt-[130px] max-w-site px-[72px]">
        <Title parts={["Kako ", { s: "funkcioniše" }]} size={44} className="text-center" />
        <div className="mt-[50px] grid grid-cols-3 gap-[20px]">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <GradientBox className="h-[320px]" inner="flex h-full flex-col p-[30px]">
                <p className="font-serif text-[56px] italic leading-none text-white">0{i + 1}</p>
                <h3 className="mt-auto text-[22px] font-semibold">{s.title}</h3>
                <p className="mt-[10px] min-h-[67px] text-[14px] leading-[1.6] text-black/70">{s.body}</p>
                <Link href={s.href} className="mt-[14px] text-[12px] font-semibold underline-offset-4 hover:underline">
                  {s.link} →
                </Link>
              </GradientBox>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Pitanja */}
      <Faq className="mt-[130px]" />

      {/* 4. Zajednica: utisci i blog, jedno pored drugog */}
      <section className="mx-auto mt-[130px] max-w-site px-[182px]">
        <Title parts={["Ostanimo u ", { s: "kontaktu" }]} size={44} className="text-center" />
        <div className="mt-[50px] grid grid-cols-2 gap-[20px]">
          <Reveal>
            <div className="flex h-full flex-col rounded-[20px] bg-[#f5f6f8] p-[40px]">
              <p className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">Utisci i predlozi</p>
              <h3 className="mt-[14px] text-[28px] font-semibold leading-[1.15] tracking-[-1px]">
                Sajam pravimo <span className="font-serif text-[32px] italic">zajedno</span>
              </h3>
              <p className="mt-[14px] text-[15px] leading-[1.6] text-[#555]">
                Fali ti kategorija, nešto ne radi kako treba ili imaš ideju? Čitamo svaku poruku.
              </p>
              <MainButton href="/kontakt/forma?tema=utisci" size="md" className="mt-auto self-start">
                Pošalji utisak
              </MainButton>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/blog/vinyl-se-vratio" className="group flex h-full flex-col rounded-[20px] bg-[#f5f6f8] p-[40px]">
              <span className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">Sa bloga</span>
              <span className="mt-[14px] block text-[28px] font-semibold leading-[1.15] tracking-[-1px]">
                Vinyl se vratio: Zašto svi opet danas slušaju ploče?
              </span>
              <span className="relative mt-[24px] block h-[200px] overflow-hidden rounded-[14px]">
                <Image src="/images/blog/vinil-boja.png" alt="" fill sizes="560px" className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0" />
              </span>
              <span className="mt-[18px] text-[13px] font-semibold underline-offset-4 group-hover:underline">Pročitaj →</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5. Poziv */}
      <ClosingCta className="mt-[130px]" />
    </div>
  );
}

const CSS = `
@keyframes ab-blob { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(60px,-30px) scale(1.1) } }
.ab-blob { animation: ab-blob 18s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ab-blob { animation: none !important } }
`;
