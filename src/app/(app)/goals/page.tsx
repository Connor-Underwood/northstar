import { auth } from "@clerk/nextjs/server";
import { db, s } from "@/db";
import { eq, asc } from "drizzle-orm";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function GoalsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await db
    .select()
    .from(s.goals)
    .where(eq(s.goals.userId, userId))
    .orderBy(asc(s.goals.targetDate));

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Goals</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Mirrors GOALS.md. Source-of-truth lives in the repo file; this view tracks progress.
      </p>

      <div className="mt-8 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-500">
            No goals seeded yet. Run the goal-seed script to populate from GOALS.md.
          </div>
        ) : (
          rows.map((g) => {
            const target = g.targetAmountCents ?? 0;
            const current = g.currentAmountCents ?? 0;
            const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
            return (
              <div
                key={g.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {g.type.replace("_", " ")} · target {g.targetDate ?? "no date"}
                    </div>
                  </div>
                  <div className="text-sm tabular-nums text-zinc-500">
                    {fmt(current)} / {fmt(target)}
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
