import { auth0 } from "./auth0";

export type CurrentUser = {
  userId: string;
  email: string | null;
  name: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;
  return {
    userId: session.user.sub,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
