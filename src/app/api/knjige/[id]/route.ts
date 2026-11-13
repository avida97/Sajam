import { NextResponse } from "next/server";
import { getBook, UpstreamError } from "@/lib/books";

// GET /api/knjige/<id> → BookDetail (sve za popunjavanje forme) ili 404.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{1,40}$/.test(id)) return NextResponse.json(null, { status: 400 });
  try {
    const book = await getBook(id);
    return book ? NextResponse.json(book) : NextResponse.json(null, { status: 404 });
  } catch (e) {
    if (e instanceof UpstreamError) return NextResponse.json({ error: "baza ne odgovara" }, { status: 502 });
    throw e;
  }
}
