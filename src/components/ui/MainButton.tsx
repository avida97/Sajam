import Link from "next/link";
import type { ComponentProps } from "react";

// „Main button“ iz Figme: crna pozadina, beli Inter Bold, velika slova.
// Varijanta "light" je dugme iz footera (belo sa crnim okvirom).
// Hover po Figmi („Main button“ 229:267, „Hover state“): malo svetlija crna.
type Props = ComponentProps<typeof Link> & {
  variant?: "dark" | "light";
  size?: "sm" | "md";
};

export function MainButton({ variant = "dark", size = "sm", className = "", ...props }: Props) {
  const colors =
    variant === "dark"
      ? "bg-ink text-white transition-colors hover:bg-[#232222]"
      : "bg-white text-black border border-black";
  const sizing = size === "sm" ? "h-[33px] text-[11px]" : "h-[37px] text-[12px] tracking-[-0.12px]";
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center px-[19px] font-bold uppercase leading-none whitespace-nowrap ${colors} ${sizing} ${className}`}
    />
  );
}
