"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IsbnField } from "@/components/sell/IsbnField";
import { CATEGORIES, HIDDEN_FIELDS, type ItemType } from "@/lib/categories";
import { CONDITIONS, type Condition } from "@/lib/conditions";
import { countLabel } from "@/lib/plural";
import { GENRES, LANGUAGES } from "@/lib/genres";
import { listingHref } from "@/lib/listings/params";
import type { BookDetail, BookHit } from "@/lib/isbn";
import { BookSuggest } from "@/components/sell/BookSuggest";
import { CITIES, PAYMENT, SHIPPING, type PaymentMethod, type ShippingMethod } from "@/lib/shipping";
import { createClient } from "@/lib/supabase/client";

// Id-jevi potkategorija („knjige/strane-knjige“) i žanrova („knjiga/roman“) iz baze.
export type SellRefs = { subcategories: Record<string, number>; genres: Record<string, number> };

// Postojeći oglas koji se menja (/prodaj?izmeni=<id>).
export type EditListing = {
  id: number;
  type: ItemType;
  values: Record<string, string>;
  price: string;
  shipping: ShippingMethod[];
  payment: PaymentMethod[];
  images: Array<{ path: string; url: string }>;
};

type Photo = { file?: File; path?: string; url: string; fromDb?: boolean };

const BUNDLE_TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Primeri u poljima, po vrsti artikla (da kod igre ne piše „knjiga“).
const EXAMPLES: Record<ItemType, { title: string; author: string; publisher: string; description: string }> = {
  knjiga: {
    title: "npr. Rat i mir",
    author: "npr. Lav Tolstoj",
    publisher: "npr. Laguna",
    description: "Opiši knjigu: stanje, eventualna oštećenja (podvlačenja, posvete, požutele strane) i o čemu se radi u knjizi...",
  },
  manga_strip: {
    title: "npr. Naruto, tom 1",
    author: "npr. Masaši Kišimoto",
    publisher: "npr. Darkwood",
    description: "Opiši izdanje: stanje, eventualna oštećenja i koji brojevi ili tomovi su u paketu...",
  },
  muzika: {
    title: "npr. Mrtva priroda",
    author: "npr. Riblja Čorba",
    publisher: "npr. PGP RTS",
    description: "Opiši izdanje: format (ploča, CD, kaseta), stanje omota i nosača, spisak pesama ili posebnosti izdanja...",
  },
  igra: {
    title: "npr. Catan",
    author: "",
    publisher: "npr. Kosmos",
    description: "Opiši igru: platforma ili vrsta, da li je kompletna (kutija, uputstvo, delovi), stanje i da li sve radi...",
  },
  oprema: {
    title: "npr. Gramofon Pioneer PL-12D",
    author: "",
    publisher: "",
    description: "Opiši opremu: šta tačno dobija kupac, stanje, eventualna oštećenja i da li sve radi...",
  },
};

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

