import { PAYMENT as PAYMENT_OPTIONS, SHIPPING as SHIPPING_OPTIONS } from "@/lib/shipping";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFavoriteCount, getSellerStats } from "@/lib/profiles";
import { HeartButton } from "@/components/catalog/HeartButton";
import { ViewCounter } from "@/components/product/ViewCounter";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCarousel } from "@/components/catalog/ProductCarousel";
import { ConditionLink } from "@/components/product/ConditionLink";
import { Gallery } from "@/components/product/Gallery";
import { ReadMore } from "@/components/product/ReadMore";
import { CATEGORIES, HIDDEN_FIELDS } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import { formatRsd, listingHref, parseListingId } from "@/lib/listings/params";
import { getListing, getSellerListings, getSimilarListings } from "@/lib/listings/query";

type Props = { params: Promise<{ slug: string }> };

const SHIPPING = Object.fromEntries(SHIPPING_OPTIONS.map((o) => [o.value, o.label])) as Record<string, string>;
const PAYMENT = Object.fromEntries(PAYMENT_OPTIONS.map((o) => [o.value, o.label])) as Record<string, string>;
const ALL_LABEL: Record<string, string> = {
  knjige: "Sve knjige",
  muzika: "Sva muzika",
  igre: "Sve igre",
  "mange-i-stripovi": "Sve mange i stripovi",
  oprema: "Sva oprema",
};
// Desna kolona: umesto „More information“ iz Figme (Expert authentication, Express Delivery,
// Returns — to Sajam ne radi) koraci kupovine, na istim pločicama (odluka V 10. 11. 2026).
const BUY_STEPS = [
  { title: "1. Pitaj prodavca", text: "Klikni „Pitaj prodavca“ i u porukama se dogovori oko stanja, slanja i cene." },
  { title: "2. Dogovor i rezervacija", text: "Kad se dogovorite, prodavac rezerviše artikal za tebe, pa ga niko drugi ne može kupiti." },
  { title: "3. Plaćanje", text: "Plaćaš direktno prodavcu, na jedan od načina iz oglasa. Sajam ne naplaćuje proviziju." },
  { title: "4. Slanje ili preuzimanje", text: "Prodavac šalje poštom ili se nalazite lično, kako ste se dogovorili u porukama." },
  { title: "5. Oceni prodavca", text: "Kad artikal stigne, oceni prodavca. Ocene pomažu drugim kupcima da biraju." },
];

async function load(slug: string) {
  const id = parseListingId(slug);
  const listing = id ? await getListing(id) : null;
  if (!listing || listing.status === "uklonjen") notFound();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await load((await params).slug);
  return { title: `${l.placeholder ? "Oglas" : l.title} | Sajam` };
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
};

