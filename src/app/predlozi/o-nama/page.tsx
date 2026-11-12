import type { Metadata } from "next";
import { AboutLab } from "@/components/info/AboutLab";

export const metadata: Metadata = { title: "Predlozi za O nama", robots: { index: false } };

// Privremena stranica sa predlozima za „O nama“ (za izbor V i Anke).
export default async function AboutProposals({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  return <AboutLab initial={Number((await searchParams).v) || 1} />;
}
