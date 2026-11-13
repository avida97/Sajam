import type { Metadata } from "next";
import { ButtonPair, InfoCards, MixedTitle } from "@/components/info/InfoBlocks";

export const metadata: Metadata = { title: "Saradnja" };

const FORM = "/kontakt/forma?tema=saradnja";

// Stranica za biznise umesto „Mediji i novosti“ (odluka V 11. 11. 2026). U Figmi nema
// dizajna, pa je složena od delova stranica Kontakt i O nama, za Ankin pregled.
export default function PartnersPage() {
  return (
    <div className="pb-[120px]">
      <section className="mx-auto flex w-[640px] flex-col items-center pt-[62px] text-center">
        <MixedTitle parts={["Rastimo ", { serif: "zajedno" }]} />
        <p className="mt-[26px] w-[580px] text-[16px] font-medium leading-[1.4] text-[#666]">
          Knjižare, antikvarijati, izdavači, prodavnice ploča i igara ili brendovi koji vole isto što i naši čitaoci:
          na Sajmu vas pronalaze ljudi koji traže baš ono što imate.
        </p>
        <ButtonPair
          className="mt-[30px]"
          primary={{ href: FORM, label: "Postani partner" }}
          secondary={{ href: "/pomoc/prodaja", label: "Kako radi prodaja" }}
        />
      </section>

      <div className="mt-[116px]">
        <InfoCards
          cards={[
            {
              title: "Prodajte kao radnja",
              body: "Objavite ponudu svoje knjižare, antikvarijata ili prodavnice ploča i igara. Oglasi su besplatni i bez provizije, a kupci vam pišu direktno.",
              link: { href: FORM, label: "Javite nam se" },
            },
            {
              title: "Izdavači i autori",
              body: "Predstavite svoja izdanja čitaocima koji traže baš takve naslove. Hajde da zajedno smislimo kako da vaše knjige stignu do pravih ljudi.",
              link: { href: FORM, label: "Predložite saradnju" },
            },
            {
              title: "Zajedničke kampanje",
              body: "Co-marketing, događaji, sajmovi knjiga ili nešto neočekivano. Uvek smo otvoreni za saradnju koja donosi nešto dobro čitaocima.",
              link: { href: FORM, label: "Pošaljite nam ideju" },
            },
          ]}
        />
      </div>

      <section className="mt-[101px] flex flex-col items-center text-center">
        <p className="text-[16px] font-medium text-[#666]">Oglasi su trenutno bez naknade i bez provizije</p>
        <MixedTitle as="h2" className="mt-[14px]" parts={["Imate ", { serif: "ideju" }, "?"]} />
        <p className="mt-[20px] w-[480px] text-[16px] leading-[1.4] text-[#666]">
          Napišite nam ko ste i šta biste voleli da radimo zajedno. Javljamo se imejlom.
        </p>
        <ButtonPair
          className="mt-[30px]"
          primary={{ href: FORM, label: "Pošalji zahtev" }}
          secondary={{ href: "/kontakt", label: "Kontakt" }}
        />
      </section>
    </div>
  );
}
