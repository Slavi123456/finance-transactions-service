import { and, asc, count, eq, ilike } from "drizzle-orm";
import { categories, products } from "../db/schema.js";
import type { Db } from "../db/client.js";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../schemas/product.schema.js";

export const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const columns = {
  id: products.id,
  name: products.name,
  description: products.description,
  categoryId: products.categoryId,
  categoryName: categories.name,
  createdAt: products.createdAt,
};

export function createProductRepository(db: Db) {
  const select = () =>
    db
      .select(columns)
      .from(products)
      .innerJoin(
        categories,
        and(eq(categories.id, products.categoryId), eq(categories.userId, products.userId)),
      );

  const owned = (userId: string, id: string) =>
    and(eq(products.userId, userId), eq(products.id, id));

  return {
    async list(userId: string, f: ListProductsQuery) {
      const where = and(
        eq(products.userId, userId),
        f.categoryId ? eq(products.categoryId, f.categoryId) : undefined,
        f.search ? ilike(products.name, `%${escapeLike(f.search)}%`) : undefined,
      );

      const [items, [totals]] = await Promise.all([
        select()
          .where(where)
          .orderBy(asc(products.name))
          .limit(f.limit)
          .offset((f.page - 1) * f.limit),
        db.select({ total: count() }).from(products).where(where),
      ]);

      return { items, total: totals?.total ?? 0 };
    },

    async findById(userId: string, id: string) {
      const [row] = await select().where(owned(userId, id)).limit(1);
      return row ?? null;
    },

    async create(userId: string, data: CreateProductInput) {
      const [row] = await db.insert(products).values({ ...data, userId }).returning({ id: products.id });
      return row;
    },

    async update(userId: string, id: string, data: UpdateProductInput) {
      const rows = await db
        .update(products)
        .set(data)
        .where(owned(userId, id))
        .returning({ id: products.id });
      return rows.length > 0;
    },

    async remove(userId: string, id: string) {
      const rows = await db.delete(products).where(owned(userId, id)).returning({ id: products.id });
      return rows.length > 0;
    },
  };
}

export type ProductRepo = ReturnType<typeof createProductRepository>;