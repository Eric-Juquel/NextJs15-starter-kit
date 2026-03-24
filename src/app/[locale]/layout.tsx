import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { Header } from "@/shared/components/layout/Header";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";

interface LocaleLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Pre-generate all locale routes at build time (static params).
 * Without this, [locale] segments are rendered on-demand only.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Locale root layout — owns <html lang={locale}> so the lang attribute
 * is always correct for the active locale (not hardcoded to "en").
 *
 * This is the "multiple root layouts" pattern: the parent app/layout.tsx
 * is a minimal pass-through, and each locale segment defines its own root.
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // getMessages() runs on the server — translations fetched and passed
  // to NextIntlClientProvider so Client Components can use useTranslations()
  const messages = await getMessages();

  return (
    /*
     * suppressHydrationWarning on <html> prevents React from warning about
     * the class attribute mismatch caused by next-themes injecting "dark"/"light"
     * before hydration.
     */
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/*
         * ThemeProvider is a Client Component (wraps next-themes).
         * children (Server Components) are passed as props —
         * they are NOT re-rendered as client components.
         * This is the "server component in client component" composition pattern.
         */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/*
           * NextIntlClientProvider makes translations available to Client Components.
           * Server Components use getTranslations() directly — no provider needed there.
           */}
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Toaster richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
