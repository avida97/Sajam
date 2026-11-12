import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteSavedSearch } from "@/components/catalog/DeleteSavedSearch";
import { MainButton } from "@/components/ui/MainButton";
import { savedSearchHref, type SavedFilters } from "@/lib/saved-searches";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sačuvane pretrage" };

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" });

// Sačuvane pretrage. Ekrana nema u Figmi; napravljen kao „Omiljeni artikli“ (naslov, siva
// pozadina, redovi kao u „Obaveštenjima“), za Ankin pregled.
export default async function SavedSearchesPage() {
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/?nalog=prijava&posle=/sacuvane-pretrage");
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_searches")
    .select("id, name, filters, created_at")
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  return (
    <>
      <section className="mx-auto h-[159px] max-w-site px-[182px] pt-[82px] text-black">
        <h1 className="font-serif text-[32px] font-medium italic leading-none">Sačuvane pretrage</h1>
      </section>
      <section className="bg-[#f5f6f8]">
        <div className="mx-auto min-h-[520px] max-w-site px-[182px] pb-[90px] pt-[38px]">
          <p className="trim-cap text-[13px] font-medium text-black">Pretrage: {rows.length}</p>
          <p className="mt-[14px] text-[13px] text-[#666]">
            Kad se pojavi novi oglas koji odgovara sačuvanoj pretrazi, dobićeš obaveštenje.
          </p>
          {rows.length ? (
            <ul className="mt-[24px] flex flex-col gap-[12px]">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-[24px] bg-white px-[24px] py-[20px] text-black">
                  <div className="min-w-0">
                    <Link href={savedSearchHref((r.filters ?? {}) as SavedFilters)} className="text-[15px] font-semibold hover:underline">
                      {r.name}
                    </Link>
                    <p className="mt-[6px] text-[12px] text-[#737373]">Sačuvano {fmtDate(r.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-[20px]">
                    <Link
                      href={savedSearchHref((r.filters ?? {}) as SavedFilters)}
                      className="flex h-[31px] items-center border-[0.5px] border-[#e1e1e1] px-[16px] text-[12px] font-bold hover:border-black"
                    >
                      POGLEDAJ OGLASE
                    </Link>
                    <DeleteSavedSearch id={r.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-[60px] flex flex-col items-center text-center text-black">
              <p className="text-[15px]">Još nemaš sačuvanih pretraga.</p>
              <p className="mt-[8px] max-w-[420px] text-[13px] text-[#666]">
                Izaberi kategoriju i filtere, pa klikni „Sačuvaj pretragu“ iznad liste artikala.
              </p>
              <MainButton href="/knjige" size="md" className="mt-[24px]">
                Pregledaj knjige
              </MainButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
