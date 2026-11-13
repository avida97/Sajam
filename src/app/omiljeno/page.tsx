import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FavoritesControls } from "@/components/catalog/FavoritesControls";
import { ProductCard } from "@/components/catalog/ProductCard";
import { MainButton } from "@/components/ui/MainButton";
import { CATEGORIES } from "@/lib/categories";
import { getListing } from "@/lib/listings/query";
import type { CatalogListing } from "@/lib/listings/types";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Omiljeni proizvodi" };

type Props = { searchParams: Promise<{ kategorija?: string; sort?: string }> };

// „Omiljeni proizvodi“ po Figmi (691:15136): naslov, broj proizvoda, Kategorija i Sortiraj po,
// pa kartice u 5 kolona na sivoj pozadini.
export default async function FavoritesPage({ searchParams }: Props) {
  const { kategorija, sort } = await searchParams;
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/?nalog=prijava&posle=/omiljeno");

  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("listing_id, created_at")
    .order("created_at", { ascending: false });
  const all = (await Promise.all((data ?? []).map((f) => getListing(f.listing_id)))).filter(
    (l): l is CatalogListing => !!l,
  );

  let items = kategorija ? all.filter((l) => l.categorySlug === kategorija) : all;
  if (sort === "cena-rastuce") items = [...items].sort((a, b) => a.price_rsd - b.price_rsd);
  else if (sort === "cena-opadajuce") items = [...items].sort((a, b) => b.price_rsd - a.price_rsd);
  else if (sort === "azbucno") items = [...items].sort((a, b) => a.title.localeCompare(b.title, "sr"));

  const categories = CATEGORIES.filter((c) => all.some((l) => l.categorySlug === c.slug)).map((c) => ({
    value: c.slug,
    label: c.name,
  }));

  return (
    <>
      <section className="mx-auto h-[159px] max-w-site px-[182px] pt-[82px] text-black">
        <h1 className="font-serif text-[32px] font-medium italic leading-none">Omiljeni proizvodi</h1>
      </section>
      <section className="bg-[#f5f6f8]">
        <div className="mx-auto min-h-[520px] max-w-site px-[182px] pb-[90px] pt-[38px]">
          <div className="flex h-[33px] items-end justify-between">
            <p className="trim-cap text-[13px] font-medium text-black">Proizvodi: {items.length}</p>
            <FavoritesControls categories={categories} kategorija={kategorija ?? ""} sort={sort ?? "najnovije"} />
          </div>
          {items.length ? (
            <div className="mt-[16px] grid grid-cols-[repeat(5,196px)] gap-x-[24px] gap-y-[50px]">
              {items.map((l) => (
                <div key={l.id} className="relative">
                  <ProductCard listing={l} />
                  {l.status !== "dostupno" && (
                    <span className="absolute left-[8px] top-[8px] bg-white px-[8px] py-[4px] text-[11px] font-semibold">
                      {l.status === "prodato" ? "Prodato" : "Rezervisano"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center pt-[80px] text-center text-black">
              <p className="font-serif text-[22px] italic">Još nemaš omiljenih proizvoda</p>
              <p className="mt-[6px] text-[13px] text-[#71717a]">
                Klikni na srce na proizvodu i sačuvaj ga ovde, da ga kasnije lako nađeš.
              </p>
              <MainButton href="/knjige" className="mt-[20px]">
                Pogledaj knjige
              </MainButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
