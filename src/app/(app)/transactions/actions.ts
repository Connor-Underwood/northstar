"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db, s } from "@/db";
import { parseDollarsToCents } from "@/lib/account-utils";

function parseSignedAmount(formData: FormData): number {
  const direction = String(formData.get("direction") ?? "expense");
  const cents = parseDollarsToCents(formData.get("amount"));
  return direction === "income" ? cents : -cents;
}

async function ensureUserOwnsAccount(userId: string, accountId: string) {
  const [row] = await db
    .select({ id: s.accounts.id })
    .from(s.accounts)
    .where(and(eq(s.accounts.id, accountId), eq(s.accounts.userId, userId)))
    .limit(1);
  if (!row) throw new Error("Invalid account");
}

export async function createTransactionAction(formData: FormData) {
  const { userId } = await requireUser();

  const accountId = String(formData.get("accountId") ?? "");
  await ensureUserOwnsAccount(userId, accountId);

  const date = String(formData.get("date") ?? "");
  if (!date) throw new Error("Date is required");
  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Description is required");

  await db.insert(s.transactions).values({
    userId,
    accountId,
    date,
    amountCents: parseSignedAmount(formData),
    description,
    merchant: (formData.get("merchant") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function updateTransactionAction(
  id: string,
  formData: FormData,
) {
  const { userId } = await requireUser();

  const accountId = String(formData.get("accountId") ?? "");
  await ensureUserOwnsAccount(userId, accountId);

  const date = String(formData.get("date") ?? "");
  if (!date) throw new Error("Date is required");
  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Description is required");

  await db
    .update(s.transactions)
    .set({
      accountId,
      date,
      amountCents: parseSignedAmount(formData),
      description,
      merchant: (formData.get("merchant") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .where(and(eq(s.transactions.id, id), eq(s.transactions.userId, userId)));

  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function deleteTransactionAction(id: string) {
  const { userId } = await requireUser();

  await db
    .delete(s.transactions)
    .where(and(eq(s.transactions.id, id), eq(s.transactions.userId, userId)));

  revalidatePath("/transactions");
  redirect("/transactions");
}
