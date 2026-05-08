"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedGoalsAction } from "./actions";

export function SeedGoalsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await seedGoalsAction();
            setMsg(
              res.added === 0
                ? "All goals already present."
                : `Added ${res.added} new goals from GOALS.md.`,
            );
            router.refresh();
          });
        }}
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        {pending ? "Seeding…" : "Seed goals from GOALS.md"}
      </button>
      {msg && <p className="text-sm text-zinc-500">{msg}</p>}
    </div>
  );
}
