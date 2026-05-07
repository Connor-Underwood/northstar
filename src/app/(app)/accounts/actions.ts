"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db, s } from "@/db";
import {
  ACCOUNT_TYPES,
  isAssetType,
  parseDollarsToCents,
  parseOptionalDollarsToCents,
  parsePercentToBps,
  type AccountTypeValue,
} from "@/lib/account-utils";

function pickType(raw: FormDataEntryValue | null): AccountTypeValue {
  const v = String(raw ?? "");
  const valid = ACCOUNT_TYPES.find((t) => t.value === v);
  if (!valid) throw new Error("Invalid account type");
  return valid.value;
}

export async function createAccountAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const type = pickType(formData.get("type"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  await db.insert(s.accounts).values({
    userId,
    name,
    type,
    institution: (formData.get("institution") as string) || null,
    currentBalanceCents: parseDollarsToCents(formData.get("balance")),
    creditLimitCents: parseOptionalDollarsToCents(formData.get("creditLimit")),
    interestRateBps: parsePercentToBps(formData.get("interestRate")),
    isAsset: isAssetType(type),
    notes: (formData.get("notes") as string) || null,
  });

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  redirect("/accounts");
}

export async function updateAccountAction(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const type = pickType(formData.get("type"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  await db
    .update(s.accounts)
    .set({
      name,
      type,
      institution: (formData.get("institution") as string) || null,
      currentBalanceCents: parseDollarsToCents(formData.get("balance")),
      creditLimitCents: parseOptionalDollarsToCents(formData.get("creditLimit")),
      interestRateBps: parsePercentToBps(formData.get("interestRate")),
      isAsset: isAssetType(type),
      notes: (formData.get("notes") as string) || null,
      updatedAt: new Date(),
    })
    .where(and(eq(s.accounts.id, id), eq(s.accounts.userId, userId)));

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  redirect("/accounts");
}

export async function deleteAccountAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await db
    .delete(s.accounts)
    .where(and(eq(s.accounts.id, id), eq(s.accounts.userId, userId)));

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  redirect("/accounts");
}

export async function seedAccountsAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const { SEED_ACCOUNTS } = await import("@/lib/account-seeds");

  const existing = await db
    .select({ id: s.accounts.id })
    .from(s.accounts)
    .where(eq(s.accounts.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return { ok: false as const, reason: "already_seeded" as const };
  }

  await db.insert(s.accounts).values(
    SEED_ACCOUNTS.map((a) => ({
      userId,
      name: a.name,
      type: a.type,
      institution: a.institution,
      currentBalanceCents: a.balanceCents,
      creditLimitCents: a.creditLimitCents,
      interestRateBps: a.interestRateBps,
      isAsset: isAssetType(a.type),
      notes: a.notes,
    })),
  );

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { ok: true as const, count: SEED_ACCOUNTS.length };
}
