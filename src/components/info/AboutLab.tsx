"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// Varijacije stranice „O nama“ u stilu „Priča“ (odluka V 12. 11. 2026). Bez osnivača kao osoba
// („nećemo da se ističemo“) i bez naglaska da je Sajam besplatan (plaćanje je moguće kasnije).
// Privremena stranica /predlozi/o-nama; izabrana varijacija prelazi u src/app/o-nama/page.tsx.

const GRADIENT =
  "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)";

const CATS = [
  { name: "Knjige", href: "/knjige", tile: "/images/kategorije/knjige.png", photo: "/images/nav/knjige.jpg", text: "Romani, lektire, stručne i antikvarne knjige." },
  { name: "Muzika", href: "/muzika", tile: "/images/kategorije/muzika.png", photo: "/images/nav/muzika.jpg", text: "Ploče, CD-ovi, kasete i merch." },
  { name: "Igre", href: "/igre", tile: "/images/kategorije/igre.png", photo: "/images/nav/igre.jpg", text: "Društvene igre, video igre i Lego." },
  { name: "Mange i stripovi", href: "/mange-i-stripovi", tile: "/images/kategorije/mange-i-stripovi.png", photo: "/images/nav/mange-i-stripovi.jpg", text: "Mange, domaći i strani stripovi." },
  { name: "Oprema", href: "/oprema", tile: "/images/kategorije/oprema.png", photo: "/images/nav/oprema.jpg", text: "Gramofoni, konzole i sve oko hobija." },
];

const VALUES = [
  { title: "Dogovor porukama", body: "Kupac i prodavac se dogovaraju direktno: o stanju, ceni, slanju i plaćanju.", href: "/pomoc/kupovina/pisanje-prodavcu", link: "Kako da pišem prodavcu" },
  { title: "Prave ocene", body: "Prodavca ocenjuju samo kupci kojima je artikal stvarno prodat, pa ocena znači nešto.", href: "/pomoc/nalog/kako-rade-ocene", link: "Kako rade ocene" },
  { title: "Oglas za par minuta", body: "Skeniraj ISBN ili upiši naslov, a Sajam sam popuni autora, izdavača, godinu i žanr.", href: "/pomoc/prodaja/kako-da-objavim-oglas", link: "Kako da objavim oglas" },
];

const STEPS = [
  { n: "01", title: "Pronađi", body: "Pretraži po naslovu, autoru ili ISBN-u, ili prelistaj kategorije.", icon: "/images/kategorije/knjige.png" },
  { n: "02", title: "Piši prodavcu", body: "Pitaj za stanje, dogovori cenu, slanje ili lično preuzimanje.", icon: "/images/pocetna/oglas.png" },
  { n: "03", title: "Preuzmi i oceni", body: "Kad stigne, oceni prodavca da i drugi znaju kako je prošlo.", icon: "/images/pocetna/prodaj.png" },
];

const SAFETY = [
  "Ocene ostavljaju samo pravi kupci",
  "Svaki oglas i korisnika možeš da prijaviš",
  "Prijave pregleda tim Sajma",
  "Saveti za bezbednu kupovinu u Centru za pomoć",
];

const FAQ = [
  { q: "Šta mogu da prodam na Sajmu?", a: "Polovne i nove knjige, muziku, igre, mange i stripove i opremu za te hobije. Oglas mora da opisuje stvaran artikal koji imaš.", href: "/pomoc/prodaja/kako-da-objavim-oglas" },
  { q: "Kako se plaća?", a: "Način plaćanja dogovaraš sa prodavcem: pouzećem, uplatom na račun ili gotovinom pri preuzimanju.", href: "/pomoc/kupovina/kako-se-placa" },
  { q: "Kako stiže artikal?", a: "Prodavac šalje poštom ili kurirskom službom, ili se dogovorite za lično preuzimanje.", href: "/pomoc/kupovina/nacini-slanja" },
  { q: "Šta ako artikal nije kao u opisu?", a: "Prvo piši prodavcu. Ostavi iskrenu ocenu, a ozbiljan problem prijavi timu Sajma.", href: "/pomoc/kupovina/artikal-nije-kao-u-opisu" },
];

