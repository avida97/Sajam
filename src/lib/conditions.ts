// Stanja artikla i opisi iz Figme (ekran „Product Page + Stanje artikala“).
export type Condition = "novo" | "kao_novo" | "korisceno";

// Odluka V, 10. 11. 2026: samo tri stanja. „Novo“ i „Kao novo“ su iz Figme, „Korišćeno“ je novo
// (Anka da pregleda tekst).
export const CONDITIONS: Array<{ value: Condition; label: string; description: string }> = [
  {
    value: "novo",
    label: "Novo",
    description:
      "Potpuno nov, neupotrebljavan i neotvoren artikal u izvornom stanju, sa originalnim pakovanjem i priborom/dodacima.",
  },
  {
    value: "kao_novo",
    label: "Kao novo",
    description:
      "Potpuno nov, neupotrebljavan artikal u izvornom stanju, sa otvorenim originalnim pakovanjem ili bez njega.",
  },
  {
    value: "korisceno",
    label: "Korišćeno",
    description:
      "Korišćen artikal koji može imati znakove upotrebe, ali i dalje služi svojoj nameni. Prodavac detalje navodi u opisu.",
  },
];
