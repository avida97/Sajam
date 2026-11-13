import Image from "next/image";
import Link from "next/link";
import { Stars } from "@/components/ui/Stars";
import type { ProfileReview } from "@/lib/profiles";
import { tagLabel } from "@/lib/reviews";

// Recenzije po Figmi („Public Profile Page + Reviews“ 653:11830): ukupno, prosek, raspodela
// po zvezdicama, pa svaka recenzija sa kupcem, oznakama i proizvodom.
export function SellerReviews({ reviews }: { reviews: ProfileReview[] }) {
  const year = new Date().getFullYear();
  const thisYear = reviews.filter((r) => new Date(r.createdAt).getFullYear() === year);
  const avg = (xs: ProfileReview[]) => xs.reduce((s, r) => s + r.rating, 0) / xs.length;
  const total = avg(reviews);
  const max = Math.max(...[1, 2, 3, 4, 5].map((n) => reviews.filter((r) => r.rating === n).length));
  return (
    <div className="mx-auto w-[856px] pt-[41px]">
      <div className="flex">
        <div className="w-[313px]">
          <p className="trim-cap text-[16px]">Ukupno recenzija</p>
          <p className="trim-cap mt-[28px] text-[33px]">{reviews.length}</p>
          <p className="trim-cap mt-[17px] text-[14px] text-[#666]">Ove godine: {thisYear.length}</p>
        </div>
        <div className="w-[313px]">
          <p className="trim-cap text-[16px]">Prosečna ocena</p>
          <div className="mt-[28px] flex items-center gap-[12px]">
            <p className="trim-cap text-[33px]">{total.toFixed(1)}</p>
            <Stars value={total} size={19} gap={2} />
          </div>
          <p className="trim-cap mt-[17px] text-[14px] text-[#666]">
            Ove godine: {thisYear.length ? avg(thisYear).toFixed(1) : "—"}
          </p>
        </div>
        <ul aria-label="Raspodela ocena" className="-mt-[15px] flex w-[230px] flex-col gap-[4px]">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = reviews.filter((r) => r.rating === n).length;
            return (
              <li key={n} className="flex h-[18px] items-center" title={`${n} zvezdica: ${c}`}>
                <span className="flex w-[34px] items-center gap-[2px] text-[14px] font-medium text-[#666]">
                  <Stars value={1} size={9} className="[&>svg:not(:first-child)]:hidden" />
                  {n}
                </span>
                <span className="h-[7px] flex-1 rounded-[12px] bg-[#dbdee1]">
                  <span
                    className="block h-[7px] min-w-[7px] rounded-[12px] bg-black"
                    style={{ width: c ? `${(c / max) * 97}%` : 7 }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="mt-[102px] flex flex-col gap-[40px]">
        {reviews.map((r) => (
          <li key={r.id} className="flex min-h-[295px] justify-between border-b border-[#e1e1e1] pb-[40px]">
            <div className="flex w-[526px] flex-col">
              <div className="flex items-center gap-[21px]">
                <span className="relative size-[56px] shrink-0 overflow-hidden rounded-full bg-white">
                  {r.reviewer?.avatarUrl && <Image src={r.reviewer.avatarUrl} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <div className="flex flex-col gap-[4px]">
                  {r.reviewer ? (
                    <Link href={`/prodavac/${r.reviewer.username}`} className="text-[15px] font-medium hover:underline">
                      {r.reviewer.displayName}
                    </Link>
                  ) : (
                    <span className="text-[15px] font-medium">Kupac</span>
                  )}
                  {r.reviewer && <span className="text-[12px] font-medium text-[#676767]">@{r.reviewer.username}</span>}
                  <Stars value={r.rating} size={14} gap={2.5} />
                </div>
              </div>
              <p className="trim-cap mt-[25px] text-[12px] font-medium">{reviewDate(r.createdAt)}</p>
              {r.comment && (
                <p className="mt-[14px] whitespace-pre-line text-[14px] leading-[1.5] text-[#3e3e3e]">{r.comment}</p>
              )}
              {r.tags.length > 0 && (
                <ul className="mt-[24px] flex gap-[9px]">
                  {r.tags.map((t) => (
                    <li key={t} className="flex h-[27px] items-center rounded-[2px] bg-white px-[9px] text-[10px] leading-[1.5]">
                      {tagLabel(t)}
                    </li>
                  ))}
                </ul>
              )}
              {r.listing && (
                <Link href={r.listing.href} className="mt-auto pt-[24px] text-[14px] hover:underline">
                  <span className="trim-cap block font-semibold">{r.listing.title}</span>
                  {r.listing.author && <span className="trim-cap mt-[10px] block">{r.listing.author}</span>}
                </Link>
              )}
            </div>
            {r.listing && (
              <Link href={r.listing.href} className="relative h-[255px] w-[196px] shrink-0 overflow-hidden bg-white">
                {r.listing.image && <Image src={r.listing.image} alt="" fill sizes="196px" className="object-cover" />}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const MONTHS = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
// Kao u Figmi: „Mart 11, 2026.“
function reviewDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}.`;
}

