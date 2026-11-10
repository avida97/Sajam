// Stanja artikla i opisi iz Figme (ekran „Product Page + Stanje artikala“).
export type Condition = "novo" | "kao_novo" | "vrlo_dobro" | "dobro" | "zadovoljavajuce";

export const CONDITIONS: Array<{ value: Condition; label: string; description: string }> = [
  {
    value: "novo",
    label: "Novo",
    description:
      "Potpuno nov, neupotrebljavan i neotvoren artikl u izvornom stanju, s originalnim pakiranjem i priborom/dodacima.",
  },
  {
    value: "kao_novo",
    label: "Kao novo",
    description:
      "Potpuno nov, neupotrebljavan artikl u izvornom stanju, s otvorenim originalnim pakiranjem ili bez njega.",
  },
  {
    value: "vrlo_dobro",
    label: "Vrlo dobro",
    description:
      "Retko korišten artikl u odličnom stanju, može imati manje vise nesavršenosti koje ne utječu na njegov cjelokupni izgled ili upotrebu.",
  },
  {
    value: "dobro",
    label: "Dobro",
    description:
      "Redovno korišćen artikal u dobrom stanju koji pokazuje znakove korišćenja, ali još uvek dobro funkcioniše za svoju namenu.",
  },
  {
    value: "zadovoljavajuce",
    label: "Zadovoljavajuće",
    description:
      "Često korišćen artikal sa vidljivim znakovima korišćenja i nedostacima, ali i dalje funkcionalan u skladu s namenom.",
  },
];
