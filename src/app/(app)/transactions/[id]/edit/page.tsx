import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq, and, asc } from "drizzle-orm";
import { db, s } from "@/db";
import { TransactionForm } from "../../transaction-form";
import {
  updateTransactionAction,
  deleteTransactionAction,
} from "../../actions";
import { centsToDollarsInput } from "@/lib/account-utils";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const [row] = await db
    .select()
    .from(s.transactions)
    .where(and(eq(s.transactions.id, id), eq(s.transactions.userId, userId)))
    .limit(1);
  if (!row) notFound();

  const accounts = await db
    .select({ id: s.accounts.id, name: s.accounts.name })
    .from(s.accounts)
    .where(eq(s.accounts.userId, userId))
    .orderBy(asc(s.accounts.name));

  const update = updateTransactionAction.bind(null, id);
  const del = deleteTransactionAction.bind(null, id);

  const direction = row.amountCents >= 0 ? "income" : "expense";

  return (
    <div className="max-w-2xl">
      <div className="text-sm text-zinc-500 mb-2">
        <Link href="/transactions" className="hover:underline">
          ← Transactions
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Edit transaction</h1>
      {row.plaidTransactionId && (
        <p className="mt-2 text-xs text-amber-600">
          Synced from Plaid — edits may be overwritten on next sync.
        </p>
      )}
      <div className="mt-6">
        <TransactionForm
          action={update}
          accounts={accounts}
          values={{
            accountId: row.accountId,
            date: row.date,
            direction,
            amount: centsToDollarsInput(Math.abs(row.amountCents)),
            description: row.description,
            merchant: row.merchant,
            notes: row.notes,
          }}
          submitLabel="Save changes"
        />
      </div>

      <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
        <form action={del} className="mt-3">
          <button
            type="submit"
            className="rounded-md border border-red-300 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete transaction
          </button>
        </form>
      </div>
    </div>
  );
}
