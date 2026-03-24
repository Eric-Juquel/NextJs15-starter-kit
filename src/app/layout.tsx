import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js 15 Starter — RSC First",
  description: "A production-ready RSC-first frontend starter kit with Next.js 15",
};

/**
 * Minimal root layout — no <html>/<body> here.
 *
 * Each [locale]/layout.tsx owns its own <html lang={locale}> root,
 * following the "multiple root layouts" pattern from the Next.js docs.
 * This lets the lang attribute be dynamic and locale-aware instead of
 * being hardcoded to "en".
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-groups#creating-multiple-root-layouts
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
