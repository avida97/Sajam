import Image from "next/image";
import Link from "next/link";
import { MainButton } from "@/components/ui/MainButton";
import { BLOG_POSTS } from "@/lib/blog";

// Dodaci na dnu stranica kategorija (V 13. 11. 2026, prebačeno sa „O nama“): tekst sa bloga koji
// pripada kategoriji i poziv da i kupac proda nešto svoje.

const GRADIENT =
  "linear-gradient(90deg, rgb(136,166,222) 0%, rgb(144,165,213) 17.5%, rgb(163,180,220) 36%, rgb(164,175,216) 56%, rgb(185,188,226) 75%, rgb(197,192,231) 87.5%, rgb(205,188,236) 100%)";

// Koji blog ide uz koju kategoriju; kad bude više tekstova, dodaje se ovde.
const BLOG_FOR_CATEGORY: Record<string, string> = { muzika: "vinyl-se-vratio" };

export function CategoryBlog({ categorySlug }: { categorySlug: string }) {
  const post = BLOG_POSTS.find((p) => p.slug === BLOG_FOR_CATEGORY[categorySlug]);
  if (!post) return null;
  return (
    <section className="mx-auto mt-[90px] max-w-site px-[182px]">
      <Link href={`/blog/${post.slug}`} className="group grid grid-cols-[520px_1fr] items-center gap-[60px]">
        <span className="relative block h-[300px] overflow-hidden rounded-[20px]">
          <Image src={post.image} alt="" fill sizes="520px" className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0" />
        </span>
        <span>
          <span className="text-[13px] font-semibold uppercase tracking-[2px] text-[#7c7c7c]">Sa bloga</span>
          <span className="mt-[14px] block text-[30px] font-semibold leading-[1.15] tracking-[-1px] text-black">{post.title}</span>
          <span className="mt-[16px] inline-block text-[13px] font-semibold text-black underline-offset-4 group-hover:underline">Pročitaj →</span>
        </span>
      </Link>
    </section>
  );
}

export function SellCta() {
  return (
    <section className="mx-auto mb-[90px] mt-[90px] max-w-site px-[72px]">
      <div className="relative overflow-hidden rounded-[15px] px-[60px] py-[70px] text-center" style={{ backgroundImage: GRADIENT }}>
        <div className="absolute left-[8%] top-[5%] size-[360px] rounded-full bg-white/40 blur-[60px]" />
        <div className="absolute bottom-[-15%] right-[10%] size-[400px] rounded-full bg-[#e9d7ff]/60 blur-[70px]" />
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-[0.15] mix-blend-multiply">
          <filter id="sell-sum">
            <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#sell-sum)" />
        </svg>
        <div className="relative">
          <h2 className="text-[48px] font-semibold leading-[1.05] tracking-[-2.4px] text-black">
            Imaš nešto što ti <span className="font-serif text-[55px] italic tracking-[-1.9px]">više</span>
            <br />
            ne treba?
          </h2>
          <p className="mt-[20px] text-[16px] font-medium text-black/70">Neko baš to traži. Oglas objaviš za par minuta.</p>
          <div className="mt-[28px] flex justify-center">
            <MainButton href="/prodaj" size="md">
              Započni prodaju
            </MainButton>
          </div>
        </div>
      </div>
    </section>
  );
}
