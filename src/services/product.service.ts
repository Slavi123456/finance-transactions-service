import type { CategoryRepo } from "../repositories/category.repository.js";
import type { ProductRepo } from "../repositories/product.repository.js";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../schemas/product.schema.js";
import { AppError } from "../utils/app-error.js";

interface Deps {
  products: ProductRepo;
  categories: CategoryRepo;
}

export function createProductService({ products, categories }: Deps) {
  async function assertCategory(userId: string, categoryId: string) {
    if (!(await categories.findById(userId, categoryId))) throw new AppError(404, "Category not found");
  }

  async function get(userId: string, id: string) {
    const row = await products.findById(userId, id);
    if (!row) throw new AppError(404, "Product not found");
    return row;
  }

  return {
    async list(userId: string, query: ListProductsQuery) {
      const { items, total } = await products.list(userId, query);
      return { items, page: query.page, limit: query.limit, total };
    },

    get,

    async create(userId: string, input: CreateProductInput) {
      await assertCategory(userId, input.categoryId);
      const created = await products.create(userId, input);
      return get(userId, created!.id);
    },

    async update(userId: string, id: string, input: UpdateProductInput) {
      if (input.categoryId) await assertCategory(userId, input.categoryId);
      if (!(await products.update(userId, id, input))) throw new AppError(404, "Product not found");
      return get(userId, id);
    },

    async remove(userId: string, id: string) {
      if (!(await products.remove(userId, id))) throw new AppError(404, "Product not found");
    },
  };
}

export type ProductService = ReturnType<typeof createProductService>;