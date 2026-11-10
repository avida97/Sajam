import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/categories";
import type { SearchParams } from "@/lib/listings/params";
import { CategoryPage } from "../CategoryPage";


type Props = {
  params: Promise<{ kategorija: string; potkategorija: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategorija, potkategorija } = await params;
  const cat = CATEGORIES.find((c) => c.slug === kategorija);
  const sub = cat?.subcategories.find((s) => s.slug === potkategorija);
  return { title: `${sub?.name ?? ""} | ${cat?.name ?? ""} | Sajam` };
}

export default async function Page({ params, searchParams }: Props) {
  const { kategorija, potkategorija } = await params;
  return <CategoryPage categorySlug={kategorija} subcategorySlug={potkategorija} searchParams={await searchParams} />;
}
