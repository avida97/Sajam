"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, HIDDEN_FIELDS, type ItemType } from "@/lib/categories";
import { CONDITIONS } from "@/lib/conditions";
import { BUNDLE_RANGES, GENRES, LANGUAGES } from "@/lib/genres";

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
  "h-[36px] w-[306px] border border-[#dfdfdf] bg-white px-[16px] text-[14px] leading-[16px] text-black placeholder:text-[#71717a] focus:border-black focus:outline-none";

export function SellForm() {
  const [type, setType] = useState<ItemType>("knjiga");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<Array<{ file: File; url: string }>>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const category = CATEGORIES.find((c) => c.itemType === type)!;
  const genres = GENRES[type];
  const hidden = HIDDEN_FIELDS[type];
  const noun = NOUN[type];

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (photos.length === 0) {
      setNotice("Dodaj bar jednu fotografiju artikla.");
      return;
    }
    setNotice("Sve je popunjeno. Objavljivanje oglasa proradiće čim povežemo bazu podataka.");
  };

  const priceNum = Number(price.replace(/\D/g, "")) || 0;

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-[636px] flex-col pb-[80px] pt-[80px]">
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
            options={BUNDLE_RANGES.map((b) => ({
              value: b.value,
              label: type === "knjiga" ? b.label : b.label.replace(/knjig[ae]?/, "artikala").replace("1 artikala", "1 artikal"),
            }))}
          />
          <Select
            name="stanje"
            placeholder={`Stanje ${noun}`}
            required
            options={CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
          />
        </div>
      </Section>

      <Section title="Fotografije artikla" className="mt-[60px]" gap={34}>
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

      <div className="mt-[60px] grid grid-cols-[306px_306px] gap-x-[24px] gap-y-[24px]">
        <Field label="Naziv">
          <input name="naziv" required placeholder="npr. Rat i mir" className={inputCls} />
        </Field>
        {!hidden.includes("author") && (
          <Field label="Autor">
            <input name="autor" placeholder={type === "muzika" ? "npr. Riblja Čorba" : "npr. Lav Tolstoj"} className={inputCls} />
          </Field>
        )}
        {!hidden.includes("isbn") && (
          <Field label="ISBN">
            <input name="isbn" placeholder="npr. 978-86-10-02436-4" className={inputCls} />
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
          <Field label={`Opis stanja ${noun}`}>
            <textarea
              name="opis"
              placeholder="Stanje sam označio kao “veoma dobro” isključivo jer je jednom pročitana, dakle ipak je korišćena, ali nema oštećenja, mrlja ili slično..."
              className="block h-[124px] w-[636px] resize-none border border-[#dfdfdf] bg-white p-[16px] text-[14px] leading-[1.4] text-black placeholder:text-[#71717a] focus:border-black focus:outline-none"
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
          <div className="relative h-[49px] w-[306px] bg-[#f5f5f5]">
            <span className="trim-cap absolute left-[10px] top-[8px] text-[11px] leading-[0.95] text-[#696969]">You earn</span>
            <span className="trim-cap absolute left-[10px] top-[25px] text-[18px] font-semibold leading-[0.95] text-[#b3b3b3]">
              RSD {priceNum.toLocaleString("sr-RS")}
            </span>
            <span
              title="Sajam ne uzima proviziju: ceo iznos ide tebi."
              className="absolute left-[287px] top-[8px]"
            >
              <Image src="/icons/info.svg" alt="Informacija" width={11} height={11} />
            </span>
          </div>
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
          className="flex h-[37px] shrink-0 items-center justify-center bg-[#09090b] px-[19px] text-[12px] font-bold uppercase leading-[0.95] tracking-[-0.12px] text-white"
        >
          <span className="trim-cap">Objavi oglas</span>
        </button>
      </div>
    </form>
  );
}

function Section({ title, className, gap, children }: { title: string; className?: string; gap: number; children: React.ReactNode }) {
  return (
    <section className={className}>
      <h2 className="text-[17px] font-semibold leading-[16px] text-black">{title}</h2>
      <div style={{ marginTop: gap - 16 }}>{children}</div>
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
        className="h-[36px] w-[306px] appearance-none border border-[#dfdfdf] bg-white pl-[11px] pr-[36px] text-[14px] leading-[16px] text-black focus:border-black focus:outline-none"
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
