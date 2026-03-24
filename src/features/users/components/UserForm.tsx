"use client";

/**
 * CLIENT COMPONENT — 'use client'
 *
 * Why client? This component:
 * 1. Uses useActionState (React 19 hook) to track form submission state
 * 2. Uses useFormStatus for the submit button's pending state
 * 3. Has interactive form elements that need event handlers
 *
 * The createUser function it calls is a Server Action —
 * the form submission goes directly to the server, no fetch() needed.
 *
 * Pattern: useActionState wraps the Server Action so we get loading/error states
 * without any useState or fetch boilerplate.
 */

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { createUser } from "@/features/users/actions/user.actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type FormState = {
  fieldErrors?: Record<string, string[]>;
  error?: string;
};

// useFormStatus must be in a child component to read the parent <form>'s pending state.
// It cannot be used in the same component that renders the <form>.
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("users");

  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("creating") : t("addUser")}
    </Button>
  );
}

export function UserForm() {
  const t = useTranslations("users");

  async function action(_: FormState, formData: FormData): Promise<FormState> {
    const input = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };

    const result = await createUser(input);

    if (!result.success) {
      return { fieldErrors: result.fieldErrors, error: result.error };
    }

    toast.success(t("success.created"));
    return {};
  }

  const [state, formAction] = useActionState(action, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("addUser")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" placeholder={t("namePlaceholder")} />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} />
            {state.fieldErrors?.email && (
              <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">{t("role")}</Label>
            <Input id="role" name="role" placeholder={t("rolePlaceholder")} />
            {state.fieldErrors?.role && (
              <p className="text-sm text-destructive">{state.fieldErrors.role[0]}</p>
            )}
          </div>

          {state.error && !state.fieldErrors && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
