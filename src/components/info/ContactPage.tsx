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

// Kontakt po Figmi („Kontakt“ 816:17371). Tekstovi kartica su iz dizajna. Prekidač
// „Sajam novosti“ je uklonjen zajedno sa stranicom Mediji i novosti (odluka V 11. 11. 2026).
export function ContactPage() {
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
          expand
          cards={[
            {
              title: "Pozovite naš prodajni tim",
              body: "Pitate se da li je Sajam pravi izbor za vaš biznis? Tu smo da vas provedemo kroz rešenja, cene i opcije prilagođene vašim potrebama.",
              link: { href: "/kontakt/forma?tema=saradnja", label: "Kontaktirajte prodajni tim" },
              image: "/images/kontakt/kartica-1.png",
            },
            {
              title: "Postanite affiliate partner",
              body: "Volimo da sarađujemo sa stručnjacima koji prepoznaju vrednost kvalitetnog saobraćaja i stvarnih rezultata. Hajde da se povežemo i izgradimo obostrano korisno partnerstvo.",
              link: { href: "/kontakt/forma?tema=saradnja", label: "Pridružite se našem affiliate programu" },
              image: "/images/kontakt/kartica-2.png",
            },
            {
              title: "Istražite mogućnosti partnerstva",
              body: "Uvek smo otvoreni za zajedničko stvaranje vrednosti - bilo da je u pitanju co-marketing kampanja, integracija platforme ili nešto neočekivano",
              link: { href: "/kontakt/forma?tema=saradnja", label: "Pošaljite email našem timu" },
              image: "/images/kontakt/kartica-3.png",
            },
          ]}
        />
      </div>

      <section id="pratite" className="mt-[101px] flex scroll-mt-[40px] flex-col items-center text-center">
        <p className="text-[16px] font-medium text-[#666]">Saznaj šta vredi kupiti, kako izabrati i gde ih pronaći</p>
        <MixedTitle as="h2" className="mt-[14px]" parts={["Mi prodajemo, vi ", { serif: "pratite" }]} />
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
