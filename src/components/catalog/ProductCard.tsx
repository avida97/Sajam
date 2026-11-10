import Image from "next/image";
import Link from "next/link";
import { CONDITIONS } from "@/lib/conditions";
import { formatRsd, listingHref } from "@/lib/listings/params";
import type { CatalogListing } from "@/lib/listings/types";

// Kartica proizvoda iz Figme („Subject“, 412:6221): slika 196×253, naslov, autor,
// stanje sa kvačicom, lokacija i crna traka sa cenom.
export function ProductCard({ listing }: { listing: CatalogListing }) {
  const condition = CONDITIONS.find((c) => c.value === listing.condition)!;
  const conditionText = ["novo", "kao_novo"].includes(condition.value)
    ? condition.label
    : `${condition.label} stanje`;
  const images = listing.images.slice(0, 3);

  return (
    <article className="relative h-[412px] w-[196px] shrink-0">
      <Link href={listingHref(listing)} className="block">
        <div className="relative h-[253px] w-[196px] overflow-hidden bg-[#f5f6f8]">
          {images[0] && (
            <Image src={images[0]} alt={listing.title} fill sizes="196px" className="object-cover" />
          )}
          {images.length > 1 && (
            <div className="absolute left-1/2 top-[234px] flex -translate-x-1/2 items-center gap-[9px]">
              {images.map((src, i) => (
                <span
                  key={src}
                  className={`h-[3px] rounded-[87px] ${i === 0 ? "w-[41px] bg-black" : "w-[21px] bg-[#e5e5e5]"}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-[20px] h-[62px]">
          <p className="truncate text-[14px] font-semibold text-black">
            {listing.placeholder ? "Naziv artikla" : listing.title}
          </p>
          {listing.author && <p className="mt-[3px] truncate text-[13px] text-black">{listing.author}</p>}
          <p className="mt-[11px] flex items-center gap-[5px] text-[12px] text-black">
            {conditionText}
            <Image src="/icons/condition-check.svg" alt="" width={15} height={15} />
          </p>
        </div>
        <p className="mt-[18px] flex h-[16px] items-center gap-[1px] text-[12px] text-black">
          <Image src="/icons/location.svg" alt="" width={14} height={14} />
          {listing.city ?? "Lokacija"}
        </p>
        <p className="absolute bottom-0 left-0 flex h-[31px] w-[196px] items-center justify-center bg-[#1b1a1a] text-[12px] font-medium uppercase text-white">
          {listing.placeholder ? "Cena RSD" : formatRsd(listing.price_rsd)}
        </p>
      </Link>
      <button
        type="button"
        aria-label="Dodaj u omiljene"
        className="absolute left-[150px] top-[16px] size-[30px]"
      >
        <Image src="/icons/heart.svg" alt="" width={30} height={30} />
      </button>
    </article>
  );
}
