import Image from "next/image";
import Link from "next/link";
import { MainButton } from "@/components/ui/MainButton";
import { MixedTitle } from "@/components/info/InfoBlocks";
import { blogCategoryName, type BlogPost } from "@/lib/blog";

// Delovi bloga po Figmi: sekcija na početnoj („Blogs“ 412:14131), izdvojeni blogovi
// („Blogs“ 696:16516), kartica u spisku („Blog List“ 696:16554). Slike su crno-bele, a na
// hover u boji (u Figmi „saturation -1“ → „0“).
const GRAY = "grayscale transition-[filter] duration-300 group-hover:grayscale-0";

export const blogHref = (p: BlogPost) => `/blog/${p.slug}`;

export function BlogHeading({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-[572px] flex-col items-center text-center">
      <p className="trim-cap text-[16px] font-medium leading-[0.95] tracking-[-0.64px] text-[#7c7c7c]">
        Saznaj šta vredi kupiti, kako izabrati i gde ih pronaći
      </p>
      <MixedTitle
        as="h1"
        className="mt-[24px]"
        parts={["Saveti, preporuke i priče za", { br: true }, "ljubitelje ", { serif: "polovnih" }, " hobija"]}
      />
      {children}
    </div>
  );
}

function Tag({ post }: { post: BlogPost }) {
  return (
    <span className="inline-flex h-[19px] items-center bg-black px-[12px] text-[10px] font-medium leading-none text-white">
      {blogCategoryName(post.category)}
    </span>
  );
}

// Početna: četiri pločice različite veličine. Na hover (Figma „1–4 blog list“, smart animate
// 0,3 s) slika dobije boju i blago se zamuti, a naslov se podigne i otkrije uvod i dugme.
const TILES = [
  { left: 0, top: 0, w: 526, h: 273 },
  { left: 538, top: 0, w: 318, h: 407 },
  { left: 0, top: 285, w: 526, h: 366 },
  { left: 538, top: 419, w: 318, h: 232 },
];

export function BlogHomeSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length < TILES.length) return null;
  return (
    <section className="mx-auto h-[978px] max-w-site pt-[50px]">
      <BlogHeading>
        <MainButton href="/blog" size="md" className="mt-[35px]">
          Istraži još blogova
        </MainButton>
      </BlogHeading>
      <div className="relative mx-auto mt-[60px] h-[651px] w-[856px]">
        {TILES.map((t, i) => {
          const p = posts[i];
          return (
            <Link
              key={p.slug}
              href={blogHref(p)}
              className="group absolute overflow-hidden rounded-[20px] bg-[#f5f6f8] text-white"
              style={{ left: t.left, top: t.top, width: t.w, height: t.h }}
            >
              <Image
                src={p.image}
                alt=""
                fill
                sizes={`${t.w}px`}
                className={`object-cover transition-[filter,transform] duration-300 group-hover:scale-[1.02] group-hover:blur-[2px] ${GRAY}`}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
              <span
                className="absolute left-[25px] right-[25px] transition-transform duration-300 ease-out group-hover:-translate-y-[69px]"
                style={{ top: t.h - 56 }}
              >
                <span className="line-clamp-2 text-[18px] font-semibold leading-[1.2]">{p.title}</span>
                <span className="mt-[12px] line-clamp-1 text-[12px] leading-[1.3] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {p.excerpt}
                </span>
                <span className="mt-[16px] inline-flex h-[24px] items-center bg-white px-[15px] text-[10px] font-semibold uppercase text-black opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Pročitaj više
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Spisak blogova: najnoviji velik levo, do tri manja desno.
export function BlogFeatured({ posts }: { posts: BlogPost[] }) {
  const [main, ...side] = posts;
  if (!main) return null;
  return (
    <div className="mx-auto flex w-[1076px] gap-[13px]">
      <Link href={blogHref(main)} className="group block w-[564px] shrink-0">
        <span className="relative block h-[262px] overflow-hidden rounded-[20px] bg-[#f5f6f8]">
          <Image src={main.image} alt="" fill sizes="564px" className={`object-cover ${GRAY}`} priority />
        </span>
        <span className="mt-[12px] block pl-px">
          <Tag post={main} />
        </span>
        <span className="mt-[18px] block text-[20px] font-semibold leading-[1.2] text-black">{main.title}</span>
        <span className="mt-[14px] line-clamp-3 text-[13px] leading-[1.4] text-[#666]">{main.excerpt}</span>
      </Link>
      <div className="flex w-[499px] flex-col gap-[13px]">
        {side.slice(0, 3).map((p) => (
          <Link key={p.slug} href={blogHref(p)} className="group flex h-[129px] gap-[13px]">
            <span className="relative block h-[129px] w-[171px] shrink-0 overflow-hidden rounded-[15px] bg-[#f5f6f8]">
              <Image src={p.image} alt="" fill sizes="171px" className={`object-cover ${GRAY}`} />
            </span>
            <span className="min-w-0">
              <Tag post={p} />
              <span className="mt-[12px] line-clamp-3 text-[18px] font-semibold leading-[1.2] text-black">{p.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={blogHref(post)} className="group block w-[306px]">
      <span className="relative block h-[229px] overflow-hidden rounded-[11px] border-[0.7px] border-black/10 bg-[#f5f6f8]">
        <Image src={post.image} alt="" fill sizes="306px" className={`object-cover ${GRAY}`} />
      </span>
      <span className="mt-[24px] block text-[15px] font-semibold leading-[1.2] text-black">{post.title}</span>
      <span className="mt-[7px] line-clamp-3 text-[13px] leading-[1.5] text-[#666]">{post.excerpt}</span>
    </Link>
  );
}
