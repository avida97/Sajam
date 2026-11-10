import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Sajam još nije javan: na Vercelu svaka stranica traži lozinku (SITE_PASSWORD).
// Bez podešene lozinke sajt na Vercelu ostaje zatvoren za sve; lokalno je otvoren.
function siteLock(request: NextRequest): NextResponse | null {
  const password = process.env.SITE_PASSWORD;
  const onVercel = Boolean(process.env.VERCEL_ENV);
  if (!password && !onVercel) return null;

  if (password) {
    const header = request.headers.get("authorization") ?? "";
    if (header.startsWith("Basic ")) {
      try {
        const decoded = atob(header.slice(6));
        const given = decoded.slice(decoded.indexOf(":") + 1);
        if (given === password) return null;
      } catch {
        // neispravno zaglavlje, traži lozinku ponovo
      }
    }
  }

  return new NextResponse("Sajam još nije otvoren.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Sajam", charset="UTF-8"' },
  });
}

// Osvežava Supabase sesiju na svakom zahtevu, da prijava ne istekne usred rada.
export async function middleware(request: NextRequest) {
  const locked = siteLock(request);
  if (locked) return locked;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Zaključane su sve stranice; slobodni su samo delovi koje Next.js učitava posle prijave.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
