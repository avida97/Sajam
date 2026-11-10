"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { sendPasswordReset, signIn, signUp, updatePassword, type AuthResult } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Prozori za prijavu i registraciju iz Figme: „Prijavi se“ (906:26695), „Prijavi se putem emaila“
// (914:29648), „Registruj se“ (914:28784), „Registruj se putem mejla“ (916:31670) i
// „Resetuj lozinku“ (916:30731). Otvaraju se preko bilo koje stranice sa ?nalog=...
// „Nova lozinka“ nema u Figmi i složena je od istih delova.
// Dugme „Nastavi uz Facebook“ je sakriveno: za MVP je prijava samo mejlom i preko Google-a.
export type AuthView = "prijava" | "prijava-mejl" | "registracija" | "registracija-mejl" | "lozinka" | "nova-lozinka";
const VIEWS: AuthView[] = ["prijava", "prijava-mejl", "registracija", "registracija-mejl", "lozinka", "nova-lozinka"];

export function AuthModal() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const view = params.get("nalog") as AuthView | null;
  const [email, setEmail] = useState("");

  const hrefFor = (next: AuthView | null) => {
    const q = new URLSearchParams(params.toString());
    if (next) q.set("nalog", next);
    else {
      q.delete("nalog");
      q.delete("posle");
    }
    const s = q.toString();
    return s ? `${pathname}?${s}` : pathname;
  };
  const go = (next: AuthView | null) => router.replace(hrefFor(next), { scroll: false });

  const done = () => {
    const after = params.get("posle");
    if (after && after.startsWith("/") && !after.startsWith("//")) router.replace(after);
    else go(null);
    router.refresh();
  };

  useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && go(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (!view || !VIEWS.includes(view)) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
      onMouseDown={(e) => e.target === e.currentTarget && go(null)}
    >
      <div role="dialog" aria-modal="true" className="relative mx-auto mb-[40px] mt-[172px] w-[452px] bg-white">
        <button type="button" onClick={() => go(null)} aria-label="Zatvori" className="absolute left-[416px] top-[20px] size-[16px]">
          <Image src="/icons/modal-close.svg" alt="" width={16} height={16} />
        </button>
        {view === "prijava" && (
          <Start mode="prijava" email={email} setEmail={setEmail} onNext={() => go("prijava-mejl")} switchHref={hrefFor("registracija")} />
        )}
        {view === "registracija" && (
          <Start mode="registracija" email={email} setEmail={setEmail} onNext={() => go("registracija-mejl")} switchHref={hrefFor("prijava")} />
        )}
        {view === "prijava-mejl" && <EmailLogin email={email} setEmail={setEmail} onBack={() => go("prijava")} forgotHref={hrefFor("lozinka")} onDone={done} />}
        {view === "registracija-mejl" && <EmailSignup email={email} setEmail={setEmail} onBack={() => go("registracija")} onDone={done} />}
        {view === "lozinka" && <ResetPassword email={email} setEmail={setEmail} onBack={() => go("prijava-mejl")} />}
        {view === "nova-lozinka" && <NewPassword onDone={() => go(null)} />}
      </div>
    </div>
  );
}

function Heading({ title, text, className = "" }: { title: string; text?: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="trim-cap font-serif text-[28px] font-medium italic leading-normal text-black">{title}</h2>
      {text && <p className="trim-cap mt-[18px] text-[14px] leading-[1.4] text-black">{text}</p>}
    </div>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="absolute left-[28px] top-[20px] flex items-center gap-[7px] text-[11px] leading-[0.95] text-black">
      <Image src="/icons/chevron-right.svg" alt="" width={4} height={8} className="rotate-180" />
      Nazad
    </button>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  className = "",
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`relative h-[40px] w-[372px] ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        placeholder=" "
        className="peer h-full w-full border-[0.5px] border-[#e1e1e1] bg-white px-[13.5px] pt-[2px] text-[12px] text-black focus:border-black focus:outline-none [&:not(:placeholder-shown)]:border-black"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-[13.5px] top-1/2 -translate-y-1/2 bg-white px-[1px] text-[12px] leading-[0.95] text-black transition-all peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]"
      >
        {label}
      </label>
    </div>
  );
}

function Check({ checked, onChange, children, className = "" }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-[5px] ${className}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-[1px] flex size-[14px] shrink-0 items-center justify-center border border-black bg-white peer-checked:bg-black peer-focus-visible:outline peer-focus-visible:outline-2">
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden>
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children}
    </label>
  );
}

function Submit({ children, pending, className = "" }: { children: React.ReactNode; pending?: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex h-[37px] w-[372px] items-center justify-center bg-ink text-[12px] font-bold uppercase leading-[0.95] tracking-[-0.12px] text-white disabled:opacity-60 ${className}`}
    >
      <span className="trim-cap">{pending ? "Sačekaj..." : children}</span>
    </button>
  );
}

