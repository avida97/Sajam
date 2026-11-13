import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/BlogParts";
import { BLOG_POSTS, blogCategoryName, findBlogPost, formatBlogDate } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findBlogPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt.slice(0, 160) } : { title: "Blog" };
}

// Blog po Figmi („Blog page“ 725:17153): putanja, naslov, autor i vreme čitanja, velika slika,
// odeljci sa naslovima u kurzivu, slika preko cele širine, crna traka sa pozivom i
// „Nastavi da čitaš“. Newsletter iz dizajna dolazi posle MVP-a.
export default async function BlogPostPage({ params }: Props) {
  const post = findBlogPost((await params).slug);
  if (!post) notFound();
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 4);
  const crumb = <Image src="/icons/breadcrumb.svg" alt="" width={4} height={8} />;

  return (
    <article className="pb-[110px] text-black">
      <div className="mx-auto w-[856px] pt-[80px]">
        <nav aria-label="Putanja" className="flex items-center gap-[8px] text-[11px] text-[#666]">
          <Link href="/blog" className="hover:text-black">
            Blogovi
          </Link>
          {crumb}
          <Link href={`/blog?kategorija=${post.category}#spisak`} className="hover:text-black">
            {blogCategoryName(post.category)}
          </Link>
          {crumb}
          <span className="truncate">{post.title}</span>
        </nav>

        <h1 className="mt-[40px] text-[39px] font-semibold leading-[1.3] tracking-[-0.78px]">{post.title}</h1>
        <div className="mt-[25px] flex h-[39px] items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <span className="flex size-[39px] items-center justify-center rounded-full bg-black text-[16px] font-semibold text-white">
              S
            </span>
            <span className="text-[14px] leading-[1.3]">{post.author}</span>
          </div>
          <div className="flex items-center gap-[12px] self-end text-[12px] font-medium text-[#666]">
            <span className="flex items-center gap-[8px]">
              <Image src="/icons/clock.svg" alt="" width={13} height={13} />
              {post.minutes} minuta
            </span>
            <span className="flex items-center gap-[8px]">
              <Image src="/icons/calendar.svg" alt="" width={13} height={13} />
              {formatBlogDate(post.date)}
            </span>
          </div>
        </div>

        <div className="relative mt-[80px] h-[398px] overflow-hidden rounded-[20px] bg-[#f5f6f8]">
          <Image src={post.hero} alt="" fill sizes="856px" className="object-cover" priority />
        </div>
      </div>

      <div className="mt-[40px] flex flex-col gap-[40px]">
        {post.blocks.map((b, i) =>
          b.type === "image" ? (
            <div key={i} className="relative mx-auto h-[420px] w-full max-w-site">
              <Image src={b.src} alt={b.alt} fill sizes="1440px" className="object-cover" />
            </div>
          ) : b.type === "cta" ? (
            <div key={i} className="mx-auto flex h-[116px] w-[856px] items-center justify-between rounded-[4px] bg-black px-[28px] text-white">
              <div>
                <p className="font-serif text-[32px] font-semibold italic leading-none">{b.title}</p>
                <p className="mt-[16px] text-[14px] font-light leading-none">{b.text}</p>
              </div>
              <Link
                href="/prodaj"
                className="flex h-[31px] items-center bg-white px-[21px] text-[12px] font-bold uppercase tracking-[-0.12px] text-black transition-colors hover:bg-[#f5f6f8]"
              >
                Započni prodaju
              </Link>
            </div>
          ) : (
            <section key={i} className="mx-auto w-[856px]">
              <h2 className="text-[32px] font-bold italic leading-[1.2] tracking-[-0.32px]">{b.heading}</h2>
              {b.paragraphs.map((p, k) => (
                <p key={k} className={`${k ? "mt-[24px]" : "mt-[25px]"} text-[16px] leading-[1.5] text-[#666]`}>
                  {p}
                </p>
              ))}
            </section>
          ),
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-[206px] max-w-site px-[72px]">
          <h2 className="trim-cap text-center font-serif text-[36px] font-medium italic leading-[0.95] tracking-[-1.08px]">
            Nastavi da čitaš
          </h2>
          <div className="mt-[40px] flex gap-[24px]">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
