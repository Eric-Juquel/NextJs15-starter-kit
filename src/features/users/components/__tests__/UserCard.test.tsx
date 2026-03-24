/**
 * Unit tests for UserCard component.
 *
 * UserCard is a Client Component that:
 * - Renders user data (name, email, role)
 * - Provides edit and delete buttons
 * - Shows loading state (opacity) while delete is pending
 *
 * We mock:
 * - next-intl (useTranslations) — no i18n provider needed in unit tests
 * - sonner (toast) — prevent side effects
 * - Server Actions — prevent actual server calls
 * - EditUserDialog — isolate UserCard from its children
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/features/users/schemas/user.schema";
import { UserCard } from "../UserCard";

// Mock next-intl — useTranslations returns a simple key-lookup function
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "success.deleted": "User deleted successfully",
      "errors.deleteFailed": "Failed to delete user",
      deleteUser: "Delete User",
      editUser: "Edit User",
    };
    return translations[key] ?? key;
  },
}));

// Mock sonner toasts — no side effects
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Server Actions — they require a Next.js server environment
vi.mock("@/features/users/actions/user.actions", () => ({
  deleteUser: vi.fn(),
}));

// Mock EditUserDialog — focus unit test on UserCard only
vi.mock("../EditUserDialog", () => ({
  EditUserDialog: () => <button type="button" aria-label="Edit User" />,
}));

import { toast } from "sonner";
import { deleteUser } from "@/features/users/actions/user.actions";

const mockDeleteUser = vi.mocked(deleteUser);
const mockToast = vi.mocked(toast);

const mockUser: User = {
  id: "1",
  name: "Alice Dupont",
  email: "alice@example.com",
  role: "Admin",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UserCard", () => {
  it("renders user name, email and role", () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText("Alice Dupont")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders delete button with correct aria-label", () => {
    render(<UserCard user={mockUser} />);

    const deleteButton = screen.getByRole("button", { name: "Delete User" });
    expect(deleteButton).toBeInTheDocument();
  });

  it("calls deleteUser and shows success toast when delete succeeds", async () => {
    mockDeleteUser.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<UserCard user={mockUser} />);

    await user.click(screen.getByRole("button", { name: "Delete User" }));

    expect(mockDeleteUser).toHaveBeenCalledWith("1");
    expect(mockToast.success).toHaveBeenCalledWith("User deleted successfully");
  });

  it("shows error toast when delete fails", async () => {
    mockDeleteUser.mockResolvedValue({ success: false, error: "Server error" });
    const user = userEvent.setup();

    render(<UserCard user={mockUser} />);

    await user.click(screen.getByRole("button", { name: "Delete User" }));

    expect(mockDeleteUser).toHaveBeenCalledWith("1");
    expect(mockToast.error).toHaveBeenCalledWith("Failed to delete user");
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it("renders all user data from props correctly", () => {
    const anotherUser: User = {
      id: "2",
      name: "Bob Martin",
      email: "bob@example.com",
      role: "Developer",
    };

    render(<UserCard user={anotherUser} />);

    expect(screen.getByText("Bob Martin")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });
});
