import Link from "next/link";

// Traka potkategorija iz Figme („Kategorije knjiga“ 512:7994): siva kapsula, aktivna stavka crna.
// Kad ima više od 7 stavki (Knjige), razmak je manji da sve stane u kapsulu.
export function SubcategoryTabs({
  items,
  label = "Potkategorije",
  className = "w-[856px]",
}: {
  items: Array<{ href: string; name: string; active: boolean }>;
  label?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={`flex h-[50px] ${className} items-center justify-between rounded-[46px] bg-field px-[5px] shadow-[inset_0_0_4px_rgba(0,0,0,0.07)]`}
    >
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.active ? "page" : undefined}
          className={`flex h-[38px] items-center rounded-[29px] ${items.length > 7 ? "px-[12px]" : "px-[17px]"} text-[13px] font-medium whitespace-nowrap ${
            i.active ? "bg-black text-white" : "text-black"
          }`}
        >
          {i.name}
        </Link>
      ))}
    </nav>
  );
}
