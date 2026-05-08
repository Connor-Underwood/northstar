import { getCurrentUser } from "@/lib/auth";
import { db, s } from "@/db";
import { eq, asc } from "drizzle-orm";
import { computeNetWorth } from "@/lib/net-worth";
import { SeedGoalsButton } from "./seed-button";
import { GoalCard, type GoalRow } from "./goal-card";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const userId = user.userId;

  const [rows, summary] = await Promise.all([
    db
      .select()
      .from(s.goals)
      .where(eq(s.goals.userId, userId))
      .orderBy(asc(s.goals.targetDate)),
    computeNetWorth(userId),
  ]);

  // For net_worth-typed goals we can auto-compute "current" from the live
  // accounts summary. Other goal types (savings_target, custom) need manual
  // updates until we wire automatic data sources for each.
  const goals: GoalRow[] = rows.map((g) => ({
    id: g.id,
    type: g.type,
    name: g.name,
    targetAmountCents: g.targetAmountCents != null ? Number(g.targetAmountCents) : null,
    targetDate: g.targetDate,
    currentAmountCents: Number(g.currentAmountCents ?? 0),
    status: g.status,
    notes: g.notes,
  }));

  function autoCurrent(goal: GoalRow): number | null {
    if (goal.type === "net_worth") return summary.netWorthCents;
    if (goal.type === "debt_free") return summary.liabilitiesCents; // "current" is what's left
    return null;
  }

  function autoStatus(goal: GoalRow): "ahead" | "on_track" | "slightly_behind" | "behind" | null {
    const current = autoCurrent(goal);
    const target = goal.targetAmountCents;
    if (current == null || target == null || !goal.targetDate) return null;
    const today = Date.now();
    const targetMs = Date.parse(goal.targetDate + "T00:00:00Z");
    if (today >= targetMs) return null;
    // For debt_free, "behind" means liabilities > expected linear path.
    // For net_worth, "behind" means current < expected linear path.
    // Skip for v1 — defer to dashboard's deviation calc.
    return null;
  }

  // Bucket: active vs achieved
  const active = goals.filter((g) => g.status !== "achieved");
  const achieved = goals.filter((g) => g.status === "achieved");

  return (
    <div className="max-w-5xl">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Mirrors GOALS.md. Source-of-truth lives in the repo file; this view tracks progress.
          </p>
        </div>
        <SeedGoalsButton />
      </header>

      {goals.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-500">
          No goals yet. Click &quot;Seed goals&quot; to add the headline goals + milestones from GOALS.md.
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                Active ({active.length})
              </h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {active.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    computedCurrent={autoCurrent(g)}
                    computedStatus={autoStatus(g)}
                  />
                ))}
              </div>
            </section>
          )}

          {achieved.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                Achieved ({achieved.length})
              </h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {achieved.map((g) => (
                  <GoalCard key={g.id} goal={g} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
