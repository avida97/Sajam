import type { Metadata } from "next";
import { ContactPage } from "@/components/info/ContactPage";

export const metadata: Metadata = { title: "Kontakt" };

export default function Page() {
  return <ContactPage />;
}
