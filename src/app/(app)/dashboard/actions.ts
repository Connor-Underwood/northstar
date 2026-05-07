"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { snapshotToday } from "@/lib/net-worth";

export async function takeSnapshotAction() {
  const { userId } = await requireUser();
  const summary = await snapshotToday(userId);
  revalidatePath("/dashboard");
  return { ok: true as const, summary };
}
