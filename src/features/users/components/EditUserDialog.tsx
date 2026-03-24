"use client";

/**
 * CLIENT COMPONENT — 'use client'
 *
 * Why client? Dialog open/close state and React Hook Form both require
 * client-side interactivity. useState and useForm are client-only hooks.
 *
 * updateUser is a Server Action called directly from this client component.
 * The call looks synchronous in code but Next.js handles the server round-trip
 * transparently — no manual fetch() or API endpoint needed.
 *
 * After a successful update, revalidatePath in the Server Action causes
 * the parent UsersPage (Server Component) to re-render with fresh data.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateUser } from "@/features/users/actions/user.actions";
import {
  type CreateUserInput,
  createUserSchema,
  type User,
} from "@/features/users/schemas/user.schema";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface EditUserDialogProps {
  readonly user: User;
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const t = useTranslations("users");
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: user.name, email: user.email, role: user.role },
  });

  const onSubmit = async (data: CreateUserInput) => {
    const result = await updateUser(user.id, data);
    if (!result.success) {
      toast.error(t("errors.updateFailed"));
      return;
    }
    toast.success(t("success.updated"));
    setOpen(false);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      reset({ name: user.name, email: user.email, role: user.role });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={t("editUser")}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">{t("name")}</Label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-email">{t("email")}</Label>
              <Input id="edit-email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role">{t("role")}</Label>
              <Input id="edit-role" {...register("role")} />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
