import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleHelpful, QuickLinks } from "@/components/help/ArticleParts";
import { HELP_SECTIONS, articleHref, findArticle, headingId } from "@/lib/help";

type Props = { params: Promise<{ sekcija: string; clanak: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clanak } = await params;
  const found = findArticle(clanak);
  return { title: found ? found.article.title : "Pomoć" };
}

// Članak pomoći po Figmi („Help Text“ 803:16345): putanja, brzi linkovi levo, tekst desno.
export default async function HelpArticlePage({ params }: Props) {
  const { sekcija, clanak } = await params;
  const found = findArticle(clanak);
  if (!found) notFound();
  const { section, topic, article } = found;
  if (section.key !== sekcija) permanentRedirect(articleHref(section.key, article.slug));

  const links = article.sections.map((s) => ({ id: headingId(s.heading), label: s.heading }));
  const crumb = <Image src="/icons/breadcrumb.svg" alt="" width={5} height={9} />;

  return (
    <div className="mx-auto max-w-site px-[182px] pb-[110px] pt-[81px] text-black">
      <nav aria-label="Putanja" className="flex items-center gap-[8px] text-[11px] text-[#666]">
        <Link href="/pomoc">Pomoć</Link>
        {crumb}
        <Link href={`/pomoc/${section.key}`}>{HELP_SECTIONS.find((s) => s.key === section.key)?.label}</Link>
        {crumb}
        <Link href={`/pomoc/${section.key}`}>{topic.title}</Link>
        {crumb}
        <span>{article.title}</span>
      </nav>

      <div className="mt-[50px] flex gap-[134px]">
        <aside className="w-[196px] shrink-0">
          <p className="text-[16px] font-semibold">Brzi linkovi</p>
          {links.length > 0 ? (
            <QuickLinks links={links} />
          ) : (
            <ul className="mt-[50px] flex flex-col gap-[14px] border-l border-[#e1e1e1] text-[14px] leading-[20px] text-[#666]">
              {topic.articles
                .filter((a) => a.slug !== article.slug)
                .map((a) => (
                  <li key={a.slug} className="pl-[17px]">
                    <Link href={articleHref(section.key, a.slug)} className="hover:text-black">
                      {a.title}
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </aside>

        <article className="w-[746px] min-w-0">
          <h1 className="text-[32px] font-semibold leading-[1.2]">{article.title}</h1>
          <p className="mt-[16px] text-[16px] leading-[1.5] text-[#666]">{article.intro}</p>
          {article.sections.map((s) => (
            <section key={s.heading} id={headingId(s.heading)} className="scroll-mt-[20px]">
              <h2 className="mt-[34px] text-[24px] font-semibold leading-[1.2]">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-[15px] text-[16px] leading-[1.5] text-[#666]">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <ArticleHelpful slug={article.slug} />
        </article>
      </div>
    </div>
  );
}
