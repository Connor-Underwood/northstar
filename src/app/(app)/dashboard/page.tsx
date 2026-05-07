import { auth } from "@clerk/nextjs/server";
import { db, s } from "@/db";
import { eq, sql } from "drizzle-orm";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [totals] = await db
    .select({
      assets: sql<number>`COALESCE(SUM(CASE WHEN ${s.accounts.isAsset} THEN ${s.accounts.currentBalanceCents} ELSE 0 END), 0)`.as("assets"),
      liabilities: sql<number>`COALESCE(SUM(CASE WHEN NOT ${s.accounts.isAsset} THEN ${s.accounts.currentBalanceCents} ELSE 0 END), 0)`.as("liabilities"),
      count: sql<number>`COUNT(*)`.as("count"),
    })
    .from(s.accounts)
    .where(eq(s.accounts.userId, userId));

  const assetsCents = Number(totals?.assets ?? 0);
  const liabilitiesCents = Number(totals?.liabilities ?? 0);
  const netWorthCents = assetsCents - liabilitiesCents;
  const accountCount = Number(totals?.count ?? 0);

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Net worth + goal progress at a glance.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Net worth" value={fmt(netWorthCents)} />
        <Stat label="Total assets" value={fmt(assetsCents)} />
        <Stat label="Total liabilities" value={fmt(liabilitiesCents)} />
      </section>

      {accountCount === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No accounts yet. Connect a bank or add one manually on the{" "}
            <a href="/accounts" className="underline font-medium">
              Accounts
            </a>{" "}
            page.
          </p>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Goals</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Goal progress will appear here once goals are seeded from GOALS.md.
        </p>
      </section>
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
