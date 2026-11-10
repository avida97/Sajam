import { NextResponse, type NextRequest } from "next/server";
import { searchBooks, UpstreamError, type SearchBy } from "@/lib/books";
import { cleanIsbn, isValidIsbn } from "@/lib/isbn";

// GET /api/knjige?isbn=978... | ?naslov=Na Drini | ?autor=Andrić → { items: BookHit[] }
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const by = (["isbn", "naslov", "autor"] as const).find((k) => p.has(k)) as SearchBy | undefined;
  if (!by) return NextResponse.json({ error: "nedostaje upit" }, { status: 400 });
  let q = (p.get(by) ?? "").trim().slice(0, 100);
  if (by === "isbn") {
    q = cleanIsbn(q);
    if (!isValidIsbn(q)) return NextResponse.json({ error: "neispravan ISBN" }, { status: 400 });
  } else if (q.length < 3) {
    return NextResponse.json({ items: [] });
  }
  try {
    return NextResponse.json({ items: await searchBooks(by, q) });
  } catch (e) {
    if (e instanceof UpstreamError) return NextResponse.json({ error: "baza ne odgovara" }, { status: 502 });
    throw e;
  }
}
