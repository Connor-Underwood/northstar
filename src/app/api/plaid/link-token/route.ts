import { getCurrentUser } from "@/lib/auth";
import { plaid } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = await plaid.linkTokenCreate({
    user: { client_user_id: user.userId },
    client_name: "Northstar",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return Response.json({ link_token: r.data.link_token });
}
