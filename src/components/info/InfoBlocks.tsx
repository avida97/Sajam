import Image from "next/image";
import Link from "next/link";
import { MainButton } from "@/components/ui/MainButton";

// Delovi stranice „Kontakt“ (Figma 816:17371), koje koristi i „O nama“.

/** Naslov 48 px sa rečima u serifu 56 px: delovi u nizu `serif` su iskošeni. */
export function MixedTitle({
  parts,
  as: Tag = "h1",
  className = "",
}: {
  parts: Array<string | { serif: string } | { br: true }>;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag className={`text-center text-[48px] font-semibold leading-[1.1] tracking-[-2.4px] text-black ${className}`}>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : "br" in p ? (
          <br key={i} />
        ) : (
          <span key={i} className="font-serif text-[56px] italic tracking-[-2.8px]">
            {p.serif}
          </span>
        ),
      )}
    </Tag>
  );
}

export function ButtonPair({
  primary,
  secondary,
  className = "",
}: {
  primary: { href: string; label: string; active?: boolean };
  secondary: { href: string; label: string; active?: boolean };
  className?: string;
}) {
  // Kad je zadato `active`, dugmad rade kao prekidač: aktivno je crno.
  const dark = (b: { active?: boolean }, fallback: boolean) => (b.active === undefined ? fallback : b.active);
  return (
    <div className={`flex justify-center gap-[10px] ${className}`}>
      {[
        { ...primary, d: dark(primary, true) },
        { ...secondary, d: dark(secondary, false) },
      ].map((b) => (
        <MainButton
          key={b.href}
          href={b.href}
          size="md"
          scroll={b.active === undefined}
          aria-current={b.active ? "page" : undefined}
          variant={b.d ? "dark" : "light"}
          className={b.d ? "" : "border-[#e1e1e1]"}
        >
          {b.label}
        </MainButton>
      ))}
    </div>
  );
}

// expand: hover po Figmi („contact cards components“ 824:16911): kartica ispod miša se širi
// na 636px i prikazuje sliku desno, a ostale se sužavaju na 306px (ukupna širina ostaje ista).
export function InfoCards({
  cards,
  expand,
}: {
  cards: Array<{ title: string; body: string; link: { href: string; label: string }; image?: string }>;
  expand?: boolean;
}) {
  return (
    <div className="info-cards mx-auto flex max-w-site justify-center gap-[24px] px-[72px]">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`info-card group/card relative flex h-[267px] w-[416px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-[#f5f6f8] px-[20px] pb-[30px] pt-[30px] text-black ${
            expand
              ? "transition-[width] duration-300 ease-out [.info-cards:has(>.info-card:hover)_&]:w-[306px] hover:!w-[636px]"
              : ""
          }`}
        >
          <div className={`flex h-full flex-col ${expand ? "group-hover/card:w-[286px]" : ""}`}>
            <h2 className="text-[20px] leading-[1.2]">{c.title}</h2>
            <p className="mt-[15px] text-[14px] leading-[1.45]">{c.body}</p>
            <Link href={c.link.href} className="mt-auto flex items-center gap-[8px] text-[12px] hover:underline">
              {c.link.label}
              <Image src="/icons/chevron-right.svg" alt="" width={4} height={7} />
            </Link>
          </div>
          {expand && c.image && (
            <Image
              src={c.image}
              alt=""
              width={298}
              height={251}
              className="pointer-events-none absolute right-[8px] top-[8px] h-[251px] w-[298px] max-w-none rounded-[20px] object-cover opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
            />
          )}
        </div>
      ))}
    </div>
  );
}
