import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
        <h2 className="text-lg font-semibold">Account</h2>
        <dl className="mt-4 grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <dt className="text-zinc-500">Name</dt>
          <dd>{user.name ?? "—"}</dd>
          <dt className="text-zinc-500">Email</dt>
          <dd>{user.email ?? "—"}</dd>
          <dt className="text-zinc-500">User ID</dt>
          <dd className="font-mono text-xs">{user.userId}</dd>
        </dl>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
        <h2 className="text-lg font-semibold">Connections</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Plaid bank connections will be managed here.
        </p>
      </section>
    </div>
  );
}
