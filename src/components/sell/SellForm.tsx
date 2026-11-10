"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IsbnField } from "@/components/sell/IsbnField";
import { CATEGORIES, HIDDEN_FIELDS, type ItemType } from "@/lib/categories";
import { CONDITIONS, type Condition } from "@/lib/conditions";
import { GENRES, LANGUAGES } from "@/lib/genres";
import { listingHref } from "@/lib/listings/params";
import type { BookDetail, BookHit } from "@/lib/isbn";
import { BookSuggest } from "@/components/sell/BookSuggest";
import { createClient } from "@/lib/supabase/client";

// Id-jevi potkategorija („knjige/strane-knjige“) i žanrova („knjiga/roman“) iz baze.
export type SellRefs = { subcategories: Record<string, number>; genres: Record<string, number> };

// „2 knjige“, „5 knjiga“, „1 artikal“, „3 artikla“, „7 artikala“.
function countLabel(n: number, book: boolean) {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  if (book) return `${n} ${last === 1 && !teen ? "knjiga" : last >= 2 && last <= 4 && !teen ? "knjige" : "knjiga"}`;
  return `${n} ${last === 1 && !teen ? "artikal" : last >= 2 && last <= 4 && !teen ? "artikla" : "artikala"}`;
}
const BUNDLE_COUNTS = [...Array.from({ length: 20 }, (_, i) => i + 1), 25, 30, 40, 50];

// Prekidač tipa artikla (Figma „Kategorije“ 934:32855): položaji teksta i crne pilule su iz dizajna.
const TYPES: Array<{ type: ItemType; label: string; text: number; pill: [number, number] }> = [
  { type: "knjiga", label: "Knjiga", text: 24, pill: [6, 75] },
  { type: "muzika", label: "Muzika", text: 118, pill: [100, 81] },
  { type: "manga_strip", label: "Manga ili strip", text: 218, pill: [200, 123] },
  { type: "igra", label: "Igra", text: 360, pill: [342, 60] },
  { type: "oprema", label: "Oprema", text: 439, pill: [421, 86] },
];

const NOUN: Record<ItemType, string> = {
  knjiga: "knjige",
  manga_strip: "artikla",
  muzika: "artikla",
  igra: "artikla",
  oprema: "artikla",
};

const PHOTO_SLOTS = [
  { left: 0, top: 0, w: 241, h: 323 },
  { left: 261, top: 0, w: 115, h: 156 },
  { left: 390, top: 0, w: 117, h: 156 },
  { left: 520, top: 0, w: 116, h: 156 },
  { left: 261, top: 167, w: 115, h: 156 },
  { left: 390, top: 167, w: 117, h: 156 },
  { left: 520, top: 167, w: 116, h: 156 },
];

const inputCls =
  "sell-field h-[36px] w-[306px] border border-[#dfdfdf] bg-white px-[16px] text-[14px] leading-[16px] text-black placeholder:text-[#71717a] focus:border-black focus:outline-none";

