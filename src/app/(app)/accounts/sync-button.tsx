"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await fetch("/api/plaid/sync", { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
              setMsg(
                `Synced: +${data.added} new, ${data.modified} updated, ${data.removed} removed.`,
              );
              router.refresh();
            } else {
              setMsg("Sync failed.");
            }
          });
        }}
        disabled={pending}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
      >
        {pending ? "Syncing…" : "Sync transactions"}
      </button>
      {msg && <span className="text-xs text-zinc-500">{msg}</span>}
    </div>
  );
}
