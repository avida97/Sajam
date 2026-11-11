"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Topic = "nalog" | "kupovina" | "bezbednost" | "prodaja" | "utisci" | "drugo" | "saradnja";

const TOPICS: Array<{ value: Topic; label: string; hint?: string }> = [
  { value: "nalog", label: "Nalog i podešavanja" },
  { value: "kupovina", label: "Kupovina" },
  { value: "bezbednost", label: "Bezbednost" },
  { value: "prodaja", label: "Prodaja" },
  { value: "utisci", label: "Utisci i predlozi", hint: "Uvek smo raspoloženi za nove ideje i kritike" },
  { value: "drugo", label: "Drugo" },
];
// „Saradnja“ se prikazuje samo kad se forma otvori sa stranice za biznise.
const SARADNJA: (typeof TOPICS)[number] = { value: "saradnja", label: "Saradnja" };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Forma „Imaš problem?“ po Figmi (883:19701). Zahtev se čuva u bazi (contact_requests).
// Utisak kupca preko slike iz dizajna je izostavljen dok ne budu stvarne recenzije.
export function ContactForm({
  initial,
}: {
  initial: { firstName: string; lastName: string; email: string; listingRef: string; topic: string | null };
}) {
  const [form, setForm] = useState({
    firstName: initial.firstName,
    lastName: initial.lastName,
    email: initial.email,
    listingRef: initial.listingRef,
    message: "",
  });
  const [topics, setTopics] = useState<Topic[]>(
    [...TOPICS, SARADNJA].some((t) => t.value === initial.topic) ? [initial.topic as Topic] : [],
  );
  const topicList = initial.topic === "saradnja" ? [SARADNJA, ...TOPICS] : TOPICS;
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"idle" | "saving" | "sent" | "error">("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setInvalid((s) => {
      const n = new Set(s);
      n.delete(k);
      return n;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = new Set<string>();
    if (!form.firstName.trim()) bad.add("firstName");
    if (!EMAIL.test(form.email.trim())) bad.add("email");
    if (!form.message.trim()) bad.add("message");
    setInvalid(bad);
    if (bad.size) return;
    setState("saving");
    const { error } = await createClient()
      .from("contact_requests")
      .insert({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim() || null,
        email: form.email.trim(),
        listing_ref: form.listingRef.trim() || null,
        message: form.message.trim(),
        topics,
      });
    setState(error ? "error" : "sent");
  };

  const field = (k: string) =>
    `sell-field h-[43px] w-full rounded-[4px] border bg-transparent px-[14px] text-[16px] text-black placeholder:text-black focus:outline-none ${
      invalid.has(k) ? "border-alert" : "border-black"
    }`;

  return (
    <div className="mx-auto flex max-w-site gap-[20px] px-[72px] pb-[18px] pt-[20px]">
      <div className="min-h-[804px] w-[506px] shrink-0 rounded-[15px] bg-[#f5f6f8] px-[45px] pb-[45px] pt-[45px] text-black">
        <h1 className="text-[37px] font-semibold leading-[1.1] tracking-[-1.5px]">
          Imaš <span className="font-serif text-[42px] italic tracking-[-1.7px]">problem</span>?
        </h1>
        <p className="mt-[26px] text-[19px] leading-[1.4]">Javićemo se putem imejla, zato prati svoje prijemno sanduče.</p>

        {state === "sent" ? (
          <div role="status" className="mt-[40px]">
            <p className="text-[20px] font-semibold">Hvala, zahtev je poslat!</p>
            <p className="mt-[12px] text-[16px] leading-[1.5] text-[#52525b]">
              Odgovor stiže na <span className="font-medium text-black">{form.email.trim()}</span>. Dok čekaš, možda
              je odgovor već u <Link href="/pomoc" className="underline">centru za pomoć</Link>.
            </p>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="mt-[30px]">
            <div className="flex gap-[25px]">
              <input aria-label="Ime" aria-required aria-invalid={invalid.has("firstName")} placeholder="Ime *" value={form.firstName} onChange={set("firstName")} maxLength={80} autoComplete="given-name" className={field("firstName")} />
              <input aria-label="Prezime" placeholder="Prezime" value={form.lastName} onChange={set("lastName")} maxLength={80} autoComplete="family-name" className={field("lastName")} />
            </div>
            <input type="email" aria-label="Email adresa" aria-required aria-invalid={invalid.has("email")} placeholder="Email adresa *" value={form.email} onChange={set("email")} maxLength={254} autoComplete="email" className={`mt-[31px] ${field("email")}`} />
            <input aria-label="ID artikla" placeholder="ID artikla" value={form.listingRef} onChange={set("listingRef")} maxLength={80} className={`mt-[31px] ${field("listingRef")}`} />
            <textarea
              aria-label="Opis problema ili zahteva"
              aria-required
              aria-invalid={invalid.has("message")}
              placeholder="Opis problema ili zahteva *"
              value={form.message}
              onChange={set("message")}
              maxLength={5000}
              className={`mt-[31px] h-[133px] resize-none py-[12px] ${field("message")}`}
            />
            {invalid.size > 0 && (
              <p role="alert" className="mt-[8px] text-[12px] text-alert">
                Popuni polja označena zvezdicom{invalid.has("email") && form.email ? " i proveri imejl adresu" : ""}.
              </p>
            )}

            <fieldset className="mt-[26px]">
              <legend className="text-[14px]">Sa čime možemo da ti pomognemo?</legend>
              <div className="mt-[18px] grid grid-cols-2 gap-x-[25px] gap-y-[18px]">
                {topicList.map((t) => (
                  <label key={t.value} className="flex cursor-pointer items-start gap-[15px] text-[16px]">
                    <input
                      type="checkbox"
                      checked={topics.includes(t.value)}
                      onChange={(e) =>
                        setTopics((xs) => (e.target.checked ? [...xs, t.value] : xs.filter((x) => x !== t.value)))
                      }
                      className="mt-[2px] size-[18px] shrink-0 rounded-[2px] accent-black"
                    />
                    <span>
                      {t.label}
                      {t.hint && (
                        <span className="mt-[2px] block text-[12px] leading-[1.3] text-[#666]">{t.hint}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {state === "error" && (
              <p role="alert" className="mt-[14px] text-[13px] text-alert">
                Zahtev nije poslat. Pokušaj ponovo.
              </p>
            )}
            <button
              type="submit"
              disabled={state === "saving"}
              className="mt-[36px] h-[48px] w-full bg-ink text-[14px] font-bold uppercase text-white disabled:opacity-50"
            >
              {state === "saving" ? "Šaljem…" : "Pošalji zahtev"}
            </button>
          </form>
        )}
      </div>

      <div className="relative min-h-[804px] w-[770px] overflow-hidden rounded-[15px]">
        <Image src="/images/kontakt/forma.png" alt="" fill sizes="770px" className="object-cover" priority />
      </div>
    </div>
  );
}
