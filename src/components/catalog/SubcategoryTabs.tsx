import Link from "next/link";

// Traka potkategorija iz Figme („Kategorije knjiga“ 512:7994): siva kapsula, aktivna stavka crna.
export function SubcategoryTabs({
  items,
}: {
  items: Array<{ href: string; name: string; active: boolean }>;
}) {
  return (
    <nav
      aria-label="Potkategorije"
      className="flex h-[50px] w-[856px] items-center justify-between rounded-[46px] bg-field px-[5px] shadow-[inset_0_0_4px_rgba(0,0,0,0.07)]"
    >
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.active ? "page" : undefined}
          className={`flex h-[38px] items-center rounded-[29px] px-[17px] text-[13px] font-medium whitespace-nowrap ${
            i.active ? "bg-black text-white" : "text-black"
          }`}
        >
          {i.name}
        </Link>
      ))}
    </nav>
  );
}
