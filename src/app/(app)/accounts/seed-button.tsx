"use client";

import { useState, useTransition } from "react";
import { seedAccountsAction } from "./actions";

export function SeedAccountsButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <button
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await seedAccountsAction();
            if (!res.ok) {
              setMsg("Already have accounts — seed skipped.");
            } else {
              setMsg(`Seeded ${res.count} accounts from GOALS.md.`);
            }
          });
        }}
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Seeding…" : "Seed accounts from GOALS.md"}
      </button>
      {msg && <p className="mt-2 text-sm text-zinc-500">{msg}</p>}
    </div>
  );
}
