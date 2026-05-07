// Wipe all accounts, transactions, plaid_items, and snapshots for a user.
// Usage: npx tsx scripts/wipe-user-data.ts <userId> --confirm

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const userId = process.argv[2];
const confirm = process.argv.includes("--confirm");

if (!userId) {
  console.error("Usage: npx tsx scripts/wipe-user-data.ts <userId> --confirm");
  process.exit(1);
}
if (!confirm) {
  console.error("Refusing to run without --confirm flag.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log(`Wiping user data for: ${userId}`);

  const tx = await sql`DELETE FROM transactions WHERE user_id = ${userId} RETURNING id`;
  console.log(`  transactions: ${tx.length} deleted`);

  const acc = await sql`DELETE FROM accounts WHERE user_id = ${userId} RETURNING id`;
  console.log(`  accounts: ${acc.length} deleted`);

  const items = await sql`DELETE FROM plaid_items WHERE user_id = ${userId} RETURNING id`;
  console.log(`  plaid_items: ${items.length} deleted`);

  const snaps = await sql`DELETE FROM net_worth_snapshots WHERE user_id = ${userId} RETURNING id`;
  console.log(`  net_worth_snapshots: ${snaps.length} deleted`);

  console.log("Goals + categories preserved.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
