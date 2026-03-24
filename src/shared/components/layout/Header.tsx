"use client";

/**
 * CLIENT COMPONENT — 'use client'
 *
 * Why client?
 * 1. useTheme (next-themes) reads from React context — client only
 * 2. useLocale / useTranslations here reads locale from client-side context
 * 3. useRouter and usePathname require the browser navigation API
 *
 * The locale switch uses the raw Next.js router to replace the locale prefix
 * in the URL — next-intl v3's navigation helpers can also be used here.
 */

import { Home, Moon, Sun, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "fr" : "en";
    // Replace the locale prefix in the current path and navigate
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-primary"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {t("nav.home")}
          </Link>
          <Link
            href={`/${locale}/users`}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-primary"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            {t("nav.users")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleLocale} aria-label={t("locale.toggle")}>
            {locale === "en" ? "FR" : "EN"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t("theme.toggle")}>
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
