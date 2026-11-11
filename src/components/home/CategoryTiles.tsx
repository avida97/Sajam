import Image from "next/image";
import Link from "next/link";

// „Istraži po kategoriji“ (Figma 412:5090). Redosled je kao u dizajnu. Hover po Figmi
// („Kategorija - hover slike“ 244:465): slika se uveća i blago nagne (smart animate 0,3 s).
const TILES = [
  { slug: "knjige", name: "Knjige" },
  { slug: "mange-i-stripovi", name: "Mange i stripovi" },
  { slug: "igre", name: "Igre" },
  { slug: "muzika", name: "Muzika" },
  { slug: "oprema", name: "Oprema" },
];

export function CategoryTiles() {
  return (
    <section className="mx-auto h-[430px] max-w-site pt-[50px]">
      <h2 className="trim-cap text-center font-serif text-[36px] font-medium italic leading-[0.95] tracking-[-1.08px] text-black">
        Istraži po kategoriji
      </h2>
      <div className="mx-auto mt-[40px] flex w-[1076px] gap-[24px]">
        {TILES.map((t) => (
          <Link key={t.slug} href={`/${t.slug}`} className="group flex w-[196px] flex-col items-center gap-[24px]">
            <span className="relative block size-[196px] overflow-hidden bg-[#f5f6f8]">
              <Image
                src={`/images/kategorije/${t.slug}.png`}
                alt=""
                width={196}
                height={196}
                className="size-full object-cover transition-transform duration-300 ease-out group-hover:-translate-x-[5px] group-hover:translate-y-[3px] group-hover:-rotate-[3.7deg] group-hover:scale-[1.12]"
              />
            </span>
            <span className="trim-cap text-[14px] uppercase leading-[0.95] tracking-[0.84px] text-black">{t.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
