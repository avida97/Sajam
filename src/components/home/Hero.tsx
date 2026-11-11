import { MainButton } from "@/components/ui/MainButton";

// Hero početne strane (Figma 412:14229). Tekst je od V (11. 11. 2026), raspored kao u dizajnu.
export function Hero() {
  return (
    <section className="mx-auto h-[694px] max-w-site pt-[180px]">
      <div className="mx-auto flex w-[900px] flex-col items-center text-center">
        <h1 className="trim-cap text-[69px] font-semibold leading-[0.95] tracking-[-3.45px] text-black">
          Kupi, prodaj, razmeni
          <br />
          <span className="font-serif text-[79px] font-semibold italic tracking-[-3.16px]">knjige... i još ponešto</span>
        </h1>
        <p className="trim-cap mt-[40px] text-[17px] font-medium leading-[0.95] tracking-[-0.68px] text-[#7c7c7c]">
          Poveži se sa drugim čitaocima i daj knjigama novi život.
        </p>
        <MainButton href="/knjige" size="md" className="mt-[34px]">
          Započni kupovinu
        </MainButton>
      </div>
    </section>
  );
}
