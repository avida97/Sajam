"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Action =
  | { type: "resolve"; reportId: number; status: "resena" | "odbacena" | "otvorena" }
  | { type: "remove"; listingId: number }
  | { type: "block"; userId: string; block: boolean }
  | { type: "contact"; requestId: number; status: "novo" | "u_radu" | "reseno" };

// Dugmad u admin delu. Uklanjanje oglasa i blokiranje traže potvrdu i (neobavezan) razlog;
// razlog uklanjanja vidi prodavac u obaveštenju, a razlog blokade samo admin.
export function AdminAction({ action, label, danger }: { action: Action; label: string; danger?: boolean }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const needsConfirm = action.type === "remove" || (action.type === "block" && action.block);

  async function run() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    let res: { error: { message: string } | null };
    if (action.type === "resolve")
      res = await supabase.rpc("admin_resolve_report", { p_report: action.reportId, p_status: action.status });
    else if (action.type === "remove")
      res = await supabase.rpc("admin_remove_listing", { p_listing: action.listingId, p_reason: reason || undefined });
    else if (action.type === "block")
      res = await supabase.rpc("admin_set_blocked", { target: action.userId, block: action.block, reason: reason || undefined });
    else res = await supabase.from("contact_requests").update({ status: action.status }).eq("id", action.requestId);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setAsking(false);
    setReason("");
    router.refresh();
  }

  const btn = `h-[28px] whitespace-nowrap border-[0.5px] px-[12px] text-[11px] font-bold disabled:opacity-60 ${
    danger ? "border-[#b42318] text-[#b42318] hover:bg-[#b42318] hover:text-white" : "border-[#ccc] bg-white text-black hover:border-black"
  }`;

  if (asking)
    return (
      <span className="flex flex-col gap-[6px]">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Razlog (nije obavezno)"
          maxLength={300}
          className="h-[28px] w-[220px] border border-field px-[8px] text-[12px] outline-none focus:border-black"
        />
        <span className="flex gap-[6px]">
          <button type="button" disabled={busy} onClick={run} className={btn}>
            {busy ? "…" : "Potvrdi"}
          </button>
          <button type="button" onClick={() => setAsking(false)} className="text-[11px] text-[#737373] hover:text-black">
            Otkaži
          </button>
        </span>
        {error && <span className="text-[11px] text-[#b42318]">{error}</span>}
      </span>
    );

  return (
    <span className="flex flex-col gap-[4px]">
      <button type="button" disabled={busy} onClick={() => (needsConfirm ? setAsking(true) : run())} className={btn}>
        {busy ? "…" : label}
      </button>
      {error && <span className="text-[11px] text-[#b42318]">{error}</span>}
    </span>
  );
}
