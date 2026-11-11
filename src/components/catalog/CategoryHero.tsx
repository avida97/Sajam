import Image from "next/image";

// Hero stranice kategorije (Figma „Products Knjige“ 500:7232): ljubičasto-plavi prelaz sa
// zamućenim mrljama i šumom, naslov i pretraga. Tekst naslova je kao u dizajnu.
export function CategoryHero({ action, query, placeholder }: { action: string; query?: string; placeholder: string }) {
  return (
    <section className="mx-auto h-[439px] max-w-site px-[72px] pt-[65px]">
      <HeroBackdrop>
        <div className="relative mx-auto flex w-[416px] flex-col items-center pt-[50px] text-center text-black">
          <h1 className="trim-cap text-[48px] font-semibold leading-[1.1] tracking-[-2.4px]">
            Napravi{" "}
            <span className="font-serif text-[56px] font-semibold italic tracking-[-2.24px]">mesta</span> za još
            knjiga
          </h1>
          <p className="trim-cap mt-[42px] text-[16px] font-light leading-[0.95] tracking-[-0.64px]">
            Poveži se s čitaocima i daj starim knjigama novi život.
          </p>
        </div>

        <form action={action} role="search" className="absolute left-1/2 top-[235px] h-[39px] w-[416px] -translate-x-1/2">
          <Image src="/icons/search.svg" alt="" width={18} height={17} className="pointer-events-none absolute left-[16px] top-[11px]" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder={placeholder}
            aria-label="Pretraga"
            className="h-full w-full rounded-[97px] bg-field pl-[42px] pr-4 text-[12px] font-medium text-black placeholder:text-black focus:outline-none"
          />
        </form>
      </HeroBackdrop>
    </section>
  );
}

// Pozadina hero okvira (prelaz, mrlje i šum), deli je i centar za pomoć.
export function HeroBackdrop({ children }: { children: React.ReactNode }) {
  return (
      <div
        className="relative h-[324px] overflow-hidden rounded-[15px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.535%, rgb(163,180,220) 36.239%, rgb(164,175,216) 56.538%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)",
        }}
      >
        <Image src="/images/hero/blob-3.svg" alt="" width={262} height={257} className="pointer-events-none absolute left-[587px] top-[68px] max-w-none" />
        <Image src="/images/hero/blob-5.svg" alt="" width={246} height={222} className="pointer-events-none absolute left-[188px] top-[123px] max-w-none" />
        <Image src="/images/hero/blob-4.svg" alt="" width={361} height={157} className="pointer-events-none absolute left-0 top-0 max-w-none" />
        {/* Šum iz Figme (Noise, monotone, 15 %). */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-[0.15] mix-blend-multiply">
          <filter id="sum">
            <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#sum)" />
        </svg>

        {children}
      </div>
  );
}
