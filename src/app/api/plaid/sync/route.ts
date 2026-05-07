import { auth } from "@clerk/nextjs/server";
import { plaid } from "@/lib/plaid";
import { decrypt } from "@/lib/encrypt";
import { db, s } from "@/db";
import { eq } from "drizzle-orm";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const items = await db
    .select()
    .from(s.plaidItems)
    .where(eq(s.plaidItems.userId, userId));

  if (items.length === 0) {
    return Response.json({ ok: true, added: 0, modified: 0, removed: 0 });
  }

  const userAccounts = await db
    .select({
      id: s.accounts.id,
      plaidAccountId: s.accounts.plaidAccountId,
    })
    .from(s.accounts)
    .where(eq(s.accounts.userId, userId));

  const accIdMap = new Map(
    userAccounts
      .filter((a) => a.plaidAccountId)
      .map((a) => [a.plaidAccountId as string, a.id]),
  );

  let added = 0;
  let modified = 0;
  let removed = 0;

  for (const item of items) {
    const accessToken = decrypt(item.accessTokenEncrypted);
    let cursor: string | undefined = item.cursor ?? undefined;
    let hasMore = true;

    while (hasMore) {
      const res = await plaid.transactionsSync({
        access_token: accessToken,
        cursor,
      });

      for (const t of res.data.added) {
        const accId = accIdMap.get(t.account_id);
        if (!accId) continue;
        await db
          .insert(s.transactions)
          .values({
            userId,
            accountId: accId,
            date: t.date,
            // Plaid: positive = outflow. We store negative for outflow.
            amountCents: -Math.round(t.amount * 100),
            description: t.name,
            merchant: t.merchant_name ?? null,
            isPending: t.pending,
            plaidTransactionId: t.transaction_id,
          })
          .onConflictDoNothing({
            target: s.transactions.plaidTransactionId,
          });
      }

      added += res.data.added.length;
      modified += res.data.modified.length;
      removed += res.data.removed.length;

      cursor = res.data.next_cursor;
      hasMore = res.data.has_more;
    }

    await db
      .update(s.plaidItems)
      .set({ cursor, lastSyncedAt: new Date() })
      .where(eq(s.plaidItems.id, item.id));

    // Refresh balances
    const refreshed = await plaid.accountsGet({ access_token: accessToken });
    for (const a of refreshed.data.accounts) {
      await db
        .update(s.accounts)
        .set({
          currentBalanceCents: Math.round((a.balances.current ?? 0) * 100),
          creditLimitCents: a.balances.limit
            ? Math.round(a.balances.limit * 100)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(s.accounts.plaidAccountId, a.account_id));
    }
  }

  return Response.json({ ok: true, added, modified, removed });
}
