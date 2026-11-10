import type { Metadata } from "next";
import { CategoryHero } from "@/components/catalog/CategoryHero";
import { FilterSidebar, type FilterGroup } from "@/components/catalog/FilterSidebar";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SortPill } from "@/components/catalog/SortPill";
import { SubcategoryTabs } from "@/components/catalog/SubcategoryTabs";
import { CATEGORIES } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import { LANGUAGES } from "@/lib/genres";
import { parseFilters, type SearchParams } from "@/lib/listings/params";
import { getFacets, getListings } from "@/lib/listings/query";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q;
  return { title: typeof q === "string" && q.trim() ? `Pretraga: ${q.trim()}` : "Pretraga" };
}

// Rezultati pretrage iz nav bara. Posebnog ekrana nema u Figmi, pa je stranica
// sklopljena od stranice kategorije („Products Knjige“ 500:7184): isti hero sa pretragom,
// kapsula sa kategorijama umesto potkategorija, filteri, sortiranje i kartice.
export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cat = typeof sp.kategorija === "string" ? CATEGORIES.find((c) => c.slug === sp.kategorija) : undefined;
  const filters = { ...parseFilters(sp), category: cat?.slug };
  const [{ items, total, page, pageCount }, facets] = await Promise.all([getListings(filters), getFacets(filters)]);

  const link = (changes: Record<string, string | null>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "strana") qs.set(k, v);
    for (const [k, v] of Object.entries(changes)) {
      if (v) qs.set(k, v);
      else qs.delete(k);
    }
    const s = qs.toString();
    return s ? `/pretraga?${s}` : "/pretraga";
  };

  const groups: FilterGroup[] = [
    {
      kind: "check",
      param: "stanje",
      title: "Stanje",
      options: CONDITIONS.map((c) => ({ value: c.value, label: c.label, count: facets.condition(c.value) })),
    },
    {
      kind: "check",
      param: "jezik",
      title: "Jezik",
      options: LANGUAGES.map((l) => ({ value: l, label: l, count: facets.language(l) })),
    },
    {
      kind: "select",
      param: "grad",
      title: "Lokacija",
      placeholder: "Izaberi grad",
      options: facets.cities.map((c) => ({ value: c, label: c })),
    },
  ];

  return (
    <>
      <CategoryHero action="/pretraga" query={filters.q} placeholder="Pretraži knjigu, autora, izdavača..." />

      <section className="mx-auto max-w-site pb-[80px] pt-[50px]">
        <div className="pl-[292px]">
          <SubcategoryTabs
            items={[
              { href: link({ kategorija: null }), name: "Sve kategorije", active: !cat },
              ...CATEGORIES.map((c) => ({ href: link({ kategorija: c.slug }), name: c.name, active: c.slug === cat?.slug })),
            ]}
          />
        </div>

        <div className="mt-[50px] flex h-[41px] items-center justify-between pl-[291px] pr-[72px]">
          <p className="text-[13px] font-medium leading-[1.5] text-black">
            {filters.q ? (
              <>
                Rezultati za „{filters.q}“: {total}
              </>
            ) : (
              <>Artikli: {total}</>
            )}
          </p>
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
              <p className="pt-[40px] text-[14px] leading-[1.5] text-black">
                {filters.q ? `Nema artikala za „${filters.q}“.` : "Nema artikala za izabrane filtere."} Probaj sa
                manje reči ili bez filtera.
              </p>
            )}
            <div className="mt-[80px] flex justify-center">
              <Pagination page={page} pageCount={pageCount} href={(p) => link({ strana: p > 1 ? String(p) : null })} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
