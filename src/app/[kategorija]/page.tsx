import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/categories";
import type { SearchParams } from "@/lib/listings/params";
import { CategoryPage } from "./CategoryPage";


type Props = { params: Promise<{ kategorija: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategorija } = await params;
  return { title: `${CATEGORIES.find((c) => c.slug === kategorija)?.name ?? ""} | Sajam` };
}

export default async function Page({ params, searchParams }: Props) {
  const { kategorija } = await params;
  return <CategoryPage categorySlug={kategorija} searchParams={await searchParams} />;
}
