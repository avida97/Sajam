import Image from "next/image";
import Link from "next/link";
import { MainButton } from "@/components/ui/MainButton";

// Footer iz Figme (komponenta „Footer“, 725:16773), sa tekstovima na srpskom.
// Kolone su prevedene na srpski (odluka V 11. 11. 2026); umesto linkova koji se u dizajnu
// ponavljaju po kolonama, svaka kolona vodi na postojeće stranice.
const COLUMNS = [
  {
    title: "Sajam",
    links: [
      { name: "O nama", href: "/o-nama" },
      { name: "Kontakt", href: "/kontakt" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Istraži",
    links: [
      { name: "Knjige", href: "/knjige" },
      { name: "Muzika", href: "/muzika" },
      { name: "Igre", href: "/igre" },
    ],
  },
  {
    title: "Pomoć i podrška",
    links: [
      { name: "Centar za pomoć", href: "/pomoc" },
      { name: "Bezbednost", href: "/pomoc/nalog/bezbedna-kupovina" },
      { name: "Utisci i predlozi", href: "/kontakt/forma?tema=utisci" },
    ],
  },
  {
    title: "Pravila",
    links: [
      { name: "Uslovi korišćenja", href: "/uslovi-koriscenja" },
      { name: "Politika privatnosti", href: "/privatnost" },
      { name: "Politika kolačića", href: "/kolacici" },
    ],
    width: "w-[114px]",
  },
];

// Adrese naloga na mrežama još nisu poznate; dodaju se kad budu otvoreni.
const SOCIALS = [
  { name: "Instagram", icon: "/icons/social-instagram.svg", href: "#" },
  { name: "Facebook", icon: "/icons/social-facebook.svg", href: "#" },
  { name: "LinkedIn", icon: "/icons/social-linkedin.svg", href: "#" },
];

export function Footer() {
  return (
    <footer className="px-[14px] pb-[14px]">
      <div className="mx-auto max-w-[1412px] overflow-hidden rounded-[25px] bg-ink pb-[48px] pt-[70px] text-white">
        <div className="mx-auto flex w-[317px] flex-col items-center text-center">
          <p className="text-[12px] font-medium leading-[0.95] tracking-[-0.48px] text-muted">
            Poveži se s čitaocima i daj starim knjigama novi život
          </p>
          <p className="mt-[17px] whitespace-nowrap font-semibold leading-[1.1] tracking-[-2.4px]">
            <span className="text-[48px]">Doživi </span>
            <span className="font-serif text-[56px] italic">Sajam</span>
            <span className="text-[48px]"> online</span>
          </p>
          <MainButton href="/prodaj" variant="light" size="md" className="mt-[10px]">
            Započni prodaju
          </MainButton>
        </div>

        <div className="mt-[78px] flex justify-center gap-[115px] leading-[0.95]">
          {COLUMNS.map((col) => (
            <div key={col.title} className={`flex flex-col gap-[17px] ${col.width ?? "w-[131px]"}`}>
              <p className="text-[14px] font-semibold tracking-[-0.14px]">{col.title}</p>
              {col.links.map((l) => (
                <Link
                  key={l.name}
                  href={l.href}
                  className="text-[12px] tracking-[-0.12px] hover:underline"
                >
                  {l.name}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-[56px] w-[970px]">
          <div className="flex items-center pb-[25px]">
            <p className="mr-[24px] text-[12px] leading-[0.95] tracking-[-0.12px]">Budi deo Sajma</p>
            <div className="flex items-center gap-[24px]">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name}>
                  <Image src={s.icon} alt="" width={16} height={16} />
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-divider-dark pt-[25px] text-center text-[12px] leading-[0.95] tracking-[-0.12px]">
            © 2026 Sajam. Sva prava zadržana.
          </div>
        </div>
      </div>
    </footer>
  );
}
