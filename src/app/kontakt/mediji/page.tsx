import type { Metadata } from "next";
import { ContactPage } from "@/components/info/ContactPage";

export const metadata: Metadata = { title: "Mediji i novosti" };

export default function Page() {
  return <ContactPage tab="novosti" />;
}
