import type { Metadata } from "next";
import { BlogCard, BlogFeatured, BlogHeading } from "@/components/blog/BlogParts";
import { SubcategoryTabs } from "@/components/catalog/SubcategoryTabs";
import { MainButton } from "@/components/ui/MainButton";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog" };

const PER_PAGE = 12;

type Props = { searchParams: Promise<{ kategorija?: string; prikazi?: string }> };

// Spisak blogova po Figmi („Blogs listing“ 694:15867). Newsletter iz dizajna dolazi posle MVP-a.
export default async function BlogPage({ searchParams }: Props) {
  const { kategorija, prikazi } = await searchParams;
  const category = BLOG_CATEGORIES.find((c) => c.slug === kategorija);
  const list = category ? BLOG_POSTS.filter((p) => p.category === category.slug) : BLOG_POSTS;
  const shown = Math.max(PER_PAGE, Number(prikazi) || PER_PAGE);
  const href = (k?: string) => (k ? `/blog?kategorija=${k}#spisak` : "/blog#spisak");

  return (
    <div className="pb-[120px]">
      <section className="mx-auto max-w-site pt-[80px]">
        <BlogHeading />
        <div className="mt-[60px]">
          <BlogFeatured posts={BLOG_POSTS.slice(0, 4)} />
        </div>
      </section>

      <section id="spisak" className="mx-auto mt-[156px] max-w-site scroll-mt-[20px]">
        <div className="flex justify-center">
          <SubcategoryTabs
            label="Kategorije blogova"
            className="w-[1146px]"
            items={[
              { href: href(), name: "Svi blogovi", active: !category },
              ...BLOG_CATEGORIES.map((c) => ({ href: href(c.slug), name: c.name, active: c.slug === category?.slug })),
            ]}
          />
        </div>

        {list.length ? (
          <div className="mx-[72px] mt-[80px] grid grid-cols-[repeat(4,306px)] gap-x-[24px] gap-y-[50px]">
            {list.slice(0, shown).map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <p className="mt-[80px] text-center text-[14px] text-[#666]">U ovoj kategoriji još nema blogova.</p>
        )}

        {list.length > shown && (
          <div className="mt-[70px] flex justify-center">
            <MainButton
              href={`/blog?${new URLSearchParams({ ...(category ? { kategorija: category.slug } : {}), prikazi: String(shown + PER_PAGE) })}#spisak`}
              size="md"
              scroll={false}
            >
              Prikaži više
            </MainButton>
          </div>
        )}
      </section>
    </div>
  );
}
