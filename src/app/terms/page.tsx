import Link from "next/link";

export const metadata = {
  title: "Terms of Service · Northstar",
};

export default function TermsPage() {
  return (
    <main className="flex flex-1 justify-center px-6 py-12">
      <article className="max-w-2xl prose prose-zinc dark:prose-invert prose-sm">
        <p className="text-sm text-zinc-500">
          <Link href="/">← Northstar</Link>
        </p>
        <h1>Terms of Service</h1>
        <p>
          <strong>Last updated: 2026-05-07</strong>
        </p>

        <h2>1. Scope</h2>
        <p>
          Northstar is a single-user personal finance tracker. The owner and
          sole user is Connor Underwood. There is no public sign-up; access
          is restricted to the owner.
        </p>

        <h2>2. No financial advice</h2>
        <p>
          Northstar is a tracking and visualization tool. Information shown
          in the app does not constitute financial, investment, tax, or
          legal advice. The user is responsible for any decisions made based
          on the data displayed.
        </p>

        <h2>3. Accuracy</h2>
        <p>
          Account balances and transactions sourced from Plaid reflect data
          provided by financial institutions and may be delayed or contain
          errors. Manual entries are entered by the user and may be incorrect.
          The official source of truth is always the underlying financial
          institution.
        </p>

        <h2>4. Service availability</h2>
        <p>
          The app is hosted on third-party infrastructure (Vercel, Neon,
          Clerk, Plaid) and may be unavailable due to provider outages,
          maintenance, or other reasons. The service is provided
          &ldquo;as is&rdquo; with no uptime guarantee.
        </p>

        <h2>5. Acceptable use</h2>
        <p>
          The application may only be used by its owner. Any unauthorized
          access is prohibited.
        </p>

        <h2>6. Liability</h2>
        <p>
          To the fullest extent permitted by law, the owner is not liable
          for any loss, financial or otherwise, arising from the use of this
          application.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions: <a href="mailto:connorunderwood.2004@gmail.com">connorunderwood.2004@gmail.com</a>
        </p>
      </article>
    </main>
  );
}
