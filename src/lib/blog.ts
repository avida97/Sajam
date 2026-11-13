// Blog (odluka V 11. 11. 2026). Tekstovi se čuvaju ovde, u kodu; novi blog se dodaje kao
// novi unos u BLOG_POSTS (najnoviji prvi). Prvi blog je primer iz Figme („Blog page“ 725:17153).
// Slike su u boji, a stranica ih prikazuje crno-belo i u boji na hover, kao u dizajnu.

export const BLOG_CATEGORIES = [
  { slug: "noviteti-i-trendovi", name: "Noviteti & Trendovi" },
  { slug: "vodici-i-saveti", name: "Vodiči & Saveti" },
  { slug: "retro-i-nostalgija", name: "Retro & Nostalgija" },
  { slug: "recenzije-i-preporuke", name: "Recenzije & Preporuke" },
  { slug: "price-i-intervjui", name: "Priče & Intervjui" },
  { slug: "top-liste-i-rangiranja", name: "Top Liste & Rangiranja" },
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]["slug"];

export type BlogBlock =
  | { type: "section"; heading: string; paragraphs: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "cta"; title: string; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string; // YYYY-MM-DD
  minutes: number;
  author: string;
  image: string; // slika za kartice
  hero: string; // velika slika na vrhu bloga
  blocks: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "vinyl-se-vratio",
    title: "Vinyl se vratio: Zašto svi opet danas slušaju ploče?",
    excerpt:
      "U eri streaminga, kada je gotovo svaka pesma na svetu dostupna jednim klikom, činilo se da su gramofonske ploče zauvek otišle u istoriju. Međutim, poslednjih godina dogodio se neočekivan preokret - vinil se vratio na velika vrata. Prodaja ploča raste iz godine u godinu, gramofoni ponovo zauzimaju centralno mesto u dnevnim sobama. Ali zašto?",
    category: "noviteti-i-trendovi",
    date: "2026-11-11",
    minutes: 6,
    author: "Tim Sajma",
    image: "/images/blog/vinil-boja.png",
    hero: "/images/blog/vinil-naslovna.png",
    blocks: [
      {
        type: "section",
        heading: "Rezime",
        paragraphs: [
          "U eri streaminga, kada je gotovo svaka pesma na svetu dostupna jednim klikom, činilo se da su gramofonske ploče zauvek otišle u istoriju. Međutim, poslednjih godina dogodio se neočekivan preokret - vinil se vratio na velika vrata. Prodaja ploča raste iz godine u godinu, gramofoni ponovo zauzimaju centralno mesto u dnevnim sobama. Ali zašto?",
        ],
      },
      {
        type: "section",
        heading: "Povratak analognog u digitalnom dobu",
        paragraphs: [
          "Digitalna revolucija donela je ogromnu dostupnost muzike. Servisi za strimovanje nude milione pesama, ali upravo ta beskonačnost izbora često dovodi do površnog slušanja. Vinil, s druge strane, zahteva pažnju. Moraš da ustaneš, pažljivo postaviš ploču, spustiš iglu i — slušaš.",
          "To iskustvo je sporije, ali i dublje. Ljudi danas sve više traže takve trenutke — male rituale koji vraćaju osećaj prisutnosti. Digitalna era donela je neverovatnu dostupnost muzike – milioni pesama nalaze se na dohvat ruke, dostupni u svakom trenutku i na svakom uređaju. Ipak, upravo ta dostupnost dovela je do toga da muziku često konzumiramo površno, bez stvarnog povezivanja sa onim što slušamo. Vinil, za razliku od toga, zahteva angažman i prisutnost. Proces slušanja počinje fizičkom interakcijom – vađenjem ploče iz omota, pažljivim postavljanjem na gramofon i spuštanjem igle. Taj ritual usporava tempo i tera nas da se fokusiramo, stvarajući iskustvo koje je mnogo intimnije i svesnije.",
        ],
      },
      {
        type: "section",
        heading: "Zvuk koji ima dušu",
        paragraphs: [
          "Jedan od glavnih razloga povratka vinila jeste kvalitet zvuka. Iako digitalni format nudi čistoću i preciznost, mnogi tvrde da vinil ima „topliji“ i prirodniji ton. Taj blagi šum, sitne nesavršenosti — sve to doprinosi osećaju da slušate nešto živo, gotovo opipljivo.",
          "Za ljubitelje muzike, to nije samo tehničko pitanje, već emocionalno iskustvo. Jedan od najčešće pominjanih razloga za povratak vinila jeste kvalitet zvuka, ali ne u tehničkom smislu savršenstva, već u osećaju koji prenosi. Vinil ne pokušava da bude besprekoran – naprotiv, njegova „nesavršenost“ daje mu karakter. Blagi šum, toplina tonova i način na koji muzika „diše“ stvaraju utisak da slušate nešto organsko i živo. Za mnoge ljubitelje muzike, to nije samo pitanje kvaliteta reprodukcije, već emocionalne povezanosti sa zvukom koji deluje autentičnije i bliže stvarnom izvođenju.",
        ],
      },
      { type: "image", src: "/images/blog/vinil-gramofon.png", alt: "Gramofon sa pločom" },
      {
        type: "section",
        heading: "Fizički format u eri virtuelnog",
        paragraphs: [
          "U vremenu kada je sve postalo digitalno — knjige, fotografije, filmovi — vinil pruža nešto što ne možeš da skroluješ: fizički predmet. U vremenu kada je većina sadržaja postala digitalna i nevidljiva, vinil ploče nude nešto što je danas sve ređe – opipljivost. Veliki omoti albuma, pažljivo dizajnirani vizuali, tekstovi pesama i dodatni materijali pretvaraju svaku ploču u kompletno umetničko delo. Kupovina vinila nije samo kupovina muzike, već i posedovanje nečega što ima estetsku i kolekcionarsku vrednost. Taj fizički aspekt stvara drugačiji odnos prema muzici, jer album postaje predmet koji zauzima prostor i ima svoju priču.",
          "Velike omote, umetničke ilustracije, tekstovi pesama — sve to čini album kompletnim umetničkim delom. Kupovina ploče više liči na kolekcionarski čin nego na običnu potrošnju.",
        ],
      },
      {
        type: "section",
        heading: "Nostalgija i retro estetika",
        paragraphs: [
          "Ne treba zanemariti ni faktor nostalgije. Čak i oni koji nisu odrasli uz ploče osećaju privlačnost prema „starim dobrim vremenima“. Vinil nosi duh prošlih decenija — od jazza i rocka do ranog hip-hopa.",
          "Retro estetika danas je u trendu, a gramofon u dnevnoj sobi postao je i vizuelni statement. Važnu ulogu u popularnosti vinila igra i nostalgija, čak i među onima koji nisu živeli u vremenu kada su ploče bile dominantan format. Postoji određena romantika vezana za prošle decenije, za način na koji se muzika nekada slušala i doživljavala. Vinil nosi sa sobom duh tog vremena, bilo da je reč o jazzu, rocku ili drugim žanrovima koji su oblikovali muzičku istoriju. Retro estetika danas je ponovo u modi, a gramofon često postaje ne samo uređaj za slušanje, već i dekorativni element koji doprinosi identitetu prostora.",
        ],
      },
      {
        type: "cta",
        title: "Napravi mesta za još ploča",
        text: "Napravi nalog, poveži se sa kupcima i daj starim pločama novi život.",
      },
      {
        type: "section",
        heading: "Suprotstavljanje algoritmima",
        paragraphs: [
          "Striming platforme često odlučuju šta ćemo slušati sledeće. Vinil vraća kontrolu u ruke slušaoca. Kada pustiš ploču, slušaš album onako kako je umetnik zamislio — od prve do poslednje pesme.",
          "To je povratak ideji da muzika nije samo pozadina, već iskustvo koje zaslužuje punu pažnju. U eri striminga, gde platforme predlažu šta bi trebalo da slušamo sledeće, vinil pruža potpuno drugačije iskustvo – ono u kojem slušalac donosi odluke. Kada pustite ploču, obično slušate ceo album, redosledom koji je umetnik osmislio. Time se vraća ideja albuma kao zaokružene umetničke celine, a ne samo zbirke pojedinačnih hitova. Ovaj način slušanja podstiče dublje razumevanje muzike i daje veću vrednost svakom delu koje je umetnik stvorio.",
        ],
      },
      {
        type: "section",
        heading: "Zajednica i kultura",
        paragraphs: [
          "Vinil nije samo medij — to je i kultura. Postoje sajmovi ploča, male prodavnice, kolekcionari i entuzijasti koji razmenjuju preporuke i retka izdanja. Kupovina ploče često znači razgovor, preporuku i lični kontakt — nešto što digitalni svet retko pruža. Vinil je mnogo više od muzičkog formata – on je deo šire kulture i zajednice. Postoje specijalizovane prodavnice ploča, sajmovi i okupljanja kolekcionara gde se razmenjuju preporuke, iskustva i retka izdanja. Kupovina ploče često uključuje razgovor sa prodavcem ili drugim ljubiteljima muzike, što stvara osećaj zajedništva koji je u digitalnom svetu sve ređi. Ova društvena dimenzija dodatno doprinosi privlačnosti vinila i njegovom ponovnom usponu.",
        ],
      },
      {
        type: "section",
        heading: "Zaključak: Više od trenda",
        paragraphs: [
          "Povratak vinila nije samo prolazna moda. To je reakcija na ubrzan, digitalizovan svet. Ljudi žele sporije, autentičnije i smislenije iskustvo — a vinil to pruža.",
          "Možda ploče nikada više neće dominirati kao nekada, ali njihova vrednost danas nije u masovnosti, već u načinu na koji nas podsećaju da muzika može biti više od zvuka u pozadini. Može biti ritual, umetnost i trenutak koji zaista živimo. Povratak vinila nije samo prolazna moda ili hipsterski trend, već odraz dublje potrebe za autentičnijim i sporijim načinom života. U svetu koji je ubrzan i preplavljen informacijama, ljudi sve više traže iskustva koja imaju smisao i trajnost. Vinil upravo to nudi – priliku da zastanemo, da se posvetimo muzici i da je doživimo na način koji je potpuniji i ličniji. Možda ploče nikada više neće biti dominantan format, ali njihova vrednost danas leži u tome što nas podsećaju kako muzika može da se sluša – sa pažnjom, emocijom i poštovanjem.",
        ],
      },
    ],
  },
];

export function blogCategoryName(slug: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)!.name;
}

export function findBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

const MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];

export function formatBlogDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}.`;
}
