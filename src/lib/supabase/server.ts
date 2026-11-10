import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

// Supabase na serveru (stranice, server akcije). Sesija se čita iz kolačića.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Poziv iz server komponente: kolačiće osvežava middleware.
        }
      },
    },
  });
}

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  unreadNotifications: number;
};

// Ulogovani korisnik sa profilom, ili null. Bez podešenog Supabase-a uvek null.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    unreadNotifications: count ?? 0,
  };
}
