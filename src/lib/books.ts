import "server-only";
import type { BookDetail, BookHit } from "@/lib/isbn";

// Traženje knjiga u javnim bazama: Google Books (sa našim ključem), a za ISBN koji Google
// nema i Open Library. Bez ključa Google deli jednu dnevnu kvotu na ceo svet i vraća 429.

const KEY = process.env.GOOGLE_BOOKS_API_KEY;
const GOOGLE = "https://www.googleapis.com/books/v1/volumes";
const DAY = { next: { revalidate: 86400 } };

export class UpstreamError extends Error {}

// ISO 639-1 (Google) i 639-2 (Open Library) kodovi jezika koje forma nudi.
const LANGUAGE_CODES: Record<string, BookDetail["language"]> = {
  sr: "Srpski",
  srp: "Srpski",
  en: "Engleski",
  eng: "Engleski",
  ru: "Ruski",
  rus: "Ruski",
  hr: "Hrvatski",
  hrv: "Hrvatski",
  sl: "Slovenački",
  slv: "Slovenački",
};
const DOMESTIC = new Set(["sr", "srp", "hr", "hrv", "bs", "bos", "sh", "cnr"]);

// Google kategorije (npr. „Fiction / Mystery & Detective / General“) → naše potkategorije Knjiga.
// Prvo pravilo koje se poklopi pobeđuje; ako ništa ne odgovara, polje ostaje prazno.
const SUBCATEGORY_RULES: Array<[RegExp, string]> = [
  [/juvenile|children/i, "knjige-za-decu"],
  [/education|study aids|textbook/i, "udzbenici-i-lektire"],
  [/computers|medical|law|technology|engineering|business|economics|mathematics|science|architecture|reference/i, "strucna-literatura"],
  [/fiction|poetry|drama|literary/i, "beletristika"],
];

// … i naši žanrovi (isti spisak kao u src/lib/genres.ts).
const GENRE_RULES: Array<[RegExp, string]> = [
  [/juvenile|children/i, "decje"],
  [/science fiction/i, "naucna-fantastika"],
  [/fantasy/i, "fantastika"],
  [/horror/i, "horor"],
  [/mystery|detective|thriller|crime|suspense/i, "krimi-i-triler"],
  [/romance/i, "romansa"],
  [/adventure/i, "avantura"],
  [/biography|autobiography|memoir/i, "biografije"],
  [/poetry/i, "poezija"],
  [/philosophy/i, "filozofija"],
  [/psychology|self-help/i, "psihologija-i-samopomoc"],
  [/^history/i, "istorija"],
  [/science|nature/i, "popularna-nauka"],
  [/fiction/i, "roman"],
];

function classify(categories: string[], language: string | null) {
  const text = categories.join(" | ");
  const match = (rules: Array<[RegExp, string]>) => rules.find(([re]) => re.test(text))?.[1] ?? null;
  let subcategory = match(SUBCATEGORY_RULES);
  // Knjiga na stranom jeziku, a nije za decu, udžbenik ni stručna → „Strane knjige“.
  if (language && !DOMESTIC.has(language) && (subcategory === null || subcategory === "beletristika")) {
    subcategory = "strane-knjige";
  }
  return { subcategory, genre: match(GENRE_RULES) };
}

/** Google opis zna da ima HTML (<p>, <b>, <br>); u formi treba običan tekst. */
function plainText(html: string | undefined) {
  if (!html) return null;
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text ? text.slice(0, 3000) : null;
}

const https = (url: string | undefined) => (url ? url.replace(/^http:/, "https:").replace("&edge=curl", "") : null);

type GoogleVolume = {
  id: string;
  volumeInfo: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    language?: string;
    description?: string;
    categories?: string[];
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    imageLinks?: Partial<Record<"smallThumbnail" | "thumbnail" | "small" | "medium" | "large" | "extraLarge", string>>;
  };
};

const isbnOf = (v: GoogleVolume["volumeInfo"]) =>
  v.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ??
  v.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier ??
  null;
const titleOf = (v: { title?: string; subtitle?: string }) => [v.title, v.subtitle].filter(Boolean).join(": ");

async function google(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ ...params, ...(KEY ? { key: KEY } : {}) });
  const res = await fetch(`${GOOGLE}${path}?${qs}`, { ...DAY, signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn("Google Books:", res.status, (await res.text()).slice(0, 300));
    throw new UpstreamError(`Google Books ${res.status}`);
  }
  return res.json();
}

