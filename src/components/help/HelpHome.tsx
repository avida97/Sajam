import Image from "next/image";
import Link from "next/link";
import { HeroBackdrop } from "@/components/catalog/CategoryHero";
import { MainButton } from "@/components/ui/MainButton";
import {
  HELP,
  HELP_SECTIONS,
  TOP_SEARCHES,
  articleHref,
  searchHelp,
  type HelpSectionKey,
} from "@/lib/help";

const ICON_SIZE = { torba: [34, 34], razgovor: [34, 34], kartica: [34, 34], kolica: [37, 34] } as const;

// Centar za pomoć po Figmi („Help Kupovina“ 783:18130; „Help Prodaja“ i „Help Moj nalog“ imaju isti raspored).
export function HelpHome({ section, query }: { section: HelpSectionKey; query?: string }) {
  const q = query?.trim() ?? "";
  const results = q ? searchHelp(q) : null;

  return (
    <div className="pb-[76px] text-black">
      <section className="mx-auto max-w-site px-[72px] pt-[65px]">
        <HeroBackdrop>
          <h1 className="trim-cap relative pt-[71px] text-center text-[48px] font-semibold leading-[1.1] tracking-[-1.92px] whitespace-nowrap">
            Kako možemo da{" "}
            <span className="font-serif text-[56px] italic tracking-[-2.8px]">pomognemo</span>?
          </h1>
          <form action="/pomoc" role="search" className="absolute left-1/2 top-[150px] h-[50px] w-[656px] -translate-x-1/2">
            <Image src="/icons/search.svg" alt="" width={18} height={17} className="pointer-events-none absolute left-[22px] top-[16px]" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Pretraži pitanja…"
              aria-label="Pretraži pitanja"
              className="h-full w-full rounded-[97px] bg-field pl-[54px] pr-6 text-[14px] text-black placeholder:text-[#666] focus:outline-none"
            />
          </form>
          <div className="absolute left-1/2 top-[234px] flex -translate-x-1/2 items-center gap-[8px] whitespace-nowrap">
            <span className="mr-[8px] text-[14px] font-medium">Najčešće pretrage</span>
            {TOP_SEARCHES.map((t) => (
              <Link key={t.href} href={t.href} className="flex h-[24px] items-center bg-black px-[8px] text-[12px] font-medium text-white">
                {t.label}
              </Link>
            ))}
          </div>
        </HeroBackdrop>
      </section>

      {results ? (
        <section className="mx-auto mt-[71px] w-[746px]">
          <p className="text-[20px] font-semibold">
            Rezultati za „{q}“: {results.length}
          </p>
          {results.length === 0 ? (
            <p className="mt-[16px] text-[14px] leading-[1.5] text-[#666]">
              Nismo našli odgovor. Probaj drugim rečima ili nam pošalji zahtev.
            </p>
          ) : (
            <ul className="mt-[24px] divide-y-[0.5px] divide-[#e1e1e1] border-y-[0.5px] border-[#e1e1e1]">
              {results.map((r) => (
                <li key={r.article.slug}>
                  <Link href={articleHref(r.section, r.article.slug)} className="block py-[16px] hover:bg-[#fafafa]">
                    <span className="block text-[12px] text-[#666]">
                      {HELP_SECTIONS.find((s) => s.key === r.section)?.label} · {r.topic}
                    </span>
                    <span className="mt-[6px] block text-[16px] font-semibold">{r.article.title}</span>
                    <span className="mt-[6px] line-clamp-2 block text-[14px] leading-[1.5] text-[#666]">{r.article.intro}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <nav aria-label="Teme pomoći" className="mx-auto mt-[71px] flex w-[322px] justify-center border-b border-[#e1e1e1]">
            {HELP_SECTIONS.map((s) => (
              <Link
                key={s.key}
                href={`/pomoc/${s.key}`}
                aria-current={s.key === section ? "page" : undefined}
                className={`-mb-px px-[12px] pb-[8px] text-[16px] font-medium ${
                  s.key === section ? "border-b-2 border-black" : "border-b-2 border-transparent"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto mt-[70px] grid w-[1063px] grid-cols-[293px_293px_293px] gap-x-[92px] gap-y-[56px]">
            {HELP[section].map((topic) => {
              const [w, h] = ICON_SIZE[topic.icon];
              return (
                <section key={topic.title} className="pl-[13px]">
                  <Image src={`/icons/pomoc/${topic.icon}.svg`} alt="" width={w} height={h} />
                  <h2 className="mt-[20px] text-[20px] font-semibold leading-[1.2]">{topic.title}</h2>
                  <ul className="mt-[30px] flex w-[280px] flex-col gap-[14px] text-[14px] leading-[20px] text-[#666]">
                    {topic.articles.map((a) => (
                      <li key={a.slug}>
                        <Link href={articleHref(section, a.slug)} className="hover:text-black hover:underline">
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}

      <HelpCta />
    </div>
  );
}

// „Ne možeš da pronađeš odgovor?“ sa dugmetom za kontakt (jedno dugme, V 13. 11. 2026).
export function HelpCta({ title = "Ne možeš da pronađeš odgovor?" }: { title?: string }) {
  return (
    <section className="mx-auto mt-[53px] flex w-[343px] flex-col items-center border-t border-[#e1e1e1] pt-[49px] text-center">
      <h2 className="text-[21px] font-bold">{title}</h2>
      <div className="mt-[30px] flex gap-[14px]">
        <MainButton href="/kontakt/forma" size="md">
          Piši nam
        </MainButton>
      </div>
    </section>
  );
}
