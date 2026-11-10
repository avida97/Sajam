// Tekstovi padajućih menija iz Figme (komponenta „Nav bar“, varijante „Nav bar + …“).
// Raspored u Figmi: dve kolone po tri stavke, popunjava se prvo leva kolona.
import { ABOUT_LINKS, CATEGORIES } from "@/lib/categories";

export type MenuItem = { href: string; name: string; description: string };

export type MenuPanel = {
  key: string;
  label: string;
  href: string;
  title: string;
  description: string;
  items: MenuItem[];
  ctaText: string;
  ctaHref: string;
  image: string;
};

// Opisi potkategorija prepisani iz Figme, redom kao u CATEGORIES.
const DESCRIPTIONS: Record<string, string[]> = {
  knjige: [
    "Romani, priče i ostala proza",
    "Knjige za najmlađe čitaoce",
    "Tematski paketi polovnih knjiga",
    "Retka i antikvarna polovna izdanja",
    "Polovne knjige na stranim jezicima",
    "Literatura za stručno usavršavanje",
    "Polovni udžbenici i školske lektire",
  ],
  muzika: [
    "Polovne vinil ploče za ljubitelje analognog zvuka",
    "Snimci koncerata i muzički filmovi",
    "Polovni CD-ovi različitih žanrova u dobrom stanju",
    "Muzički suveniri i merch omiljenih izvođača",
    "Kasete sa muzikom iz različitih perioda",
  ],
  igre: [
    "Igre za PC, PlayStation, Xbox i Nintendo konzole",
    "Slagalice za sve uzraste i nivoe težine",
    "PC igre različitih žanrova i sistema",
    "Polovne TCG karte i sličice za albume",
    "Klasične i moderne igre za druženje",
    "Retka i kolekcionarska izdanja",
  ],
  "mange-i-stripovi": [
    "Polovne mange različitih žanrova i serijala",
    "Stripovi domaćih i stranih izdavača",
    "Samostalne strip priče sa bogatim ilustracijama",
    "Retka i limitirana izdanja za kolekcionare",
    "Artbookovi, fanzini i slična izdanja",
  ],
  oprema: [
    "Gramofoni, CD plejeri, kasetofoni, zvučnici",
    "Tastature, miševi, monitori",
    "Kontroleri, konzole, dodaci",
    "Pojačala, zvučni sistemi",
    "Police, stalci, lampe za čitanje",
    "Ostali korisni dodaci i oprema",
  ],
};

const HEADINGS: Record<string, { description: string; cta: string }> = {
  knjige: {
    description: "Veliki izbor polovnih naslova za sve uzraste i različita interesovanja",
    cta: "Pretvori stare knjige u novac uz jednostavnu i brzu prodaju",
  },
  muzika: {
    description: "Raznovrstan izbor polovnih muzičkih izdanja za sve ukuse",
    cta: "Unovči svoju muziku jednostavno i brzo bez komplikacija",
  },
  igre: {
    description: "Raznovrstan izbor polovnih igara za sve platforme",
    cta: "Prodaj svoje igre jednostavno i brzo bez komplikacija",
  },
  "mange-i-stripovi": {
    description:
      "Veliki izbor polovnih mangi i stripova, od popularnih serijala do ređih izdanja",
    cta: "Prodaj svoje mange i stripove brzo i lako uz sigurnu isplatu",
  },
  oprema: {
    description: "Raznovrsna polovna oprema za knjige, igre i svakodnevnu upotrebu",
    cta: "Unovči svoju opremu brzo i sigurno uz jednostavan proces prodaje bez komplikacija",
  },
};

// Redosled potkategorija u Figmi se razlikuje od redosleda u tabeli strukture,
// pa je ovde zapisan eksplicitno (leva kolona odozgo, pa desna).
const FIGMA_ORDER: Record<string, string[]> = {
  knjige: [
    "beletristika",
    "knjige-za-decu",
    "antikvarne-knjige",
    "strucna-literatura",
    "casopisi",
    "strane-knjige",
    "udzbenici-i-lektire",
  ],
  muzika: ["gramofonske-ploce", "cd", "audiokasete", "blu-ray-dvd-koncerti", "merch"],
  igre: [
    "pc-i-konzolne-igre",
    "lego",
    "drustvene-igre",
    "slagalice",
    "karte-i-slicice",
    "kolekcionarska-izdanja",
  ],
  "mange-i-stripovi": ["mange", "stripovi", "graficki-romani", "kolekcionarski", "ostalo"],
  oprema: [
    "audio-oprema",
    "gaming-oprema",
    "oprema-za-knjige",
    "racunarska-oprema",
    "hi-fi-oprema",
    "ostalo",
  ],
};

const categoryPanels: MenuPanel[] = CATEGORIES.map((cat) => {
  const bySlug = new Map(
    cat.subcategories.map((s, i) => [s.slug, { ...s, description: DESCRIPTIONS[cat.slug][i] }]),
  );
  return {
    key: cat.slug,
    label: cat.name,
    href: `/${cat.slug}`,
    title: cat.name,
    description: HEADINGS[cat.slug].description,
    items: FIGMA_ORDER[cat.slug].map((slug) => {
      const s = bySlug.get(slug)!;
      return { href: `/${cat.slug}/${s.slug}`, name: s.name, description: s.description };
    }),
    ctaText: HEADINGS[cat.slug].cta,
    ctaHref: "/prodaj",
    image: `/images/nav/${cat.slug}.jpg`,
  };
});

// „O nama“ — opisi su prepisani iz Figme kakvi jesu; neki su ponovljeni iz menija Oprema
// i Anka treba da ih zameni.
const ABOUT_DESCRIPTIONS = [
  "Povezujemo kupce i prodavce na jednom mestu",
  "Kontroleri, konzole, dodaci",
  "Police, stalci, lampe za čitanje",
  "Brzo i jednostavno postavljanje oglasa",
  "Pojačala, zvučni sistemi",
  "Jednostavna kupovina i prodaja bez komplikacija",
];

const aboutPanel: MenuPanel = {
  key: "o-nama",
  label: "O nama",
  href: "/o-nama",
  title: "O nama",
  description: "Mesto za kupovinu i prodaju polovnih knjiga, muzike i igara",
  items: ABOUT_LINKS.map((l, i) => ({ ...l, description: ABOUT_DESCRIPTIONS[i] })),
  ctaText: "Saveti, preporuke i priče iz sveta knjiga, muzike, igara i kolekcionarstva",
  ctaHref: "/o-nama",
  image: "/images/nav/o-nama.jpg",
};

export const MENU_PANELS: MenuPanel[] = [...categoryPanels, aboutPanel];
