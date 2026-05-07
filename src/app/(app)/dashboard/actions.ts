"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { snapshotToday } from "@/lib/net-worth";

export async function takeSnapshotAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const summary = await snapshotToday(userId);
  revalidatePath("/dashboard");
  return { ok: true as const, summary };
}
