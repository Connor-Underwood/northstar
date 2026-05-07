CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings', 'credit_card', 'brokerage', 'retirement', 'student_loan', 'mortgage', 'auto_loan', 'other_asset', 'other_liability');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('active', 'achieved', 'paused');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('debt_free', 'net_worth', 'savings_target', 'custom');--> statement-breakpoint
CREATE TYPE "public"."plaid_item_status" AS ENUM('good', 'error', 'requires_login');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" NOT NULL,
	"institution" text,
	"current_balance_cents" bigint DEFAULT 0 NOT NULL,
	"credit_limit_cents" bigint,
	"interest_rate_bps" integer,
	"is_asset" boolean NOT NULL,
	"plaid_item_id" text,
	"plaid_account_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"is_income" boolean DEFAULT false NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "goal_type" NOT NULL,
	"name" text NOT NULL,
	"target_amount_cents" bigint,
	"target_date" date,
	"current_amount_cents" bigint DEFAULT 0 NOT NULL,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "net_worth_snapshots" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"snapshot_date" date NOT NULL,
	"total_assets_cents" bigint NOT NULL,
	"total_liabilities_cents" bigint NOT NULL,
	"net_worth_cents" bigint NOT NULL,
	"breakdown" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plaid_items" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plaid_item_id" text NOT NULL,
	"plaid_institution_id" text,
	"institution_name" text,
	"access_token_encrypted" text NOT NULL,
	"status" "plaid_item_status" DEFAULT 'good' NOT NULL,
	"cursor" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"date" date NOT NULL,
	"amount_cents" bigint NOT NULL,
	"description" text NOT NULL,
	"merchant" text,
	"category_id" text,
	"notes" text,
	"is_pending" boolean DEFAULT false NOT NULL,
	"plaid_transaction_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_plaid_account_unique" ON "accounts" USING btree ("plaid_account_id");--> statement-breakpoint
CREATE INDEX "categories_user_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_user_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_user_date_unique" ON "net_worth_snapshots" USING btree ("user_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "plaid_items_user_idx" ON "plaid_items" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plaid_items_item_unique" ON "plaid_items" USING btree ("plaid_item_id");--> statement-breakpoint
CREATE INDEX "transactions_user_date_idx" ON "transactions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "transactions_account_idx" ON "transactions" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_plaid_unique" ON "transactions" USING btree ("plaid_transaction_id");