import type { ItemType } from "@/lib/categories";

// Žanrovi za filter „Žanrovi“. Isti spisak je u supabase/migrations/20261110000200_pocetni_podaci.sql;
// kad baza bude povezana, čita se iz tabele genres.
const BOOK_GENRES = [
  ["roman", "Roman"],
  ["romansa", "Romansa"],
  ["krimi-i-triler", "Krimi i triler"],
  ["fantastika", "Fantastika"],
  ["naucna-fantastika", "Naučna fantastika"],
  ["horor", "Horor"],
  ["avantura", "Avantura"],
  ["istorija", "Istorija"],
  ["biografije", "Biografije i memoari"],
  ["poezija", "Poezija"],
  ["popularna-nauka", "Popularna nauka"],
  ["filozofija", "Filozofija"],
  ["psihologija-i-samopomoc", "Psihologija i samopomoć"],
  ["decje", "Za decu"],
  ["ostalo", "Ostalo"],
] as const;

export const GENRES: Record<ItemType, Array<{ slug: string; name: string }>> = {
  knjiga: BOOK_GENRES.map(([slug, name]) => ({ slug, name })),
  manga_strip: BOOK_GENRES.map(([slug, name]) => ({ slug, name })),
  muzika: [
    ["rok", "Rok"],
    ["pop", "Pop"],
    ["dzez", "Džez"],
    ["klasicna", "Klasična"],
    ["elektronska", "Elektronska"],
    ["hip-hop", "Hip-hop"],
    ["narodna", "Narodna"],
    ["ostalo", "Ostalo"],
  ].map(([slug, name]) => ({ slug, name })),
  igra: [
    ["akcija", "Akcija"],
    ["avantura", "Avantura"],
    ["strategija", "Strategija"],
    ["sport", "Sport"],
    ["porodicne", "Porodične"],
    ["ostalo", "Ostalo"],
  ].map(([slug, name]) => ({ slug, name })),
  oprema: [],
};

// Jezici iz Figme (filter „Jezik“ na stranici Knjige).
export const LANGUAGES = ["Srpski", "Engleski", "Ruski", "Hrvatski", "Slovenački"] as const;

// Opsezi iz Figme (filter „Broj knjiga u paketu“).
export const BUNDLE_RANGES = [
  { value: "1", label: "1 knjiga", min: 1, max: 1 },
  { value: "2-5", label: "2 - 5 knjiga", min: 2, max: 5 },
  { value: "5-10", label: "5 - 10 knjiga", min: 5, max: 10 },
  { value: "10+", label: "preko 10 knjiga", min: 11, max: Infinity },
];
