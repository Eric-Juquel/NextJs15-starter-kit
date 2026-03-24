"use client";
/**
 * CLIENT COMPONENT — 'use client'
 *
 * Error boundaries MUST be Client Components in Next.js App Router.
 * This component catches errors thrown by UsersPage and its children,
 * and provides a way to retry the failed render.
 */

import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";

interface ErrorProps {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}

export default function UsersError({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold text-destructive">{t("error")}</h2>
      <p className="text-muted-foreground">{error.message || t("errorDescription")}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
