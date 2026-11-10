"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";
import { MENU_PANELS, type MenuPanel } from "@/lib/nav-menu";

type NavUser = {
  avatarUrl: string | null;
  displayName: string;
  unreadNotifications: number;
} | null;

export function NavBarClient({ user }: { user: NavUser }) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panel = MENU_PANELS.find((p) => p.key === open) ?? null;
  const pathname = usePathname();
  const authHref = (view: "prijava" | "registracija") => `${pathname}?nalog=${view}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={ref} className="relative z-40" onMouseLeave={() => setOpen(null)}>
      {/* 1. red: pretraga, jezik, logo, ikonice, dugme */}
      <div className="h-[59px] border-b-[0.7px] border-line bg-white">
        <div className="relative mx-auto flex h-full max-w-site items-center px-[72px]">
          <form action="/pretraga" className="relative h-[39px] w-[357px]" role="search">
            <Image
              src="/icons/search.svg"
              alt=""
              width={18}
              height={17}
              className="pointer-events-none absolute left-[10px] top-[11px]"
            />
            <input
              name="q"
              type="search"
              placeholder="Search by brand, item..."
              aria-label="Pretraga"
              className="h-full w-full rounded-[97px] bg-field pl-[36px] pr-4 text-[12px] font-medium text-black placeholder:text-black focus:outline-none"
            />
          </form>

          <button
            type="button"
            aria-label="Jezik: srpski"
            className="ml-[18px] flex h-[21px] items-center gap-[8px]"
          >
            <Image src="/icons/flag-sr.png" alt="" width={21} height={21} className="rounded-full" />
            <Image src="/icons/chevron-down.svg" alt="" width={9} height={5} />
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-logo text-[24px] font-bold leading-none text-black"
          >
            SAJAM
          </Link>

          <div className="ml-auto flex items-center">
            {user ? (
              <>
                <Link href="/omiljeno" aria-label="Omiljeni artikli" className="block">
                  <Image src="/icons/like.svg" alt="" width={26} height={23} />
                </Link>
                <Link
                  href="/obavestenja"
                  aria-label="Obaveštenja"
                  className="relative ml-[30px] block h-[31px] w-[24px]"
                >
                  <Image src="/icons/bell.svg" alt="" width={21} height={24} className="absolute left-0 top-[1px]" />
                  {user.unreadNotifications > 0 && (
                    <span className="absolute left-[10px] top-[17px] flex size-[14px] items-center justify-center rounded-full bg-alert text-[8px] font-medium leading-none text-white">
                      {user.unreadNotifications > 9 ? "9+" : user.unreadNotifications}
                    </span>
                  )}
                </Link>
                <Link
                  href="/moj-profil"
                  aria-label={`Profil: ${user.displayName}`}
                  className="ml-[26px] block size-[29px] overflow-hidden rounded-full bg-field"
                >
                  {user.avatarUrl && (
                    <Image src={user.avatarUrl} alt="" width={29} height={29} className="size-full object-cover" />
                  )}
                </Link>
              </>
            ) : (
              // Neprijavljen posetilac (Figma: nav bar na ekranu „Prijavi se“ 912:27724).
              <>
                <Link href={authHref("registracija")} replace scroll={false} className="trim-cap text-[14px] font-medium text-black">
                  Registruj se
                </Link>
                <Link href={authHref("prijava")} replace scroll={false} className="trim-cap ml-[25px] text-[14px] font-medium text-black">
                  Prijavi se
                </Link>
              </>
            )}
            <MainButton href="/prodaj" className="ml-[29px]">
              Započni prodaju
            </MainButton>
          </div>
        </div>
      </div>

      {/* 2. red: meni kategorija */}
      <nav aria-label="Kategorije" className="h-[67px] border-b-[0.7px] border-line bg-white">
        <ul className="flex h-full items-center justify-center">
          {MENU_PANELS.map((p) => {
            const active = open === p.key;
            return (
              <li key={p.key}>
                <button
                  type="button"
                  aria-expanded={active}
                  onMouseEnter={() => setOpen(p.key)}
                  onClick={() => setOpen(active ? null : p.key)}
                  className={`flex items-center gap-[10px] rounded-[118px] px-[20px] py-[11px] text-[12px] font-medium leading-none text-black ${active ? "bg-field" : ""}`}
                >
                  {p.label}
                  <Image
                    src="/icons/chevron-down.svg"
                    alt=""
                    width={9}
                    height={5}
                    className={active ? "rotate-180" : ""}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {panel && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-[126px] bg-black/50"
            onClick={() => setOpen(null)}
            aria-hidden
          />
          <MegaMenu panel={panel} onNavigate={() => setOpen(null)} />
        </>
      )}
    </header>
  );
}

function MegaMenu({ panel, onNavigate }: { panel: MenuPanel; onNavigate: () => void }) {
  return (
    <div
      style={{ height: panel.items.length > 6 ? 370 : 289 }}
      className="absolute left-1/2 top-[136px] w-[937px] -translate-x-1/2 overflow-hidden rounded-[10px] bg-white">
      <Link
        href={panel.href}
        onClick={onNavigate}
        className="absolute left-[27px] top-[31px] flex w-[178px] flex-col gap-[20px] font-medium"
      >
        <span className="text-[27px] leading-none text-black">{panel.title}</span>
        <span className="text-[15px] leading-[1.5] text-[#777574]">{panel.description}</span>
      </Link>

      <ul
        className="absolute left-[241px] top-[42px] grid grid-flow-col grid-cols-[156px_156px] gap-x-[45px] gap-y-[17px] font-medium"
        style={{ gridTemplateRows: `repeat(${Math.max(3, Math.ceil(panel.items.length / 2))}, auto)` }}
      >
        {panel.items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} onClick={onNavigate} className="flex flex-col gap-[10px]">
              <span className="text-[14px] leading-none text-black">{item.name}</span>
              <span className="text-[12px] leading-[1.5] text-[#777574]">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={panel.ctaHref}
        onClick={onNavigate}
        className="absolute left-[654px] top-[27px] block w-[254px]"
      >
        {/* Fotografija iz Figme; dok se ne izveze, prikazuje se siva pozadina iz dizajna (#9e9e9e). */}
        <span
          className="relative block h-[153px] w-[254px] overflow-hidden rounded-[5px] bg-[#9e9e9e] bg-cover bg-center"
          style={{ backgroundImage: `url(${panel.image})` }}
        >
          <span className="absolute left-[212px] top-[110px] size-[27px] rounded-[54px] bg-white" />
        </span>
        <span className="mt-[16px] block text-[14px] font-medium leading-[1.5] text-black">
          {panel.ctaText}
        </span>
      </Link>
    </div>
  );
}
