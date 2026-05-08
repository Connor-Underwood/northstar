"use client";

import { useState, useTransition } from "react";
import {
  seedCategoriesAction,
  recategorizeAllAction,
  resetPlaidCursorsAction,
} from "./actions";
import { useRouter } from "next/navigation";

export function SpendingControls({ hasCategories }: { hasCategories: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function refetchFromPlaid() {
    const reset = await resetPlaidCursorsAction();
    setMsg(`Reset ${reset.items} cursors. Fetching from Plaid…`);
    const sync = await fetch("/api/plaid/sync", { method: "POST" });
    const syncData = await sync.json().catch(() => ({}));
    if (!sync.ok) {
      setMsg(`Re-fetch failed (${sync.status}).`);
      return;
    }
    const recat = await recategorizeAllAction();
    setMsg(
      `Re-fetched ${syncData.added} from Plaid, recategorized ${recat.updated}.`,
    );
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {!hasCategories ? (
        <button
          onClick={() => {
            setMsg(null);
            startTransition(async () => {
              const res = await seedCategoriesAction();
              setMsg(
                `Seeded categories. Backfilled ${res.backfilled} transactions.`,
              );
              router.refresh();
            });
          }}
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {pending ? "Seeding…" : "Seed default categories"}
        </button>
      ) : (
        <>
          <button
            onClick={() => {
              setMsg(null);
              startTransition(async () => {
                const res = await recategorizeAllAction();
                setMsg(`Recategorized ${res.updated} transactions.`);
                router.refresh();
              });
            }}
            disabled={pending}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
          >
            {pending ? "Working…" : "Recategorize all"}
          </button>
          <button
            onClick={() => {
              setMsg(null);
              startTransition(refetchFromPlaid);
            }}
            disabled={pending}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
          >
            {pending ? "Working…" : "Re-fetch from Plaid"}
          </button>
        </>
      )}
      {msg && <span className="text-xs text-zinc-500">{msg}</span>}
    </div>
  );
}
