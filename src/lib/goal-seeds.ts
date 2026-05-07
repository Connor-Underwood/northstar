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
];
