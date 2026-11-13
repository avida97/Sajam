import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAction } from "@/components/admin/AdminActions";
import { listingHref } from "@/lib/listings/params";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

type Props = { searchParams: Promise<{ tab?: string; q?: string; prikaz?: string }> };

const TABS = [
  { slug: "prijave", label: "Prijave" },
  { slug: "zahtevi", label: "Kontakt zahtevi" },
  { slug: "korisnici", label: "Korisnici" },
];

const TOPIC: Record<string, string> = {
  nalog: "Nalog",
  kupovina: "Kupovina",
  bezbednost: "Bezbednost",
  prodaja: "Prodaja",
  utisci: "Utisci i predlozi",
  drugo: "Drugo",
  saradnja: "Saradnja",
};
const REQUEST_STATUS: Record<string, string> = { novo: "Novo", u_radu: "U radu", reseno: "Rešeno" };
const REPORT_STATUS: Record<string, string> = { otvorena: "Otvorena", resena: "Rešena", odbacena: "Odbačena" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("sr-Latn-RS", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Admin deo (samo za naloge sa is_admin). Ekrana nema u Figmi; jednostavne tabele u stilu
// sajta, za Ankin pregled. Ostali korisnici dobijaju 404, kao da stranica ne postoji.
export default async function AdminPage({ searchParams }: Props) {
  const me = await getCurrentUser();
  if (!me?.profile?.is_admin) notFound();
  const { tab = "prijave", q, prikaz } = await searchParams;
  const supabase = await createClient();

  const [{ count: openReports }, { count: newRequests }] = await Promise.all([
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "otvorena"),
    supabase.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "novo"),
  ]);
  const badge: Record<string, number> = { prijave: openReports ?? 0, zahtevi: newRequests ?? 0 };

  return (
    <>
      <section className="mx-auto max-w-site px-[182px] pt-[82px] text-black">
        <h1 className="font-serif text-[32px] font-medium italic leading-none">Admin</h1>
        <nav className="mt-[36px] flex gap-[28px] border-b-[0.5px] border-[#ccc]">
          {TABS.map((t) => (
            <Link
              key={t.slug}
              href={`/admin?tab=${t.slug}`}
              className={`-mb-px flex items-center gap-[8px] pb-[12px] text-[14px] font-medium ${
                tab === t.slug ? "border-b-2 border-black" : "text-[#737373] hover:text-black"
              }`}
            >
              {t.label}
              {!!badge[t.slug] && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-alert px-[5px] text-[10px] text-white">
                  {badge[t.slug]}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </section>
      <section className="bg-[#f5f6f8]">
        <div className="mx-auto min-h-[560px] max-w-site px-[182px] pb-[90px] pt-[30px] text-black">
          {tab === "zahtevi" ? (
            <Requests all={prikaz === "sve"} />
          ) : tab === "korisnici" ? (
            <Users q={q} meId={me.id} />
          ) : (
            <Reports all={prikaz === "sve"} />
          )}
        </div>
      </section>
    </>
  );
}

function Filter({ tab, all, openLabel }: { tab: string; all: boolean; openLabel: string }) {
  const cls = (on: boolean) => `text-[13px] ${on ? "font-semibold text-black" : "text-[#737373] hover:text-black"}`;
  return (
    <div className="flex gap-[18px]">
      <Link href={`/admin?tab=${tab}`} className={cls(!all)}>
        {openLabel}
      </Link>
      <Link href={`/admin?tab=${tab}&prikaz=sve`} className={cls(all)}>
        Sve
      </Link>
    </div>
  );
}

async function Reports({ all }: { all: boolean }) {
  const supabase = await createClient();
  let query = supabase
    .from("reports")
    .select("id, reporter_id, listing_id, reported_user_id, reason, details, status, created_at, resolved_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!all) query = query.eq("status", "otvorena");
  const { data: reports } = await query;
  const rows = reports ?? [];

  const listingIds = [...new Set(rows.map((r) => r.listing_id).filter((x): x is number => !!x))];
  const { data: listings } = listingIds.length
    ? await supabase.from("listings").select("id, title, status, seller_id").in("id", listingIds)
    : { data: [] as Array<{ id: number; title: string; status: string; seller_id: string }> };
  const peopleIds = [
    ...new Set(
      rows.flatMap((r) => [r.reporter_id, r.reported_user_id]).concat((listings ?? []).map((l) => l.seller_id)),
    ),
  ].filter((x): x is string => !!x);
  const { data: people } = peopleIds.length
    ? await supabase.from("profiles").select("id, username, display_name, blocked_at").in("id", peopleIds)
    : { data: [] as Array<{ id: string; username: string; display_name: string; blocked_at: string | null }> };
  const person = (id: string | null) => people?.find((p) => p.id === id);
  const listing = (id: number | null) => listings?.find((l) => l.id === id);

  return (
    <>
      <Filter tab="prijave" all={all} openLabel="Otvorene" />
      {rows.length ? (
        <ul className="mt-[20px] flex flex-col gap-[12px]">
          {rows.map((r) => {
            const l = listing(r.listing_id);
            const target = r.listing_id ? person(l?.seller_id ?? null) : person(r.reported_user_id);
            const reporter = person(r.reporter_id);
            return (
              <li key={r.id} className="flex justify-between gap-[24px] bg-white px-[24px] py-[20px]">
                <div className="min-w-0 text-[13px] leading-[1.5]">
                  <p className="text-[11px] text-[#737373]">
                    {fmt(r.created_at)} · {r.listing_id ? "Oglas" : "Korisnik"} · {REPORT_STATUS[r.status]}
                  </p>
                  <p className="mt-[6px] text-[15px] font-semibold">
                    {r.listing_id ? (
                      l ? (
                        <Link href={listingHref(l)} className="hover:underline">
                          {l.title}
                        </Link>
                      ) : (
                        "Obrisan oglas"
                      )
                    ) : target ? (
                      <Link href={`/prodavac/${target.username}`} className="hover:underline">
                        {target.display_name} (@{target.username})
                      </Link>
                    ) : (
                      "Obrisan nalog"
                    )}
                    {l?.status === "uklonjen" && <span className="ml-[8px] text-[11px] font-normal text-[#b42318]">uklonjen</span>}
                  </p>
                  {r.listing_id && target && (
                    <p className="text-[12px] text-[#666]">
                      Prodavac:{" "}
                      <Link href={`/prodavac/${target.username}`} className="underline-offset-2 hover:underline">
                        @{target.username}
                      </Link>
                      {target.blocked_at && <span className="ml-[6px] text-[#b42318]">blokiran</span>}
                    </p>
                  )}
                  {!r.listing_id && target?.blocked_at && <p className="text-[12px] text-[#b42318]">blokiran</p>}
                  <p className="mt-[8px]">
                    <b className="font-semibold">Razlog:</b> {r.reason}
                  </p>
                  {r.details && <p className="mt-[4px] max-w-[560px] whitespace-pre-line text-[#52525b]">{r.details}</p>}
                  <p className="mt-[8px] text-[12px] text-[#737373]">Prijavio/la: {reporter ? `@${reporter.username}` : "—"}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-[8px]">
                  {r.status === "otvorena" ? (
                    <>
                      {l && l.status !== "uklonjen" && (
                        <AdminAction action={{ type: "remove", listingId: l.id }} label="Ukloni oglas" danger />
                      )}
                      {target && !target.blocked_at && (
                        <AdminAction action={{ type: "block", userId: target.id, block: true }} label="Blokiraj korisnika" danger />
                      )}
                      <AdminAction action={{ type: "resolve", reportId: r.id, status: "resena" }} label="Rešeno" />
                      <AdminAction action={{ type: "resolve", reportId: r.id, status: "odbacena" }} label="Odbaci" />
                    </>
                  ) : (
                    <AdminAction action={{ type: "resolve", reportId: r.id, status: "otvorena" }} label="Ponovo otvori" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-[40px] text-[14px] text-[#666]">{all ? "Još nema prijava." : "Nema otvorenih prijava."}</p>
      )}
    </>
  );
}

async function Requests({ all }: { all: boolean }) {
  const supabase = await createClient();
  let query = supabase
    .from("contact_requests")
    .select("id, first_name, last_name, email, listing_ref, message, topics, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!all) query = query.neq("status", "reseno");
  const { data } = await query;
  const rows = data ?? [];
  return (
    <>
      <Filter tab="zahtevi" all={all} openLabel="Nerešeni" />
      {rows.length ? (
        <ul className="mt-[20px] flex flex-col gap-[12px]">
          {rows.map((r) => (
            <li key={r.id} className="flex justify-between gap-[24px] bg-white px-[24px] py-[20px]">
              <div className="min-w-0 text-[13px] leading-[1.5]">
                <p className="text-[11px] text-[#737373]">
                  {fmt(r.created_at)} · {REQUEST_STATUS[r.status] ?? r.status}
                  {r.topics.length ? ` · ${r.topics.map((t) => TOPIC[t] ?? t).join(", ")}` : ""}
                </p>
                <p className="mt-[6px] text-[15px] font-semibold">
                  {r.first_name} {r.last_name}
                </p>
                <a href={`mailto:${r.email}`} className="text-[12px] text-[#666] underline-offset-2 hover:underline">
                  {r.email}
                </a>
                {r.listing_ref && <p className="text-[12px] text-[#666]">Oglas: {r.listing_ref}</p>}
                <p className="mt-[8px] max-w-[620px] whitespace-pre-line">{r.message}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-[8px]">
                {r.status !== "u_radu" && r.status !== "reseno" && (
                  <AdminAction action={{ type: "contact", requestId: r.id, status: "u_radu" }} label="U radu" />
                )}
                {r.status !== "reseno" ? (
                  <AdminAction action={{ type: "contact", requestId: r.id, status: "reseno" }} label="Rešeno" />
                ) : (
                  <AdminAction action={{ type: "contact", requestId: r.id, status: "novo" }} label="Vrati u nerešene" />
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-[40px] text-[14px] text-[#666]">{all ? "Još nema zahteva." : "Nema nerešenih zahteva."}</p>
      )}
    </>
  );
}

async function Users({ q, meId }: { q?: string; meId: string }) {
  const supabase = await createClient();
  const term = q?.trim().replace(/[%,()]/g, "");
  let query = supabase
    .from("profiles")
    .select("id, username, display_name, city, created_at, blocked_at, is_admin")
    .order("created_at", { ascending: false })
    .limit(100);
  query = term ? query.or(`username.ilike.%${term}%,display_name.ilike.%${term}%`) : query.not("blocked_at", "is", null);
  const { data } = await query;
  const rows = data ?? [];
  const blockedIds = rows.filter((r) => r.blocked_at).map((r) => r.id);
  const { data: blocks } = blockedIds.length
    ? await supabase
        .from("account_blocks")
        .select("user_id, reason, created_at")
        .in("user_id", blockedIds)
        .eq("blocked", true)
        .order("created_at", { ascending: false })
    : { data: [] as Array<{ user_id: string; reason: string | null; created_at: string }> };
  const lastReason = (id: string) => blocks?.find((b) => b.user_id === id)?.reason;

  return (
    <>
      <form action="/admin" className="flex gap-[10px]">
        <input type="hidden" name="tab" value="korisnici" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Korisničko ime ili ime"
          className="h-[36px] w-[320px] border border-field bg-white px-[12px] text-[13px] outline-none focus:border-black"
        />
        <button type="submit" className="h-[36px] bg-black px-[18px] text-[12px] font-bold text-white hover:bg-[#232222]">
          PRETRAŽI
        </button>
      </form>
      <p className="mt-[18px] text-[13px] text-[#666]">
        {term ? `Rezultati za „${term}“: ${rows.length}` : `Blokirani nalozi: ${rows.length}`}
      </p>
      {rows.length > 0 && (
        <ul className="mt-[14px] flex flex-col gap-[10px]">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-[24px] bg-white px-[24px] py-[16px] text-[13px]">
              <div>
                <Link href={`/prodavac/${r.username}`} className="text-[15px] font-semibold hover:underline">
                  {r.display_name}
                </Link>{" "}
                <span className="text-[#666]">@{r.username}</span>
                {r.is_admin && <span className="ml-[8px] text-[11px] font-semibold">ADMIN</span>}
                <p className="mt-[4px] text-[12px] text-[#737373]">
                  Na Sajmu od {new Date(r.created_at).toLocaleDateString("sr-Latn-RS")}
                  {r.city ? ` · ${r.city}` : ""}
                </p>
                {r.blocked_at && (
                  <p className="mt-[4px] text-[12px] text-[#b42318]">
                    Blokiran {fmt(r.blocked_at)}
                    {lastReason(r.id) ? `: ${lastReason(r.id)}` : ""}
                  </p>
                )}
              </div>
              {r.id !== meId &&
                (r.blocked_at ? (
                  <AdminAction action={{ type: "block", userId: r.id, block: false }} label="Odblokiraj" />
                ) : (
                  <AdminAction action={{ type: "block", userId: r.id, block: true }} label="Blokiraj" danger />
                ))}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
