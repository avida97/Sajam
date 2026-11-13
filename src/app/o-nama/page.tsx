import type { Metadata } from "next";
import { AboutPage } from "@/components/info/AboutPage";

export const metadata: Metadata = { title: "O nama" };

// „O nama“ nema dizajn u Figmi (okvir 873:19401 je prazan). Dizajn je V izabrala 13. 11. 2026
// od predloga „Priča“; složen od postojećih stilova sajta (gradijent, serif naglasci), za Ankin pregled.
export default async function Page({ searchParams }: { searchParams: Promise<{ vazno?: string }> }) {
  return <AboutPage vazno={Number((await searchParams).vazno) || 1} />;
}
