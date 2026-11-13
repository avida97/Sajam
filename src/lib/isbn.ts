// ISBN i tipovi podataka o knjizi iz javnih baza. Ovaj fajl sme i u pregledač;
// samo traženje (src/lib/books.ts) radi na serveru, zbog Google ključa.

import { LANGUAGES } from "@/lib/genres";

/** Jedan red u padajućoj listi rezultata. */
export type BookHit = {
  id: string;
  title: string;
  authors: string | null;
  publisher: string | null;
  year: string | null;
  isbn: string | null;
  thumb: string | null;
};

/** Sve što forma može da popuni kad se izabere knjiga. Sve ostaje izmenljivo. */
export type BookDetail = {
  title: string;
  authors: string | null;
  publisher: string | null;
  pageCount: number | null;
  language: (typeof LANGUAGES)[number] | null;
  isbn: string | null;
  description: string | null;
  /** Naslovne redom po pouzdanosti; prva koja se učita ide u oglas. */
  covers: string[];
  subcategory: string | null;
  genre: string | null;
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
