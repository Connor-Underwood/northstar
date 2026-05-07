"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db, s } from "@/db";
import { eq } from "drizzle-orm";
import { SEED_GOALS } from "@/lib/goal-seeds";

export async function seedGoalsAction() {
  const { userId } = await requireUser();

  const existing = await db
    .select({ id: s.goals.id })
    .from(s.goals)
    .where(eq(s.goals.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return { ok: false, reason: "already_seeded" as const };
  }

  await db.insert(s.goals).values(
    SEED_GOALS.map((g) => ({
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
  return { ok: true, count: SEED_GOALS.length };
}
