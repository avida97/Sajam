"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Filteri levo od liste (Figma „Filter list“ 500:7262 i „Filter components“ 460:9086).
// Svaka grupa se sklapa klikom na naslov; izbor odmah menja adresu (?stanje=…&jezik=…).
export type FilterGroup =
  | { kind: "select"; param: string; title: string; placeholder: string; options: Array<{ value: string; label: string }> }
  | { kind: "check"; param: string; title: string; options: Array<{ value: string; label: string; count: number }> };

export function FilterSidebar({ groups }: { groups: FilterGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const push = (param: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(param, value);
    else next.delete(param);
    next.delete("strana");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex w-[196px] flex-col gap-[30px]">
      {groups.map((g) => (
        <Group key={g.param} title={g.title}>
          {g.kind === "select" ? (
            <div className="relative mt-[18px]">
              <select
                aria-label={g.title}
                value={params.get(g.param) ?? ""}
                onChange={(e) => push(g.param, e.target.value || null)}
                className="h-[33px] w-[196px] appearance-none rounded-[5px] border-[0.5px] border-[#8d8c8c] bg-white pl-[13px] pr-[30px] text-[12px] font-medium text-black focus:outline-none"
              >
                <option value="">{g.placeholder}</option>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Image
                src="/icons/chevron-up.svg"
                alt=""
                width={11}
                height={6}
                className="pointer-events-none absolute right-[13px] top-[14px] rotate-180"
              />
            </div>
          ) : (
            <ul className="mt-[17px] flex flex-col gap-[15px]">
              {g.options.map((o) => {
                const selected = (params.get(g.param) ?? "").split(",").filter(Boolean);
                const on = selected.includes(o.value);
                const toggle = () => {
                  const next = on ? selected.filter((v) => v !== o.value) : [...selected, o.value];
                  push(g.param, next.length ? next.join(",") : null);
                };
                return (
                  <li key={o.value}>
                    <button type="button" role="checkbox" aria-checked={on} onClick={toggle} className="flex items-center gap-[8px] text-left">
                      <Image src={on ? "/icons/check-yes.svg" : "/icons/check-no.svg"} alt="" width={19} height={19} />
                      <span className="flex items-center gap-[3px]">
                        <span className="text-[13px] font-medium leading-[1.5] text-black">{o.label}</span>
                        <span className="text-[9px] leading-[1.5] text-[#67676e]">({o.count})</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Group>
      ))}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-[15px] w-[196px] items-center justify-between text-left"
      >
        <span className="text-[13px] font-medium leading-[1.5] text-black">{title}</span>
        <Image src="/icons/chevron-up.svg" alt="" width={11} height={6} className={open ? "" : "rotate-180"} />
      </button>
      {open && children}
    </section>
  );
}
