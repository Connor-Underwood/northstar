"use client";

import { useEffect, useState, useTransition } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";

export function ConnectBankButton() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.link_token) setLinkToken(d.link_token);
        else setError("Failed to fetch Plaid link token. Check PLAID env vars.");
      })
      .catch(() => setError("Failed to reach Plaid."));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      setError(null);
      startTransition(async () => {
        const ex = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });
        if (!ex.ok) {
          setError("Token exchange failed.");
          return;
        }
        await fetch("/api/plaid/sync", { method: "POST" });
        router.refresh();
      });
    },
    onExit: (err) => {
      if (err) setError(err.error_message ?? err.error_code ?? "Plaid exited.");
    },
  });

  return (
    <div>
      <button
        onClick={() => open()}
        disabled={!ready || pending || !linkToken}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Connecting…" : "Connect bank"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
