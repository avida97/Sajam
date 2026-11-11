import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { HelpHome } from "@/components/help/HelpHome";
import { HELP_SECTIONS, articleHref, findArticle, isHelpSection } from "@/lib/help";

type Props = { params: Promise<{ sekcija: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sekcija } = await params;
  const label = HELP_SECTIONS.find((s) => s.key === sekcija)?.label;
  return { title: label ? `Pomoć: ${label}` : "Pomoć" };
}

export default async function HelpSectionPage({ params }: Props) {
  const { sekcija } = await params;
  if (isHelpSection(sekcija)) return <HelpHome section={sekcija} />;
  // Kratke adrese iz menija (npr. /pomoc/naknade) vode na članak.
  const found = findArticle(sekcija);
  if (found) permanentRedirect(articleHref(found.section.key, found.article.slug));
  notFound();
}
