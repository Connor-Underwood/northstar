// Mirrors GOALS.md §1 snapshot. Same pattern as goal-seeds.ts.
// Update both when GOALS.md changes.

import type { AccountTypeValue } from "./account-utils";

export type SeedAccount = {
  name: string;
  type: AccountTypeValue;
  institution: string | null;
  balanceCents: number;
  creditLimitCents: number | null;
  interestRateBps: number | null;
  notes: string | null;
};

const dollars = (n: number) => Math.round(n * 100);

export const SEED_ACCOUNTS: SeedAccount[] = [
  // Cash
  {
    name: "Chase Checking",
    type: "checking",
    institution: "Chase",
    balanceCents: dollars(2277.61),
    creditLimitCents: null,
    interestRateBps: null,
    notes: null,
  },
  {
    name: "Chase Savings",
    type: "savings",
    institution: "Chase",
    balanceCents: dollars(0.05),
    creditLimitCents: null,
    interestRateBps: null,
    notes: "Unused.",
  },
  {
    name: "E*TRADE Premium Savings",
    type: "savings",
    institution: "E*TRADE",
    balanceCents: dollars(3.52),
    creditLimitCents: null,
    interestRateBps: null,
    notes: null,
  },

  // Investments
  {
    name: "Roth IRA",
    type: "retirement",
    institution: "E*TRADE",
    balanceCents: dollars(14312),
    creditLimitCents: null,
    interestRateBps: null,
    notes: "No 2026 contribution yet (limit $7,000).",
  },
  {
    name: "E*TRADE Brokerage",
    type: "brokerage",
    institution: "E*TRADE",
    balanceCents: dollars(0.02),
    creditLimitCents: null,
    interestRateBps: null,
    notes: null,
  },

  // Liabilities — credit cards
  {
    name: "Capital One SavorOne",
    type: "credit_card",
    institution: "Capital One",
    balanceCents: dollars(2606.81),
    creditLimitCents: dollars(15400),
    interestRateBps: null,
    notes: null,
  },
  {
    name: "Chase Freedom Unlimited",
    type: "credit_card",
    institution: "Chase",
    balanceCents: dollars(388.54),
    creditLimitCents: dollars(800),
    interestRateBps: null,
    notes: "49% utilization — pay off ASAP from tax refund.",
  },

  // Liabilities — student loans (separate so rates track per-loan)
  {
    name: "Direct Loan 1-01 (Subsidized)",
    type: "student_loan",
    institution: "Federal Direct",
    balanceCents: dollars(1967.45),
    creditLimitCents: null,
    interestRateBps: 499,
    notes: "First payment due 2026-05-10.",
  },
  {
    name: "Direct Loan 1-02 (Unsubsidized)",
    type: "student_loan",
    institution: "Federal Direct",
    balanceCents: dollars(3893.14),
    creditLimitCents: null,
    interestRateBps: 499,
    notes: null,
  },
  {
    name: "Direct Loan 1-03 (Subsidized)",
    type: "student_loan",
    institution: "Federal Direct",
    balanceCents: dollars(4247.9),
    creditLimitCents: null,
    interestRateBps: 550,
    notes: "Highest rate — payoff first (avalanche).",
  },
];
