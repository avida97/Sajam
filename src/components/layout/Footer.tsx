import Image from "next/image";
import Link from "next/link";
import { MainButton } from "@/components/ui/MainButton";

// Footer iz Figme (komponenta „Footer“, 725:16773). Tekstovi su kao u dizajnu.
const COLUMNS = [
  {
    title: "Company",
    links: [
      { name: "Feedback", href: "/kontakt/forma" },
      { name: "Trust, Safety & Security", href: "/pomoc/nalog/bezbedna-kupovina" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Cookie Policy", href: "/privatnost#kolacici" },
      { name: "Terms of Service", href: "/uslovi-koriscenja" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { name: "Cookie Policy", href: "/privatnost#kolacici" },
      { name: "Terms of Service", href: "/uslovi-koriscenja" },
      { name: "Privacy Policy", href: "/privatnost" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Cookie Policy", href: "/privatnost#kolacici" },
      { name: "Terms of Service", href: "/uslovi-koriscenja" },
      { name: "Privacy Policy", href: "/privatnost" },
    ],
    width: "w-[114px]",
  },
];

// Adrese naloga na mrežama još nisu poznate; dodaju se kad budu otvoreni.
const SOCIALS = [
  { name: "X", icon: "/icons/social-x.svg", href: "#" },
  { name: "Instagram", icon: "/icons/social-instagram.svg", href: "#" },
  { name: "Facebook", icon: "/icons/social-facebook.svg", href: "#" },
  { name: "LinkedIn", icon: "/icons/social-linkedin.svg", href: "#" },
  { name: "Threads", icon: "/icons/social-threads.svg", href: "#" },
];

const APPS = [
  { name: "iOS", icon: "/icons/app-apple.svg" },
  { name: "Android", icon: "/icons/app-android.svg" },
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
            <span className="text-[48px]">Try </span>
            <span className="font-serif text-[56px] italic">Sajam</span>
            <span className="text-[48px]"> now</span>
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
          <div className="flex items-center justify-between pb-[25px]">
            <div className="flex items-center">
              <p className="w-[78px] text-[12px] leading-[0.95] tracking-[-0.12px]">Follow Us</p>
              <div className="flex items-center gap-[24px]">
                {SOCIALS.map((s) => (
                  <a key={s.name} href={s.href} aria-label={s.name}>
                    <Image src={s.icon} alt="" width={16} height={16} />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-[24px]">
              <p className="text-[12px] leading-[0.95] tracking-[-0.12px]">Mobile app</p>
              {APPS.map((a) => (
                <span key={a.name} aria-label={a.name}>
                  <Image src={a.icon} alt="" width={16} height={16} />
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-divider-dark pt-[25px] text-center text-[12px] leading-[0.95] tracking-[-0.12px]">
            2026 Sajam Balkan doo
          </div>
        </div>
      </div>
    </footer>
  );
}
