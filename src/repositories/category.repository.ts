import { and, asc, eq } from "drizzle-orm";
import { categories } from "../db/schema.js";
import type { Db } from "../db/client.js";

export function createCategoryRepository(db: Db) {
  const owned = (userId: string, id: string) =>
    and(eq(categories.userId, userId), eq(categories.id, id));

  return {
    list(userId: string) {
      return db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId))
        .orderBy(asc(categories.name));
    },

    async findById(userId: string, id: string) {
      const [row] = await db.select().from(categories).where(owned(userId, id)).limit(1);
      return row ?? null;
    },

    async create(userId: string, name: string) {
      const [row] = await db.insert(categories).values({ userId, name }).returning();
      return row;
    },

    async update(userId: string, id: string, name: string) {
      const [row] = await db.update(categories).set({ name }).where(owned(userId, id)).returning();
      return row ?? null;
    },

    async remove(userId: string, id: string) {
      const rows = await db.delete(categories).where(owned(userId, id)).returning({ id: categories.id });
      return rows.length > 0;
    },
  };
}

export type CategoryRepo = ReturnType<typeof createCategoryRepository>;