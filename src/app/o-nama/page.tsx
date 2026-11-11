import type { Metadata } from "next";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { HelpCta } from "@/components/help/HelpHome";
import { ButtonPair, InfoCards, MixedTitle } from "@/components/info/InfoBlocks";

export const metadata: Metadata = { title: "O nama" };

// „O nama“ nema dizajn u Figmi (okvir 873:19401 je prazan). Stranica je složena od delova
// stranica Kontakt, Početna i Pomoć, za Ankin pregled.
export default function AboutPage() {
  return (
    <div className="pb-[76px]">
      <section className="mx-auto flex w-[640px] flex-col items-center pt-[62px] text-center">
        <MixedTitle parts={["Daj starim ", { serif: "knjigama" }, { br: true }, "novi ", { serif: "život" }]} />
        <p className="mt-[26px] w-[580px] text-[16px] font-medium leading-[1.4] text-[#666]">
          Sajam je mesto gde ljubitelji knjiga, muzike, igara, mangi i stripova kupuju i prodaju ono što im više ne
          treba. Prodavci besplatno objavljuju oglase, a kupci se sa njima dogovaraju porukama.
        </p>
        <ButtonPair
          className="mt-[30px]"
          primary={{ href: "/prodaj", label: "Započni prodaju" }}
          secondary={{ href: "/pomoc", label: "Pomoćni centar" }}
        />
      </section>

      <div className="mt-[116px]">
        <InfoCards
          cards={[
            {
              title: "Besplatno za sve",
              body: "Objava oglasa i prodaja su besplatne. Nema naknade za oglas ni provizije na prodaju, a kupac plaća samo artikal i poštarinu.",
              link: { href: "/pomoc/prodaja/naknade", label: "Naknade" },
            },
            {
              title: "Dogovor porukama",
              body: "Kupac i prodavac se dogovaraju direktno, kroz poruke na Sajmu: o stanju, ceni, slanju i načinu plaćanja.",
              link: { href: "/pomoc/kupovina/pisanje-prodavcu", label: "Kako da pišem prodavcu" },
            },
            {
              title: "Ocene posle svake prodaje",
              body: "Prodavca mogu da ocene samo kupci kojima je artikal stvarno prodat, pa ocene na profilu pokazuju pravo iskustvo.",
              link: { href: "/pomoc/nalog/kako-rade-ocene", label: "Kako rade ocene" },
            },
          ]}
        />
      </div>

      <div className="mt-[70px]">
        <CategoryTiles />
      </div>

      <HelpCta title="Imaš pitanje za nas?" />
    </div>
  );
}
