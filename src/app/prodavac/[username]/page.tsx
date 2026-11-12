import { daysLabel } from "@/lib/shipping";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { MainButton } from "@/components/ui/MainButton";
import { getListingsBySeller } from "@/lib/listings/query";
import { SellerReviews } from "@/components/account/SellerReviews";
import { getProfile, getReviews } from "@/lib/profiles";
import { getCurrentUser } from "@/lib/supabase/server";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ tab?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProfile((await params).username);
  return { title: p ? `${p.displayName} (@${p.username})` : "Profil" };
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" });

// Profil prodavca po Figmi („Profile Page“ 960:34514 i „Public Profile Page + Items for sale /
// + Reviews“). Za MVP bez praćenja (Followers, Following, Zaprati) i bez oznaka „Expert seller“.
// Vlasnik profila umesto „Zaprati“ vidi „Izmeni profil“ i „Moji oglasi“.
export default async function SellerPage({ params, searchParams }: Props) {
  const { username } = await params;
  const { tab } = await searchParams;
  const profile = await getProfile(username);
  if (!profile) notFound();
  const [listings, reviews, me] = await Promise.all([
    getListingsBySeller(profile.username),
    getReviews(profile.id),
    getCurrentUser(),
  ]);
  const own = me?.id === profile.id;
  const forSale = listings.filter((l) => l.status !== "prodato");
  const sold = listings.filter((l) => l.status === "prodato").length;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const showReviews = tab === "recenzije";
  const base = `/prodavac/${profile.username}`;

  return (
    <>
      <section className="mx-auto max-w-site px-[182px] pb-[60px] pt-[68px] text-black">
        <div className="flex items-start gap-[36px]">
          <span className="relative size-[172px] shrink-0 overflow-hidden rounded-full bg-[#f5f6f8]">
            {profile.avatarUrl && <Image src={profile.avatarUrl} alt="" fill sizes="172px" className="object-cover" />}
          </span>
          <div className="flex-1 pt-[8px]">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="flex items-center gap-[10px] text-[28px] leading-[1.2]">
                  {profile.displayName}
                  {avg != null && <span className="text-[14px] font-semibold">★ {avg.toFixed(1)}</span>}
                </h1>
                <p className="mt-[4px] text-[14px] text-[#666]">@{profile.username}</p>
              </div>
              {own && (
                <div className="flex gap-[10px]">
                  <MainButton href="/moj-profil/izmeni">Izmeni profil</MainButton>
                  <MainButton href="/moji-oglasi" variant="light">
                    Moji oglasi
                  </MainButton>
                </div>
              )}
            </div>
            <div className="mt-[22px] flex flex-col gap-[10px] text-[13px]">
              {profile.city && (
                <p className="flex items-center gap-[4px]">
                  <Image src="/icons/location.svg" alt="" width={14} height={14} />
                  {profile.city}, Srbija
                </p>
              )}
              <p>
                <b className="font-semibold">{forSale.length}</b> stvari na prodaju{"   "}
                <b className="ml-[12px] font-semibold">{sold}</b> prodato
              </p>
              {profile.shipsWithinDays && <p>Obično šalje za {daysLabel(profile.shipsWithinDays)}</p>}
              {profile.bio && <p className="max-w-[560px] whitespace-pre-line leading-[1.5] text-[#52525b]">{profile.bio}</p>}
              <p className="text-[12px] text-[#7c7c7c]">Na Sajmu od {fmtDate(profile.createdAt)}</p>
            </div>
          </div>
        </div>

        <nav className="mt-[48px] flex gap-[24px] text-[14px] font-medium">
          <Link href={base} className={`pb-[8px] ${!showReviews ? "border-b-2 border-black" : "text-[#666]"}`}>
            Na prodaju ({forSale.length})
          </Link>
          <Link href={`${base}?tab=recenzije`} className={`pb-[8px] ${showReviews ? "border-b-2 border-black" : "text-[#666]"}`}>
            Recenzije ({reviews.length})
          </Link>
        </nav>
      </section>

      <section className="bg-[#f5f6f8]">
        <div className="mx-auto min-h-[420px] max-w-site px-[182px] py-[48px]">
          {showReviews ? (
            reviews.length ? (
              <SellerReviews reviews={reviews} />
            ) : (
              <Empty title="Još nema recenzija" text="Recenzije ostavljaju kupci posle kupovine." />
            )
          ) : forSale.length ? (
            <div className="grid grid-cols-5 gap-x-[24px] gap-y-[40px]">
              {forSale.map((l) => (
                <div key={l.id} className="relative">
                  <ProductCard listing={l} />
                  {l.status === "rezervisano" && (
                    <span className="absolute left-[8px] top-[8px] bg-white px-[8px] py-[4px] text-[11px] font-semibold">Rezervisano</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Nema artikala"
              text={own ? "Još nemaš nijedan oglas." : "Prodavac trenutno nema ništa na prodaju."}
              action={own}
            />
          )}
        </div>
      </section>
    </>
  );
}

// Prazno stanje iz Figme („No items available“ sa tužnim licem).
function Empty({ title, text, action }: { title: string; text: string; action?: boolean }) {
  return (
    <div className="flex flex-col items-center pt-[40px] text-center">
      <svg width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden>
        <circle cx="29" cy="29" r="27" stroke="#27272a" strokeWidth="3" />
        <circle cx="20" cy="23" r="3" fill="#27272a" />
        <circle cx="38" cy="23" r="3" fill="#27272a" />
        <path d="M18 42c3-5 7-7 11-7s8 2 11 7" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="mt-[18px] font-serif text-[22px] italic">{title}</p>
      <p className="mt-[6px] text-[13px] text-[#71717a]">{text}</p>
      {action && (
        <MainButton href="/prodaj" className="mt-[20px]">
          Započni prodaju
        </MainButton>
      )}
    </div>
  );
}
