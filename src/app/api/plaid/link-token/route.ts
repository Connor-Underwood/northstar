import { auth } from "@clerk/nextjs/server";
import { plaid } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = await plaid.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "Get Rich Quick",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return Response.json({ link_token: r.data.link_token });
}
