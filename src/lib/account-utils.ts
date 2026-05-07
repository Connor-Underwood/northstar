export const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking", isAsset: true },
  { value: "savings", label: "Savings", isAsset: true },
  { value: "brokerage", label: "Brokerage", isAsset: true },
  { value: "retirement", label: "Retirement (Roth, 401k, IRA)", isAsset: true },
  { value: "other_asset", label: "Other asset", isAsset: true },
  { value: "credit_card", label: "Credit card", isAsset: false },
  { value: "student_loan", label: "Student loan", isAsset: false },
  { value: "mortgage", label: "Mortgage", isAsset: false },
  { value: "auto_loan", label: "Auto loan", isAsset: false },
  { value: "other_liability", label: "Other liability", isAsset: false },
] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]["value"];

export function isAssetType(type: string): boolean {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.isAsset ?? true;
}

export function parseDollarsToCents(value: FormDataEntryValue | null): number {
  if (value == null) return 0;
  const s = String(value).replace(/[$,\s]/g, "");
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function parseOptionalDollarsToCents(
  value: FormDataEntryValue | null,
): number | null {
  if (value == null || String(value).trim() === "") return null;
  return parseDollarsToCents(value);
}

/** Percent (e.g. "5.5") → basis points (550). */
export function parsePercentToBps(
  value: FormDataEntryValue | null,
): number | null {
  if (value == null || String(value).trim() === "") return null;
  const n = parseFloat(String(value).replace(/[%\s]/g, ""));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export function bpsToPercent(bps: number | null): string {
  if (bps == null) return "";
  return (bps / 100).toFixed(2);
}

export function centsToDollarsInput(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}
