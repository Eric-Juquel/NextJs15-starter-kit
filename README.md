# Next.js 15 Starter — RSC First

A production-ready starter kit demonstrating the **React Server Components (RSC)** architecture with Next.js 15 App Router.

This is the **RSC-first** counterpart to the React 19 + Vite starter. The same feature set (users CRUD, dark mode, i18n, forms), but rearchitected to leverage server-side rendering patterns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme`) |
| i18n | next-intl v3 (RSC-compatible, `[locale]` routing) |
| Dark mode | next-themes (SSR-safe) |
| Validation | Zod v4 |
| Forms | React Hook Form + `@hookform/resolvers` |
| Toasts | Sonner |
| UI primitives | Radix UI (Dialog, Label, Slot) |
| Icons | lucide-react |
| Linting | Biome v2 |
| Git hooks | Husky + lint-staged |
| Testing | Vitest + Testing Library + jsdom |

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/en` automatically.

## RSC Architecture — Key Concepts

### 1. Server Components (default)

Every file in `app/` is a Server Component by default. No `'use client'` = runs on the server.

```typescript
// src/app/[locale]/users/page.tsx
export default async function UsersPage() {
  // Direct data access — no fetch(), no useEffect, no loading state
  const users = await usersDb.getAll();
  // ...
}
```

**What you get:**
- Data is fetched before HTML is sent to the browser
- Zero client-side JS for the data-fetching logic
- No loading spinners for initial page load
- No TanStack Query, no Axios, no API routes for reads

### 2. Server Actions for mutations

Mutations run on the server via `'use server'` functions called directly from Client Components.

```typescript
// src/features/users/actions/user.actions.ts
"use server";

export async function createUser(input: CreateUserInput) {
  // Direct DB access — no API route needed
  const user = await usersDb.create(input);
  // Tell Next.js to re-render the UsersPage RSC
  revalidatePath("/[locale]/users", "page");
  return { success: true, data: user };
}
```

**What you get:**
- No `POST /api/users` endpoint needed
- Zod validation runs on the server (cannot be bypassed)
- `revalidatePath` triggers a server re-render of affected pages
- Type-safe end-to-end (TypeScript knows the return type)

### 3. Client Components — only when needed

`'use client'` is used only for components that need:
- Browser APIs
- Event handlers / interactivity
- React hooks (`useState`, `useEffect`, `useTransition`, etc.)

```
src/
├── app/[locale]/users/page.tsx    ← Server Component (async, fetches data)
└── features/users/components/
    ├── UserCard.tsx               ← 'use client' (onClick handlers)
    ├── UserForm.tsx               ← 'use client' (useActionState)
    └── EditUserDialog.tsx         ← 'use client' (useState, useForm)
```

### 4. The composition pattern

Server Components can pass data down to Client Components as props:

```tsx
// Server Component (UsersPage)
const users = await usersDb.getAll(); // server-side fetch

return users.map(user => (
  <UserCard key={user.id} user={user} /> // Client Component receives data as props
));
```

The Client Component boundary is pushed as far down the tree as possible.

### 5. useActionState (React 19)

React 19's `useActionState` connects a form to a Server Action with built-in pending/error state:

```tsx
// Client Component
const [state, formAction] = useActionState(action, {});

return <form action={formAction}>...</form>;
```

No manual `useState` for loading, no try/catch in the component.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — minimal pass-through (no html/body)
│   ├── not-found.tsx
│   ├── globals.css                   # Tailwind v4 theme + system font stack
│   └── [locale]/
│       ├── layout.tsx                # Locale root layout: <html lang={locale}>, ThemeProvider, NextIntlClientProvider, generateStaticParams
│       ├── page.tsx                  # Home (Server Component)
│       ├── loading.tsx               # Suspense fallback
│       └── users/
│           ├── page.tsx              # Users list (async Server Component)
│           ├── loading.tsx           # Skeleton
│           └── error.tsx             # Error boundary
├── features/
│   ├── home/components/
│   │   └── HomeContent.tsx           # Server Component
│   └── users/
│       ├── actions/
│       │   └── user.actions.ts       # Server Actions ('use server')
│       ├── components/
│       │   ├── UserCard.tsx          # 'use client'
│       │   ├── UserForm.tsx          # 'use client' (useActionState)
│       │   └── EditUserDialog.tsx    # 'use client' (useForm + Dialog)
│       └── schemas/
│           └── user.schema.ts        # Zod schemas (shared server/client)
├── i18n/
│   ├── routing.ts                    # next-intl route config
│   ├── request.ts                    # Server-side i18n config
│   └── locales/
│       ├── en.json
│       └── fr.json
├── lib/
│   ├── data/users.ts                 # In-memory store (replace with real DB)
│   └── utils.ts                      # cn() helper
├── middleware.ts                     # next-intl routing middleware
├── shared/
│   ├── components/
│   │   ├── layout/Header.tsx         # 'use client' (theme + locale toggle)
│   │   └── ui/                       # shadcn/ui pattern components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   └── providers/
│       └── ThemeProvider.tsx         # 'use client' wrapper for next-themes
└── tests/
    └── setup.ts                      # Vitest + Testing Library setup
```

## Comparison: RSC vs Client-side

| Concern | React 19 + Vite (client) | Next.js 15 (RSC) |
|---------|--------------------------|------------------|
| Initial data fetch | `useQuery` + loading state | `await usersDb.getAll()` in async component |
| Mutations | `useMutation` + API route | Server Action + `revalidatePath` |
| Loading state | `isLoading` boolean | `loading.tsx` Suspense boundary |
| Error handling | `isError` + error state | `error.tsx` Error boundary |
| Bundle size | Full data layer in client JS | Data layer stays on server |
| API routes needed | Yes (for reads + writes) | No (writes only via Server Actions) |

## Tailwind CSS v4

No `tailwind.config.js`. Theme is defined in CSS:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.205 0 0);
  /* ... */
}

.dark {
  --color-primary: oklch(0.985 0 0);
  /* ... */
}
```

## i18n Routes

| URL | Locale |
|-----|--------|
| `/en` | English (default) |
| `/fr` | French |
| `/en/users` | Users page (English) |
| `/fr/users` | Users page (French) |

The middleware (`src/middleware.ts`) handles locale detection and redirects.

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Biome lint check
pnpm lint:fix     # Biome lint + auto-fix
pnpm format       # Biome format
pnpm test         # Vitest watch mode
pnpm test:run     # Vitest single run
pnpm test:cov     # Coverage report
```

## Replacing the In-memory Store

The `usersDb` in `src/lib/data/users.ts` simulates a database. To use a real database:

1. Install your ORM (e.g., `pnpm add prisma @prisma/client`)
2. Replace `usersDb` methods with real queries
3. Server Actions and the UsersPage require no changes — they call `usersDb` which is now your real DB client
