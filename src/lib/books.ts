import "server-only";
import type { BookDetail, BookHit } from "@/lib/isbn";

// Traženje knjiga u javnim bazama: Google Books (sa našim ključem), a za ISBN koji Google
// nema i Open Library. Bez ključa Google deli jednu dnevnu kvotu na ceo svet i vraća 429.

const KEY = process.env.GOOGLE_BOOKS_API_KEY;
const GOOGLE = "https://www.googleapis.com/books/v1/volumes";
const DAY = { next: { revalidate: 86400 } };

export class UpstreamError extends Error {}

// Jezik se NE uzima iz Google-a: on za većinu srpskih knjiga piše „en“. Umesto toga se čita
// iz ISBN-a (grupa izdavača po zemlji); ako se ne zna, polje ostaje prazno.
// 978-86 Srbija, 978-953 Hrvatska, 978-961 Slovenija, 978-5 Rusija, 978-0/1 i 979-8 engleski.
function languageFromIsbn(isbn: string | null): BookDetail["language"] {
  if (!isbn) return null;
  const i = isbn.length === 10 ? `978${isbn}` : isbn;
  if (i.startsWith("97886")) return "Srpski";
  if (i.startsWith("978953")) return "Hrvatski";
  if (i.startsWith("978961")) return "Slovenački";
  if (i.startsWith("9785")) return "Ruski";
  if (/^978[01]|^9798/.test(i)) return "Engleski";
  return null;
}

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

function classify(categories: string[], language: BookDetail["language"]) {
  const text = categories.join(" | ");
  const match = (rules: Array<[RegExp, string]>) => rules.find(([re]) => re.test(text))?.[1] ?? null;
  let subcategory = match(SUBCATEGORY_RULES);
  // Samo kad se iz ISBN-a sigurno zna da je knjiga na engleskom ili ruskom → „Strane knjige“.
  if ((language === "Engleski" || language === "Ruski") && (subcategory === null || subcategory === "beletristika")) {
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

  // Google nema ništa po nazivu ili autoru → Open Library (samo izdanja sa ISBN-om, da bi detalji radili).
  if (hits.length === 0 && by !== "isbn") {
    const docs = await olSearch(by === "naslov" ? { title: q } : { author: q }, 10).catch(() => []);
    for (const d of docs) {
      const isbn = d.isbn?.find((i) => i.length === 13) ?? d.isbn?.[0];
      if (!d.title || !isbn || hits.length >= 6) continue;
      hits.push({
        id: `ol-${isbn}`,
        title: d.title,
        authors: d.author_name?.join(", ") ?? null,
        publisher: d.publisher?.[0] ?? null,
        year: d.first_publish_year ? String(d.first_publish_year) : null,
        isbn,
        thumb: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg` : null,
      });
    }
  }

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
    const notes = typeof b.notes === "string" ? b.notes : b.notes?.value;
    const language = languageFromIsbn(isbn);
    const title = titleOf(b);
    const authors = b.authors?.map((a) => a.name).join(", ") || null;
    const own = b.cover?.large ?? b.cover?.medium;
    return {
      title,
      authors,
      publisher: b.publishers?.[0]?.name ?? null,
      pageCount: b.number_of_pages || null,
      language,
      isbn,
      description: plainText(notes),
      covers: own ? [own] : await otherCovers(isbn, b.title ?? title, authors),
      ...classify(b.subjects?.map((s) => s.name) ?? [], language),
    };
  }

  const vol = (await google(`/${encodeURIComponent(id)}`)) as GoogleVolume | null;
  const v = vol?.volumeInfo;
  if (!v?.title) return null;
  const img = v.imageLinks ?? {};
  const isbn = isbnOf(v);
  const language = languageFromIsbn(isbn);
  const authors = v.authors?.join(", ") ?? null;
  const own = https(img.large ?? img.medium ?? img.small ?? img.thumbnail);
  return {
    title: titleOf(v),
    authors,
    publisher: v.publisher ?? null,
    pageCount: v.pageCount || null,
    language,
    isbn,
    description: plainText(v.description),
    covers: own ? [own] : await otherCovers(isbn, v.title, authors),
    ...classify(v.categories ?? [], language),
  };
}

/**
 * Kad Google nema naslovnu za to izdanje: Open Library po ISBN-u, Open Library po nazivu i
 * autoru, pa druga Google izdanja iste knjige. Adrese se ne proveravaju ovde; pregledač ih
 * probava redom preko /api/knjige/naslovna, koja odbija sve što nije slika.
 */
async function otherCovers(isbn: string | null, title: string, authors: string | null): Promise<string[]> {
  const covers: string[] = [];
  if (isbn) covers.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
  const author = authors?.split(",")[0]?.trim();
  const [ol, g] = await Promise.all([
    olSearch({ title, ...(author ? { author } : {}) }, 5).catch(() => []),
    google("", {
      q: `intitle:"${title}"${author ? ` inauthor:"${author}"` : ""}`,
      maxResults: "10",
      fields: "items(volumeInfo(imageLinks/thumbnail))",
    }).catch(() => null),
  ]);
  for (const d of ol) if (d.cover_i) covers.push(`https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`);
  for (const it of (g?.items ?? []) as GoogleVolume[]) {
    const t = https(it.volumeInfo.imageLinks?.thumbnail);
    if (t) covers.push(t.replace(/zoom=\d/, "zoom=1"));
  }
  return [...new Set(covers)].slice(0, 8);
}

type OlDoc = {
  title?: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
};

async function olSearch(params: Record<string, string>, limit: number): Promise<OlDoc[]> {
  const qs = new URLSearchParams({ ...params, limit: String(limit), fields: "title,author_name,publisher,first_publish_year,isbn,cover_i" });
  const res = await fetch(`https://openlibrary.org/search.json?${qs}`, {
    ...DAY,
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "Sajam/1.0 (book marketplace)" },
  });
  if (!res.ok) return [];
  return ((await res.json()).docs ?? []) as OlDoc[];
}

/** Naslovne slike se preuzimaju samo sa ovih adresa (vidi /api/knjige/naslovna). */
export const COVER_HOSTS = ["books.google.com", "books.googleusercontent.com", "covers.openlibrary.org"];
