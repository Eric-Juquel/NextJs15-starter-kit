"use server";
/**
 * SERVER ACTIONS
 *
 * Server Actions run exclusively on the server.
 * They can directly access the data layer (DB, filesystem) without going through an API.
 * After mutations, revalidatePath() tells Next.js to invalidate the RSC cache
 * and re-render the Server Components that depend on this data.
 *
 * No fetch(), no API routes — just direct function calls.
 *
 * How it works end-to-end:
 * 1. Client Component calls createUser(input) — looks like a normal function call
 * 2. Next.js serializes the call and sends it to the server via a POST request
 * 3. The function runs on the server, accesses usersDb directly
 * 4. revalidatePath() marks the UsersPage RSC cache as stale
 * 5. On next navigation/refresh, UsersPage re-renders with fresh data
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CreateUserInput, UpdateUserInput, User } from "@/features/users/schemas/user.schema";
import { createUserSchema, updateUserSchema } from "@/features/users/schemas/user.schema";
import { usersDb } from "@/lib/data/users";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createUser(input: CreateUserInput): Promise<ActionResult<User>> {
  const parsed = createUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const user = await usersDb.create(parsed.data);

  // Invalidate the RSC cache for the users page.
  // Next.js will re-render UsersPage (Server Component) on the next request,
  // pulling fresh data from usersDb without any client-side state management.
  revalidatePath("/", "layout");

  return { success: true, data: user };
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<ActionResult<User>> {
  const parsed = updateUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const user = await usersDb.update(id, parsed.data);
    revalidatePath("/", "layout");
    return { success: true, data: user };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user",
    };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    await usersDb.delete(id);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete user",
    };
  }
}
