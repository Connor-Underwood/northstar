import Link from "next/link";
import { AccountForm } from "../account-form";
import { createAccountAction } from "../actions";

export default function NewAccountPage() {
  return (
    <div className="max-w-2xl">
      <div className="text-sm text-zinc-500 mb-2">
        <Link href="/accounts" className="hover:underline">
          ← Accounts
        </Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">New account</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-500">
        Add an account manually — useful for retirement accounts, student loans,
        and anything Plaid can&apos;t see.
      </p>
      <AccountForm action={createAccountAction} submitLabel="Create account" />
    </div>
  );
}
