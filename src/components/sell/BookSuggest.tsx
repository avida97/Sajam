"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cleanIsbn, isValidIsbn, type BookHit } from "@/lib/isbn";

export type SearchBy = "isbn" | "naslov" | "autor";

// Polje sa padajućom listom knjiga iz javnih baza (Google Books, Open Library).
// Polje ostaje obično polje: može da se kuca bilo šta, a lista je samo predlog.
// ISBN se traži čim je broj ispravan; naziv i autor posle 3 slova i kratke pauze.
export function BookSuggest({
  by,
  name,
  placeholder,
  className,
  required,
  enabled,
  inputRef,
  trigger,
  padRight,
  onPick,
  children,
}: {
  by: SearchBy;
  name: string;
  placeholder: string;
  className: string;
  required?: boolean;
  enabled: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Spolja zadat upit (npr. skeniran ISBN): traži odmah. */
  trigger?: { value: string; n: number } | null;
  padRight?: number;
  onPick: (hit: BookHit) => void;
  children?: React.ReactNode;
}) {
  const [items, setItems] = useState<BookHit[]>([]);
  const [state, setState] = useState<"loading" | "done" | "error" | "invalid">("done");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  const timer = useRef<number | undefined>(undefined);
  const ctrlRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (q: string) => {
      ctrlRef.current?.abort();
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;
      setState("loading");
      setActive(-1);
      setOpen(true);
      const res = await fetch(`/api/knjige?${by}=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (ctrl.signal.aborted) return;
      if (!res) return setState("error");
      setItems(res.items);
      setState("done");
      setActive(res.items.length === 1 ? 0 : -1);
    },
    [by],
  );

  const close = () => {
    clearTimeout(timer.current);
    ctrlRef.current?.abort();
    setOpen(false);
  };

  const onInput = (value: string) => {
    if (!enabled) return;
    clearTimeout(timer.current);
    if (by === "isbn") {
      const isbn = cleanIsbn(value);
      if (isValidIsbn(isbn)) return void run(isbn);
      const looksDone = isbn.length === 13 || (isbn.length === 10 && !isbn.startsWith("97"));
      ctrlRef.current?.abort();
      setState("invalid");
      setOpen(looksDone);
      return;
    }
    const q = value.trim();
    if (q.length < 3) return close();
    timer.current = window.setTimeout(() => run(q), 400);
  };

  useEffect(() => {
    if (!trigger || !ref.current) return;
    ref.current.value = trigger.value;
    ref.current.scrollIntoView({ block: "center" });
    onInput(trigger.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useEffect(() => () => {
    clearTimeout(timer.current);
    ctrlRef.current?.abort();
  }, []);

  const pick = (hit: BookHit) => {
    close();
    onPick(hit);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (items.length ? (a + d + items.length) % items.length : -1));
    }
    if (e.key === "Enter" && active >= 0 && items[active]) {
      e.preventDefault();
      pick(items[active]);
    }
  };

  const listId = `${name}-predlozi`;
  const message =
    state === "loading"
      ? "Tražim knjigu…"
      : state === "error"
        ? "Pretraga trenutno ne radi. Popuni podatke ručno."
        : state === "invalid"
          ? "Proveri broj, ovaj ISBN nije ispravan."
          : items.length === 0
            ? "Knjiga nije pronađena. Popuni podatke ručno."
            : null;

  return (
    <div className="relative">
      <input
        ref={ref}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        inputMode={by === "isbn" ? "numeric" : undefined}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onInput={(e) => onInput(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        onFocus={() => enabled && items.length > 0 && state === "done" && setOpen(true)}
        onBlur={() => setOpen(false)}
        className={className}
        style={padRight ? { paddingRight: padRight } : undefined}
      />
      {children}

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 top-[40px] z-30 max-h-[360px] w-[306px] overflow-y-auto border border-black bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {message ? (
            <p className="px-[12px] py-[12px] text-[12px] leading-[1.4] text-[#7c7c7c]">{message}</p>
          ) : (
            <>
              <p className="px-[12px] pb-[4px] pt-[10px] text-[11px] font-medium leading-[1.3] text-[#7c7c7c]">
                Izaberi svoju knjigu
              </p>
              {items.map((hit, i) => (
                <button
                  key={hit.id}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(hit)}
                  className={`flex w-full items-start gap-[10px] px-[12px] py-[8px] text-left ${i === active ? "bg-[#f5f6f8]" : ""}`}
                >
                  <span className="block h-[48px] w-[32px] shrink-0 overflow-hidden bg-[#f5f6f8]">
                    {hit.thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hit.thumb} alt="" className="size-full object-cover" loading="lazy" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-[13px] font-semibold leading-[1.3] text-black">{hit.title}</span>
                    <span className="mt-[2px] line-clamp-1 block text-[12px] leading-[1.3] text-[#52525b]">
                      {hit.authors ?? "Nepoznat autor"}
                    </span>
                    <span className="line-clamp-1 block text-[11px] leading-[1.3] text-[#7c7c7c]">
                      {[hit.publisher, hit.year, hit.isbn && `ISBN ${hit.isbn}`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
