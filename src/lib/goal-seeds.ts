// Derived from GOALS.md §3 (debt-free) and §4 (net-worth milestone curve).
// GOALS.md is gitignored (personal data); this mirror lives in code so the
// seed action can run in production. Update both when goals change.

export type SeedGoal = {
  type: "debt_free" | "net_worth" | "savings_target" | "custom";
  name: string;
  targetAmountCents: number | null;
  targetDate: string | null; // YYYY-MM-DD
  notes: string | null;
};

const dollars = (n: number) => Math.round(n * 100);

export const SEED_GOALS: SeedGoal[] = [
  // Headline goals (GOALS.md §3, §4)
  {
    type: "debt_free",
    name: "Debt-free by EOY 2026",
    targetAmountCents: 0,
    targetDate: "2026-12-31",
    notes: "Student loans + CCs + family loan. Aggressive Aug–Oct payoff window once Google paychecks start.",
  },
  {
    type: "net_worth",
    name: "$1M net worth by 30",
    targetAmountCents: dollars(1_000_000),
    targetDate: "2034-07-13",
    notes: "30th birthday. Stretch goal — requires sustained ~$95k/yr saved + 7% real returns.",
  },

  // Sub-milestones (GOALS.md §4 milestone curve)
  {
    type: "net_worth",
    name: "Milestone: $30k net worth",
    targetAmountCents: dollars(30_000),
    targetDate: "2026-12-31",
    notes: "Debt-free, Roth maxed, ~$10k brokerage/cash.",
  },
  {
    type: "net_worth",
    name: "Milestone: $100k net worth",
    targetAmountCents: dollars(100_000),
    targetDate: "2027-12-31",
    notes: 'First full Google year — hit the "$100k by 23" benchmark.',
  },
  {
    type: "net_worth",
    name: "Milestone: $200k net worth",
    targetAmountCents: dollars(200_000),
    targetDate: "2028-12-31",
    notes: "L4 promo expected by here.",
  },
  {
    type: "net_worth",
    name: "Milestone: $325k net worth",
    targetAmountCents: dollars(325_000),
    targetDate: "2029-12-31",
    notes: null,
  },
  {
    type: "net_worth",
    name: "Milestone: $475k net worth",
    targetAmountCents: dollars(475_000),
    targetDate: "2030-12-31",
    notes: null,
  },
  {
    type: "net_worth",
    name: "Milestone: $640k net worth",
    targetAmountCents: dollars(640_000),
    targetDate: "2031-12-31",
    notes: "L5 expected.",
  },
  {
    type: "net_worth",
    name: "Milestone: $810k net worth",
    targetAmountCents: dollars(810_000),
    targetDate: "2032-12-31",
    notes: null,
  },

  // Tactical wealth-building goals (selected 2026-05-08)
  {
    type: "savings_target",
    name: "Emergency fund: $15k in HYSA",
    targetAmountCents: dollars(15_000),
    targetDate: "2026-12-31",
    notes: "3 months of SF expenses. After debt-free, this is the next priority before taxable investing.",
  },
  {
    type: "savings_target",
    name: "Capture full 401(k) match from paycheck #1",
    targetAmountCents: null,
    targetDate: "2026-08-12",
    notes: "Free ~$7k/yr from Google. Must elect contribution % BEFORE first paycheck. Pass/fail goal.",
  },
  {
    type: "savings_target",
    name: "Roth IRA 2026 max ($7,000)",
    targetAmountCents: dollars(7_000),
    targetDate: "2027-04-15",
    notes: "Tax-free growth forever. 2026 contribution deadline is tax day 2027.",
  },
  {
    type: "savings_target",
    name: "Mega backdoor Roth: $30k+ in 2026",
    targetAmountCents: dollars(30_000),
    targetDate: "2026-12-31",
    notes: "Google plan supports after-tax contributions + in-plan conversion. Biggest wealth lever for L3+ Google SWEs. Requires HR setup of after-tax election.",
  },
  {
    type: "custom",
    name: "Promotion to L4 by EOY 2027",
    targetAmountCents: null,
    targetDate: "2027-12-31",
    notes: "Typical L3→L4 cadence is 18-24 months. Drives comp growth which feeds every other goal.",
  },
  {
    type: "savings_target",
    name: "Savings rate ≥ 40% of net comp in 2026",
    targetAmountCents: 4000, // basis points: 4000 = 40.00%
    targetDate: "2026-12-31",
    notes: "Behavioral lever. Computed monthly: (income - spending) / income. targetAmountCents stores basis points (4000 = 40%) since this is a rate not a dollar amount.",
  },
];
