"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/MainButton";
import { MENU_PANELS, type MenuPanel } from "@/lib/nav-menu";
import { createClient } from "@/lib/supabase/client";

type NavUser = {
  id: string;
  avatarUrl: string | null;
  username: string | null;
  displayName: string;
  unreadNotifications: number;
  unreadMessages: number;
  isAdmin?: boolean;
} | null;

export function NavBarClient({ user: initial }: { user: NavUser }) {
  const user = useLiveCounts(initial);
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panel = MENU_PANELS.find((p) => p.key === open) ?? null;
  // Meni se zatvara čim miš izađe iz menija ili panela. Mala pauza dozvoljava prelaz
  // preko uskog razmaka između reda kategorija i panela.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };
  useEffect(() => cancelClose, []);
  const pathname = usePathname();
  const authHref = (view: "prijava" | "registracija") => `${pathname}?nalog=${view}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={ref} className="sticky top-0 z-40" onMouseLeave={() => setOpen(null)}>
      {/* 1. red: pretraga, jezik, logo, ikonice, dugme */}
      <div className="h-[59px] border-b-[0.7px] border-line bg-white" onMouseEnter={() => open && closeSoon()}>
        <div className="relative mx-auto flex h-full max-w-site items-center px-[72px]">
          <form action="/pretraga" className="relative h-[39px] w-[357px]" role="search">
            {/* Lupa je dugme za pretragu (uz Enter), odluka V 11. 11. 2026. */}
            <button
              type="submit"
              aria-label="Pretraži"
              className="absolute left-[4px] top-[4px] flex size-[31px] items-center justify-center rounded-full transition-colors hover:bg-black/10 focus-visible:bg-black/10 focus-visible:outline-none"
            >
              <Image src="/icons/search.svg" alt="" width={18} height={17} />
            </button>
            <input
              name="q"
              type="search"
              placeholder="Pretraži po naslovu, autoru..."
              aria-label="Pretraga"
              className="h-full w-full rounded-[97px] bg-field pl-[40px] pr-4 text-[12px] font-medium text-black placeholder:text-black focus:outline-none"
            />
          </form>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-logo text-[24px] font-bold leading-none text-black"
          >
            SAJAM
          </Link>

          <div className="ml-auto flex items-center">
            {user ? (
              <>
                <Link href="/omiljeno" aria-label="Omiljeni proizvodi" className="block">
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
                <AccountMenu user={user} />
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
                  onMouseEnter={() => {
                    cancelClose();
                    setOpen(p.key);
                  }}
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
            onMouseEnter={closeSoon}
            onClick={() => setOpen(null)}
            aria-hidden
          />
          <div onMouseEnter={cancelClose}>
            <MegaMenu panel={panel} onNavigate={() => setOpen(null)} />
          </div>
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
        className="absolute left-[19px] top-[23px] flex w-[194px] flex-col gap-[20px] rounded-[5px] p-[8px] font-medium transition-colors duration-150 hover:bg-field"
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
            <Link
              href={item.href}
              onClick={onNavigate}
              className="-m-[8px] flex flex-col gap-[10px] rounded-[5px] p-[8px] transition-colors duration-150 hover:bg-field focus-visible:bg-field focus-visible:outline-none"
            >
              <span className="text-[14px] leading-none text-black">{item.name}</span>
              <span className="text-[12px] leading-[1.5] text-[#777574]">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={panel.ctaHref}
        onClick={onNavigate}
        className="group absolute left-[654px] top-[27px] block w-[254px]"
      >
        {/* Fotografija iz Figme; dok se ne izveze, prikazuje se siva pozadina iz dizajna (#9e9e9e). */}
        <span
          className="relative block h-[153px] w-[254px] overflow-hidden rounded-[5px] bg-[#9e9e9e]"
        >
          <span
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${panel.image})` }}
          />
          <span className="absolute left-[212px] top-[110px] size-[27px] rounded-[54px] bg-white" />
        </span>
        <span className="mt-[16px] block text-[14px] font-medium leading-[1.5] text-black group-hover:underline">
          {panel.ctaText}
        </span>
      </Link>
    </div>
  );
}

// Meni ispod slike profila. Nema ga u Figmi; napravljen od panela mega-menija (bela kartica,
// zaobljena 10px, tekst 14px), za Ankin pregled.
function AccountMenu({ user }: { user: NonNullable<NavUser> }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const items: Array<{ href: string; label: string; count?: number }> = [
    { href: user.username ? `/prodavac/${user.username}` : "/moj-profil", label: "Moj profil" },
    { href: "/poruke", label: "Poruke", count: user.unreadMessages },
    { href: "/moji-oglasi", label: "Moji oglasi" },
    { href: "/sacuvane-pretrage", label: "Sačuvane pretrage" },
    { href: "/moj-profil/izmeni", label: "Podešavanja profila" },
    ...(user.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div ref={ref} className="relative ml-[26px]">
      <button
        type="button"
        aria-label={`Moj nalog: ${user.displayName}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative block size-[29px] rounded-full bg-field"
      >
        {user.avatarUrl && (
          <Image src={user.avatarUrl} alt="" width={29} height={29} className="size-full rounded-full object-cover" />
        )}
        {user.unreadMessages > 0 && (
          <span
            aria-label={`Nepročitane poruke: ${user.unreadMessages}`}
            className="absolute -right-[5px] -top-[4px] flex size-[15px] items-center justify-center rounded-full border-[1.5px] border-white bg-alert text-[8px] font-medium leading-none text-white"
          >
            {user.unreadMessages > 9 ? "9+" : user.unreadMessages}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[41px] z-50 w-[220px] overflow-hidden rounded-[10px] bg-white py-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <p className="truncate px-[18px] pb-[10px] pt-[6px] text-[12px] text-[#777574]">{user.displayName}</p>
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-[18px] py-[10px] text-[14px] font-medium text-black hover:bg-[#f5f6f8]"
            >
              {i.label}
              {!!i.count && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-alert px-[5px] text-[10px] font-medium text-white">
                  {i.count > 9 ? "9+" : i.count}
                </span>
              )}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push("/");
              router.refresh();
            }}
            className="mt-[4px] block w-full border-t-[0.7px] border-line px-[18px] pb-[8px] pt-[14px] text-left text-[14px] font-medium text-black hover:bg-[#f5f6f8]"
          >
            Odjavi se
          </button>
        </div>
      )}
    </div>
  );
}

// Brojevi na zvoncu i na slici profila se menjaju uživo: baza za svaku novu poruku pravi
// obaveštenje primaocu, pa je dovoljno slušati nova obaveštenja tog korisnika.
function useLiveCounts(initial: NavUser): NavUser {
  const [extra, setExtra] = useState({ notifications: 0, messages: 0 });
  const id = initial?.id;
  // Kad server pošalje sveže brojeve (nova stranica, osvežavanje), lokalni dodaci se brišu.
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setExtra({ notifications: 0, messages: 0 });
  }
  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`obavestenja-${id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${id}` },
        (payload) => {
          const type = (payload.new as { type?: string }).type;
          // Na stranici Poruke je otvoren razgovor već pročitan, pa se tamo ne broji.
          if (type === "nova_poruka" && window.location.pathname === "/poruke") return;
          setExtra((e) => ({
            notifications: e.notifications + 1,
            messages: e.messages + (type === "nova_poruka" ? 1 : 0),
          }));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);
  if (!initial) return null;
  return {
    ...initial,
    unreadNotifications: initial.unreadNotifications + extra.notifications,
    unreadMessages: initial.unreadMessages + extra.messages,
  };
}
