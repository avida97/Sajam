import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-[20px] pb-[120px] pt-[100px] text-center text-black">
      <h1 className="font-serif text-[36px] font-medium italic leading-none">Stranica ne postoji</h1>
      <p className="mt-[16px] text-[14px] text-[#52525b]">Možda je oglas uklonjen ili je adresa pogrešna.</p>
      <Link href="/" className="mt-[28px] inline-flex h-[33px] items-center bg-ink px-[19px] text-[11px] font-bold uppercase text-white">
        Početna strana
      </Link>
    </div>
  );
}
