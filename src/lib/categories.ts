// Kategorije i potkategorije iz Figme (meni u nav baru).
// Isti spisak se upisuje u bazu kroz supabase/seed.sql; ako se ovde menja, menja se i tamo.

export type ItemType = "knjiga" | "muzika" | "igra" | "manga_strip" | "oprema";

export type Subcategory = { slug: string; name: string };

export type Category = {
  slug: string;
  name: string;
  itemType: ItemType;
  subcategories: Subcategory[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "knjige",
    name: "Knjige",
    itemType: "knjiga",
    subcategories: [
      { slug: "beletristika", name: "Beletristika" },
      { slug: "knjige-za-decu", name: "Knjige za decu" },
      { slug: "casopisi", name: "Časopisi" },
      { slug: "antikvarne-knjige", name: "Antikvarne knjige" },
      { slug: "strane-knjige", name: "Strane knjige" },
      { slug: "strucna-literatura", name: "Stručna literatura" },
      { slug: "udzbenici-i-lektire", name: "Udžbenici i lektire" },
    ],
  },
  {
    slug: "muzika",
    name: "Muzika",
    itemType: "muzika",
    subcategories: [
      { slug: "gramofonske-ploce", name: "Gramofonske ploče" },
      { slug: "blu-ray-dvd-koncerti", name: "Blu-ray / DVD koncerti" },
      { slug: "cd", name: "CD-ovi" },
      { slug: "merch", name: "Merch" },
      { slug: "audiokasete", name: "Audiokasete" },
    ],
  },
  {
    slug: "igre",
    name: "Igre",
    itemType: "igra",
    subcategories: [
      { slug: "pc-i-konzolne-igre", name: "PC i konzolne igre" },
      { slug: "slagalice", name: "Slagalice" },
      { slug: "lego", name: "Lego" },
      { slug: "karte-i-slicice", name: "Karte i sličice" },
      { slug: "drustvene-igre", name: "Društvene igre" },
      { slug: "kolekcionarska-izdanja", name: "Kolekcionarska izdanja" },
    ],
  },
  {
    slug: "mange-i-stripovi",
    name: "Mange i stripovi",
    itemType: "manga_strip",
    subcategories: [
      { slug: "mange", name: "Mange" },
      { slug: "stripovi", name: "Stripovi" },
      { slug: "graficki-romani", name: "Grafički romani" },
      { slug: "kolekcionarski", name: "Kolekcionarski" },
      { slug: "ostalo", name: "Ostalo" },
    ],
  },
  {
    slug: "oprema",
    name: "Oprema",
    itemType: "oprema",
    subcategories: [
      { slug: "audio-oprema", name: "Audio oprema" },
      { slug: "racunarska-oprema", name: "Računarska oprema" },
      { slug: "gaming-oprema", name: "Gaming oprema" },
      { slug: "hi-fi-oprema", name: "Hi-Fi oprema" },
      { slug: "oprema-za-knjige", name: "Oprema za knjige" },
      { slug: "ostalo", name: "Ostalo" },
    ],
  },
];

// Meni „O nama“ iz Figme.
export const ABOUT_LINKS = [
  { href: "/pomoc/kupovina", name: "O kupovini" },
  { href: "/pomoc/prodaja", name: "O prodaji" },
  { href: "/pomoc/naknade", name: "Naknade" },
  { href: "/saradnja", name: "Saradnja" },
  { href: "/pomoc", name: "Pomoć" },
  { href: "/kontakt", name: "Kontakt" },
];

// Polja forme koja nemaju smisla za određeni tip proizvoda (odluka 10. 11. 2026).
export const HIDDEN_FIELDS: Record<ItemType, Array<"author" | "isbn" | "page_count" | "publisher">> = {
  knjiga: [],
  manga_strip: [],
  muzika: ["isbn", "page_count"],
  igra: ["author", "isbn", "page_count"],
  oprema: ["author", "isbn", "page_count", "publisher"],
};
