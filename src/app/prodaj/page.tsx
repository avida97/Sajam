import type { Metadata } from "next";
import { SellForm } from "@/components/sell/SellForm";

export const metadata: Metadata = { title: "Prodaja artikla" };

// Forma „Prodaja artikla“ iz Figme (922:32648). Objavljivanje proradi kad se poveže baza.
export default function ProdajPage() {
  return <SellForm />;
}
