import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/knjige/sazetak { naslov, autor?, izdavac?, isbn? } → { sazetak } | { nepoznato: true }
// Sažetak knjige uz pomoć AI, kada knjige nema u bazi knjiga ili baza nema opis (odluka V 11. 11. 2026).
// Samo za prijavljene korisnike, da niko spolja ne troši ključ. Prodavac uvek može da izmeni tekst.

const UNKNOWN = "NEPOZNATO";

const SYSTEM = `Pišeš kratak sažetak knjige za oglas na Sajmu, sajtu za prodaju polovnih knjiga u Srbiji.
Piši na srpskom jeziku, latinicom, u 3 do 5 rečenica: o čemu se radi u knjizi, glavna tema i atmosfera.
Ne otkrivaj kraj i važne obrte. Ne ocenjuj knjigu i ne spominji stanje primerka, cenu ni prodaju.
Piši samo ono što pouzdano znaš o baš ovoj knjizi. Ako knjigu ne poznaješ dovoljno, ili naslov i autor
mogu da se odnose na više različitih knjiga, odgovori samo rečju ${UNKNOWN}.
Vrati samo tekst sažetka, bez naslova, navodnika i uvoda.`;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "potrebna prijava" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI sažetak nije podešen" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const title = clean(body?.naslov, 200);
  if (title.length < 2) return NextResponse.json({ error: "nedostaje naslov" }, { status: 400 });
  const lines = [
    `Naslov: ${title}`,
    clean(body?.autor, 200) && `Autor: ${clean(body?.autor, 200)}`,
    clean(body?.izdavac, 200) && `Izdavač: ${clean(body?.izdavac, 200)}`,
    clean(body?.isbn, 20) && `ISBN: ${clean(body?.isbn, 20)}`,
  ].filter(Boolean);

  const client = new Anthropic();
  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: lines.join("\n") }],
    });
    if (res.stop_reason === "refusal") return NextResponse.json({ nepoznato: true });
    const text = res.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    if (!text || text.includes(UNKNOWN)) return NextResponse.json({ nepoznato: true });
    return NextResponse.json({ sazetak: text.slice(0, 5000) });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "previše zahteva" }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      console.error("AI sažetak nije napravljen:", e.status, e.message);
      return NextResponse.json({ error: "AI ne odgovara" }, { status: 502 });
    }
    throw e;
  }
}
