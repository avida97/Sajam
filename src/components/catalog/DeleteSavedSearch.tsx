"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteSavedSearch({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().from("saved_searches").delete().eq("id", id);
        router.refresh();
      }}
      className="text-[12px] text-[#737373] underline-offset-2 hover:text-black hover:underline disabled:opacity-60"
    >
      {busy ? "Briše se…" : "Obriši"}
    </button>
  );
}
