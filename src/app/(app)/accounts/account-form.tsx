import Link from "next/link";
import { ACCOUNT_TYPES } from "@/lib/account-utils";

export type AccountFormValues = {
  name?: string;
  type?: string;
  institution?: string | null;
  balance?: string;
  creditLimit?: string;
  interestRate?: string;
  notes?: string | null;
};

export function AccountForm({
  action,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  values?: AccountFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-5 max-w-xl">
      <Field label="Name" required>
        <input
          name="name"
          required
          defaultValue={values?.name ?? ""}
          placeholder="Chase Checking"
          className={inputCls}
        />
      </Field>

      <Field label="Type" required>
        <select
          name="type"
          required
          defaultValue={values?.type ?? "checking"}
          className={inputCls}
        >
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Institution">
        <input
          name="institution"
          defaultValue={values?.institution ?? ""}
          placeholder="Chase, E*TRADE, Federal Direct, etc."
          className={inputCls}
        />
      </Field>

      <Field label="Current balance ($)" required>
        <input
          name="balance"
          required
          type="number"
          step="0.01"
          defaultValue={values?.balance ?? ""}
          placeholder="0.00"
          className={inputCls}
        />
      </Field>

      <Field label="Credit limit ($) — for credit cards only">
        <input
          name="creditLimit"
          type="number"
          step="0.01"
          defaultValue={values?.creditLimit ?? ""}
          placeholder="(optional)"
          className={inputCls}
        />
      </Field>

      <Field label="Interest rate (%) — for debts">
        <input
          name="interestRate"
          type="number"
          step="0.001"
          defaultValue={values?.interestRate ?? ""}
          placeholder="e.g. 5.5"
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
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitLabel}
        </button>
        <Link
          href="/accounts"
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
