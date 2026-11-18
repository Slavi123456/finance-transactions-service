import type { ProductRepo } from "../repositories/product.repository.js";
import type { PurchaseRepo } from "../repositories/purchase.repository.js";
import type {
  CreatePurchaseInput,
  ListPurchasesQuery,
  UpdatePurchaseInput,
} from "../schemas/purchase.schema.js";
import { AppError } from "../utils/app-error.js";

interface Deps {
  purchases: PurchaseRepo;
  products: ProductRepo;
}

export function createPurchaseService({ purchases, products }: Deps) {
  async function assertProduct(userId: string, productId: string) {
    if (!(await products.findById(userId, productId))) throw new AppError(404, "Product not found");
  }

  async function get(userId: string, id: string) {
    const row = await purchases.findById(userId, id);
    if (!row) throw new AppError(404, "Purchase not found");
    return row;
  }

  return {
    async list(userId: string, query: ListPurchasesQuery) {
      const { items, total } = await purchases.list(userId, query);
      return { items, page: query.page, limit: query.limit, total };
    },

    get,

    async create(userId: string, input: CreatePurchaseInput) {
      // The composite FK would also catch this, but only with an unhelpful 409
      await assertProduct(userId, input.productId);
      const created = await purchases.create(userId, input);
      if (!created) throw new AppError(500, "Could not create purchase");
      return get(userId, created.id);
    },

    async update(userId: string, id: string, input: UpdatePurchaseInput) {
      if (input.productId) await assertProduct(userId, input.productId);
      if (!(await purchases.update(userId, id, input))) throw new AppError(404, "Purchase not found");
      return get(userId, id);
    },

    async remove(userId: string, id: string) {
      if (!(await purchases.remove(userId, id))) throw new AppError(404, "Purchase not found");
    },
  };
}

export type PurchaseService = ReturnType<typeof createPurchaseService>;