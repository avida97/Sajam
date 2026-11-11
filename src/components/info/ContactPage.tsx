import Image from "next/image";
import { ButtonPair, InfoCards, MixedTitle } from "@/components/info/InfoBlocks";

// Adrese naloga na mrežama još nisu poznate; dodaju se kad budu otvoreni (isto kao u footeru).
const SOCIALS = [
  { name: "Instagram", icon: "instagram" },
  { name: "Facebook", icon: "facebook" },
  { name: "LinkedIn", icon: "linkedin" },
];

// Kontakt po Figmi („Kontakt“ 816:17371, varijanta „Mediji“ 842:18315). Tekstovi kartica su iz dizajna.
export function ContactPage({ tab }: { tab: "mreze" | "novosti" }) {
  return (
    <div className="pb-[120px]">
      <section className="mx-auto flex w-[572px] flex-col items-center pt-[62px] text-center">
        <MixedTitle parts={["Imate ", { serif: "pitanja" }, "?", { br: true }, "Mi imamo ", { serif: "odgovore" }, "!"]} />
        <p className="mt-[26px] w-[550px] text-[16px] font-medium leading-[1.4] text-[#666]">
          Bez obzira da li ste radoznali kako se Sajam uklapa u vaš stek, istražujete partnerstvo ili vam je samo
          potrebna pomoć da započnete - tu smo za vas.
        </p>
        <ButtonPair
          className="mt-[30px]"
          primary={{ href: "/pomoc", label: "Pomoćni centar" }}
          secondary={{ href: "/kontakt/forma", label: "Pošalji zahtev" }}
        />
      </section>

      <div className="mt-[116px]">
        <InfoCards
          cards={[
            {
              title: "Pozovite naš prodajni tim",
              body: "Pitate se da li je Sajam pravi izbor za vaš biznis? Tu smo da vas provedemo kroz rešenja, cene i opcije prilagođene vašim potrebama.",
              link: { href: "/kontakt/forma?tema=prodaja", label: "Kontaktirajte prodajni tim" },
            },
            {
              title: "Postanite affiliate partner",
              body: "Volimo da sarađujemo sa stručnjacima koji prepoznaju vrednost kvalitetnog saobraćaja i stvarnih rezultata. Hajde da se povežemo i izgradimo obostrano korisno partnerstvo.",
              link: { href: "/kontakt/forma", label: "Pridružite se našem affiliate programu" },
            },
            {
              title: "Istražite mogućnosti partnerstva",
              body: "Uvek smo otvoreni za zajedničko stvaranje vrednosti - bilo da je u pitanju co-marketing kampanja, integracija platforme ili nešto neočekivano",
              link: { href: "/kontakt/forma", label: "Pošaljite email našem timu" },
            },
          ]}
        />
      </div>

      <section id="pratite" className="mt-[101px] flex scroll-mt-[40px] flex-col items-center text-center">
        <p className="text-[16px] font-medium text-[#666]">Saznaj šta vredi kupiti, kako izabrati i gde ih pronaći</p>
        <MixedTitle as="h2" className="mt-[14px]" parts={["Mi prodajemo, vi ", { serif: "pratite" }]} />
        <ButtonPair
          className="mt-[24px]"
          primary={{ href: "/kontakt#pratite", label: "Društvene mreže", active: tab === "mreze" }}
          secondary={{ href: "/kontakt/mediji#pratite", label: "Sajam novosti", active: tab === "novosti" }}
        />

        {tab === "mreze" ? (
          <>
            <div className="mt-[66px] flex items-center gap-[34px]">
              {SOCIALS.map((s) => (
                <a key={s.name} href="#" aria-label={s.name}>
                  <Image src={`/icons/social-${s.icon}-dark.svg`} alt="" width={16} height={16} />
                </a>
              ))}
            </div>
            <div className="mt-[54px] flex w-full justify-center gap-[10px] overflow-hidden">
              {Array.from({ length: 10 }, (_, i) => (
                <Image
                  key={i}
                  src={`/images/kontakt/mreze-${i + 1}.png`}
                  alt=""
                  width={196}
                  height={196}
                  className="size-[196px] max-w-none shrink-0 object-cover"
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-[66px] w-[416px] text-[14px] leading-[1.5] text-[#666]">
            Prve novosti o Sajmu stižu uskoro. Do tada nas prati na društvenim mrežama.
          </p>
        )}
      </section>
    </div>
  );
}
