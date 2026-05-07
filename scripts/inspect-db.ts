import "dotenv/config";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("=== plaid_items ===");
  const items = await sql`SELECT id, user_id, plaid_item_id, institution_name, status, last_synced_at, cursor IS NOT NULL AS has_cursor, created_at FROM plaid_items ORDER BY created_at DESC`;
  console.log(items);

  console.log("\n=== accounts ===");
  const accs = await sql`SELECT id, user_id, name, type, institution, current_balance_cents, plaid_account_id IS NOT NULL AS plaid_linked, created_at FROM accounts ORDER BY created_at DESC LIMIT 20`;
  console.log(accs);

  console.log("\n=== transactions count ===");
  const tx = await sql`SELECT COUNT(*)::int AS n FROM transactions`;
  console.log(tx);

  console.log("\n=== goals count ===");
  const goals = await sql`SELECT COUNT(*)::int AS n FROM goals`;
  console.log(goals);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
