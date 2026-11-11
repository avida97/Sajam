"use client";

import Image from "next/image";
import { useState } from "react";
import { MainButton } from "@/components/ui/MainButton";

// „Napravi mesta za još knjiga“ (Figma 412:13259, komponenta 278:652): tri nagnute kartice
// sa koracima i 3D ikonicama. Hover po Figmi: kartica ispod miša se ispravlja i raste, a druge
// dve se okreću u stranu (varijante „Frame 26–28“, smart animate 0,4 s). Položaji su iz
// dizajna (platno 1440 px): središte, veličina i ugao (u Figmi pozitivan ugao je ulevo).
// Tekst je usklađen sa sajtom (odluka V 11. 11. 2026): nema aplikacije ni plaćene oznake za
// slanje, kupac i prodavac se dogovaraju porukama.
type Pose = { cx: number; cy: number; size: number; rot: number };

const STEPS: Array<{
  n: string;
  title: string;
  body: string;
  note: string;
  img: { src: string; w: number; h: number; base: number };
  // Položaj kartice i slike: bez hovera, pa kad je miš na koraku 01, 02 i 03.
  card: Pose[];
  icon: Pose[];
}> = [
  {
    n: "01",
    title: "Napravi profil",
    body: "Registruj se i dodaj ime, grad i fotografiju. Posle toga možeš da postaviš prvi oglas.",
    note: "Dobro popunjen profil olakšava komunikaciju i pomaže drugim korisnicima da te brže prepoznaju.",
    img: { src: "/images/pocetna/profil.png", w: 186.16, h: 186.16, base: 152 },
    card: [
      { cx: 407.9, cy: 236.1, size: 242, rot: -4.52 },
      { cx: 418.0, cy: 246.5, size: 270, rot: 0 },
      { cx: 411.1, cy: 219.9, size: 230, rot: 15.89 },
      { cx: 410.3, cy: 233.9, size: 230, rot: -4.52 },
    ],
    icon: [
      { cx: 530.7, cy: 254.8, size: 152, rot: -15 },
      { cx: 552.5, cy: 244.5, size: 167, rot: 0 },
      { cx: 517.1, cy: 193.6, size: 131.3, rot: 5.41 },
      { cx: 510.9, cy: 239.3, size: 134.3, rot: -15 },
    ],
  },
  {
    n: "02",
    title: "Postavi oglas",
    body: "Slikaj artikal, opiši stanje i odredi cenu. Klikni „Objavi oglas“ i oglas je odmah vidljiv.",
    note: "Što više detalja dodaš u opis i fotografije, veća je verovatnoća da će se kupci javiti.",
    img: { src: "/images/pocetna/oglas.png", w: 208.56, h: 208.56, base: 170.3 },
    card: [
      { cx: 717.5, cy: 277.0, size: 242, rot: 3.97 },
      { cx: 760.5, cy: 286.8, size: 242, rot: 14.18 },
      { cx: 731.5, cy: 277.0, size: 270, rot: 0 },
      { cx: 728.1, cy: 286.2, size: 230, rot: 18.97 },
    ],
    icon: [
      { cx: 831.3, cy: 265.3, size: 170.3, rot: 15 },
      { cx: 870.4, cy: 255.1, size: 158.3, rot: 25.21 },
      { cx: 859.9, cy: 268.9, size: 199.9, rot: 0 },
      { cx: 831.4, cy: 258.6, size: 150.9, rot: 30 },
    ],
  },
  {
    n: "03",
    title: "Prodaj knjigu",
    body: "Kupac ti piše porukom. Dogovorite cenu, slanje i plaćanje, pa pošalji knjigu.",
    note: "Kad označiš oglas kao prodat, kupac može da te oceni, a dobre ocene donose nove kupce.",
    img: { src: "/images/pocetna/prodaj.png", w: 227.76, h: 244.96, base: 149.5 },
    card: [
      { cx: 1030.7, cy: 228.0, size: 242, rot: -7.23 },
      { cx: 1076.4, cy: 210.6, size: 230, rot: -12.28 },
      { cx: 1080.0, cy: 284.4, size: 230, rot: -22.23 },
      { cx: 1040.7, cy: 228.0, size: 270, rot: 0 },
    ],
    icon: [
      { cx: 1110.9, cy: 241.5, size: 149.5, rot: -30 },
      { cx: 1155.2, cy: 231.1, size: 138.5, rot: -35.05 },
      { cx: 1161.3, cy: 313.6, size: 128.3, rot: -45 },
      { cx: 1145.4, cy: 224.1, size: 159.8, rot: -15 },
    ],
  },
];

