/**
 * USERS PAGE — SERVER COMPONENT (RSC)
 *
 * This is the heart of the RSC pattern. Notice:
 *
 * 1. NO 'use client' → this component runs entirely on the server
 * 2. async function → we can await data directly, like a Node.js module
 * 3. Direct data access → no fetch(), no useEffect, no loading state needed
 * 4. Zero JS sent to the client for this component's rendering
 *
 * Contrast with the React 19 Vite starter (client-side data fetching):
 *   ❌ No useQuery() hook
 *   ❌ No isLoading / isError states
 *   ❌ No TanStack Query provider
 *   ❌ No Axios client
 *   ❌ No /api/users endpoint
 *
 * The data is fetched and embedded in the HTML before it reaches the browser.
 * When users arrive on the page, they immediately see the data — no loading spinner.
 *
 * Mutation flow (create/update/delete):
 * Client Component calls Server Action → Server Action mutates usersDb →
 * revalidatePath() → Next.js re-renders THIS Server Component → fresh HTML
 */

import { getTranslations } from "next-intl/server";
import { UserCard } from "@/features/users/components/UserCard";
import { UserForm } from "@/features/users/components/UserForm";
import { usersDb } from "@/lib/data/users";

// Opt out of caching — always fetch fresh data on every request.
// This is equivalent to getServerSideProps in the Pages Router.
// Remove this line to enable static rendering with on-demand revalidation.
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Direct data access — runs on the server, no HTTP round-trip, no loading spinner.
  // Both promises run concurrently with Promise.all for optimal performance.
  const [users, t] = await Promise.all([usersDb.getAll(), getTranslations("users")]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            /*
             * UserCard is a Client Component ('use client') because it needs
             * onClick handlers for edit and delete. But it receives server-fetched
             * data as props — this is the canonical Server → Client data flow pattern.
             *
             * The Client Component boundary is pushed as far down the tree as possible,
             * keeping most of the page as server-rendered HTML.
             */
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/*
       * UserForm is a Client Component because it uses useActionState (React 19).
       * The createUser function passed to the form is a Server Action —
       * form submission goes directly to the server, no manual fetch() needed.
       */}
      <UserForm />
    </div>
  );
}
