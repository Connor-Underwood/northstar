// Default categories + Plaid mapping. Plaid's personal_finance_category.primary
// values: https://plaid.com/docs/api/products/transactions/#categories-get

export type SeedCategory = {
  name: string;
  isIncome: boolean;
  color: string; // tailwind color hex
};

export const SEED_CATEGORIES: SeedCategory[] = [
  // Income
  { name: "Income", isIncome: true, color: "#10b981" },
  // Spending
  { name: "Food & Dining", isIncome: false, color: "#f97316" },
  { name: "Groceries", isIncome: false, color: "#84cc16" },
  { name: "Transportation", isIncome: false, color: "#06b6d4" },
  { name: "Travel", isIncome: false, color: "#0ea5e9" },
  { name: "Shopping", isIncome: false, color: "#ec4899" },
  { name: "Bills & Utilities", isIncome: false, color: "#a855f7" },
  { name: "Rent & Housing", isIncome: false, color: "#8b5cf6" },
  { name: "Entertainment", isIncome: false, color: "#f59e0b" },
  { name: "Health & Medical", isIncome: false, color: "#ef4444" },
  { name: "Personal Care", isIncome: false, color: "#f43f5e" },
  { name: "Subscriptions", isIncome: false, color: "#6366f1" },
  { name: "Education", isIncome: false, color: "#14b8a6" },
  { name: "Loan Payments", isIncome: false, color: "#dc2626" },
  { name: "Bank Fees", isIncome: false, color: "#737373" },
  { name: "Transfers", isIncome: false, color: "#a3a3a3" },
  { name: "Uncategorized", isIncome: false, color: "#71717a" },
];

// Plaid primary → local category name
export const PLAID_CATEGORY_MAP: Record<string, string> = {
  INCOME: "Income",
  TRANSFER_IN: "Transfers",
  TRANSFER_OUT: "Transfers",
  LOAN_PAYMENTS: "Loan Payments",
  BANK_FEES: "Bank Fees",
  ENTERTAINMENT: "Entertainment",
  FOOD_AND_DRINK: "Food & Dining",
  GENERAL_MERCHANDISE: "Shopping",
  HOME_IMPROVEMENT: "Shopping",
  MEDICAL: "Health & Medical",
  PERSONAL_CARE: "Personal Care",
  GENERAL_SERVICES: "Bills & Utilities",
  GOVERNMENT_AND_NON_PROFIT: "Bills & Utilities",
  TRANSPORTATION: "Transportation",
  TRAVEL: "Travel",
  RENT_AND_UTILITIES: "Rent & Housing",
  OTHER: "Uncategorized",
};

// Detailed overrides — Plaid's detailed values are PRIMARY + suffix.
// e.g., FOOD_AND_DRINK_GROCERIES → "Groceries" instead of "Food & Dining"
export const PLAID_DETAILED_OVERRIDES: Record<string, string> = {
  FOOD_AND_DRINK_GROCERIES: "Groceries",
  GENERAL_MERCHANDISE_DIGITAL_PURCHASE: "Subscriptions",
  GENERAL_SERVICES_EDUCATION: "Education",
  GENERAL_MERCHANDISE_BOOKSTORES: "Education",
};

export function mapPlaidCategoryToLocal(
  primary: string | null | undefined,
  detailed: string | null | undefined,
): string {
  if (detailed && PLAID_DETAILED_OVERRIDES[detailed]) {
    return PLAID_DETAILED_OVERRIDES[detailed];
  }
  if (primary && PLAID_CATEGORY_MAP[primary]) {
    return PLAID_CATEGORY_MAP[primary];
  }
  return "Uncategorized";
}
