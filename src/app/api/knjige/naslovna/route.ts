import { NextResponse, type NextRequest } from "next/server";
import { COVER_HOSTS } from "@/lib/books";

// GET /api/knjige/naslovna?u=<adresa slike> → sama slika. Pregledač ne može direktno da
// preuzme Google naslovnicu kao fajl (CORS), a treba nam fajl da bi išla u oglas kao fotografija.
export async function GET(req: NextRequest) {
  let url: URL;
  try {
    url = new URL(req.nextUrl.searchParams.get("u") ?? "");
  } catch {
    return NextResponse.json(null, { status: 400 });
  }
  if (url.protocol !== "https:" || !COVER_HOSTS.includes(url.hostname)) {
    return NextResponse.json(null, { status: 400 });
  }
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { "user-agent": "Mozilla/5.0 (compatible; Sajam/1.0)", accept: "image/*" },
    cache: "no-store",
  }).catch((e) => {
    console.warn("Naslovna:", url.toString(), e);
    return null;
  });
  if (res && !res.ok) console.warn("Naslovna:", url.toString(), res.status);
  const type = res?.headers.get("content-type") ?? "";
  if (!res?.ok || !type.startsWith("image/")) return NextResponse.json(null, { status: 404 });
  const body = await res.arrayBuffer();
  if (body.byteLength > 5_000_000) return NextResponse.json(null, { status: 413 });
  return new NextResponse(body, { headers: { "content-type": type, "cache-control": "private, max-age=86400" } });
}
