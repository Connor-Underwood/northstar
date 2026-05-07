import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight">
          Northstar
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
          A personal finance tracker built around two goals: debt-free by EOY
          2026, $1M net worth by 30.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
          <Link
            href="/auth/login?screen_hint=signup"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
