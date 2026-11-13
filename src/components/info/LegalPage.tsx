import { QuickLinks } from "@/components/help/ArticleParts";
import { headingId } from "@/lib/help";
import { LEGAL_DOCS, type LegalDoc } from "@/lib/legal";
import Link from "next/link";

// Pravne stranice nemaju dizajn u Figmi; raspored je isti kao članak pomoći („Help Text“ 803:16345).
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const links = doc.sections.map((s) => ({ id: headingId(s.heading), label: s.heading }));
  return (
    <div className="mx-auto max-w-site px-[182px] pb-[110px] pt-[81px] text-black">
      <nav aria-label="Pravila" className="flex items-center gap-[20px] text-[11px] text-[#666]">
        {LEGAL_DOCS.map((d) => (
          <Link
            key={d.slug}
            href={`/${d.slug}`}
            aria-current={d.slug === doc.slug ? "page" : undefined}
            className={d.slug === doc.slug ? "font-medium text-black" : "hover:text-black"}
          >
            {d.title}
          </Link>
        ))}
      </nav>

      <div className="mt-[50px] flex gap-[134px]">
        <aside className="w-[196px] shrink-0">
          <p className="text-[16px] font-semibold">Brzi linkovi</p>
          <QuickLinks links={links} />
        </aside>

        <article className="w-[746px] min-w-0">
          <h1 className="text-[32px] font-semibold leading-[1.2]">{doc.title}</h1>
          <p className="mt-[8px] text-[12px] text-[#666]">Poslednja izmena: {doc.updated}</p>
          <p className="mt-[16px] text-[16px] leading-[1.5] text-[#666]">{doc.intro}</p>
          {doc.sections.map((s) => (
            <section key={s.heading} id={headingId(s.heading)} className="scroll-mt-[20px]">
              <h2 className="mt-[34px] text-[24px] font-semibold leading-[1.2]">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-[15px] text-[16px] leading-[1.5] text-[#666]">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
