import { NextResponse } from "next/server";
import { cleanIsbn, isValidIsbn, lookupIsbn } from "@/lib/isbn";

// GET /api/isbn/9788610024364 → podaci o knjizi ili 404.
// Ide preko servera da bi Google Books dobio naš ključ (GOOGLE_BOOKS_API_KEY), koji ne sme u pregledač.
export async function GET(_req: Request, { params }: { params: Promise<{ isbn: string }> }) {
  const isbn = cleanIsbn((await params).isbn);
  if (!isValidIsbn(isbn)) return NextResponse.json({ error: "neispravan ISBN" }, { status: 400 });

  const info = await lookupIsbn(isbn, AbortSignal.timeout(8000), process.env.GOOGLE_BOOKS_API_KEY);
  if (!info?.title) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(info, { headers: { "cache-control": "private, max-age=86400" } });
}
