import {
  pgTable,
  text,
  bigint,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// All monetary values are stored as BIGINT cents to avoid floating-point math.
// userId is the Clerk user id (text). No mirror users table.

export const accountTypeEnum = pgEnum("account_type", [
  "checking",
  "savings",
  "credit_card",
  "brokerage",
  "retirement", // Roth IRA, 401(k), etc.
  "student_loan",
  "mortgage",
  "auto_loan",
  "other_asset",
  "other_liability",
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "debt_free",
  "net_worth",
  "savings_target",
  "custom",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "achieved",
  "paused",
]);

export const plaidItemStatusEnum = pgEnum("plaid_item_status", [
  "good",
  "error",
  "requires_login",
]);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    type: accountTypeEnum("type").notNull(),
    institution: text("institution"),
    currentBalanceCents: bigint("current_balance_cents", { mode: "number" })
      .notNull()
      .default(0),
    creditLimitCents: bigint("credit_limit_cents", { mode: "number" }),
    interestRateBps: integer("interest_rate_bps"), // basis points: 5.50% -> 550
    isAsset: boolean("is_asset").notNull(),
    plaidItemId: text("plaid_item_id"),
    plaidAccountId: text("plaid_account_id"),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("accounts_user_idx").on(t.userId),
    uniqueIndex("accounts_plaid_account_unique").on(t.plaidAccountId),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    isIncome: boolean("is_income").notNull().default(false),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("categories_user_idx").on(t.userId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(), // negative = outflow
    description: text("description").notNull(),
    merchant: text("merchant"),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    isPending: boolean("is_pending").notNull().default(false),
    plaidTransactionId: text("plaid_transaction_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("transactions_user_date_idx").on(t.userId, t.date),
    index("transactions_account_idx").on(t.accountId),
    uniqueIndex("transactions_plaid_unique").on(t.plaidTransactionId),
  ],
);

export const goals = pgTable(
  "goals",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    type: goalTypeEnum("type").notNull(),
    name: text("name").notNull(),
    targetAmountCents: bigint("target_amount_cents", { mode: "number" }),
    targetDate: date("target_date"),
    currentAmountCents: bigint("current_amount_cents", { mode: "number" })
      .notNull()
      .default(0),
    status: goalStatusEnum("status").notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("goals_user_idx").on(t.userId)],
);

export const netWorthSnapshots = pgTable(
  "net_worth_snapshots",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    snapshotDate: date("snapshot_date").notNull(),
    totalAssetsCents: bigint("total_assets_cents", { mode: "number" }).notNull(),
    totalLiabilitiesCents: bigint("total_liabilities_cents", {
      mode: "number",
    }).notNull(),
    netWorthCents: bigint("net_worth_cents", { mode: "number" }).notNull(),
    breakdown: jsonb("breakdown"), // per-account snapshot blob
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("snapshots_user_date_unique").on(t.userId, t.snapshotDate),
  ],
);

export const plaidItems = pgTable(
  "plaid_items",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    plaidItemId: text("plaid_item_id").notNull(),
    plaidInstitutionId: text("plaid_institution_id"),
    institutionName: text("institution_name"),
    accessTokenEncrypted: text("access_token_encrypted").notNull(),
    status: plaidItemStatusEnum("status").notNull().default("good"),
    cursor: text("cursor"), // /transactions/sync cursor
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("plaid_items_user_idx").on(t.userId),
    uniqueIndex("plaid_items_item_unique").on(t.plaidItemId),
  ],
);