function Notice({ result }: { result: AuthResult | null }) {
  if (!result) return null;
  const text = result.ok ? result.message : result.error;
  if (!text) return null;
  return (
    <p role={result.ok ? "status" : "alert"} className={`mt-[15px] text-[12px] leading-[1.4] ${result.ok ? "text-black" : "text-alert"}`}>
      {text}
    </p>
  );
}

function GoogleButton({ onError }: { onError: (msg: string) => void }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const click = async () => {
    setPending(true);
    try {
      // Ako Google prijava još nije uključena u Supabase-u, ne šaljemo korisnika na stranicu sa greškom.
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
      const settings = res.ok ? await res.json() : null;
      if (!settings?.external?.google) {
        onError("Prijava preko Google-a još nije uključena. Za sada se prijavi mejlom.");
        setPending(false);
        return;
      }
      const after = params.get("posle") ?? pathname;
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(after)}` },
      });
      if (error) throw error;
    } catch {
      onError("Prijava preko Google-a trenutno ne radi. Pokušaj mejlom.");
      setPending(false);
    }
  };
  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      className="relative h-[39px] w-[372px] border-[0.5px] border-[#e1e1e1] bg-white disabled:opacity-60"
    >
      <Image src="/icons/google.svg" alt="" width={17} height={17} className="absolute left-[119.5px] top-[10.5px]" />
      <span className="trim-cap absolute left-[146px] top-[15px] text-[12px] font-semibold leading-normal text-black">Nastavi uz Google</span>
    </button>
  );
}

function Start({
  mode,
  email,
  setEmail,
  onNext,
  switchHref,
}: {
  mode: "prijava" | "registracija";
  email: string;
  setEmail: (v: string) => void;
  onNext: () => void;
  switchHref: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const login = mode === "prijava";
  return (
    <form
      className="px-[40px] pb-[70px] pt-[70px]"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <Heading
        title="Dobrodošli na Sajam!"
        text={
          login
            ? "Prijavi se na svoj Sajam nalog i započni kupovinu, prodaju, konverzaciju i ostalo."
            : "Registruj svoj Sajam nalog i započni kupovinu, prodaju, konverzaciju i ostalo."
        }
      />
      <div className="mt-[40px]">
        <GoogleButton onError={setError} />
      </div>
      {error && <p role="alert" className="mt-[10px] text-[12px] leading-[1.4] text-alert">{error}</p>}
      <div className="mt-[25px] flex items-center gap-[18px]">
        <span className="h-px flex-1 bg-[#e1e1e1]" />
        <span className="trim-cap text-[12px] leading-normal text-black">ili</span>
        <span className="h-px flex-1 bg-[#e1e1e1]" />
      </div>
      <p className="trim-cap mt-[30px] text-[12px] leading-[0.95] text-black">
        {login ? "Prijavi se putem mejla" : "Registruj se putem mejla"}
      </p>
      <Field label="Email adresa" type="email" value={email} onChange={setEmail} autoComplete="email" className="mt-[15px]" />
      <Submit className="mt-[22px]">nastavi</Submit>
      <p className="trim-cap mt-[15px] text-[14px] leading-normal text-black">
        {login ? "Nemaš nalog? " : "Već imaš nalog? "}
        <Link href={switchHref} replace scroll={false} className="underline">
          {login ? "Registruj se" : "Prijavi se"}
        </Link>
      </p>
    </form>
  );
}

function EmailLogin({
  email,
  setEmail,
  onBack,
  forgotHref,
  onDone,
}: {
  email: string;
  setEmail: (v: string) => void;
  onBack: () => void;
  forgotHref: string;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="px-[40px] pb-[40px] pt-[70px]"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await signIn(email, password);
          setResult(r);
          if (r.ok) onDone();
        });
      }}
    >
      <Back onClick={onBack} />
      <Heading title="Prijavi se" text="Prijavi se na svoj Sajam nalog i započni kupovinu, prodaju, konverzaciju i ostalo." />
      <Field label="Email adresa" type="email" value={email} onChange={setEmail} autoComplete="email" className="mt-[25px]" />
      <Field label="Lozinka" type="password" value={password} onChange={setPassword} autoComplete="current-password" className="mt-[20px]" />
      <div className="mt-[20px] flex items-center justify-between">
        <Check checked={remember} onChange={setRemember}>
          <span className="trim-cap text-[14px] leading-[0.95] text-black">Ostavi me prijavljenog</span>
        </Check>
        <Link href={forgotHref} replace scroll={false} className="text-[10px] leading-[0.95] text-black underline">
          Zaboravili ste lozinku?
        </Link>
      </div>
      <Submit pending={pending} className="mt-[25px]">Prijavi se</Submit>
      <Notice result={result} />
    </form>
  );
}

function EmailSignup({
  email,
  setEmail,
  onBack,
  onDone,
}: {
  email: string;
  setEmail: (v: string) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="px-[40px] pb-[63px] pt-[70px]"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await signUp({ username, email, password, marketing, next: params.get("posle") ?? "/" });
          setResult(r);
          if (r.ok && !r.message) onDone();
        });
      }}
    >
      <Back onClick={onBack} />
      <Heading title="Registruj se" text="Registruj svoj Sajam nalog i započni kupovinu, prodaju, konverzaciju i ostalo." />
      <Field label="Korisničko ime" value={username} onChange={setUsername} autoComplete="username" className="mt-[28px]" />
      <Field label="Email adresa" type="email" value={email} onChange={setEmail} autoComplete="email" className="mt-[25px]" />
      <Field label="Lozinka" type="password" value={password} onChange={setPassword} autoComplete="new-password" className="mt-[20px]" />
      <Check checked={marketing} onChange={setMarketing} className="mt-[25px]">
        <span className="text-[12px] leading-[1.4] text-black">
          Želim primati personalizovane ponude i među prvima saznati o najnovijim ažuriranjima vezanim za Sajam putem emaila.
        </span>
      </Check>
      <p className="mt-[25px] text-[12px] leading-[1.4] text-[#7c7c7c]">
        By signing up, I accept Sajam&apos;s{" "}
        <Link href="/pomoc/uslovi" className="underline">Terms and Conditions</Link> and{" "}
        <Link href="/pomoc/privatnost" className="underline">Privacy Policy</Link>.
      </p>
      <Submit pending={pending} className="mt-[30px]">Registruj se</Submit>
      <Notice result={result} />
    </form>
  );
}

function ResetPassword({ email, setEmail, onBack }: { email: string; setEmail: (v: string) => void; onBack: () => void }) {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="px-[40px] pb-[40px] pt-[68px]"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await sendPasswordReset(email)));
      }}
    >
      <Back onClick={onBack} />
      <Heading title="Resetuj lozinku" text="Unesi svoj email da bi resetovao lozinku." />
      <Field label="Email adresa" type="email" value={email} onChange={setEmail} autoComplete="email" className="mt-[25px]" />
      <Submit pending={pending} className="mt-[25px]">pošalji link</Submit>
      <Notice result={result} />
    </form>
  );
}

function NewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<AuthResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="px-[40px] pb-[40px] pt-[68px]"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await updatePassword(password);
          setResult(r);
          if (r.ok) setTimeout(onDone, 1200);
        });
      }}
    >
      <Heading title="Nova lozinka" text="Unesi novu lozinku za svoj Sajam nalog." />
      <Field label="Nova lozinka" type="password" value={password} onChange={setPassword} autoComplete="new-password" className="mt-[25px]" />
      <Submit pending={pending} className="mt-[25px]">sačuvaj</Submit>
      <Notice result={result} />
    </form>
  );
}
