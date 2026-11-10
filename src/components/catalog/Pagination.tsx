import Image from "next/image";
import Link from "next/link";

// Numeracija strana iz Figme (528:8013). Tekstovi su kao u dizajnu.
const box =
  "flex h-[36px] items-center justify-center gap-[4px] rounded-[4px] border border-[#e9e9e9] bg-white px-[12px] text-[14px] leading-[20px] text-[#313131]";

export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const pages = visiblePages(page, pageCount);
  const Ctl = ({ to, children, label }: { to: number; children: React.ReactNode; label: string }) =>
    to < 1 || to > pageCount || to === page ? (
      <span className={`${box} opacity-50`} aria-label={label}>{children}</span>
    ) : (
      <Link href={href(to)} className={box} aria-label={label}>{children}</Link>
    );

  return (
    <nav aria-label="Strane" className="flex items-start gap-[6px]">
      <Ctl to={1} label="Prva strana"><Image src="/icons/pg-first.svg" alt="" width={16} height={16} />First</Ctl>
      <Ctl to={page - 1} label="Prethodna strana"><Image src="/icons/pg-back.svg" alt="" width={16} height={16} />Back</Ctl>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`d${i}`} className={`${box} w-[31px] px-0`}>
            <Image src="/icons/pg-dots.svg" alt="" width={16} height={16} />
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className="flex h-[36px] items-center rounded-[4px] bg-black px-[12px] text-[14px] font-bold leading-[20px] text-white">
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={box}>{p}</Link>
        ),
      )}
      <Ctl to={page + 1} label="Sledeća strana">Next<Image src="/icons/pg-next.svg" alt="" width={16} height={16} /></Ctl>
      <Ctl to={pageCount} label="Poslednja strana">Last<Image src="/icons/pg-last.svg" alt="" width={16} height={16} /></Ctl>
    </nav>
  );
}

// Kao u dizajnu: 1, trenutna sa susedima, tri tačke, poslednja.
function visiblePages(page: number, count: number): Array<number | "…"> {
  if (count <= 6) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, page - 1, page, page + 1, count].filter((p) => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}
