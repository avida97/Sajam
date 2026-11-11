import type { Metadata } from "next";
import { ContactForm } from "@/components/info/ContactForm";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pošalji zahtev" };

type Props = { searchParams: Promise<{ oglas?: string; tema?: string }> };

export default async function ContactFormPage({ searchParams }: Props) {
  const [{ oglas, tema }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const [first, ...rest] = (user?.profile?.display_name ?? "").trim().split(/\s+/);
  return (
    <ContactForm
      initial={{
        firstName: first ?? "",
        lastName: rest.join(" "),
        email: user?.email ?? "",
        listingRef: oglas?.slice(0, 80) ?? "",
        topic: tema ?? null,
      }}
    />
  );
}
