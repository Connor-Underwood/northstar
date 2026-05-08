"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markGoalAchievedAction,
  reactivateGoalAction,
  updateGoalProgressAction,
} from "./actions";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export type GoalRow = {
  id: string;
  type: string;
  name: string;
  targetAmountCents: number | null;
  targetDate: string | null;
  currentAmountCents: number;
  status: "active" | "achieved" | "paused";
  notes: string | null;
};

export function GoalCard({
  goal,
  computedCurrent,
  computedStatus,
}: {
  goal: GoalRow;
  /** If parent computes current value (e.g. from accounts), pass it. */
  computedCurrent?: number | null;
  computedStatus?: "ahead" | "on_track" | "slightly_behind" | "behind" | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    ((goal.currentAmountCents ?? 0) / 100).toFixed(2),
  );

  const target = goal.targetAmountCents;
  const current = computedCurrent ?? goal.currentAmountCents ?? 0;
  const isAchieved = goal.status === "achieved";
  const isRate = goal.name.toLowerCase().includes("savings rate");
  const isBinary = target == null; // pass/fail goal

  let pct = 0;
  if (target != null && target > 0) {
    pct = Math.max(0, Math.min(100, (current / target) * 100));
  } else if (isAchieved) {
    pct = 100;
  }

  const barColor = isAchieved
    ? "bg-emerald-500"
    : computedStatus === "behind"
      ? "bg-red-500"
      : computedStatus === "slightly_behind"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div
      className={`rounded-lg border p-5 ${
        isAchieved
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold">{goal.name}</div>
            {isAchieved && (
              <span className="text-xs rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-0.5">
                ✓ achieved
              </span>
            )}
            {!isAchieved && computedStatus === "behind" && (
              <span className="text-xs rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 px-2 py-0.5">
                behind
              </span>
            )}
            {!isAchieved && computedStatus === "slightly_behind" && (
              <span className="text-xs rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5">
                slightly behind
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {goal.type.replace(/_/g, " ")}
            {goal.targetDate && <> · target {goal.targetDate}</>}
          </div>
          {goal.notes && (
            <div className="mt-2 text-xs text-zinc-500 leading-snug">
              {goal.notes}
            </div>
          )}
        </div>
        <div className="text-right text-sm tabular-nums text-zinc-500 shrink-0">
          {isBinary ? (
            <span className="text-xs">{isAchieved ? "Done" : "Pending"}</span>
          ) : isRate ? (
            <span>
              {(current / 100).toFixed(1)}% / {((target ?? 0) / 100).toFixed(0)}%
            </span>
          ) : (
            <span>
              {fmt(current)} / {fmt(target ?? 0)}
            </span>
          )}
        </div>
      </div>

      {!isBinary && (
        <>
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-zinc-500">{pct.toFixed(1)}%</div>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {!isAchieved && (
          <button
            onClick={() => {
              startTransition(async () => {
                await markGoalAchievedAction(goal.id);
                router.refresh();
              });
            }}
            disabled={pending}
            className="rounded-md border border-emerald-300 dark:border-emerald-900 px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-950 disabled:opacity-50"
          >
            Mark achieved
          </button>
        )}
        {isAchieved && (
          <button
            onClick={() => {
              startTransition(async () => {
                await reactivateGoalAction(goal.id);
                router.refresh();
              });
            }}
            disabled={pending}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
          >
            Reactivate
          </button>
        )}
        {!isBinary && computedCurrent == null && (
          <>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                disabled={pending}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
              >
                Update progress
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <span className="text-zinc-500">$</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-24 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs"
                />
                <button
                  onClick={() => {
                    const cents = Math.round(parseFloat(draft) * 100);
                    if (Number.isNaN(cents)) return;
                    startTransition(async () => {
                      await updateGoalProgressAction(goal.id, cents);
                      setEditing(false);
                      router.refresh();
                    });
                  }}
                  className="rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-2 py-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-zinc-500"
                >
                  Cancel
                </button>
              </span>
            )}
          </>
        )}
        {computedCurrent != null && (
          <span className="text-zinc-500">Auto-tracked</span>
        )}
      </div>
    </div>
  );
}
