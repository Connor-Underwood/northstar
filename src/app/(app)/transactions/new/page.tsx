import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { db, s } from "@/db";
import { TransactionForm } from "../transaction-form";
import { createTransactionAction } from "../actions";

export default async function NewTransactionPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const userId = user.userId;

  const accounts = await db
    .select({ id: s.accounts.id, name: s.accounts.name })
    .from(s.accounts)
    .where(eq(s.accounts.userId, userId))
    .orderBy(asc(s.accounts.name));

  return (
    <div className="max-w-2xl">
      <div className="text-sm text-zinc-500 mb-2">
        <Link href="/transactions" className="hover:underline">
          ← Transactions
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">New transaction</h1>
      {accounts.length === 0 && (
        <p className="mt-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-900 dark:text-amber-200">
          You need an account first.{" "}
          <Link href="/accounts/new" className="underline font-medium">
            Add one
          </Link>
          .
        </p>
      )}
      <div className="mt-6">
        <TransactionForm
          action={createTransactionAction}
          accounts={accounts}
          submitLabel="Create transaction"
        />
      </div>
    </div>
  );
}
