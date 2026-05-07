import { db, s } from "@/db";
import { eq, sql, and, asc } from "drizzle-orm";

export type NetWorthSummary = {
  assetsCents: number;
  liabilitiesCents: number;
  netWorthCents: number;
  accountCount: number;
};

export async function computeNetWorth(userId: string): Promise<NetWorthSummary> {
  const [totals] = await db
    .select({
      assets: sql<number>`COALESCE(SUM(CASE WHEN ${s.accounts.isAsset} THEN ${s.accounts.currentBalanceCents} ELSE 0 END), 0)`.as("assets"),
      liabilities: sql<number>`COALESCE(SUM(CASE WHEN NOT ${s.accounts.isAsset} THEN ${s.accounts.currentBalanceCents} ELSE 0 END), 0)`.as("liabilities"),
      count: sql<number>`COUNT(*)`.as("count"),
    })
    .from(s.accounts)
    .where(and(eq(s.accounts.userId, userId), eq(s.accounts.isActive, true)));

  const assetsCents = Number(totals?.assets ?? 0);
  const liabilitiesCents = Number(totals?.liabilities ?? 0);
  return {
    assetsCents,
    liabilitiesCents,
    netWorthCents: assetsCents - liabilitiesCents,
    accountCount: Number(totals?.count ?? 0),
  };
}

/** Upsert today's snapshot (one per user per day). */
export async function snapshotToday(userId: string) {
  const summary = await computeNetWorth(userId);
  const today = new Date().toISOString().slice(0, 10);
  await db
    .insert(s.netWorthSnapshots)
    .values({
      userId,
      snapshotDate: today,
      totalAssetsCents: summary.assetsCents,
      totalLiabilitiesCents: summary.liabilitiesCents,
      netWorthCents: summary.netWorthCents,
    })
    .onConflictDoUpdate({
      target: [s.netWorthSnapshots.userId, s.netWorthSnapshots.snapshotDate],
      set: {
        totalAssetsCents: summary.assetsCents,
        totalLiabilitiesCents: summary.liabilitiesCents,
        netWorthCents: summary.netWorthCents,
      },
    });
  return summary;
}

export type SnapshotPoint = { date: string; netWorthCents: number };

export async function getSnapshots(userId: string): Promise<SnapshotPoint[]> {
  const rows = await db
    .select({
      date: s.netWorthSnapshots.snapshotDate,
      netWorthCents: s.netWorthSnapshots.netWorthCents,
    })
    .from(s.netWorthSnapshots)
    .where(eq(s.netWorthSnapshots.userId, userId))
    .orderBy(asc(s.netWorthSnapshots.snapshotDate));
  return rows.map((r) => ({
    date: r.date,
    netWorthCents: Number(r.netWorthCents),
  }));
}

export type MilestonePoint = { date: string; targetCents: number; name: string };

export async function getNetWorthMilestones(
  userId: string,
): Promise<MilestonePoint[]> {
  const rows = await db
    .select({
      date: s.goals.targetDate,
      targetCents: s.goals.targetAmountCents,
      name: s.goals.name,
    })
    .from(s.goals)
    .where(and(eq(s.goals.userId, userId), eq(s.goals.type, "net_worth")))
    .orderBy(asc(s.goals.targetDate));

  return rows
    .filter((r) => r.date && r.targetCents != null)
    .map((r) => ({
      date: r.date as string,
      targetCents: Number(r.targetCents),
      name: r.name,
    }));
}
