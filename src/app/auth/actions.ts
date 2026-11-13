"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthResult = { ok: true; message?: string } | { ok: false; error: string };

const NOT_READY: AuthResult = { ok: false, error: "Prijava još nije podešena na ovom sajtu." };

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

// Poruke Supabase-a na srpskom, za greške koje korisnik može sam da ispravi.
function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Pogrešan imejl ili lozinka.";
  if (m.includes("email not confirmed")) return "Prvo potvrdi imejl: otvori link koji smo ti poslali.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Nalog sa ovim imejlom već postoji. Prijavi se.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "Lozinka mora imati bar 8 znakova.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Previše pokušaja. Sačekaj malo pa pokušaj ponovo.";
  if (m.includes("invalid") && m.includes("email")) return "Mejl adresa nije ispravna.";
  return "Nešto nije u redu. Pokušaj ponovo.";
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, error: translate(error.message) };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUp(input: {
  username: string;
  email: string;
  password: string;
  marketing: boolean;
  next: string;
}): Promise<AuthResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,30}$/.test(username))
    return { ok: false, error: "Korisničko ime: 3 do 30 znakova, samo mala slova, brojevi, tačka i donja crta." };
  if (input.password.length < 8) return { ok: false, error: "Lozinka mora imati bar 8 znakova." };

  const supabase = await createClient();
  const { data: free } = await supabase.rpc("username_available", { p_username: username });
  if (free === false) return { ok: false, error: "Ovo korisničko ime je zauzeto. Izaberi drugo." };

  const next = input.next.startsWith("/") && !input.next.startsWith("//") ? input.next : "/";
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { username, marketing_emails: input.marketing },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: translate(error.message) };
  // Supabase za postojeći mejl ne javlja grešku, nego vraća korisnika bez identiteta.
  if (data.user && data.user.identities?.length === 0)
    return { ok: false, error: "Nalog sa ovim imejlom već postoji. Prijavi se." };
  if (data.session) {
    revalidatePath("/", "layout");
    return { ok: true };
  }
  return { ok: true, message: "Poslali smo ti imejl. Otvori link iz imejla da potvrdiš nalog." };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent("/?nalog=nova-lozinka")}`,
  });
  if (error) return { ok: false, error: translate(error.message) };
  return { ok: true, message: "Ako nalog postoji, poslali smo ti imejl sa linkom za novu lozinku." };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  if (password.length < 8) return { ok: false, error: "Lozinka mora imati bar 8 znakova." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: translate(error.message) };
  return { ok: true, message: "Lozinka je promenjena." };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
