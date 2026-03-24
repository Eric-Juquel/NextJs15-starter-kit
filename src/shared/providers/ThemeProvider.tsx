"use client";
/**
 * CLIENT COMPONENT — 'use client'
 *
 * Why client? next-themes uses React context and browser APIs (localStorage,
 * matchMedia) to track and apply the user's theme preference.
 *
 * Important RSC composition pattern:
 * ThemeProvider wraps {children} — but those children (Server Components)
 * are NOT re-rendered as client code. React keeps them as server-rendered HTML.
 * This is called "passing Server Components through a Client Component boundary".
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
