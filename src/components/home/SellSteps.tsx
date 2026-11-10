import Image from "next/image";
import { MainButton } from "@/components/ui/MainButton";

// „Napravi mesta za još knjiga“ (Figma 412:13259, varijanta „Frame 25“ komponente 278:651):
// tri nagnute kartice sa koracima i 3D ikonicama. Položaji su preneti iz dizajna (platno 1440 px).
const STEPS = [
  {
    n: "03",
    title: "Prodaj knjigu",
    body: "Prodato! Spakuj knjigu, ispiši unapred plaćenu oznaku za slanje i pošalji paket.",
    note: "Brzo slanje i dobro pakovanje pomažu da kupac dobije knjigu sigurno i na vreme.",
    card: { cx: 1030.67, cy: 227.99, rot: 7.23 },
    img: { src: "/images/pocetna/prodaj.png", left: 997, top: 119, w: 227.76, h: 244.96 },
  },
  {
    n: "01",
    title: "Napravi profil",
    body: "Popuni osnovne informacije o sebi i dodaj fotografiju profila. Nakon toga možeš početi koristiti aplikaciju.",
    note: "Dobro popunjen profil olakšava komunikaciju i pomaže drugim korisnicima da te brže prepoznaju.",
    card: { cx: 407.92, cy: 236.05, rot: 4.52 },
    img: { src: "/images/pocetna/profil.png", left: 437.57, top: 161.71, w: 186.16, h: 186.16 },
  },
  {
    n: "02",
    title: "Postavi oglas",
    body: "Slikaj ili snimi knjigu, opiši je i odredi cenu. Dodirni “Dodaj” i oglas će biti aktivan.",
    note: "Što više detalja dodaš u opis i fotografije, veća je verovatnoća da će se kupci javiti.",
    card: { cx: 717.51, cy: 277, rot: -3.97 },
    img: { src: "/images/pocetna/oglas.png", left: 727, top: 161, w: 208.56, h: 208.56 },
  },
];

export function SellSteps() {
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

      <div className="relative mt-[32px] h-[496px] w-[1440px]">
        {STEPS.map((s) => (
          <div key={s.n} className="contents">
            <div
              className="absolute h-[312px] w-[242px] overflow-hidden rounded-[15px] bg-[#f5f6f8] px-[25px] pt-[26px] text-black"
              style={{ left: s.card.cx - 121, top: s.card.cy - 156, transform: `rotate(${s.card.rot}deg)` }}
            >
              <p className="text-[11px] leading-[1.4]">{s.n}</p>
              <h3 className="mt-[9px] font-serif text-[15px] font-bold italic leading-[1.4]">{s.title}</h3>
              <p className="mt-[7px] h-[141px] text-[15px] leading-[1.4]">{s.body}</p>
              <p className="border-t-[0.3px] border-[#8c8c8c] pt-[18px] text-[10px] leading-[1.89]">{s.note}</p>
            </div>
            <Image
              src={s.img.src}
              alt=""
              width={Math.round(s.img.w)}
              height={Math.round(s.img.h)}
              className="pointer-events-none absolute"
              style={{ left: s.img.left, top: s.img.top, width: s.img.w, height: s.img.h }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
