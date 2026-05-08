import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/spending", label: "Spending" },
  { href: "/goals", label: "Goals" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const initial = (user.name ?? user.email ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex flex-1">
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 px-4 py-6">
        <Link
          href="/dashboard"
          className="mb-8 px-2 text-lg font-semibold tracking-tight"
        >
          Northstar
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate">{user.email ?? user.name}</div>
              <a
                href="/auth/logout"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sign out
              </a>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
