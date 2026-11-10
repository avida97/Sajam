import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryHero } from "@/components/catalog/CategoryHero";
import { FilterSidebar, type FilterGroup } from "@/components/catalog/FilterSidebar";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductCarousel } from "@/components/catalog/ProductCarousel";
import { SortPill } from "@/components/catalog/SortPill";
import { SubcategoryTabs } from "@/components/catalog/SubcategoryTabs";
import { CATEGORIES, HIDDEN_FIELDS } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import { BUNDLE_RANGES, GENRES, LANGUAGES } from "@/lib/genres";
import { parseFilters, type SearchParams } from "@/lib/listings/params";
import { getFacets, getListings, getTrendingListings } from "@/lib/listings/query";

// „Sve knjige“ u traci potkategorija, prilagođeno rodu za ostale kategorije.
const ALL_LABEL: Record<string, string> = {
  knjige: "Sve knjige",
  muzika: "Sva muzika",
  igre: "Sve igre",
  "mange-i-stripovi": "Sve mange i stripovi",
  oprema: "Sva oprema",
};

// Lista artikala jedne kategorije po Figmi („Products Knjige“ 500:7184).
export async function CategoryPage({
  categorySlug,
  subcategorySlug,
  searchParams,
}: {
  categorySlug: string;
  subcategorySlug?: string;
  searchParams: SearchParams;
}) {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) notFound();
  const sub = subcategorySlug ? category.subcategories.find((s) => s.slug === subcategorySlug) : undefined;
  if (subcategorySlug && !sub) notFound();

  const base = sub ? `/${category.slug}/${sub.slug}` : `/${category.slug}`;
  const filters = { ...parseFilters(searchParams), category: category.slug, subcategory: sub?.slug };
  const [{ items, page, pageCount }, facets, trending] = await Promise.all([
    getListings(filters),
    getFacets(filters),
    getTrendingListings(30, category.slug),
  ]);

  const isBookLike = category.itemType === "knjiga" || category.itemType === "manga_strip";
  const hidden = HIDDEN_FIELDS[category.itemType];
  const groups: FilterGroup[] = [];
  if (GENRES[category.itemType].length)
    groups.push({
      kind: "select",
      param: "zanr",
      title: "Žanrovi",
      placeholder: "Izaberi žanr",
      options: GENRES[category.itemType].map((g) => ({ value: g.slug, label: g.name })),
    });
  groups.push({
    kind: "check",
    param: "stanje",
    title: category.itemType === "knjiga" ? "Stanje knjige" : "Stanje",
    options: CONDITIONS.map((c) => ({ value: c.value, label: c.label, count: facets.condition(c.value) })),
  });
  if (isBookLike)
    groups.push({
      kind: "check",
      param: "broj",
      title: "Broj knjiga u paketu",
      options: BUNDLE_RANGES.map((r) => ({ value: r.value, label: r.label, count: facets.bundle(r.value) })),
    });
  if (!hidden.includes("author"))
    groups.push({
      kind: "select",
      param: "autor",
      title: "Autori",
      placeholder: "Izaberi autora",
      options: facets.authors.map((a) => ({ value: a, label: a })),
    });
  if (isBookLike)
    groups.push({
      kind: "check",
      param: "jezik",
      title: "Jezik",
      options: LANGUAGES.map((l) => ({ value: l, label: l, count: facets.language(l) })),
    });
  groups.push({
    kind: "select",
    param: "grad",
    title: "Lokacija",
    placeholder: "Izaberi grad",
    options: facets.cities.map((c) => ({ value: c, label: c })),
  });

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === "string" && k !== "strana") qs.set(k, v);
    if (p > 1) qs.set("strana", String(p));
    const s = qs.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <>
      <CategoryHero
        action={base}
        query={filters.q}
        placeholder={isBookLike ? "Pretraži knjigu, autora..." : "Pretraži artikal..."}
      />

      <section className="mx-auto max-w-site pb-[80px] pt-[50px]">
        <div className="pl-[292px]">
          <SubcategoryTabs
            items={[
              { href: `/${category.slug}`, name: ALL_LABEL[category.slug] ?? "Sve", active: !sub },
              ...category.subcategories.map((s) => ({
                href: `/${category.slug}/${s.slug}`,
                name: s.name,
                active: s.slug === sub?.slug,
              })),
            ]}
          />
        </div>

        <div className="mt-[50px] flex h-[41px] items-center justify-between pl-[291px] pr-[72px]">
          <button type="button" className="flex items-center gap-[9px] text-[13px] font-medium leading-[1.5] text-black">
            <Image src="/icons/bookmark.svg" alt="" width={12} height={16} />
            Sačuvaj pretragu
          </button>
          <SortPill current={filters.sort ?? "najnovije"} />
        </div>

        <div className="flex gap-[24px] pl-[72px] pr-[72px]">
          <aside className="-mt-[24px] w-[196px] shrink-0">
            <FilterSidebar groups={groups} />
          </aside>
          <div className="mt-[16px] min-w-0 flex-1">
            {items.length ? (
              <div className="grid grid-cols-[repeat(5,196px)] gap-x-[24px] gap-y-[50px]">
                {items.map((l) => (
                  <ProductCard key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <p className="pt-[40px] text-[14px] text-black">Nema artikala za izabrane filtere.</p>
            )}
            <div className="mt-[80px] flex justify-center">
              <Pagination page={page} pageCount={pageCount} href={pageHref} />
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel title="Trenutno u trendu" href={`/${category.slug}`} listings={trending} />
    </>
  );
}