export function SellForm({
  refs,
  signedIn,
  editing,
  defaultCity,
}: {
  refs: SellRefs | null;
  signedIn: boolean;
  editing?: EditListing | null;
  defaultCity?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [type, setType] = useState<ItemType>(editing?.type ?? "knjiga");
  const [publishing, setPublishing] = useState(false);
  const [price, setPrice] = useState(editing?.price ?? "");
  const [photos, setPhotos] = useState<Photo[]>(() => editing?.images.map((i) => ({ path: i.path, url: i.url })) ?? []);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [photoError, setPhotoError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [shipping, setShipping] = useState<ShippingMethod[]>(editing?.shipping ?? ["posta"]);
  const [payment, setPayment] = useState<PaymentMethod[]>(editing?.payment ?? ["tekuci_racun"]);
  const [shipError, setShipError] = useState(false);
  const shipRef = useRef<HTMLDivElement>(null);
  const photoGridRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLLabelElement>(null);
  const pickRef = useRef(0);
  const bundleRef = useRef<HTMLDivElement>(null);

  // Broj artikala u paketu: kockice 1–10 ili drugi broj upisan ručno.
  const [bundle, setBundle] = useState(editing?.values.broj ?? "");
  const [bundleOther, setBundleOther] = useState(() => !!editing && !BUNDLE_TILES.includes(Number(editing.values.broj)));
  const [bundleError, setBundleError] = useState(false);
  // Jezik: ponuđeni ili „Drugo“ pa upisan ručno.
  const knownLang = (v: string) => (LANGUAGES as readonly string[]).includes(v);
  const [langOther, setLangOther] = useState(() => !!editing?.values.jezik && !knownLang(editing.values.jezik));

  // Izabrana knjiga iz padajuće liste popunjava formu. Sva polja ostaju izmenljiva.
  const pickBook = useCallback(async (hit: BookHit) => {
    const form = formRef.current;
    if (!form) return;
    const n = ++pickRef.current;
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
      covers: [],
      subcategory: null,
      genre: null,
    };

    const set = (name: string, _label: string, value: string | number | null) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el || value == null || value === "") return;
      if (el instanceof HTMLSelectElement && ![...el.options].some((o) => o.value === String(value))) return;
      el.value = String(value);
      el.setAttribute("aria-invalid", "false");
    };
    set("naziv", "naziv", book.title);
    set("autor", "autor", book.authors);
    set("isbn", "ISBN", book.isbn);
    set("izdavac", "izdavač", book.publisher);
    set("broj_stranica", "broj stranica", book.pageCount);
    set("jezik", "jezik", book.language);
    if (book.language) setLangOther(false);
    set("potkategorija", "kategorija", book.subcategory);
    set("zanr", "žanr", book.genre);
    set("opis", "opis", book.description);

    // Naslovna iz baze ide kao prva fotografija (može da se ukloni); prethodna iz baze se menja.
    // Redom se probaju: velika slika iz detalja, sličica iz liste, pa Open Library po ISBN-u.
    const isbn = book.isbn ?? hit.isbn;
    const candidates = [
      ...new Set(
        [
          book.covers[0],
          hit.thumb?.replace(/zoom=\d/, "zoom=1").replace(/-S\.jpg$/, "-L.jpg"),
          ...book.covers.slice(1),
          isbn && `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`,
        ].filter((u): u is string => !!u),
      ),
    ];
    for (const u of candidates) {
      const blob = await fetch(`/api/knjige/naslovna?u=${encodeURIComponent(u)}`)
        .then((r) => (r.ok ? r.blob() : null))
        .catch(() => null);
      if (n !== pickRef.current) return;
      if (!blob || blob.size < 2000 || !blob.type.startsWith("image/")) continue;
      const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const file = new File([blob], `naslovna.${ext}`, { type: blob.type });
      setPhotos((p) => {
        p.filter((x) => x.fromDb).forEach((x) => URL.revokeObjectURL(x.url));
        return [{ file, url: URL.createObjectURL(file), fromDb: true }, ...p.filter((x) => !x.fromDb)].slice(0, PHOTO_SLOTS.length);
      });
      setPhotoError(false);
      break;
    }
  }, []);

  const category = CATEGORIES.find((c) => c.itemType === type)!;
  const genres = GENRES[type];
  const hidden = HIDDEN_FIELDS[type];
  const noun = NOUN[type];
  const isBook = type === "knjiga" || type === "manga_strip";

  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => p.file && URL.revokeObjectURL(p.url)), []);

  // Izmena oglasa: polja se popune iz baze kad se forma prikaže.
  useEffect(() => {
    const form = formRef.current;
    if (!editing || !form) return;
    for (const [name, value] of Object.entries(editing.values)) {
      if (name === "broj") continue;
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (name === "jezik" && value && !(LANGUAGES as readonly string[]).includes(value)) {
        if (el) el.value = "drugo";
        const other = form.elements.namedItem("jezik_drugo") as HTMLInputElement | null;
        if (other) other.value = value;
        continue;
      }
      if (el && value) el.value = value;
    }
  }, [editing]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, PHOTO_SLOTS.length - photos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next]);
    if (next.length) setPhotoError(false);
  };

  const removePhoto = (i: number) => {
    if (photos[i].file) URL.revokeObjectURL(photos[i].url);
    setPhotos((p) => p.filter((_, j) => j !== i));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (publishing) return;

    // Obavezna polja (odluka V 10. 11. 2026): prazna dobijaju crveni okvir, bez dodatnog teksta.
    const form = e.currentTarget;
    const required = [
      "potkategorija",
      genres.length > 0 && "zanr",
      "stanje",
      "naziv",
      !hidden.includes("author") && "autor",
      "jezik",
      langOther && "jezik_drugo",
      // Opis je obavezan (odluka V 11. 11. 2026): kupac mora da zna šta tačno kupuje.
      "opis",
    ];
    const bad: HTMLElement[] = [];
    for (const name of required) {
      if (!name) continue;
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const empty = el.value.trim() === "";
      el.setAttribute("aria-invalid", String(empty));
      if (empty) bad.push(el);
    }
    const isbnEl = form.elements.namedItem("isbn") as HTMLInputElement | null;
    if (isbnEl) {
      const raw = isbnEl.value.toUpperCase().replace(/[^0-9X]/g, "");
      const wrong = raw !== "" && !/^(97[89])?[0-9]{9}[0-9X]$/.test(raw);
      isbnEl.setAttribute("aria-invalid", String(wrong));
      if (wrong) bad.push(isbnEl);
    }
    const noBundle = !(Number(bundle) >= 1);
    setBundleError(noBundle);
    if (noBundle && bundleRef.current) bad.push(bundleRef.current);
    setPhotoError(photos.length === 0);
    if (photos.length === 0 && photoGridRef.current) bad.push(photoGridRef.current);
    const noShip = shipping.length === 0 || payment.length === 0;
    setShipError(noShip);
    if (noShip && shipRef.current) bad.push(shipRef.current);
    setPriceError(!priceNum);
    if (!priceNum && priceRef.current) bad.push(priceRef.current);
    if (bad.length) {
      setNotice(null);
      const top = bad.reduce((a, b) => (b.getBoundingClientRect().top < a.getBoundingClientRect().top ? b : a));
      top.scrollIntoView({ behavior: "smooth", block: "center" });
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
    const pages = text("broj_stranica");

    setPublishing(true);
    setNotice(editing ? "Čuvam izmene..." : "Objavljujem oglas...");
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
    const fields = {
      item_type: type,
      category_id: categoryId,
      genre_id: genreSlug ? (refs.genres[`${type}/${genreSlug}`] ?? null) : null,
      title,
      author: hidden.includes("author") ? null : text("autor"),
      isbn: hidden.includes("isbn") ? null : isbnRaw,
      language: langOther ? text("jezik_drugo") : text("jezik"),
      page_count: hidden.includes("page_count") || !pages ? null : Number(pages),
      publisher: hidden.includes("publisher") ? null : text("izdavac"),
      bundle_count: Number(bundle),
      condition: text("stanje") as Condition,
      description: text("opis"),
      price_rsd: priceNum,
      city: text("grad"),
      shipping_methods: shipping,
      payment_methods: payment,
    };
    const { data: listing, error } = editing
      ? await supabase.from("listings").update(fields).eq("id", editing.id).select("id").single()
      : await supabase.from("listings").insert({ seller_id: user.id, ...fields }).select("id").single();
    if (error || !listing) {
      setPublishing(false);
      setNotice(editing ? "Izmene nisu sačuvane. Pokušaj ponovo." : "Oglas nije objavljen. Proveri polja i pokušaj ponovo.");
      return;
    }

    // Fotografije idu direktno iz pregledača u Supabase Storage: <korisnik>/<oglas>/<redni broj>.
    // Kod izmene se postojeće slike zadržavaju, a redosled se upisuje iznova.
    const paths: string[] = [];
    for (const [i, p] of photos.entries()) {
      if (p.path) {
        paths.push(p.path);
        continue;
      }
      const file = p.file!;
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${listing.id}/${i}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("listing-images").upload(path, file, { contentType: file.type });
      if (up.error) {
        if (!editing) await supabase.from("listings").delete().eq("id", listing.id);
        setPublishing(false);
        setNotice(
          up.error.message.toLowerCase().includes("size")
            ? "Neka fotografija je veća od 8 MB. Smanji je pa pokušaj ponovo."
            : editing
              ? "Nove fotografije nisu otpremljene. Pokušaj ponovo."
              : "Fotografije nisu otpremljene, pa oglas nije objavljen. Pokušaj ponovo.",
        );
        return;
      }
      paths.push(path);
    }
    if (editing) {
      const removed = editing.images.map((i) => i.path).filter((p) => !paths.includes(p));
      await supabase.from("listing_images").delete().eq("listing_id", listing.id);
      if (removed.length) await supabase.storage.from("listing-images").remove(removed);
    }
    const rows = await supabase
      .from("listing_images")
      .insert(paths.map((path, position) => ({ listing_id: listing.id, path, position })));
    if (rows.error) {
      if (!editing) await supabase.from("listings").delete().eq("id", listing.id);
      setPublishing(false);
      setNotice("Fotografije nisu sačuvane. Pokušaj ponovo.");
      return;
    }

    router.push(listingHref({ id: listing.id, title }));
    router.refresh();
  };

  const priceNum = Number(price.replace(/\D/g, "")) || 0;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      onChange={(e) => {
        const t = e.target as HTMLElement;
        if (t.getAttribute("aria-invalid") === "true") t.setAttribute("aria-invalid", "false");
      }} className="mx-auto flex w-[636px] flex-col pb-[80px] pt-[80px]">
      <div className="text-center text-black">
        <h1 className="trim-cap font-serif text-[32px] font-medium italic leading-[0.95] tracking-[-0.32px]">
          {editing ? "Izmeni oglas" : "Sell an item"}
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
          <div ref={bundleRef} className="col-span-2">
            <p className="text-[14px] font-medium text-black">
              {type === "knjiga" ? "Broj knjiga u paketu" : "Broj artikala u paketu"}
            </p>
            <div role="radiogroup" aria-label="Broj u paketu" className="mt-[12px] flex gap-[8px]">
              {BUNDLE_TILES.map((n) => {
                const on = !bundleOther && bundle === String(n);
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={countLabel(n, type === "knjiga")}
                    onClick={() => {
                      setBundle(String(n));
                      setBundleOther(false);
                      setBundleError(false);
                    }}
                    className={`size-[44px] border text-[14px] font-medium ${
                      on ? "border-black bg-black text-white" : bundleError ? "border-alert bg-white" : "border-[#dfdfdf] bg-white hover:border-black"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              {bundleOther ? (
                <input
                  autoFocus
                  type="number"
                  min={1}
                  max={999}
                  aria-label="Drugi broj"
                  value={bundle}
                  onChange={(e) => {
                    setBundle(e.target.value.replace(/\D/g, "").slice(0, 3));
                    setBundleError(false);
                  }}
                  placeholder="Broj"
                  className={`h-[44px] w-[116px] border px-[12px] text-[14px] text-black focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${
                    bundleError ? "border-alert" : "border-black"
                  }`}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBundleOther(true);
                    setBundle("");
                  }}
                  className={`h-[44px] w-[116px] border bg-white text-[13px] font-medium ${bundleError ? "border-alert" : "border-[#dfdfdf] hover:border-black"}`}
                >
                  Drugi broj
                </button>
              )}
            </div>
          </div>
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
        <div ref={photoGridRef} className="relative h-[323px] w-[636px]">
          {PHOTO_SLOTS.map((s, i) => {
            const photo = photos[i];
            return (
              <div
                key={i}
                className={`absolute overflow-clip bg-[#f5f6f8] ${i === 0 && photoError ? "border border-alert" : ""}`}
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

      <div className="mt-[60px] grid grid-cols-[306px_306px] gap-x-[24px] gap-y-[24px]">
        <Field label="Naziv">
          <BookSuggest by="naslov" name="naziv" required placeholder={EXAMPLES[type].title} className={inputCls} enabled={isBook} onPick={pickBook} />
        </Field>
        {!hidden.includes("author") && (
          <Field label="Autor">
            <BookSuggest
              by="autor"
              name="autor"
              placeholder={EXAMPLES[type].author}
              className={inputCls}
              enabled={isBook}
              onPick={pickBook}
            />
          </Field>
        )}
        {!hidden.includes("isbn") && (
          <Field
            label="ISBN"
            info="ISBN je broj od 10 ili 13 cifara koji stoji iznad bar-koda na poleđini knjige, ili na prvim stranama (npr. 978-86-10-02436-4). Upiši ga ili ga skeniraj dugmetom Skeniraj, i Sajam će sam popuniti podatke o knjizi."
          >
            <IsbnField className={inputCls} onPick={pickBook} />
          </Field>
        )}
        <Field label="Jezik">
          <Select
            name="jezik"
            placeholder="Izaberi jezik"
            options={[...LANGUAGES.map((l) => ({ value: l as string, label: l as string })), { value: "drugo", label: "Drugo" }]}
            onChange={(v) => setLangOther(v === "drugo")}
          />
          {langOther && (
            <input name="jezik_drugo" autoFocus placeholder="Upiši jezik, npr. Nemački" maxLength={40} className={`${inputCls} mt-[10px]`} />
          )}
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
            <input name="izdavac" placeholder={EXAMPLES[type].publisher} className={inputCls} />
          </Field>
        )}
        <div className="col-span-2">
          <Field label="Opis">
            <textarea
              name="opis"
              required
              maxLength={5000}
              placeholder={EXAMPLES[type].description}
              className="sell-field block h-[124px] w-[636px] resize-none border border-[#dfdfdf] bg-white p-[16px] text-[14px] leading-[1.4] text-black placeholder:text-[#71717a] focus:border-black focus:outline-none"
            />
          </Field>
        </div>
      </div>

      <Section title="Slanje i plaćanje" className="mt-[60px]" gap={28}>
        <div ref={shipRef} className="grid grid-cols-[306px_306px] gap-x-[24px] gap-y-[24px]">
          <CheckGroup
            label="Kako šalješ"
            options={SHIPPING}
            value={shipping}
            error={shipError && shipping.length === 0}
            onChange={(v) => {
              setShipping(v);
              setShipError(false);
            }}
          />
          <CheckGroup
            label="Kako kupac plaća"
            options={PAYMENT}
            value={payment}
            error={shipError && payment.length === 0}
            onChange={(v) => {
              setPayment(v);
              setShipError(false);
            }}
          />
          <Field label="Grad" optional>
            <Select
              name="grad"
              placeholder="Izaberi grad"
              defaultValue={editing ? "" : (defaultCity ?? "")}
              options={[
                ...(defaultCity && !(CITIES as readonly string[]).includes(defaultCity) ? [{ value: defaultCity, label: defaultCity }] : []),
                ...CITIES.map((c) => ({ value: c as string, label: c as string })),
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="Cena artikla" className="mt-[60px]" gap={28}>
        <div className="flex gap-[24px]">
          <label ref={priceRef} className={`relative flex h-[49px] w-[306px] items-center border ${priceError ? "border-alert" : "border-black"}`}>
            <span className="ml-[9px] flex items-center text-[18px] font-semibold text-black">
              <span className="mr-[5px]">RSD</span>
              <input
                name="cena"
                required
                inputMode="numeric"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value.replace(/\D/g, "").slice(0, 9));
                  setPriceError(false);
                }}
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
          <span className="trim-cap">{editing ? "Sačuvaj izmene" : "Objavi oglas"}</span>
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

function Field({
  label,
  optional,
  info,
  children,
}: {
  label: string;
  optional?: boolean;
  info?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center text-[17px] font-semibold leading-[16px] text-black">
        {label}
        {optional && <span className="ml-[4px] text-[13px] font-normal text-[#7c7c7c]">(opciono)</span>}
        {info && (
          <span
            tabIndex={0}
            aria-label={info}
            onClick={(e) => e.preventDefault()}
            className="group relative ml-[6px] flex size-[16px] cursor-help items-center justify-center focus:outline-none"
          >
            <Image src="/icons/info.svg" alt="" width={11} height={11} />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-[22px] left-1/2 z-40 hidden w-[280px] -translate-x-1/2 bg-ink px-[12px] py-[10px] text-[12px] font-normal leading-[1.45] text-white group-hover:block group-focus:block"
            >
              {info}
            </span>
          </span>
        )}
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
  defaultValue = "",
  onChange,
}: {
  name: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="relative h-[36px] w-[306px]">
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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

// Grupa štikliranja (isti izgled kao filteri na stranici kategorije, Figma „Filter components“).
function CheckGroup<T extends string>({
  label,
  options,
  value,
  error,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T[];
  error: boolean;
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset className={`border p-[12px] ${error ? "border-alert" : "border-transparent"}`}>
      <legend className="sr-only">{label}</legend>
      <p className="text-[17px] font-semibold leading-[16px] text-black">{label}</p>
      <ul className="mt-[16px] flex flex-col gap-[12px]">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <li key={o.value}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
                className="flex items-center gap-[8px] text-left"
              >
                <Image src={on ? "/icons/check-yes.svg" : "/icons/check-no.svg"} alt="" width={19} height={19} />
                <span className="text-[14px] leading-[1.5] text-black">{o.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
