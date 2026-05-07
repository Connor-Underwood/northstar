import { getCurrentUser } from "@/lib/auth";
import { plaid, mapPlaidAccountType } from "@/lib/plaid";
import { encrypt } from "@/lib/encrypt";
import { db, s } from "@/db";
import { CountryCode } from "plaid";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = user.userId;

    const body = await req.json().catch(() => null);
    const publicToken = body?.public_token;
    if (typeof publicToken !== "string") {
      console.error("[plaid/exchange] invalid body:", body);
      return Response.json({ error: "invalid_body" }, { status: 400 });
    }

    console.log("[plaid/exchange] start", { userId, publicTokenLen: publicToken.length });

    const ex = await plaid.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = ex.data.access_token;
    const itemId = ex.data.item_id;
    console.log("[plaid/exchange] exchanged", { itemId });

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
    console.log("[plaid/exchange] institution", { institutionId, institutionName });

    const acc = await plaid.accountsGet({ access_token: accessToken });
    console.log("[plaid/exchange] accountsGet", {
      count: acc.data.accounts.length,
      types: acc.data.accounts.map((a) => `${a.type}/${a.subtype}`),
    });

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
    console.log("[plaid/exchange] item inserted", insertedItem);

    let accountsAdded = 0;
    for (const a of acc.data.accounts) {
      const { type, isAsset } = mapPlaidAccountType(a);
      const balance = a.balances.current ?? 0;
      try {
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
        accountsAdded++;
      } catch (e) {
        console.error("[plaid/exchange] account insert failed", {
          name: a.name,
          type,
          subtype: a.subtype,
          plaidAccountId: a.account_id,
          err: (e as Error).message,
        });
      }
    }

    console.log("[plaid/exchange] done", { accountsAdded });
    return Response.json({
      ok: true,
      item_id: insertedItem.id,
      accounts_added: accountsAdded,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = (e as { response?: { data?: { error_code?: string } } })
      ?.response?.data?.error_code;
    console.error("[plaid/exchange] FAIL", { msg, code, error: e });
    return Response.json(
      { error: "exchange_failed", message: msg, plaid_code: code },
      { status: 500 },
    );
  }
}