// Stranica proizvoda po Figmi („Product Page“ 575:12070). Po odluci za MVP nema korpe
// ni ponuda: „Stavi u korpu“, „Pošalji ponudu“, „2 ponude u toku“ i plaćanje na rate su sakriveni,
// a glavno dugme je „Pitaj prodavca“ (poruke).
export default async function ListingPage({ params }: Props) {
  const l = await load((await params).slug);
  const category = CATEGORIES.find((c) => c.slug === l.categorySlug);
  if (!category) notFound();
  const sub = category.subcategories.find((s) => s.slug === l.subcategorySlug);
  const condition = CONDITIONS.find((c) => c.value === l.condition) ?? CONDITIONS[CONDITIONS.length - 1];
  const hidden = HIDDEN_FIELDS[l.item_type];
  const title = l.placeholder ? "Naziv artikla" : l.title;
  const [similar, fromSeller, me, stats] = await Promise.all([
    getSimilarListings(l, 30),
    getSellerListings(l, 30),
    getCurrentUser(),
    l.placeholder ? null : getSellerStats(l.seller.username),
  ]);
  const favCount = l.placeholder ? 0 : await getFavoriteCount(l.id);
  const own = !!me?.profile && me.profile.username === l.seller.username;

  const meta = [
    l.bundle_count > 1 ? `${l.bundle_count} ${l.item_type === "knjiga" ? "knjiga" : "artikala"} u paketu` : null,
    "condition",
    l.city,
  ].filter(Boolean) as string[];

  // Prazno polje ostaje prazno; probni tekst samo kod probnih oglasa (dok baza nije povezana).
  const empty = l.placeholder ? "—" : "";
  const details: Array<[string, React.ReactNode]> = [
    ["Naslov", title],
    ...(!hidden.includes("author") ? [["Autor", l.author ?? empty] as [string, React.ReactNode]] : []),
    ["Jezik", l.language ?? empty],
    ["Žanr", l.genre?.name ?? empty],
    ["Slanje", l.shipping_methods.map((m) => SHIPPING[m]).join(", ") || empty],
    ["Plaćanje", l.payment_methods.map((m) => PAYMENT[m]).join(", ") || empty],
    ["Stanje", l.condition_note ?? condition.label],
  ];
  // Tehnički podaci idu na kraj liste, sivim slovima, da se ne ističu.
  const minor: Array<[string, string]> = [
    ...(!hidden.includes("isbn") && (l.isbn || l.placeholder) ? [["ISBN", l.isbn ?? empty] as [string, string]] : []),
    ["Objavljeno", fmtDate(l.created_at)],
    ["Ažurirano", fmtDate(l.updated_at)],
    ["ID oglasa", String(l.id)],
  ];

  return (
    <>
      {!l.placeholder && !own && <ViewCounter listingId={l.id} />}
      {/* Hero: galerija levo, siva kolona sa podacima desno */}
      <section className="relative mx-auto h-[838px] max-w-site">
        <div className="absolute inset-y-0 left-1/2 w-1/2 bg-[#f5f6f8]" />
        <nav aria-label="Putanja" className="absolute left-1/2 top-[30px] z-10 flex -translate-x-1/2 items-center gap-[8px] text-[11px] text-[#666]">
          <Link href="/">Početna strana</Link>
          <Image src="/icons/breadcrumb.svg" alt="" width={5} height={9} />
          <Link href={`/${category.slug}`}>{ALL_LABEL[category.slug]}</Link>
          {sub && (
            <>
              <Image src="/icons/breadcrumb.svg" alt="" width={5} height={9} />
              <Link href={`/${category.slug}/${sub.slug}`}>{sub.name}</Link>
            </>
          )}
          <Image src="/icons/breadcrumb.svg" alt="" width={5} height={9} />
          <span>{title}</span>
        </nav>

        <div className="absolute left-[172px] top-[108px]">
          <Gallery images={l.images} title={title} />
        </div>

        <div className="absolute left-[842px] top-[108px] w-[416px] text-black">
          <div className="flex justify-between">
            <div className="flex w-[306px] flex-col gap-[16px] text-[16px]">
              <h1 className="trim-cap font-semibold">{title}</h1>
              {l.author && <p className="trim-cap">{l.author}</p>}
            </div>
            <HeartButton listingId={l.placeholder ? 0 : l.id} variant="page" count={favCount} />
          </div>
          <div className="mt-[16px] flex items-center gap-[8px] text-[14px] text-[#737373]">
            {meta.map((m, i) => (
              <span key={m} className="contents">
                {i > 0 && <span className="size-[3px] rounded-full bg-[#737373]" />}
                {m === "condition" ? <ConditionLink label={condition.label} /> : <span className="trim-cap">{m}</span>}
              </span>
            ))}
          </div>
          <p className="trim-cap mt-[18px] text-[20px] font-medium">
            {l.placeholder ? "Cena RSD" : formatRsd(l.price_rsd).replace(" ", "")}
          </p>

          {l.status !== "dostupno" && (
            <p className="mt-[14px] inline-block bg-white px-[10px] py-[5px] text-[12px] font-semibold">
              {l.status === "prodato" ? "Prodato" : "Rezervisano"}
            </p>
          )}
          {own ? (
            <Link
              href={`/prodaj?izmeni=${l.id}`}
              className="mt-[60px] flex h-[39px] w-[416px] items-center justify-center bg-black text-[13px] font-bold text-white"
            >
              IZMENI OGLAS
            </Link>
          ) : (
            <Link
              href={
                me
                  ? `/poruke?oglas=${l.id}`
                  : `${listingHref(l)}?nalog=prijava&posle=${encodeURIComponent(`/poruke?oglas=${l.id}`)}`
              }
              scroll={false}
              className="mt-[60px] flex h-[39px] w-[416px] items-center justify-center bg-black text-[13px] font-bold text-white"
            >
              PITAJ PRODAVCA
            </Link>
          )}

          <div className="mt-[40px]">
            <p className="trim-cap text-[14px] font-semibold">SAŽETAK</p>
            <div className="mt-[22px]">
              <ReadMore text={l.description ?? (l.placeholder ? "Opis artikla." : "")} />
            </div>
          </div>
        </div>
      </section>

      {/* Detalji: prodavac, opis i podaci, dodatne informacije */}
      <section className="mx-auto flex min-h-[609px] max-w-site pb-[40px] gap-[24px] pl-[182px] pt-[50px] text-black">
        <div className="w-[306px]">
          <h2 className="font-serif text-[36px] font-medium italic">Detalji</h2>
          <p className="trim-cap mt-[18px] text-[14px] font-semibold leading-[1.4]">PRODAVAC</p>
          <div className="mt-[12px] border-[0.5px] border-[#ccc] bg-white">
            <div className="border-b-[0.5px] border-[#ccc] p-[20px]">
              <div className="flex items-center gap-[8px]">
                <span className="relative size-[48px] shrink-0 overflow-hidden rounded-[38px] bg-[#f5f6f8]">
                  {l.seller.avatarUrl && <Image src={l.seller.avatarUrl} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <div className="flex flex-col gap-[8px]">
                  <p className="trim-cap text-[16px] font-medium">{l.seller.displayName}</p>
                  <p className="trim-cap text-[12px] text-[#666]">@{l.seller.username}</p>
                </div>
              </div>
              <Link
                href={`/prodavac/${l.seller.username}`}
                className="mt-[10px] flex h-[31px] w-[266px] items-center justify-center border-[0.5px] border-[#e1e1e1] bg-white text-[12px] font-bold"
              >
                SVE PONUDE PRODAVCA
              </Link>
            </div>
            <div className="relative flex h-[75px] items-start px-[19.5px] pt-[24px] text-[12px]">
              <div className="flex w-[58px] flex-col gap-[8px]">
                <p className="trim-cap font-semibold">{stats?.sold ?? 0}</p>
                <p className="trim-cap">prodato</p>
              </div>
              <div className="-mt-[4px] ml-[10px] flex h-[35px] gap-[14px] border-l-[0.5px] border-[#ccc] pl-[10.5px] pt-[4px]">
                <div className="flex w-[46px] flex-col gap-[8px]">
                  <Link href={`/prodavac/${l.seller.username}?tab=recenzije`} className="trim-cap font-semibold hover:underline">
                    {stats?.reviews ?? 0}
                  </Link>
                  <p className="trim-cap">ocena</p>
                </div>
                <div className="flex w-[93px] flex-col gap-[8px]">
                  <p className="trim-cap font-semibold">{stats?.positivePct != null ? `${stats.positivePct}%` : "—"}</p>
                  <p className="trim-cap">pozitivnih ocena</p>
                </div>
              </div>
              <span title="Pozitivne ocene su ocene sa 4 i 5 zvezdica." className="absolute right-[20px] top-[20px]">
                <Image src="/icons/info.svg" alt="Pozitivne ocene su ocene sa 4 i 5 zvezdica." width={11} height={11} />
              </span>
            </div>
          </div>
          <p className="mt-[12px] text-[12px] leading-[1.4] text-[#737373]">
            Artikal prodaje fizičko lice, a cenu je odredio prodavac.
          </p>
        </div>

        <div className="w-[416px] pt-[65px]">
          <div className="border-b-[0.5px] border-[#e1e1e1] pb-[18px]">
            <p className="trim-cap text-[14px] font-semibold leading-[1.4]">OPIS PROIZVODA</p>
            <div className="mt-[18px]">
              <ReadMore text={l.description ?? (l.placeholder ? "Opis artikla." : "")} />
            </div>
          </div>
          <p className="trim-cap mt-[40px] text-[14px] font-semibold leading-[1.4]">DETALJI PROIZVODA</p>
          <dl className="mt-[19px] grid grid-cols-[86px_306px] gap-x-[24px] gap-y-[12px] text-[14px]">
            {details.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="trim-cap">{k}</dt>
                <dd className="trim-cap">{v}</dd>
              </div>
            ))}
            {minor.map(([k, v], i) => (
              <div key={k} className="contents text-[12px] text-[#9a9a9a]">
                <dt className={`trim-cap ${i === 0 ? "mt-[14px]" : ""}`}>{k}</dt>
                <dd className={`trim-cap ${i === 0 ? "mt-[14px]" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="w-[306px] pt-[65px]">
          <p id="kako-ide-kupovina" className="trim-cap scroll-mt-[40px] text-[14px] font-semibold leading-[1.4]">KAKO IDE KUPOVINA</p>
          <ul className="mt-[12px] flex flex-col gap-[10px]">
            {BUY_STEPS.map((step) => (
              <li key={step.title}>
                <details className="group bg-[#f5f6f8]">
                  <summary className="flex h-[54px] cursor-pointer list-none items-center justify-between px-[24px] text-[14px] leading-[1.4] [&::-webkit-details-marker]:hidden">
                    {step.title}
                    <Image src="/icons/plus.svg" alt="" width={14} height={14} className="transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="-mt-[6px] px-[24px] pb-[18px] text-[13px] leading-[1.5] text-[#52525b]">{step.text}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProductCarousel title="Slični proizvodi" href={sub ? `/${category.slug}/${sub.slug}` : `/${category.slug}`} listings={similar} />
      <ProductCarousel title="Još od istog prodavca" href={`/prodavac/${l.seller.username}`} listings={fromSeller} />
    </>
  );
}
