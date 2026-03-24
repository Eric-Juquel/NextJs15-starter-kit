"use client";

/**
 * CLIENT COMPONENT — 'use client'
 *
 * Why client? onClick handlers for the delete button require client-side
 * interactivity. useTransition gives us a pending state while the Server
 * Action is running, so we can show visual feedback (opacity).
 *
 * Key RSC insight: we do NOT manage the users list in local state.
 * After deleteUser runs, revalidatePath() causes the parent UsersPage
 * (Server Component) to re-fetch and re-render with the updated list.
 * The Client Component just triggers the mutation — the Server Component
 * owns the data.
 */

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteUser } from "@/features/users/actions/user.actions";
import type { User } from "@/features/users/schemas/user.schema";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { EditUserDialog } from "./EditUserDialog";

interface UserCardProps {
  readonly user: User;
}

export function UserCard({ user }: UserCardProps) {
  const t = useTranslations("users");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (!result.success) {
        toast.error(t("errors.deleteFailed"));
        return;
      }
      toast.success(t("success.deleted"));
      // No need to update local state here.
      // revalidatePath() in the Server Action will cause UsersPage
      // (the parent Server Component) to re-render with fresh data.
    });
  };

  return (
    <Card className={isPending ? "opacity-50 pointer-events-none" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
        <div className="flex gap-1">
          <EditUserDialog user={user} />
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={t("deleteUser")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-1 text-xs font-medium text-primary">{user.role}</p>
      </CardContent>
    </Card>
  );
}
