import type { Metadata } from "next";
import { HeroLab } from "@/components/home/HeroLab";

export const metadata: Metadata = { title: "Predlozi za hero", robots: { index: false } };

// Privremena stranica sa predlozima za hero početne strane (za Ankin izbor).
export default async function HeroProposals({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const v = Number((await searchParams).v) || 1;
  return <HeroLab initial={v} />;
}