function Title({ parts, size = 56, className = "" }: { parts: Array<string | { s: string } | { br: true }>; size?: number; className?: string }) {
  return (
    <h2 className={`font-semibold leading-[1.05] ${className}`} style={{ fontSize: size, letterSpacing: -size * 0.05 }}>
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

// ——— zajednički delovi „Priče“ ———

function Opener({ eyebrow = "O nama" }: { eyebrow?: string }) {
  return (
    <section className="mx-auto max-w-[980px] px-[24px] pt-[90px] text-center">
      <Reveal>
        <p className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">{eyebrow}</p>
        <Title className="mt-[22px]" size={64} parts={["Stvari koje ", { s: "volimo" }, " zaslužuju", { br: true }, "drugi ", { s: "život" }]} />
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
    <section className="mx-auto mt-[90px] grid max-w-site grid-cols-[1fr_520px] items-center gap-[80px] px-[182px]">
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

function NumberedValues({ className = "" }: { className?: string }) {
  return (
    <section className={`mx-auto max-w-site px-[182px] ${className}`}>
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
  );
}

function CategoriesGrid({ className = "" }: { className?: string }) {
  return (
    <section className={`mx-auto max-w-site px-[72px] text-center ${className}`}>
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

// ——— 1.1 Klasična: priča, vrednosti, kategorije, kako radi, česta pitanja ———
function Classic() {
  return (
    <div className="pb-[90px]">
      <Opener />
      <Why />
      <NumberedValues className="mt-[110px]" />
      <CategoriesGrid className="mt-[110px]" />
      <section className="mx-auto mt-[110px] max-w-site px-[182px]">
        <Title parts={["Kako se ", { s: "kupuje" }]} size={44} className="text-center" />
        <div className="mt-[50px] grid grid-cols-3 gap-[24px]">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <div className="group relative h-[280px] overflow-hidden rounded-[20px] bg-[#f5f6f8] p-[30px]">
                <p className="text-[12px] text-[#7c7c7c]">{s.n}</p>
                <h4 className="mt-[8px] font-serif text-[24px] italic">{s.title}</h4>
                <p className="mt-[10px] w-[210px] text-[14px] leading-[1.5] text-[#555]">{s.body}</p>
                <Image src={s.icon} alt="" width={209} height={209} className="absolute -bottom-[24px] -right-[14px] rounded-[20px] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" style={{ width: 150, height: "auto" }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <Faq className="mt-[120px]" />
      <ClosingCta />
    </div>
  );
}

// ——— 1.2 Crna traka: vrednosti na crnoj traci, traka kategorija sa fotografijama, poziv za utiske ———
function DarkBand() {
  return (
    <div className="pb-[90px]">
      <Opener />
      <Why />
      <section className="mt-[110px] bg-ink py-[90px] text-white">
        <div className="mx-auto max-w-site px-[182px]">
          <Title parts={["Kako ", { s: "radimo" }]} size={44} />
          <div className="mt-[50px] grid grid-cols-3 gap-[40px]">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 120}>
                <p className="font-serif text-[64px] italic leading-none text-[#a4afd8]">0{i + 1}</p>
                <h4 className="mt-[18px] text-[20px] font-semibold">{v.title}</h4>
                <p className="mt-[10px] text-[14px] leading-[1.6] text-white/70">{v.body}</p>
                <Link href={v.href} className="mt-[14px] inline-block text-[12px] font-semibold underline-offset-4 hover:underline">
                  {v.link} →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-[110px] overflow-hidden">
        <div className="mx-auto flex max-w-site items-end justify-between px-[182px]">
          <Title parts={["Pet ", { s: "sajmova" }, " u jednom"]} size={44} />
          <p className="w-[320px] text-right text-[14px] text-[#666]">Pređi mišem preko kategorije.</p>
        </div>
        <div className="mx-auto mt-[40px] flex h-[360px] max-w-site gap-[12px] px-[72px]">
          {CATS.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="group relative flex-1 overflow-hidden rounded-[20px] transition-[flex-grow] duration-500 ease-out hover:flex-[2.6]"
            >
              <Image src={c.photo} alt="" fill sizes="600px" className="object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:grayscale-0" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-[22px] left-[22px] right-[22px] text-white">
                <span className="block text-[20px] font-semibold">{c.name}</span>
                <span className="mt-[6px] block text-[13px] opacity-0 transition-opacity duration-300 group-hover:opacity-90">{c.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-[110px] max-w-site px-[182px]">
        <Reveal>
          <div className="flex items-center justify-between gap-[60px] rounded-[20px] bg-[#f5f6f8] px-[56px] py-[50px]">
            <div>
              <Title parts={["Sajam pravimo ", { s: "zajedno" }]} size={36} />
              <p className="mt-[14px] max-w-[560px] text-[15px] leading-[1.6] text-[#555]">
                Fali ti kategorija, nešto ne radi kako treba ili imaš ideju? Pišemo i čitamo svaku poruku.
              </p>
            </div>
            <MainButton href="/kontakt/forma?tema=utisci" size="md">
              Pošalji utisak
            </MainButton>
          </div>
        </Reveal>
      </section>
      <ClosingCta />
    </div>
  );
}

// ——— 1.3 Put jedne knjige: priča kroz korake „od police do novog vlasnika“ sa lepljivom slikom ———
const JOURNEY = [
  { t: "Na polici", b: "Knjiga je pročitana i stoji. Lepa je, ali više nije tvoja priča.", icon: "/images/kategorije/knjige.png" },
  { t: "Oglas", b: "Slikaš je, skeniraš ISBN, opišeš stanje i odrediš cenu. Za par minuta je na Sajmu.", icon: "/images/pocetna/oglas.png" },
  { t: "Poruka", b: "Neko ko je baš to tražio ti piše. Dogovorite cenu, slanje i plaćanje.", icon: "/images/pocetna/profil.png" },
  { t: "Novi vlasnik", b: "Knjiga putuje dalje, a kupac ostavlja ocenu da i drugi znaju kako je prošlo.", icon: "/images/pocetna/prodaj.png" },
];
function Journey() {
  const [step, setStep] = useState(0);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  return (
    <div className="pb-[90px]">
      <Opener />
      <Why />
      <section className="mx-auto mt-[120px] max-w-site px-[182px]">
        <Title parts={["Put jedne ", { s: "knjige" }]} size={44} />
        <div className="mt-[30px] grid grid-cols-[1fr_440px] gap-[80px]">
          <div>
            {JOURNEY.map((j, i) => (
              <div
                key={j.t}
                data-i={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="flex min-h-[300px] flex-col justify-center border-l-2 pl-[30px] transition-colors duration-500"
                style={{ borderColor: step === i ? "#09090b" : "#e1e1e1", opacity: step === i ? 1 : 0.35 }}
              >
                <p className="font-serif text-[20px] italic text-[#7c7c7c]">0{i + 1}</p>
                <h4 className="mt-[8px] text-[30px] font-semibold tracking-[-1px]">{j.t}</h4>
                <p className="mt-[12px] max-w-[440px] text-[16px] leading-[1.6] text-[#555]">{j.b}</p>
              </div>
            ))}
          </div>
          <div className="sticky top-[200px] h-[440px] self-start">
            <GradientBox className="size-full" inner="flex size-full items-center justify-center">
              {JOURNEY.map((j, i) => (
                <Image
                  key={j.icon}
                  src={j.icon}
                  alt=""
                  width={209}
                  height={209}
                  className="absolute rounded-[24px] transition-all duration-700"
                  style={{
                    width: 230,
                    height: "auto",
                    opacity: step === i ? 1 : 0,
                    transform: `scale(${step === i ? 1 : 0.7}) rotate(${step === i ? 0 : -15}deg)`,
                  }}
                />
              ))}
            </GradientBox>
          </div>
        </div>
      </section>
      <NumberedValues className="mt-[100px]" />
      <Faq className="mt-[110px]" />
      <ClosingCta />
    </div>
  );
}

// ——— 1.4 Gradijentni naglasci: vrednosti u gradijentnim karticama, bezbednost, blog ———
function Accents() {
  return (
    <div className="pb-[90px]">
      <Opener />
      <Why />
      <section className="mx-auto mt-[110px] max-w-site px-[72px]">
        <div className="grid grid-cols-3 gap-[20px]">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <GradientBox className="h-[300px]" inner="flex h-full flex-col p-[30px]">
                <p className="font-serif text-[56px] italic leading-none text-white">0{i + 1}</p>
                <h4 className="mt-auto text-[22px] font-semibold">{v.title}</h4>
                <p className="mt-[10px] text-[14px] leading-[1.6] text-black/70">{v.body}</p>
              </GradientBox>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-[110px] grid max-w-site grid-cols-2 items-center gap-[80px] px-[182px]">
        <Reveal>
          <Title parts={["Kupuj ", { s: "mirno" }]} size={44} />
          <p className="mt-[16px] text-[16px] leading-[1.7] text-[#555]">
            Sajam ne stoji između kupca i prodavca, ali pazi da pravila važe za sve.
          </p>
          <MainButton href="/pomoc/nalog/bezbedna-kupovina" size="md" variant="light" className="mt-[26px] border-[#e1e1e1]">
            Saveti za bezbednu kupovinu
          </MainButton>
        </Reveal>
        <ul className="flex flex-col gap-[14px]">
          {SAFETY.map((s, i) => (
            <Reveal key={s} delay={i * 100}>
              <li className="flex items-center gap-[16px] rounded-[16px] bg-[#f5f6f8] px-[22px] py-[18px] text-[15px] font-medium">
                <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-black text-[13px] text-white">✓</span>
                {s}
              </li>
            </Reveal>
          ))}
        </ul>
      </section>
      <CategoriesGrid className="mt-[110px]" />
      <section className="mx-auto mt-[110px] max-w-site px-[182px]">
        <Reveal>
          <Link href="/blog/vinyl-se-vratio" className="group grid grid-cols-[520px_1fr] items-center gap-[60px]">
            <span className="relative block h-[300px] overflow-hidden rounded-[20px]">
              <Image src="/images/blog/vinil-boja.png" alt="" fill sizes="520px" className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0" />
            </span>
            <span>
              <span className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">Sa bloga</span>
              <span className="mt-[14px] block text-[30px] font-semibold leading-[1.15] tracking-[-1px]">Vinyl se vratio: Zašto svi opet danas slušaju ploče?</span>
              <span className="mt-[16px] inline-block text-[13px] font-semibold underline-offset-4 group-hover:underline">Pročitaj →</span>
            </span>
          </Link>
        </Reveal>
      </section>
      <ClosingCta />
    </div>
  );
}

const OPTIONS = [
  { n: 1, name: "Klasična", note: "Priča → tri vrednosti → Šta sve nađeš → Kako se kupuje (3 koraka) → Česta pitanja (otvaraju se) → poziv.", C: Classic },
  { n: 2, name: "Crna traka", note: "Priča → vrednosti na crnoj traci → kategorije sa fotografijama koje se šire na hover → Sajam pravimo zajedno (utisci) → poziv.", C: DarkBand },
  { n: 3, name: "Put jedne knjige", note: "Priča → „Put jedne knjige“: koraci se pale dok skroluješ, a slika desno se menja → vrednosti → Česta pitanja → poziv.", C: Journey },
  { n: 4, name: "Gradijentni naglasci", note: "Priča → vrednosti u gradijentnim karticama → Kupuj mirno (bezbednost) → kategorije → tekst sa bloga → poziv.", C: Accents },
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
          <span className="mr-[8px] font-semibold">O nama, „Priča“:</span>
          {OPTIONS.map((o) => (
            <Link
              key={o.n}
              href={`/predlozi/o-nama?v=${o.n}`}
              onClick={() => setV(o.n)}
              className={`rounded-full px-[12px] py-[6px] ${o.n === v ? "bg-black text-white" : "bg-[#f5f6f8] hover:bg-[#e8e9ec]"}`}
            >
              1.{o.n} {o.name}
            </Link>
          ))}
        </div>
        <p className="mx-auto max-w-site px-[72px] pb-[10px] text-[12px] text-[#737373]">{cur.note}</p>
      </div>
      <div className="text-black">
        <C key={v} />
      </div>
    </>
  );
}

const CSS = `
@keyframes ab-blob { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(60px,-30px) scale(1.1) } }
.ab-blob { animation: ab-blob 18s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ab-blob { animation: none !important } }
`;
