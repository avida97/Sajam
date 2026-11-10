// ISBN: čišćenje, provera kontrolne cifre i traženje podataka o knjizi u javnim bazama
// (Google Books, pa Open Library). Obe baze su besplatne, bez ključa, i rade iz pregledača.

import { LANGUAGES } from "@/lib/genres";

export type BookInfo = {
  title: string | null;
  authors: string | null;
  publisher: string | null;
  pageCount: number | null;
  language: (typeof LANGUAGES)[number] | null;
};

/** Ostavlja samo cifre i X: „978-86-10-02436-4“ → „9788610024364“. */
export function cleanIsbn(raw: string) {
  return raw.toUpperCase().replace(/[^0-9X]/g, "");
}

/** Da li je ISBN-10 ili ISBN-13 sa ispravnom kontrolnom cifrom. */
export function isValidIsbn(isbn: string) {
  if (/^97[89][0-9]{10}$/.test(isbn)) {
    const sum = [...isbn].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
    return sum % 10 === 0;
  }
  if (/^[0-9]{9}[0-9X]$/.test(isbn)) {
    const sum = [...isbn].reduce((s, d, i) => s + (d === "X" ? 10 : Number(d)) * (10 - i), 0);
    return sum % 11 === 0;
  }
  return false;
}

// ISO 639-1 (Google) i 639-2 (Open Library) kodovi jezika koje forma nudi.
const LANGUAGE_CODES: Record<string, BookInfo["language"]> = {
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

async function fromGoogle(isbn: string, signal: AbortSignal): Promise<BookInfo | null> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const v = data.items?.[0]?.volumeInfo;
  if (!v) return null;
  return {
    title: [v.title, v.subtitle].filter(Boolean).join(": ") || null,
    authors: v.authors?.join(", ") ?? null,
    publisher: v.publisher ?? null,
    pageCount: v.pageCount || null,
    language: LANGUAGE_CODES[v.language] ?? null,
  };
}

async function fromOpenLibrary(isbn: string, signal: AbortSignal): Promise<BookInfo | null> {
  const res = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    { signal },
  );
  if (!res.ok) return null;
  const b = (await res.json())[`ISBN:${isbn}`];
  if (!b) return null;
  const lang = b.languages?.[0]?.key?.split("/").pop();
  return {
    title: [b.title, b.subtitle].filter(Boolean).join(": ") || null,
    authors: b.authors?.map((a: { name: string }) => a.name).join(", ") || null,
    publisher: b.publishers?.[0]?.name ?? null,
    pageCount: b.number_of_pages || null,
    language: (lang && LANGUAGE_CODES[lang]) ?? null,
  };
}

/** Traži knjigu u obe baze i spaja ono što nađe (Google ima prednost). */
export async function lookupIsbn(isbn: string, signal: AbortSignal): Promise<BookInfo | null> {
  const safe = <T,>(p: Promise<T>) => p.catch(() => null);
  const google = await safe(fromGoogle(isbn, signal));
  const complete = google && google.title && google.authors && google.publisher && google.pageCount;
  const open = complete ? null : await safe(fromOpenLibrary(isbn, signal));
  if (!google && !open) return null;
  const pick = <K extends keyof BookInfo>(k: K) => google?.[k] ?? open?.[k] ?? null;
  return {
    title: pick("title"),
    authors: pick("authors"),
    publisher: pick("publisher"),
    pageCount: pick("pageCount"),
    language: pick("language"),
  };
}
