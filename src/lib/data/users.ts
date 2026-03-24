// In-memory store (simulates a database for demo)
// In production, replace this with a real database client (Prisma, Drizzle, etc.)
//
// Why globalThis? Next.js App Router can re-evaluate modules between Server Action
// calls and Server Component renders (isolated module contexts). A plain `let` variable
// would reset on each evaluation. Storing the array on globalThis makes it a true
// singleton that persists across the Node.js process lifetime — the same pattern
// used for Prisma client in Next.js.
import type { User } from "@/features/users/schemas/user.schema";

const g = globalThis as typeof globalThis & { __users?: User[] };

if (!g.__users) {
  g.__users = [
    { id: "1", name: "Alice Dupont", email: "alice@example.com", role: "Admin" },
    { id: "2", name: "Bob Martin", email: "bob@example.com", role: "User" },
  ];
}

// Accessor keeps the code below identical — all reads/writes go through this reference.
const getStore = () => g.__users as User[];

export const usersDb = {
  getAll: async (): Promise<User[]> => [...getStore()],
  getById: async (id: string): Promise<User | undefined> => getStore().find((u) => u.id === id),
  create: async (input: { name: string; email: string; role: string }): Promise<User> => {
    const newUser: User = { id: crypto.randomUUID(), ...input };
    g.__users = [...getStore(), newUser];
    return newUser;
  },
  update: async (
    id: string,
    input: Partial<{ name: string; email: string; role: string }>,
  ): Promise<User> => {
    const store = getStore();
    const index = store.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    store[index] = { ...store[index], ...input };
    return store[index];
  },
  delete: async (id: string): Promise<void> => {
    g.__users = getStore().filter((u) => u.id !== id);
  },
};
