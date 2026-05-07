import { auth } from "@clerk/nextjs/server";
import { plaid, mapPlaidAccountType } from "@/lib/plaid";
import { encrypt } from "@/lib/encrypt";
import { db, s } from "@/db";
import { CountryCode } from "plaid";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const publicToken = body?.public_token;
  if (typeof publicToken !== "string") {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const ex = await plaid.itemPublicTokenExchange({
    public_token: publicToken,
  });
  const accessToken = ex.data.access_token;
  const itemId = ex.data.item_id;

  const item = await plaid.itemGet({ access_token: accessToken });
  const institutionId = item.data.item.institution_id ?? null;
  let institutionName: string | null = null;
  if (institutionId) {
    const inst = await plaid.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });
    institutionName = inst.data.institution.name;
  }

  const acc = await plaid.accountsGet({ access_token: accessToken });

  const [insertedItem] = await db
    .insert(s.plaidItems)
    .values({
      userId,
      plaidItemId: itemId,
      plaidInstitutionId: institutionId,
      institutionName,
      accessTokenEncrypted: encrypt(accessToken),
    })
    .returning({ id: s.plaidItems.id });

  for (const a of acc.data.accounts) {
    const { type, isAsset } = mapPlaidAccountType(a);
    const balance = a.balances.current ?? 0;
    await db.insert(s.accounts).values({
      userId,
      name: a.official_name ?? a.name,
      type,
      institution: institutionName,
      currentBalanceCents: Math.round(balance * 100),
      creditLimitCents: a.balances.limit
        ? Math.round(a.balances.limit * 100)
        : null,
      isAsset,
      plaidItemId: insertedItem.id,
      plaidAccountId: a.account_id,
    });
  }

  return Response.json({
    ok: true,
    item_id: insertedItem.id,
    accounts_added: acc.data.accounts.length,
  });
}
