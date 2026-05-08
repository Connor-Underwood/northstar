"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db, s } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import {
  SEED_CATEGORIES,
  mapPlaidCategoryToLocal,
} from "@/lib/category-seeds";

export async function seedCategoriesAction() {
  const { userId } = await requireUser();

  const existing = await db
    .select({ id: s.categories.id })
    .from(s.categories)
    .where(eq(s.categories.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(s.categories).values(
      SEED_CATEGORIES.map((c) => ({
        userId,
        name: c.name,
        isIncome: c.isIncome,
        color: c.color,
      })),
    );
  }

  // Backfill: assign categoryId to any uncategorized transactions whose Plaid
  // category we know how to map.
  const cats = await db
    .select({ id: s.categories.id, name: s.categories.name })
    .from(s.categories)
    .where(eq(s.categories.userId, userId));
  const byName = new Map(cats.map((c) => [c.name, c.id]));

  const uncat = await db
    .select({
      id: s.transactions.id,
      primary: s.transactions.plaidCategoryPrimary,
      detailed: s.transactions.plaidCategoryDetailed,
    })
    .from(s.transactions)
    .where(
      and(
        eq(s.transactions.userId, userId),
        isNull(s.transactions.categoryId),
      ),
    );

  let backfilled = 0;
  for (const t of uncat) {
    const localName = mapPlaidCategoryToLocal(t.primary, t.detailed);
    const localId = byName.get(localName);
    if (!localId) continue;
    await db
      .update(s.transactions)
      .set({ categoryId: localId })
      .where(eq(s.transactions.id, t.id));
    backfilled++;
  }

  revalidatePath("/spending");
  revalidatePath("/transactions");
  return { ok: true as const, seeded: existing.length === 0, backfilled };
}

export async function recategorizeAllAction() {
  const { userId } = await requireUser();

  const cats = await db
    .select({ id: s.categories.id, name: s.categories.name })
    .from(s.categories)
    .where(eq(s.categories.userId, userId));
  const byName = new Map(cats.map((c) => [c.name, c.id]));

  const all = await db
    .select({
      id: s.transactions.id,
      primary: s.transactions.plaidCategoryPrimary,
      detailed: s.transactions.plaidCategoryDetailed,
    })
    .from(s.transactions)
    .where(eq(s.transactions.userId, userId));

  let updated = 0;
  for (const t of all) {
    const localName = mapPlaidCategoryToLocal(t.primary, t.detailed);
    const localId = byName.get(localName) ?? null;
    if (localId) {
      await db
        .update(s.transactions)
        .set({ categoryId: localId })
        .where(eq(s.transactions.id, t.id));
      updated++;
    }
  }

  revalidatePath("/spending");
  revalidatePath("/transactions");
  return { ok: true as const, updated };
}
