"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CITIES } from "@/lib/shipping";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_URL } from "@/lib/supabase/env";

type Initial = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  bio: string | null;
  shipsWithinDays: number | null;
};

const inputCls =
  "sell-field h-[36px] w-[306px] border border-[#dfdfdf] bg-white px-[16px] text-[14px] leading-[16px] text-black placeholder:text-[#71717a] focus:border-black focus:outline-none";

// Smanjuje sliku na najviše 512×512 i pravi JPEG (bucket avatars prima do 2 MB).
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("slika"))), "image/jpeg", 0.88));
}

// Podešavanja profila (ime, slika, grad, opis, rok slanja). Ekrana nema u Figmi; napravljen je
// od polja iz forme „Prodaja proizvoda“ i prikazuje se na profilu i oglasima, za Ankin pregled.
export function ProfileForm({ initial, email }: { initial: Initial; email: string | null }) {
  const router = useRouter();
  const [avatar, setAvatar] = useState<{ file: File | null; url: string | null }>({ file: null, url: initial.avatarUrl });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const text = (n: string) => String(fd.get(n) ?? "").trim() || null;
    const name = text("ime");
    const nameEl = form.elements.namedItem("ime") as HTMLInputElement;
    nameEl.setAttribute("aria-invalid", String(!name));
    if (!name) return nameEl.focus();

    setSaving(true);
    setNotice("Čuvam…");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return router.replace("/?nalog=prijava&posle=/moj-profil/izmeni");
    }

    let avatarUrl = avatar.url;
    if (avatar.file) {
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const blob = await shrink(avatar.file).catch(() => null);
      const up = blob ? await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg" }) : null;
      if (!up || up.error) {
        setSaving(false);
        return setNotice("Slika nije otpremljena. Probaj drugu sliku (JPG ili PNG).");
      }
      avatarUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
    }

    const days = text("rok");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        avatar_url: avatarUrl,
        city: text("grad"),
        bio: text("bio"),
        ships_within_days: days ? Number(days) : null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return setNotice("Profil nije sačuvan. Pokušaj ponovo.");
    router.push(`/prodavac/${initial.username}`);
    router.refresh();
  };

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onChange={(e) => (e.target as HTMLElement).setAttribute("aria-invalid", "false")}
      className="mx-auto flex w-[636px] flex-col pb-[80px] pt-[80px] text-black"
    >
      <h1 className="trim-cap text-center font-serif text-[32px] font-medium italic leading-[0.95] tracking-[-0.32px]">
        Podešavanja profila
      </h1>
      <p className="mt-[24px] text-center text-[14px] leading-[1.5]">Ovo vide kupci na tvom profilu i oglasima.</p>

      <div className="mt-[60px] flex items-center gap-[24px]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Promeni sliku profila"
          className="relative flex size-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f6f8]"
        >
          {avatar.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar.url} alt="" className="size-full object-cover" />
          ) : (
            <Image src="/icons/camera.svg" alt="" width={20} height={19} />
          )}
        </button>
        <div>
          <p className="text-[17px] font-semibold leading-[16px]">Slika profila</p>
          <p className="mt-[8px] text-[13px] leading-[1.4] text-[#7c7c7c]">Klikni na krug da dodaš ili promeniš sliku.</p>
          {avatar.url && (
            <button
              type="button"
              onClick={() => setAvatar({ file: null, url: null })}
              className="mt-[8px] text-[12px] font-medium underline"
            >
              Ukloni sliku
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setAvatar({ file: f, url: URL.createObjectURL(f) });
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-[48px] grid grid-cols-[306px_306px] gap-x-[24px] gap-y-[24px]">
        <Field label="Ime i prezime">
          <input name="ime" defaultValue={initial.displayName} placeholder="npr. Ana Petrović" maxLength={80} className={inputCls} />
        </Field>
        <Field label="Korisničko ime">
          <input
            value={`@${initial.username}`}
            readOnly
            style={{ borderColor: "#dfdfdf" }}
            className={`${inputCls} bg-[#f5f6f8] text-[#71717a]`}
          />
        </Field>
        <Field label="Grad" optional>
          <SelectBox name="grad" defaultValue={initial.city ?? ""} placeholder="Izaberi grad" options={CITIES.map((c) => [c, c])} />
        </Field>
        <Field label="Obično šaljem za" optional>
          <SelectBox
            name="rok"
            defaultValue={initial.shipsWithinDays ? String(initial.shipsWithinDays) : ""}
            placeholder="Izaberi rok"
            options={[1, 2, 3, 5, 7, 10].map((n) => [String(n), `${n} ${n === 1 ? "radni dan" : n < 5 ? "radna dana" : "radnih dana"}`])}
          />
        </Field>
        <div className="col-span-2">
          <Field label="O meni" optional>
            <textarea
              name="bio"
              defaultValue={initial.bio ?? ""}
              maxLength={1000}
              placeholder="Npr. šta voliš da čitaš, kako pakuješ knjige i kada možeš da se nađeš za preuzimanje."
              className="sell-field block h-[124px] w-[636px] resize-none border border-[#dfdfdf] bg-white p-[16px] text-[14px] leading-[1.4] placeholder:text-[#71717a] focus:border-black focus:outline-none"
            />
          </Field>
        </div>
        {email && (
          <p className="col-span-2 text-[12px] text-[#7c7c7c]">Prijavljen nalog: {email}. Mejl se ne prikazuje drugima.</p>
        )}
      </div>

      <div className="mt-[60px] flex items-center justify-end gap-[24px]">
        {notice && <p role="status" className="text-[13px] text-[#52525b]">{notice}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex h-[37px] items-center bg-[#09090b] px-[19px] text-[12px] font-bold uppercase text-white disabled:opacity-60"
        >
          Sačuvaj
        </button>
      </div>
    </form>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[17px] font-semibold leading-[16px]">
        {label}
        {optional && <span className="ml-[4px] text-[13px] font-normal text-[#7c7c7c]">(opciono)</span>}
      </span>
      <span className="mt-[12px] block">{children}</span>
    </label>
  );
}

function SelectBox({
  name,
  defaultValue,
  placeholder,
  options,
}: {
  name: string;
  defaultValue: string;
  placeholder: string;
  options: Array<[string, string]>;
}) {
  return (
    <div className="relative h-[36px] w-[306px]">
      <select
        name={name}
        defaultValue={defaultValue}
        className="sell-field h-[36px] w-[306px] appearance-none border border-[#dfdfdf] bg-white pl-[11px] pr-[36px] text-[14px] focus:border-black focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <Image src="/icons/chevron-down.svg" alt="" width={9} height={5} className="pointer-events-none absolute left-[279px] top-[16px]" />
    </div>
  );
}
