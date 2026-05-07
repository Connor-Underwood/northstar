import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db, s } from "@/db";
import { eq, asc } from "drizzle-orm";
import { ConnectBankButton } from "./connect-bank";
import { SyncButton } from "./sync-button";
import { ACCOUNT_TYPES } from "@/lib/account-utils";

const TYPE_LABELS = Object.fromEntries(
  ACCOUNT_TYPES.map((t) => [t.value, t.label]),
);

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AccountsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await db
    .select()
    .from(s.accounts)
    .where(eq(s.accounts.userId, userId))
    .orderBy(asc(s.accounts.name));

  return (
    <div className="max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Bank, credit, investment, and debt accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncButton />
          <Link
            href="/accounts/new"
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Add manually
          </Link>
          <ConnectBankButton />
        </div>
      </header>

      <div className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No accounts yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">
                    {row.name}
                    {row.plaidAccountId && (
                      <span className="ml-2 text-xs text-zinc-400">·plaid</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {TYPE_LABELS[row.type] ?? row.type}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {row.institution ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmt(row.currentBalanceCents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/accounts/${row.id}/edit`}
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