const CARD_W = 242;
const CARD_H = 312;
const EASE = "transform 400ms cubic-bezier(0.42, 0, 0.58, 1)";

export function SellSteps() {
  // 0 = bez hovera, 1–3 = miš je na koraku 01–03.
  const [active, setActive] = useState(0);

  return (
    <section className="mx-auto h-[792px] max-w-site pt-[50px]">
      <div className="mx-auto flex w-[416px] flex-col items-center text-center">
        <h2 className="trim-cap text-[48px] font-semibold leading-[1.1] tracking-[-2.4px] text-black">
          Napravi{" "}
          <span className="font-serif text-[56px] font-semibold italic tracking-[-2.24px]">mesta</span> za još
          knjiga
        </h2>
        <p className="trim-cap mt-[42px] text-[16px] font-medium leading-[0.95] tracking-[-0.64px] text-[#7c7c7c]">
          Poveži se s čitaocima i daj starim knjigama novi život.
        </p>
        <MainButton href="/prodaj" size="md" className="mt-[32px]">
          Započni prodaju
        </MainButton>
      </div>

      <div className="relative mt-[32px] h-[496px] w-[1440px]" onMouseLeave={() => setActive(0)}>
        {STEPS.map((s, i) => {
          const c0 = s.card[0];
          const c = s.card[active];
          const p0 = s.icon[0];
          const p = s.icon[active];
          const enter = () => setActive(i + 1);
          return (
            <div key={s.n} className="contents">
              <div
                onMouseEnter={enter}
                className="absolute h-[312px] w-[242px] overflow-hidden rounded-[15px] bg-[#f5f6f8] px-[25px] pt-[26px] text-black"
                style={{
                  left: c0.cx - CARD_W / 2,
                  top: c0.cy - CARD_H / 2,
                  transform: `translate(${c.cx - c0.cx}px, ${c.cy - c0.cy}px) rotate(${-c.rot}deg) scale(${c.size / CARD_W})`,
                  transition: EASE,
                  zIndex: active === i + 1 ? 2 : 1,
                }}
              >
                <p className="text-[11px] leading-[1.4]">{s.n}</p>
                <h3 className="mt-[9px] font-serif text-[15px] font-bold italic leading-[1.4]">{s.title}</h3>
                <p className="mt-[7px] h-[141px] text-[15px] leading-[1.4]">{s.body}</p>
                <p className="border-t-[0.3px] border-[#8c8c8c] pt-[18px] text-[10px] leading-[1.89]">{s.note}</p>
              </div>
              {/* Slika je izvezena već nagnuta (ugao iz stanja bez hovera), pa se okreće za razliku. */}
              <Image
                src={s.img.src}
                alt=""
                width={Math.round(s.img.w)}
                height={Math.round(s.img.h)}
                className="pointer-events-none absolute"
                style={{
                  left: p0.cx - s.img.w / 2,
                  top: p0.cy - s.img.h / 2,
                  width: s.img.w,
                  height: s.img.h,
                  maxWidth: "none",
                  transform: `translate(${p.cx - p0.cx}px, ${p.cy - p0.cy}px) rotate(${-(p.rot - p0.rot)}deg) scale(${p.size / s.img.base})`,
                  transition: EASE,
                  zIndex: 3,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
