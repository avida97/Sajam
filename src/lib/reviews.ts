// Oznake koje kupac može da doda uz ocenu (Figma: „Fast shipper“, „Item as described“, „Quick replies“).
export const REVIEW_TAGS = [
  { value: "brzo_slanje", label: "Brzo slanje" },
  { value: "kao_u_opisu", label: "Kao u opisu" },
  { value: "brzi_odgovori", label: "Brzi odgovori" },
] as const;

export type ReviewTag = (typeof REVIEW_TAGS)[number]["value"];

export const tagLabel = (t: string) => REVIEW_TAGS.find((x) => x.value === t)?.label ?? t;
