import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/goals", label: "Goals" },
  { href: "/settings", label: "Settings" },
];

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1">
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 px-4 py-6">
        <Link href="/dashboard" className="mb-8 px-2 text-lg font-semibold tracking-tight">
          Get Rich Quick
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
        <div className="mt-auto px-2">
          <UserButton />
        </div>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
