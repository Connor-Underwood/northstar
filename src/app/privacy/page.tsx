import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · Northstar",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 justify-center px-6 py-12">
      <article className="max-w-2xl prose prose-zinc dark:prose-invert prose-sm">
        <p className="text-sm text-zinc-500">
          <Link href="/">← Northstar</Link>
        </p>
        <h1>Privacy Policy</h1>
        <p>
          <strong>Last updated: 2026-05-07</strong>
        </p>

        <h2>1. About this app</h2>
        <p>
          Northstar is a single-user personal finance tracker. The owner and
          developer (Connor Underwood) is the sole user of this application.
          There is no public sign-up, no marketing, and no third-party access
          to user data.
        </p>

        <h2>2. Data we collect</h2>
        <ul>
          <li>
            <strong>Authentication data</strong> (managed by Auth0): email
            address and authentication metadata.
          </li>
          <li>
            <strong>Financial data via Plaid</strong>: account balances,
            transactions, holdings, and liability details for accounts the
            user explicitly connects through Plaid Link. The user (myself)
            provides explicit consent during the Plaid Link flow.
          </li>
          <li>
            <strong>Manually entered data</strong>: account names, balances,
            interest rates, transactions, and goals entered through the app
            UI.
          </li>
        </ul>

        <h2>3. How data is stored</h2>
        <ul>
          <li>
            All data is stored in a private Postgres database (Neon) with
            at-rest encryption.
          </li>
          <li>
            Plaid access tokens are additionally encrypted with AES-256-GCM
            before being written to the database.
          </li>
          <li>All traffic between the browser, the app, and Plaid is TLS-encrypted.</li>
        </ul>

        <h2>4. How data is used</h2>
        <p>
          Data is used solely to render the user&apos;s own dashboard, compute
          net worth, categorize transactions, and track progress against
          stated personal goals. No data is sold, shared, monetized, or used
          for any analytics service.
        </p>

        <h2>5. Third parties</h2>
        <p>The app uses these service providers, each with their own privacy policy:</p>
        <ul>
          <li>Plaid — for bank/investment data aggregation</li>
          <li>Auth0 — for authentication</li>
          <li>Neon — for database hosting</li>
          <li>Vercel — for application hosting</li>
        </ul>

        <h2>6. Data retention &amp; deletion</h2>
        <p>
          Data persists as long as the application is in use. The user can
          delete any account, transaction, goal, or Plaid item at any time
          through the application UI or direct database access. Disconnecting
          a Plaid item removes its access token and stops further syncing.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions: <a href="mailto:connorunderwood.2004@gmail.com">connorunderwood.2004@gmail.com</a>
        </p>
      </article>
    </main>
  );
}
