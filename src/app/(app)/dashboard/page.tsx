import { getCurrentUser } from "@/lib/auth";
import { db, s } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import {
  computeNetWorth,
  snapshotToday,
  getSnapshots,
  getNetWorthMilestones,
} from "@/lib/net-worth";
import { NetWorthChart } from "./net-worth-chart";
import { SnapshotButton } from "./snapshot-button";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const userId = user.userId;

  // Snapshot today (idempotent — one row per user per day).
  await snapshotToday(userId);

  const [summary, snapshots, milestones, headlineGoals] = await Promise.all([
    computeNetWorth(userId),
    getSnapshots(userId),
    getNetWorthMilestones(userId),
    db
      .select()
      .from(s.goals)
      .where(
        and(eq(s.goals.userId, userId)),
      )
      .orderBy(asc(s.goals.targetDate))
      .limit(20),
  ]);

  const debtFreeGoal = headlineGoals.find((g) => g.type === "debt_free");
  const millionGoal = headlineGoals.find(
    (g) =>
      g.type === "net_worth" &&
      g.targetAmountCents != null &&
      Number(g.targetAmountCents) >= 100_000_000, // ≥ $1M
  );

  // Progress toward $1M goal: current net worth / target.
  const millionPct =
    millionGoal && Number(millionGoal.targetAmountCents) > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (summary.netWorthCents / Number(millionGoal.targetAmountCents)) * 100,
          ),
        )
      : 0;

  // Progress toward debt-free goal: 1 - (current liabilities / starting liabilities).
  // Without a baseline, we just show current liabilities as a "remaining" amount.
  const debtRemainingCents = summary.liabilitiesCents;

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Net worth + goal progress at a glance.
          </p>
        </div>
        <SnapshotButton />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Net worth" value={fmt(summary.netWorthCents)} />
        <Stat label="Total assets" value={fmt(summary.assetsCents)} />
        <Stat label="Total liabilities" value={fmt(summary.liabilitiesCents)} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Net worth vs. milestone curve</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Solid green = your actual snapshots. Dashed gray = the GOALS.md §4 curve.
        </p>
        <div className="mt-4">
          <NetWorthChart snapshots={snapshots} milestones={milestones} />
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {millionGoal && (
          <GoalCard
            title={millionGoal.name}
            current={fmt(summary.netWorthCents)}
            target={fmt(Number(millionGoal.targetAmountCents))}
            pct={millionPct}
            targetDate={millionGoal.targetDate}
          />
        )}
        {debtFreeGoal && (
          <DebtCard
            title={debtFreeGoal.name}
            remaining={fmt(debtRemainingCents)}
            targetDate={debtFreeGoal.targetDate}
          />
        )}
      </section>

      {summary.accountCount === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No accounts yet. Connect a bank on the{" "}
            <a href="/accounts" className="underline font-medium">
              Accounts
            </a>{" "}
            page.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function GoalCard({
  title,
  current,
  target,
  pct,
  targetDate,
}: {
  title: string;
  current: string;
  target: string;
  pct: number;
  targetDate: string | null;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-zinc-500">
            target {targetDate ?? "—"}
          </div>
        </div>
        <div className="text-sm tabular-nums text-zinc-500">
          {current} / {target}
        </div>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-zinc-500">{pct.toFixed(2)}%</div>
    </div>
  );
}

function DebtCard({
  title,
  remaining,
  targetDate,
}: {
  title: string;
  remaining: string;
  targetDate: string | null;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-zinc-500">
            target {targetDate ?? "—"}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Remaining debt
        </div>
        <div className="mt-1 text-2xl font-semibold">{remaining}</div>
      </div>
    </div>
  );
}
