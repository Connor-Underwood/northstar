import Link from "next/link";

export type TransactionFormValues = {
  accountId?: string;
  date?: string;
  direction?: "income" | "expense";
  amount?: string;
  description?: string;
  merchant?: string | null;
  notes?: string | null;
};

export function TransactionForm({
  action,
  values,
  accounts,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  values?: TransactionFormValues;
  accounts: { id: string; name: string }[];
  submitLabel: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="space-y-5 max-w-xl">
      <Field label="Account" required>
        <select
          name="accountId"
          required
          defaultValue={values?.accountId ?? accounts[0]?.id ?? ""}
          className={inputCls}
        >
          {accounts.length === 0 && (
            <option value="" disabled>
              No accounts — add one first
            </option>
          )}
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Date" required>
        <input
          name="date"
          type="date"
          required
          defaultValue={values?.date ?? today}
          className={inputCls}
        />
      </Field>

      <Field label="Type" required>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="direction"
              value="expense"
              defaultChecked={values?.direction !== "income"}
            />
            Expense (out)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="direction"
              value="income"
              defaultChecked={values?.direction === "income"}
            />
            Income (in)
          </label>
        </div>
      </Field>

      <Field label="Amount ($)" required>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={values?.amount ?? ""}
          placeholder="0.00"
          className={inputCls}
        />
      </Field>

      <Field label="Description" required>
        <input
          name="description"
          required
          defaultValue={values?.description ?? ""}
          placeholder="Coffee, paycheck, etc."
          className={inputCls}
        />
      </Field>

      <Field label="Merchant">
        <input
          name="merchant"
          defaultValue={values?.merchant ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Notes">
        <textarea
          name="notes"
          rows={2}
          defaultValue={values?.notes ?? ""}
          className={inputCls}
        />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={accounts.length === 0}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitLabel}
        </button>
        <Link
          href="/transactions"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