export function SellForm({ refs, signedIn }: { refs: SellRefs | null; signedIn: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [type, setType] = useState<ItemType>("knjiga");
  const [publishing, setPublishing] = useState(false);
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<Array<{ file: File; url: string; fromDb?: boolean }>>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [bookNote, setBookNote] = useState<{ tone: "info" | "ok" | "warn"; text: string } | null>(null);
  const pickRef = useRef(0);

  // Izabrana knjiga iz padajuće liste popunjava formu. Sva polja ostaju izmenljiva.
  const pickBook = useCallback(async (hit: BookHit) => {
    const form = formRef.current;
    if (!form) return;
    const n = ++pickRef.current;
    setBookNote({ tone: "info", text: `Učitavam podatke za „${hit.title}“...` });
    const detail: BookDetail | null = await fetch(`/api/knjige/${encodeURIComponent(hit.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    if (n !== pickRef.current) return;
    const book: BookDetail = detail ?? {
      title: hit.title,
      authors: hit.authors,
      publisher: hit.publisher,
      isbn: hit.isbn,
      pageCount: null,
      language: null,
      description: null,
      cover: null,
      subcategory: null,
      genre: null,
    };

    const filled: string[] = [];
    const set = (name: string, label: string, value: string | number | null) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el || value == null || value === "") return;
      if (el instanceof HTMLSelectElement && ![...el.options].some((o) => o.value === String(value))) return;
      el.value = String(value);
      filled.push(label);
    };
    set("naziv", "naziv", book.title);
    set("autor", "autor", book.authors);
    set("isbn", "ISBN", book.isbn);
    set("izdavac", "izdavač", book.publisher);
    set("broj_stranica", "broj stranica", book.pageCount);
    set("jezik", "jezik", book.language);
    set("potkategorija", "kategorija", book.subcategory);
    set("zanr", "žanr", book.genre);
    set("opis", "opis", book.description);

    // Naslovna iz baze ide kao prva fotografija (može da se ukloni); prethodna iz baze se menja.
    let cover = false;
    if (book.cover) {
      const blob = await fetch(`/api/knjige/naslovna?u=${encodeURIComponent(book.cover)}`)
        .then((r) => (r.ok ? r.blob() : null))
        .catch(() => null);
      if (n !== pickRef.current) return;
      if (blob && blob.size > 2000) {
        const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
        const file = new File([blob], `naslovna.${ext}`, { type: blob.type });
        setPhotos((p) => {
          p.filter((x) => x.fromDb).forEach((x) => URL.revokeObjectURL(x.url));
          return [{ file, url: URL.createObjectURL(file), fromDb: true }, ...p.filter((x) => !x.fromDb)].slice(0, PHOTO_SLOTS.length);
        });
        cover = true;
        filled.push("naslovna fotografija");
      }
    }

    const missing = [
      !(form.elements.namedItem("potkategorija") as HTMLSelectElement | null)?.value && "kategorija",
      !(form.elements.namedItem("stanje") as HTMLSelectElement | null)?.value && "stanje",
      "svoje fotografije knjige",
      !(form.elements.namedItem("cena") as HTMLInputElement | null)?.value && "cena",
    ].filter(Boolean);
    setBookNote({
      tone: "ok",
      text:
        `Popunjeno iz baze: ${filled.join(", ")}. Proveri podatke, sve možeš da izmeniš. ` +
        `Još dodaj: ${missing.join(", ")}.` +
        (cover ? " Naslovna iz baze je prva fotografija, a dodaj i slike svog primerka." : ""),
    });
  }, []);

  const category = CATEGORIES.find((c) => c.itemType === type)!;
  const genres = GENRES[type];
  const hidden = HIDDEN_FIELDS[type];
  const noun = NOUN[type];
  const isBook = type === "knjiga" || type === "manga_strip";

  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, PHOTO_SLOTS.length - photos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next]);
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photos[i].url);
    setPhotos((p) => p.filter((_, j) => j !== i));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (publishing) return;
    if (photos.length === 0) {
      setNotice("Dodaj bar jednu fotografiju artikla.");
      return;
    }
    if (!refs) {
      setNotice("Objavljivanje trenutno ne radi. Pokušaj ponovo malo kasnije.");
      return;
    }
    if (!signedIn) {
      // Prijava se otvara preko ove stranice, pa popunjena forma i fotografije ostaju.
      router.replace(`${pathname}?nalog=prijava&posle=${encodeURIComponent(pathname)}`, { scroll: false });
      return;
    }

    const fd = new FormData(e.currentTarget);
    const text = (name: string) => {
      const v = String(fd.get(name) ?? "").trim();
      return v === "" ? null : v;
    };
    const categoryId = refs.subcategories[`${category.slug}/${text("potkategorija")}`];
    const genreSlug = text("zanr");
    const isbnRaw = text("isbn")?.toUpperCase().replace(/[^0-9X]/g, "") ?? null;
    if (isbnRaw && !/^(97[89])?[0-9]{9}[0-9X]$/.test(isbnRaw)) {
      setNotice("ISBN nije ispravan. Unesi 10 ili 13 cifara, npr. 978-86-10-02436-4.");
      return;
    }
    const pages = text("broj_stranica");
    if (!priceNum) {
      setNotice("Unesi cenu artikla.");
      return;
    }

    setPublishing(true);
    setNotice("Objavljujem oglas...");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPublishing(false);
      setNotice(null);
      router.replace(`${pathname}?nalog=prijava&posle=${encodeURIComponent(pathname)}`, { scroll: false });
      return;
    }

    const title = text("naziv")!;
    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        item_type: type,
        category_id: categoryId,
        genre_id: genreSlug ? (refs.genres[`${type}/${genreSlug}`] ?? null) : null,
        title,
        author: hidden.includes("author") ? null : text("autor"),
        isbn: hidden.includes("isbn") ? null : isbnRaw,
        language: text("jezik"),
        page_count: hidden.includes("page_count") || !pages ? null : Number(pages),
        publisher: hidden.includes("publisher") ? null : text("izdavac"),
        bundle_count: Number(text("broj") ?? 1),
        condition: text("stanje") as Condition,
        description: text("opis"),
        price_rsd: priceNum,
      })
      .select("id")
      .single();
    if (error || !listing) {
      setPublishing(false);
      setNotice("Oglas nije objavljen. Proveri polja i pokušaj ponovo.");
      return;
    }

    // Fotografije idu direktno iz pregledača u Supabase Storage: <korisnik>/<oglas>/<redni broj>.
    for (const [i, p] of photos.entries()) {
      const ext = (p.file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${listing.id}/${i}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("listing-images").upload(path, p.file, { contentType: p.file.type });
      const row = up.error ? null : await supabase.from("listing_images").insert({ listing_id: listing.id, path, position: i });
      if (up.error || row?.error) {
        await supabase.from("listings").delete().eq("id", listing.id);
        setPublishing(false);
        setNotice(
          up.error?.message.toLowerCase().includes("size")
            ? "Neka fotografija je veća od 8 MB. Smanji je pa pokušaj ponovo."
            : "Fotografije nisu otpremljene, pa oglas nije objavljen. Pokušaj ponovo.",
        );
        return;
      }
    }

    router.push(listingHref({ id: listing.id, title }));
    router.refresh();
  };

  const priceNum = Number(price.replace(/\D/g, "")) || 0;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mx-auto flex w-[636px] flex-col pb-[80px] pt-[80px]">
      <div className="text-center text-black">
        <h1 className="trim-cap font-serif text-[32px] font-medium italic leading-[0.95] tracking-[-0.32px]">
          Sell an item
        </h1>
        <p className="mt-[24px] text-[14px] leading-[1.5]">What type of item are you selling?</p>
      </div>

      <div
        role="radiogroup"
        aria-label="Tip artikla"
        className="relative mx-auto mt-[30px] h-[50px] w-[513px] overflow-clip rounded-[46px] bg-[#f5f5f5] shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.07)]"
      >
        {TYPES.filter((t) => t.type === type).map((t) => (
          <span
            key={t.type}
            className="absolute top-[6px] h-[38px] rounded-[29px] bg-black transition-all"
            style={{ left: t.pill[0], width: t.pill[1] }}
          />
        ))}
        {TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            role="radio"
            aria-checked={t.type === type}
            onClick={() => setType(t.type)}
            className={`absolute top-[17px] whitespace-nowrap text-[13px] font-medium leading-[normal] ${
              t.type === type ? "text-white" : "text-black"
            }`}
            style={{ left: t.text }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Section title="Detalji artikla" className="mt-[70px]" gap={36}>
        <div key={type} className="grid grid-cols-[306px_306px] gap-x-[24px] gap-y-[18px]">
          <Select name="potkategorija" placeholder="Kategorija" required options={category.subcategories.map((s) => ({ value: s.slug, label: s.name }))} />
          {genres.length > 0 ? (
            <Select name="zanr" placeholder="Žanr" options={genres.map((g) => ({ value: g.slug, label: g.name }))} />
          ) : (
            <span />
          )}
          <Select
            name="broj"
            placeholder={type === "knjiga" ? "Broj knjiga u paketu" : "Broj artikala u paketu"}
            options={BUNDLE_COUNTS.map((n) => ({ value: String(n), label: countLabel(n, type === "knjiga") }))}
          />
          <Select
            name="stanje"
            placeholder={`Stanje ${noun}`}
            required
            options={CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
          />
        </div>
      </Section>

      <Section
        title="Fotografije artikla"
        hint="Dodaj što više fotografija, do 7: prednju i zadnju stranu, hrbat i svako oštećenje. Oglasi sa više fotografija se brže prodaju."
        className="mt-[60px]"
        gap={34}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="relative h-[323px] w-[636px]">
          {PHOTO_SLOTS.map((s, i) => {
            const photo = photos[i];
            return (
              <div
                key={i}
                className="absolute overflow-clip bg-[#f5f6f8]"
                style={{ left: s.left, top: s.top, width: s.w, height: s.h }}
              >
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={`Fotografija ${i + 1}`} className="size-full object-cover" />
                    {photo.fromDb && (
                      <span className="absolute bottom-[6px] left-[6px] bg-white px-[6px] py-[3px] text-[10px] font-medium leading-none text-black">
                        Naslovna iz baze
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label="Ukloni fotografiju"
                      className="absolute right-[6px] top-[6px] flex size-[22px] items-center justify-center rounded-full bg-white"
                    >
                      <Image src="/icons/close.svg" alt="" width={10} height={10} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label={i === 0 ? "Dodaj naslovnu fotografiju" : "Dodaj fotografiju"}
                    className="flex size-full items-center justify-center"
                  >
                    <Image src="/icons/camera.svg" alt="" width={20} height={19} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {isBook && (
        <div className="mt-[60px] bg-[#f5f6f8] px-[20px] py-[18px]">
          <p className="text-[15px] font-semibold leading-[1.3] text-black">Objavi knjigu za par sekundi</p>
          <ol className="mt-[10px] list-decimal space-y-[4px] pl-[18px] text-[13px] leading-[1.45] text-[#52525b]">
            <li>
              Skeniraj bar-kod sa poleđine knjige: na telefonu dugmetom <b className="font-semibold text-black">Skeniraj</b>, a
              na računaru dugmetom <b className="font-semibold text-black">Telefonom</b>. Možeš i da upišeš ISBN, naziv ili
              autora.
            </li>
            <li>Sa spiska izaberi svoju knjigu.</li>
            <li>
              Sajam sam popuni naziv, autora, izdavača, broj stranica, jezik, kategoriju, žanr, opis i naslovnu
              fotografiju. Ti samo proveriš podatke, dodaš slike svog primerka, stanje i cenu.
            </li>
          </ol>
          <p className="mt-[10px] text-[12px] leading-[1.4] text-[#7c7c7c]">
            Popunjena polja imaju crni okvir, a prazna sivi, pa se odmah vidi šta je ostalo.
          </p>
          {bookNote && (
            <p
              role="status"
              className={`mt-[12px] border-l-2 pl-[10px] text-[13px] leading-[1.45] ${
                bookNote.tone === "ok" ? "border-[#15803d] text-[#14532d]" : "border-[#a1a1aa] text-[#52525b]"
              }`}
            >
              {bookNote.text}
            </p>
          )}
        </div>
      )}

      <div className={`${isBook ? "mt-[32px]" : "mt-[60px]"} grid grid-cols-[306px_306px] gap-x-[24px] gap-y-[24px]`}>
        <Field label="Naziv">
          <BookSuggest by="naslov" name="naziv" required placeholder="npr. Rat i mir" className={inputCls} enabled={isBook} onPick={pickBook} />
        </Field>
        {!hidden.includes("author") && (
          <Field label="Autor">
            <BookSuggest
              by="autor"
              name="autor"
              placeholder={type === "muzika" ? "npr. Riblja Čorba" : "npr. Lav Tolstoj"}
              className={inputCls}
              enabled={isBook}
              onPick={pickBook}
            />
          </Field>
        )}
        {!hidden.includes("isbn") && (
          <Field label="ISBN" optional>
            <IsbnField className={inputCls} onPick={pickBook} />
          </Field>
        )}
        <Field label="Jezik">
          <Select name="jezik" placeholder="Izaberi jezik" options={LANGUAGES.map((l) => ({ value: l, label: l }))} />
        </Field>
        {!hidden.includes("page_count") && (
          <Field label="Broj stranica" optional>
            <div className="relative">
              <input
                name="broj_stranica"
                type="number"
                min={1}
                placeholder="npr. 347"
                className={`${inputCls} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <Image src="/icons/stepper.svg" alt="" width={9} height={18} className="pointer-events-none absolute left-[290px] top-[9px]" />
            </div>
          </Field>
        )}
        {!hidden.includes("publisher") && (
          <Field label={type === "muzika" ? "Izdavačka kuća" : "Izdavač"} optional>
            <input name="izdavac" placeholder="npr. Laguna" className={inputCls} />
          </Field>
        )}
        <div className="col-span-2">
          <Field label="Opis">
            <textarea
              name="opis"
              placeholder="Opiši artikal: stanje, eventualna oštećenja, o čemu se radi u knjizi ili šta sve dobija kupac..."
              className="sell-field block h-[124px] w-[636px] resize-none border border-[#dfdfdf] bg-white p-[16px] text-[14px] leading-[1.4] text-black placeholder:text-[#71717a] focus:border-black focus:outline-none"
            />
          </Field>
        </div>
      </div>

      <Section title="Cena artikla" className="mt-[60px]" gap={28}>
        <div className="flex gap-[24px]">
          <label className="relative block h-[49px] w-[306px] border border-black">
            <span className="trim-cap absolute left-[9px] top-[7px] text-[11px] leading-[0.95] text-black">Price</span>
            <span className="absolute left-[9px] top-[21px] flex items-center text-[18px] font-semibold text-black">
              <span className="mr-[5px]">RSD</span>
              <input
                name="cena"
                required
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="1000"
                className="w-[220px] bg-transparent placeholder:text-[#b3b3b3] focus:outline-none"
              />
            </span>
          </label>
        </div>
      </Section>

      <div className="mt-[60px] flex items-center justify-end gap-[24px]">
        {notice && (
          <p role="status" className="text-[13px] leading-[1.4] text-[#52525b]">
            {notice}
          </p>
        )}
        <button
          type="submit"
          disabled={publishing}
          className="flex h-[37px] shrink-0 disabled:opacity-60 items-center justify-center bg-[#09090b] px-[19px] text-[12px] font-bold uppercase leading-[0.95] tracking-[-0.12px] text-white"
        >
          <span className="trim-cap">Objavi oglas</span>
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  className,
  gap,
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  gap: number;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="text-[17px] font-semibold leading-[16px] text-black">{title}</h2>
      {hint && <p className="mt-[8px] text-[13px] leading-[1.4] text-[#7c7c7c]">{hint}</p>}
      <div style={{ marginTop: hint ? 16 : gap - 16 }}>{children}</div>
    </section>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[17px] font-semibold leading-[16px] text-black">
        {label}
        {optional && <span className="ml-[4px] text-[13px] font-normal text-[#7c7c7c]">(opciono)</span>}
      </span>
      <span className="mt-[12px] block">{children}</span>
    </label>
  );
}

function Select({
  name,
  placeholder,
  options,
  required,
}: {
  name: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div className="relative h-[36px] w-[306px]">
      <select
        name={name}
        required={required}
        defaultValue=""
        className="sell-field h-[36px] w-[306px] appearance-none border border-[#dfdfdf] bg-white pl-[11px] pr-[36px] text-[14px] leading-[16px] text-black focus:border-black focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Image
        src="/icons/chevron-down.svg"
        alt=""
        width={9}
        height={5}
        className="pointer-events-none absolute left-[279px] top-[16px]"
      />
    </div>
  );
}
