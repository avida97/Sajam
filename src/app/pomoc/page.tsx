import type { Metadata } from "next";
import { HelpHome } from "@/components/help/HelpHome";

export const metadata: Metadata = { title: "Pomoć" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function HelpPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return <HelpHome section="kupovina" query={q} />;
}
