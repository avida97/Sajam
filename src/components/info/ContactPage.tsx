import Image from "next/image";
import { ButtonPair, InfoCards, MixedTitle } from "@/components/info/InfoBlocks";

// Adrese naloga na mrežama još nisu poznate; dodaju se kad budu otvoreni (isto kao u footeru).
const SOCIALS = [
  { name: "Instagram", icon: "instagram" },
  { name: "Facebook", icon: "facebook" },
  { name: "LinkedIn", icon: "linkedin" },
];

// Redosled slika kao u Figmi (kasete prve); na 4. i 8. je ikonica videa umesto Instagrama.
const STRIP = [10, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const VIDEO = [3, 7];

// Kontakt po Figmi („Kontakt“ 816:17371). Tekstovi prepravljeni 13. 11. 2026 (V): ti umesto vi, bez šablona za softverske firme. Prekidač
// „Sajam novosti“ je uklonjen zajedno sa stranicom Mediji i novosti (odluka V 11. 11. 2026).
export function ContactPage() {
  return (
    <div className="pb-[120px]">
      <section className="mx-auto flex w-[572px] flex-col items-center pt-[62px] text-center">
        <MixedTitle parts={["Imaš ", { serif: "pitanje" }, "?", { br: true }, "Tu ", { serif: "smo" }, "."]} />
        <p className="mt-[26px] w-[550px] text-[16px] font-medium leading-[1.4] text-[#666]">
          Većina odgovora je već u Centru za pomoć. Ako ne nađeš svoj, piši nam.
        </p>
        <ButtonPair
          className="mt-[30px]"
          primary={{ href: "/pomoc", label: "Centar za pomoć" }}
          secondary={{ href: "/kontakt/forma", label: "Pošalji zahtev" }}
        />
      </section>

      <div className="mt-[116px]">
        <InfoCards
          expand
          cards={[
            {
              title: "Pomoć oko naloga i oglasa",
              body: "Nešto ne radi, ne možeš da se prijaviš ili imaš pitanje o oglasu? Piši nam i javićemo se imejlom.",
              link: { href: "/kontakt/forma", label: "Piši nam" },
              image: "/images/kontakt/kartica-1.png",
            },
            {
              title: "Saradnja za knjižare i izdavače",
              body: "Imaš knjižaru, antikvarijat, izdavačku kuću ili prodavnicu ploča i igara? Pogledaj kako možemo da sarađujemo.",
              link: { href: "/saradnja", label: "Saznaj više" },
              image: "/images/kontakt/kartica-2.png",
            },
            {
              title: "Utisci i predlozi",
              body: "Fali ti kategorija ili imaš ideju kako da Sajam bude bolji? Čitamo svaku poruku.",
              link: { href: "/kontakt/forma?tema=utisci", label: "Pošalji predlog" },
              image: "/images/kontakt/kartica-3.png",
            },
          ]}
        />
      </div>

      <section id="pratite" className="mt-[101px] flex scroll-mt-[40px] flex-col items-center text-center">
        <p className="text-[16px] font-medium text-[#666]">Novosti, preporuke i priče iz sveta knjiga, muzike i igara</p>
        <MixedTitle as="h2" className="mt-[14px]" parts={["Prati ", { serif: "nas" }]} />
        {/* Hover (Figma „social icons components“ 839:17265): crni krug, bela ikonica i prsten. */}
        <div className="mt-[40px] flex items-center gap-[20px]">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href="#"
              aria-label={s.name}
              className="group relative flex size-[30px] items-center justify-center rounded-full bg-[#f5f6f8] transition-colors hover:bg-black hover:shadow-[0_0_0_3px_#fff,0_0_0_5px_#000] focus-visible:bg-black focus-visible:outline-none"
            >
              <Image src={`/icons/social-${s.icon}-dark.svg`} alt="" width={16} height={16} className="group-hover:hidden group-focus-visible:hidden" />
              <Image src={`/icons/social-${s.icon}.svg`} alt="" width={16} height={16} className="hidden group-hover:block group-focus-visible:block" />
            </a>
          ))}
        </div>
        {/* Hover (Figma „INSTAGRAM IMAGES“ 842:17661): zamućenje, tamni sloj i ikonica objave. */}
        <div className="mt-[47px] flex w-full justify-center gap-[10px] overflow-hidden">
          {STRIP.map((file, i) => (
            <a key={i} href="#" aria-label="Objava na Instagramu" className="group relative size-[196px] shrink-0 overflow-hidden">
              <Image
                src={`/images/kontakt/mreze-${file}.png`}
                alt=""
                width={196}
                height={196}
                className="size-[196px] max-w-none object-cover transition-[filter] duration-200 group-hover:blur-[4px]"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Image src={VIDEO.includes(i) ? "/icons/play-white.svg" : "/icons/social-instagram.svg"} alt="" width={16} height={16} />
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
