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

export function InfoCards({
  cards,
}: {
  cards: Array<{ title: string; body: string; link: { href: string; label: string } }>;
}) {
  return (
    <div className="mx-auto flex max-w-site justify-center gap-[24px] px-[72px]">
      {cards.map((c) => (
        <div key={c.title} className="flex h-[267px] w-[416px] flex-col rounded-[20px] bg-[#f5f6f8] px-[20px] pb-[30px] pt-[30px] text-black">
          <h2 className="text-[20px] leading-[1.2]">{c.title}</h2>
          <p className="mt-[15px] text-[14px] leading-[1.45]">{c.body}</p>
          <Link href={c.link.href} className="mt-auto flex items-center gap-[8px] text-[12px] hover:underline">
            {c.link.label}
            <Image src="/icons/chevron-right.svg" alt="" width={4} height={7} />
          </Link>
        </div>
      ))}
    </div>
  );
}
