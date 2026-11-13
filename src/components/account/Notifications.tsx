"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type NotificationItem = {
  id: number;
  text: string;
  createdAt: string;
  unread: boolean;
  image: string | null;
  imageHref: string | null;
  action: { label: string; href: string | null } | null;
};

const TZ = "Europe/Belgrade";
const when = (iso: string) =>
  new Date(iso).toLocaleString("sr-Latn-RS", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: TZ });

export function Notifications({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const unread = items.filter((i) => i.unread).map((i) => i.id);

  // Otvorena obaveštenja postaju pročitana; nova ostaju istaknuta dok se stranica ne napusti.
  const key = unread.join(",");
  useEffect(() => {
    if (!key) return;
    const ids = key.split(",").map(Number);
    createClient()
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids)
      .then(() => router.refresh());
  }, [key, router]);

  return (
    <div className="mx-auto max-w-site px-[182px] pb-[80px] pt-[68px] text-black">
      <h1 className="font-serif text-[36px] font-medium italic leading-none">Obaveštenja</h1>
      <p className="mt-[14px] text-[14px] text-[#52525b]">Poruke, prodaje i ocene na jednom mestu.</p>

      {items.length === 0 ? (
        <p className="mt-[60px] text-center text-[14px] text-[#71717a]">Još nemaš obaveštenja.</p>
      ) : (
        <ul className="mt-[40px] divide-y-[0.5px] divide-[#e1e1e1] border-y-[0.5px] border-[#e1e1e1]">
          {items.map((n) => (
            <li key={n.id} className={`flex items-center gap-[20px] px-[12px] py-[16px] ${n.unread ? "bg-[#f5f6f8]" : ""}`}>
              <span className="flex w-[10px] justify-center">
                {n.unread && <span aria-label="Novo" className="size-[8px] rounded-full bg-alert" />}
              </span>
              {n.imageHref ? (
                <Link href={n.imageHref} className={`relative block h-[72px] w-[56px] shrink-0 overflow-hidden ${n.unread ? "bg-white" : "bg-[#f5f6f8]"}`}>
                  {n.image && <Image src={n.image} alt="" fill sizes="56px" className="object-cover" />}
                </Link>
              ) : (
                <span className={`block h-[72px] w-[56px] shrink-0 ${n.unread ? "bg-white" : "bg-[#f5f6f8]"}`} />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-[14px] leading-[1.5] ${n.unread ? "font-semibold" : ""}`}>{n.text}</p>
                <p className="mt-[4px] text-[12px] text-[#71717a]">{when(n.createdAt)}</p>
              </div>
              {n.action &&
                (n.action.href ? (
                  <Link
                    href={n.action.href}
                    className="inline-flex h-[33px] shrink-0 items-center bg-ink px-[19px] text-[11px] font-bold uppercase text-white"
                  >
                    {n.action.label}
                  </Link>
                ) : (
                  <span className="shrink-0 text-[12px] text-[#71717a]">{n.action.label}</span>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
