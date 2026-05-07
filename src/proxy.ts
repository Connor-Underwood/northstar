import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

const PROTECTED = [
  /^\/dashboard/,
  /^\/accounts/,
  /^\/transactions/,
  /^\/goals/,
  /^\/settings/,
  /^\/api\/plaid/,
];

export default async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  // /auth/* routes are owned by Auth0 (login/logout/callback/profile/access-token).
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  const isProtected = PROTECTED.some((re) =>
    re.test(request.nextUrl.pathname),
  );
  if (!isProtected) return authRes;

  const session = await auth0.getSession(request);
  if (!session) {
    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return authRes;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
