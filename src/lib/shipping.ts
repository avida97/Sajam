// Načini slanja i plaćanja (enumi shipping_method i payment_method u bazi).
// Isti nazivi se prikazuju na stranici oglasa.
export const SHIPPING = [
  { value: "posta", label: "Pošta" },
  { value: "licno", label: "Lično preuzimanje" },
] as const;
export const PAYMENT = [
  { value: "tekuci_racun", label: "Tekući račun (pre slanja)" },
  { value: "pouzece", label: "Pouzećem" },
  { value: "gotovina", label: "Gotovina" },
] as const;
export type ShippingMethod = (typeof SHIPPING)[number]["value"];
export type PaymentMethod = (typeof PAYMENT)[number]["value"];

// Gradovi za polje „Grad“ u formi i filter „Lokacija“.
export const CITIES = [
  "Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak",
  "Kraljevo", "Novi Pazar", "Smederevo", "Leskovac", "Valjevo", "Kruševac", "Vranje", "Šabac",
  "Užice", "Sombor", "Požarevac", "Pirot", "Zaječar", "Kikinda", "Sremska Mitrovica", "Jagodina",
  "Vršac", "Bor", "Prokuplje", "Loznica", "Inđija", "Stara Pazova", "Ruma", "Gornji Milanovac",
] as const;

// „1 radni dan“, „3 radna dana“, „5 radnih dana“ (za „Obično šalje za …“).
export const daysLabel = (n: number) =>
  `${n} ${n === 1 ? "radni dan" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "radna dana" : "radnih dana"}`;
