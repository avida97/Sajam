import type { Metadata } from "next";
import { LegalPage } from "@/components/info/LegalPage";
import { findLegal } from "@/lib/legal";

const doc = findLegal("privatnost")!;

export const metadata: Metadata = { title: doc.title };

export default function Page() {
  return <LegalPage doc={doc} />;
}
