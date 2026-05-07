import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db, s } from "@/db";
import { eq, desc } from "drizzle-orm";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function TransactionsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await db
    .select()
    .from(s.transactions)
    .where(eq(s.transactions.userId, userId))
    .orderBy(desc(s.transactions.date))
    .limit(100);

  return (
    <div className="max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-2 text-sm text-zinc-500">
            100 most recent transactions.
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add transaction
        </Link>
      </header>

      <div className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No transactions yet. Connect a bank to start syncing.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-zinc-500">{row.date}</td>
                  <td className="px-4 py-3 font-medium">{row.description}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {row.merchant ?? "—"}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${row.amountCents >= 0 ? "text-emerald-600" : ""}`}
                  >
                    {fmt(row.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/transactions/${row.id}/edit`}
                      className="text-xs text-zinc-500 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
