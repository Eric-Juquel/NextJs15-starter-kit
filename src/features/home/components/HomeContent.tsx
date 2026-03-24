/**
 * SERVER COMPONENT (default — no 'use client')
 *
 * useTranslations from next-intl works in Server Components too.
 * The translations are loaded server-side; no client JS needed for this component.
 */

import { Code2, FileText, Globe, Moon, Server, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const featureIcons = {
  rsc: Server,
  serverActions: Zap,
  i18n: Globe,
  theme: Moon,
  forms: FileText,
  typescript: Code2,
};

export function HomeContent() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(featureIcons) as Array<keyof typeof featureIcons>).map((key) => {
          const Icon = featureIcons[key];
          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">{t(`features.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(`features.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
