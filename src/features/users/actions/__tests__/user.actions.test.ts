/**
 * Unit tests for user Server Actions.
 *
 * We mock revalidatePath (Next.js cache) and usersDb to isolate
 * the action logic — validation, error handling, and success paths.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUser, deleteUser, updateUser } from "../user.actions";

// Mock next/cache — revalidatePath is a Next.js server primitive
// that doesn't exist in the Vitest/jsdom environment.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock the in-memory DB so tests don't share state
vi.mock("@/lib/data/users", () => ({
  usersDb: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

import { revalidatePath } from "next/cache";
import { usersDb } from "@/lib/data/users";

const mockRevalidatePath = vi.mocked(revalidatePath);
const mockUsersDb = vi.mocked(usersDb);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createUser ──────────────────────────────────────────────────────────────

describe("createUser", () => {
  it("returns success with the new user when input is valid", async () => {
    const newUser = {
      id: "abc-123",
      name: "Carol White",
      email: "carol@example.com",
      role: "Editor",
    };
    mockUsersDb.create.mockResolvedValue(newUser);

    const result = await createUser({
      name: "Carol White",
      email: "carol@example.com",
      role: "Editor",
    });

    expect(result).toEqual({ success: true, data: newUser });
    expect(mockUsersDb.create).toHaveBeenCalledOnce();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/[locale]/users", "page");
  });

  it("returns validation error when name is too short", async () => {
    const result = await createUser({
      name: "A", // min 2 chars
      email: "carol@example.com",
      role: "Editor",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed");
      expect(result.fieldErrors?.name).toBeDefined();
    }
    expect(mockUsersDb.create).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid email", async () => {
    const result = await createUser({
      name: "Carol White",
      email: "not-an-email",
      role: "Editor",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
    expect(mockUsersDb.create).not.toHaveBeenCalled();
  });

  it("returns validation error when role is empty", async () => {
    const result = await createUser({
      name: "Carol White",
      email: "carol@example.com",
      role: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.role).toBeDefined();
    }
  });
});

// ─── updateUser ──────────────────────────────────────────────────────────────

describe("updateUser", () => {
  it("returns success with updated user when input is valid", async () => {
    const updatedUser = {
      id: "1",
      name: "Alice Updated",
      email: "alice@example.com",
      role: "Admin",
    };
    mockUsersDb.update.mockResolvedValue(updatedUser);

    const result = await updateUser("1", { name: "Alice Updated" });

    expect(result).toEqual({ success: true, data: updatedUser });
    expect(mockUsersDb.update).toHaveBeenCalledWith("1", { name: "Alice Updated" });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/[locale]/users", "page");
  });

  it("returns validation error when email format is invalid", async () => {
    const result = await updateUser("1", { email: "bad-email" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
    expect(mockUsersDb.update).not.toHaveBeenCalled();
  });

  it("returns error when user is not found", async () => {
    mockUsersDb.update.mockRejectedValue(new Error("User not found"));

    const result = await updateUser("999", { name: "Nobody" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("User not found");
    }
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});

// ─── deleteUser ──────────────────────────────────────────────────────────────

describe("deleteUser", () => {
  it("returns success and revalidates path on deletion", async () => {
    mockUsersDb.delete.mockResolvedValue(undefined);

    const result = await deleteUser("1");

    expect(result).toEqual({ success: true });
    expect(mockUsersDb.delete).toHaveBeenCalledWith("1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/[locale]/users", "page");
  });

  it("returns error when deletion fails", async () => {
    mockUsersDb.delete.mockRejectedValue(new Error("Deletion failed"));

    const result = await deleteUser("999");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Deletion failed");
    }
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
