import { and, asc, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { products, purchases } from "../db/schema.js";
import type { Db } from "../db/client.js";
import { escapeLike } from "./product.repository.js";
import type {
  CreatePurchaseInput,
  ListPurchasesQuery,
  UpdatePurchaseInput,
} from "../schemas/purchase.schema.js";

const columns = {
  id: purchases.id,
  productId: purchases.productId,
  productName: products.name,
  categoryId: products.categoryId,
  shop: purchases.shop,
  quantity: purchases.quantity,
  unit: purchases.unit,
  price: purchases.price,
  purchasedOn: purchases.purchasedOn,
  createdAt: purchases.createdAt,
};

const ORDER = {
  date_desc: [desc(purchases.purchasedOn), desc(purchases.createdAt)],
  date_asc: [asc(purchases.purchasedOn), asc(purchases.createdAt)],
  price_desc: [desc(purchases.price), desc(purchases.purchasedOn)],
  price_asc: [asc(purchases.price), desc(purchases.purchasedOn)],
};

type Filters = Pick<ListPurchasesQuery, "from" | "to" | "productId" | "categoryId" | "shop">;

export function createPurchaseRepository(db: Db) {
  const select = () =>
    db
      .select(columns)
      .from(purchases)
      .innerJoin(
        products,
        and(eq(products.id, purchases.productId), eq(products.userId, purchases.userId)),
      );

  const owned = (userId: string, id: string) =>
    and(eq(purchases.userId, userId), eq(purchases.id, id));

  const filtered = (userId: string, f: Filters) =>
    and(
      eq(purchases.userId, userId),
      f.from ? gte(purchases.purchasedOn, f.from) : undefined,
      f.to ? lte(purchases.purchasedOn, f.to) : undefined,
      f.productId ? eq(purchases.productId, f.productId) : undefined,
      f.categoryId ? eq(products.categoryId, f.categoryId) : undefined,
      f.shop ? ilike(purchases.shop, `%${escapeLike(f.shop)}%`) : undefined,
    );

  return {
    async list(userId: string, f: ListPurchasesQuery) {
      const where = filtered(userId, f);

      const [items, [totals]] = await Promise.all([
        select()
          .where(where)
          .orderBy(...ORDER[f.sort])
          .limit(f.limit)
          .offset((f.page - 1) * f.limit),
        // the count query needs the same join, because categoryId is a column of products
        db
          .select({ total: count() })
          .from(purchases)
          .innerJoin(
            products,
            and(eq(products.id, purchases.productId), eq(products.userId, purchases.userId)),
          )
          .where(where),
      ]);

      return { items, total: totals?.total ?? 0 };
    },

    findInRange(userId: string, from: string, to: string) {
      return select()
        .where(filtered(userId, { from, to }))
        .orderBy(asc(purchases.purchasedOn), asc(purchases.createdAt));
    },

    async findById(userId: string, id: string) {
      const [row] = await select().where(owned(userId, id)).limit(1);
      return row ?? null;
    },

    async create(userId: string, data: CreatePurchaseInput) {
      const [row] = await db
        .insert(purchases)
        .values({ ...data, userId })
        .returning({ id: purchases.id });
      return row;
    },

    async update(userId: string, id: string, data: UpdatePurchaseInput) {
      const rows = await db
        .update(purchases)
        .set(data)
        .where(owned(userId, id))
        .returning({ id: purchases.id });
      return rows.length > 0;
    },

    async remove(userId: string, id: string) {
      const rows = await db.delete(purchases).where(owned(userId, id)).returning({ id: purchases.id });
      return rows.length > 0;
    },
  };
}

export type PurchaseRepo = ReturnType<typeof createPurchaseRepository>;