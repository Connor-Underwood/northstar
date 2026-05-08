"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db, s } from "@/db";
import { eq, and } from "drizzle-orm";
import { SEED_GOALS } from "@/lib/goal-seeds";

/** Idempotent: inserts only goals whose name doesn't already exist for the user. */
export async function seedGoalsAction() {
  const { userId } = await requireUser();

  const existing = await db
    .select({ name: s.goals.name })
    .from(s.goals)
    .where(eq(s.goals.userId, userId));
  const existingNames = new Set(existing.map((g) => g.name));

  const toInsert = SEED_GOALS.filter((g) => !existingNames.has(g.name));
  if (toInsert.length === 0) {
    return { ok: true as const, added: 0 };
  }

  await db.insert(s.goals).values(
    toInsert.map((g) => ({
      userId,
      type: g.type,
      name: g.name,
      targetAmountCents: g.targetAmountCents,
      targetDate: g.targetDate,
      notes: g.notes,
    })),
  );

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true as const, added: toInsert.length };
}

export async function markGoalAchievedAction(goalId: string) {
  const { userId } = await requireUser();
  await db
    .update(s.goals)
    .set({ status: "achieved", updatedAt: new Date() })
    .where(and(eq(s.goals.id, goalId), eq(s.goals.userId, userId)));
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function reactivateGoalAction(goalId: string) {
  const { userId } = await requireUser();
  await db
    .update(s.goals)
    .set({ status: "active", updatedAt: new Date() })
    .where(and(eq(s.goals.id, goalId), eq(s.goals.userId, userId)));
  revalidatePath("/goals");
  return { ok: true as const };
}

export async function updateGoalProgressAction(
  goalId: string,
  newAmountCents: number,
) {
  const { userId } = await requireUser();
  await db
    .update(s.goals)
    .set({ currentAmountCents: newAmountCents, updatedAt: new Date() })
    .where(and(eq(s.goals.id, goalId), eq(s.goals.userId, userId)));
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
