// Srpski oblik imenice uz broj: 1 knjiga, 2–4 knjige, 5+ knjiga (11–14 uvek kao 5+).
export function plural(n: number, one: string, few: string, many: string) {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  if (last === 1 && !teen) return one;
  if (last >= 2 && last <= 4 && !teen) return few;
  return many;
}

/** „2 knjige“, „5 knjiga“, „1 proizvod“, „3 proizvoda“, „7 proizvoda“. */
export function countLabel(n: number, book: boolean) {
  return `${n} ${book ? plural(n, "knjiga", "knjige", "knjiga") : plural(n, "proizvod", "proizvoda", "proizvoda")}`;
}
