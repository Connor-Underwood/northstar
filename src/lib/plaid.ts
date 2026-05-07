import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import type { AccountBase } from "plaid";

const env = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PlaidEnvironments;

export const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  }),
);

export type AccountTypeEnum =
  | "checking"
  | "savings"
  | "credit_card"
  | "brokerage"
  | "retirement"
  | "student_loan"
  | "mortgage"
  | "auto_loan"
  | "other_asset"
  | "other_liability";

const RETIREMENT_SUBTYPES = new Set([
  "401k",
  "401a",
  "403b",
  "457b",
  "ira",
  "roth",
  "roth 401k",
  "sep ira",
  "simple ira",
  "pension",
  "retirement",
  "thrift savings plan",
]);

export function mapPlaidAccountType(account: AccountBase): {
  type: AccountTypeEnum;
  isAsset: boolean;
} {
  const type = account.type;
  const subtype = (account.subtype ?? "") as string;

  if (type === "credit") return { type: "credit_card", isAsset: false };

  if (type === "loan") {
    if (subtype === "student") return { type: "student_loan", isAsset: false };
    if (subtype === "mortgage") return { type: "mortgage", isAsset: false };
    if (subtype === "auto") return { type: "auto_loan", isAsset: false };
    return { type: "other_liability", isAsset: false };
  }

  if (type === "depository") {
    if (subtype === "savings") return { type: "savings", isAsset: true };
    return { type: "checking", isAsset: true };
  }

  if (type === "investment") {
    if (RETIREMENT_SUBTYPES.has(subtype))
      return { type: "retirement", isAsset: true };
    return { type: "brokerage", isAsset: true };
  }

  return { type: "other_asset", isAsset: true };
}
