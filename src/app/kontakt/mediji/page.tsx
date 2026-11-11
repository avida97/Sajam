import { permanentRedirect } from "next/navigation";

// „Mediji i novosti“ je zamenjena stranicom za biznise (odluka V 11. 11. 2026).
export default function Page() {
  permanentRedirect("/saradnja");
}
