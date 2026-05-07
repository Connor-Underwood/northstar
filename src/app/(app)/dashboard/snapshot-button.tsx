"use client";

import { useState, useTransition } from "react";
import { takeSnapshotAction } from "./actions";

export function SnapshotButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await takeSnapshotAction();
            setMsg("Snapshot recorded.");
            void res;
          });
        }}
        disabled={pending}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Take snapshot"}
      </button>
      {msg && <span className="text-xs text-zinc-500">{msg}</span>}
    </div>
  );
}
