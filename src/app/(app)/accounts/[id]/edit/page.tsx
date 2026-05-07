import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { db, s } from "@/db";
import { AccountForm } from "../../account-form";
import { updateAccountAction, deleteAccountAction } from "../../actions";
import {
  bpsToPercent,
  centsToDollarsInput,
} from "@/lib/account-utils";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const userId = user.userId;

  const [row] = await db
    .select()
    .from(s.accounts)
    .where(and(eq(s.accounts.id, id), eq(s.accounts.userId, userId)))
    .limit(1);

  if (!row) notFound();

  const update = updateAccountAction.bind(null, id);
  const del = deleteAccountAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="text-sm text-zinc-500 mb-2">
        <Link href="/accounts" className="hover:underline">
          ← Accounts
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Edit account</h1>
      {row.plaidAccountId && (
        <p className="mt-2 text-xs text-amber-600">
          This account is linked to Plaid. Edits to balance will be overwritten
          on the next sync.
        </p>
      )}
      <div className="mt-6">
        <AccountForm
          action={update}
          values={{
            name: row.name,
            type: row.type,
            institution: row.institution,
            balance: centsToDollarsInput(row.currentBalanceCents),
            creditLimit: centsToDollarsInput(row.creditLimitCents),
            interestRate: bpsToPercent(row.interestRateBps),
            notes: row.notes,
          }}
          submitLabel="Save changes"
        />
      </div>

      <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Deleting an account also deletes its transactions.
        </p>
        <form action={del} className="mt-3">
          <button
            type="submit"
            className="rounded-md border border-red-300 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete account
          </button>
        </form>
      </div>
    </div>
  );
}