async function openLibrary(isbn: string) {
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, {
    ...DAY,
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "Sajam/1.0 (book marketplace)" },
  }).catch(() => null);
  if (!res?.ok) return null;
  return ((await res.json()) as Record<string, OpenLibraryBook>)[`ISBN:${isbn}`] ?? null;
}

type OpenLibraryBook = {
  title?: string;
  subtitle?: string;
  authors?: Array<{ name: string }>;
  publishers?: Array<{ name: string }>;
  publish_date?: string;
  number_of_pages?: number;
  languages?: Array<{ key: string }>;
  subjects?: Array<{ name: string }>;
  cover?: { small?: string; medium?: string; large?: string };
  notes?: string | { value: string };
};

export type SearchBy = "isbn" | "naslov" | "autor";

/** Do 6 knjiga za padajuću listu. */
export async function searchBooks(by: SearchBy, q: string): Promise<BookHit[]> {
  const query = by === "isbn" ? `isbn:${q}` : by === "naslov" ? `intitle:${q}` : `inauthor:${q}`;
  const data = await google("", {
    q: query,
    maxResults: "6",
    printType: "books",
    fields:
      "items(id,volumeInfo(title,subtitle,authors,publisher,publishedDate,industryIdentifiers,imageLinks/smallThumbnail,imageLinks/thumbnail))",
  });
  const hits: BookHit[] = ((data?.items ?? []) as GoogleVolume[])
    .filter((it) => it.volumeInfo.title)
    .map(({ id, volumeInfo: v }) => ({
      id,
      title: titleOf(v),
      authors: v.authors?.join(", ") ?? null,
      publisher: v.publisher ?? null,
      year: v.publishedDate?.slice(0, 4) ?? null,
      isbn: isbnOf(v),
      thumb: https(v.imageLinks?.smallThumbnail ?? v.imageLinks?.thumbnail),
    }));

  if (hits.length === 0 && by === "isbn") {
    const b = await openLibrary(q);
    if (b?.title) {
      hits.push({
        id: `ol-${q}`,
        title: titleOf(b),
        authors: b.authors?.map((a) => a.name).join(", ") || null,
        publisher: b.publishers?.[0]?.name ?? null,
        year: b.publish_date?.match(/\d{4}/)?.[0] ?? null,
        isbn: q,
        thumb: b.cover?.small ?? null,
      });
    }
  }
  return hits;
}

/** Svi podaci o izabranoj knjizi: id iz Google Books ili „ol-<ISBN>“ za Open Library. */
export async function getBook(id: string): Promise<BookDetail | null> {
  if (id.startsWith("ol-")) {
    const isbn = id.slice(3);
    const b = await openLibrary(isbn);
    if (!b?.title) return null;
    const lang = b.languages?.[0]?.key?.split("/").pop() ?? null;
    const notes = typeof b.notes === "string" ? b.notes : b.notes?.value;
    return {
      title: titleOf(b),
      authors: b.authors?.map((a) => a.name).join(", ") || null,
      publisher: b.publishers?.[0]?.name ?? null,
      pageCount: b.number_of_pages || null,
      language: (lang && LANGUAGE_CODES[lang]) || null,
      isbn,
      description: plainText(notes),
      cover: b.cover?.large ?? b.cover?.medium ?? null,
      ...classify(b.subjects?.map((s) => s.name) ?? [], lang),
    };
  }

  const vol = (await google(`/${encodeURIComponent(id)}`)) as GoogleVolume | null;
  const v = vol?.volumeInfo;
  if (!v?.title) return null;
  const img = v.imageLinks ?? {};
  return {
    title: titleOf(v),
    authors: v.authors?.join(", ") ?? null,
    publisher: v.publisher ?? null,
    pageCount: v.pageCount || null,
    language: (v.language && LANGUAGE_CODES[v.language]) || null,
    isbn: isbnOf(v),
    description: plainText(v.description),
    cover: https(img.large ?? img.medium ?? img.small ?? img.thumbnail),
    ...classify(v.categories ?? [], v.language ?? null),
  };
}

/** Naslovne slike se preuzimaju samo sa ovih adresa (vidi /api/knjige/naslovna). */
export const COVER_HOSTS = ["books.google.com", "books.googleusercontent.com", "covers.openlibrary.org"];
