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

// Opisi potkategorija iz Figme, redom kao u CATEGORIES. Časopisi i Lego imali su tuđe opise
// (greška u Figmi), pa su zamenjeni (odluka V 11. 11. 2026).
const DESCRIPTIONS: Record<string, string[]> = {
  knjige: [
    "Romani, priče i ostala proza",
    "Knjige za najmlađe čitaoce",
    "Časopisi, magazini i stari brojevi",
    "Retka i antikvarna izdanja",
    "Knjige na stranim jezicima",
    "Literatura za stručno usavršavanje",
    "Udžbenici i školske lektire",
  ],
  muzika: [
    "Vinil ploče za ljubitelje analognog zvuka",
    "Snimci koncerata i muzički filmovi",
    "CD-ovi svih žanrova",
    "Muzički suveniri i merch omiljenih izvođača",
    "Kasete sa muzikom iz različitih perioda",
  ],
  igre: [
    "Igre za PC, PlayStation, Xbox i Nintendo konzole",
    "Slagalice za sve uzraste i nivoe težine",
    "Lego kocke, setovi i figurice",
    "TCG karte i sličice za albume",
    "Klasične i moderne igre za druženje",
    "Retka i kolekcionarska izdanja",
  ],
  "mange-i-stripovi": [
    "Mange različitih žanrova i serijala",
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
    description: "Naslovi za sve uzraste i interesovanja",
    cta: "Pretvori pročitane knjige u novac",
  },
  muzika: {
    description: "Muzička izdanja za sve ukuse",
    cta: "Ploče i CD-ovi koje više ne slušaš",
  },
  igre: {
    description: "Igre za sve platforme i društvo",
    cta: "Prodaj igre koje više ne igraš",
  },
  "mange-i-stripovi": {
    description: "Od popularnih serijala do ređih izdanja",
    cta: "Mange i stripovi koji čekaju novog čitaoca",
  },
  oprema: {
    description: "Oprema za muziku, igre i čitanje",
    cta: "Oprema koja ti više ne treba",
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

// „O nama“: u Figmi su opisi bili pomešani sa menijem Oprema, pa su napisani da odgovaraju
// stranicama na koje vode (odluka V 11. 11. 2026). Redom kao ABOUT_LINKS.
const ABOUT_DESCRIPTIONS = [
  "Kako da pronađeš proizvod i dogovoriš kupovinu",
  "Kako da postaviš oglas i prodaš proizvod",
  "Šta se plaća na Sajmu",
  "Za knjižare, izdavače i brendove koji žele da sarađuju sa nama",
  "Odgovori na najčešća pitanja",
  "Piši nam ako ti treba pomoć",
];

const aboutPanel: MenuPanel = {
  key: "o-nama",
  label: "O nama",
  href: "/o-nama",
  title: "O nama",
  description: "Mesto za kupovinu i prodaju knjiga, muzike, igara i opreme",
  items: ABOUT_LINKS.map((l, i) => ({ ...l, description: ABOUT_DESCRIPTIONS[i] })),
  ctaText: "Upoznaj Sajam: ko smo i zašto smo ga napravili",
  ctaHref: "/o-nama",
  image: "/images/nav/o-nama.jpg",
};

export const MENU_PANELS: MenuPanel[] = [...categoryPanels, aboutPanel];
