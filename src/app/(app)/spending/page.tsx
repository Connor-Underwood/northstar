import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db, s } from "@/db";
import { and, eq, gte, lte, sql, asc } from "drizzle-orm";
import { SpendingControls } from "./spending-controls";
import { SpendingPie } from "./spending-pie";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

function monthBounds(ym: string): { start: string; end: string; label: string } {
  // ym = "YYYY-MM"
  const [y, m] = ym.split("-").map(Number);
  const start = `${ym}-01`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = `${ym}-${String(last).padStart(2, "0")}`;
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { start, end, label };
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function SpendingPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const userId = user.userId;

  const { month: monthParam } = await searchParams;
  const todayUtc = new Date();
  const defaultMonth = `${todayUtc.getUTCFullYear()}-${String(
    todayUtc.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  const month = monthParam ?? defaultMonth;
  const { start, end, label } = monthBounds(month);

  const cats = await db
    .select()
    .from(s.categories)
    .where(eq(s.categories.userId, userId))
    .orderBy(asc(s.categories.name));

  // Group spending by category for the chosen month. Spending = outflows
  // (amount_cents < 0). We sum the absolute value.
  const rows = await db
    .select({
      categoryId: s.transactions.categoryId,
      total: sql<number>`COALESCE(SUM(-${s.transactions.amountCents}), 0)`.as(
        "total",
      ),
      count: sql<number>`COUNT(*)`.as("count"),
    })
    .from(s.transactions)
    .where(
      and(
        eq(s.transactions.userId, userId),
        gte(s.transactions.date, start),
        lte(s.transactions.date, end),
        sql`${s.transactions.amountCents} < 0`,
      ),
    )
    .groupBy(s.transactions.categoryId);

  const catById = new Map(cats.map((c) => [c.id, c]));
  const breakdown = rows
    .map((r) => {
      const cat = r.categoryId ? catById.get(r.categoryId) : null;
      return {
        categoryId: r.categoryId,
        name: cat?.name ?? "Uncategorized",
        color: cat?.color ?? "#71717a",
        amountCents: Number(r.total),
        count: Number(r.count),
      };
    })
    .sort((a, b) => b.amountCents - a.amountCents);

  const totalSpent = breakdown.reduce((acc, b) => acc + b.amountCents, 0);

  // Income for comparison
  const [incomeRow] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${s.transactions.amountCents}), 0)`.as(
        "total",
      ),
    })
    .from(s.transactions)
    .where(
      and(
        eq(s.transactions.userId, userId),
        gte(s.transactions.date, start),
        lte(s.transactions.date, end),
        sql`${s.transactions.amountCents} > 0`,
      ),
    );
  const totalIncome = Number(incomeRow?.total ?? 0);

  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, +1);

  return (
    <div className="max-w-5xl">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Spending</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Where the money goes, by category, per month.
          </p>
        </div>
        <SpendingControls hasCategories={cats.length > 0} />
      </header>

      <div className="mt-6 flex items-center gap-3 text-sm">
        <Link
          href={`/spending?month=${prev}`}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          ←
        </Link>
        <div className="font-medium">{label}</div>
        <Link
          href={`/spending?month=${next}`}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          →
        </Link>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total spent" value={fmt(totalSpent)} />
        <Stat label="Total income" value={fmt(totalIncome)} />
        <Stat
          label="Net (income - spent)"
          value={fmt(totalIncome - totalSpent)}
        />
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-3">By category</h2>
          <SpendingPie
            slices={breakdown.map((b) => ({
              name: b.name,
              amountCents: b.amountCents,
              color: b.color,
            }))}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Top categories</h2>
          {breakdown.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-500">
              {cats.length === 0
                ? "Seed categories to start tracking spending."
                : "No spending in this period yet."}
            </div>
          ) : (
            <ul className="rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              {breakdown.map((b) => {
                const pct =
                  totalSpent > 0 ? (b.amountCents / totalSpent) * 100 : 0;
                return (
                  <li
                    key={b.categoryId ?? "uncategorized"}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full inline-block"
                        style={{ backgroundColor: b.color }}
                      />
                      <span className="font-medium">{b.name}</span>
                      <span className="text-xs text-zinc-500">
                        ({b.count} tx)
                      </span>
                    </div>
                    <div className="tabular-nums text-right">
                      <div>{fmt(b.amountCents)}</div>
                      <div className="text-xs text-zinc-500">
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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
