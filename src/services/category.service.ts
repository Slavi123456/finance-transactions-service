import type { CategoryRepo } from "../repositories/category.repository.js";
import type { CategoryInput } from "../schemas/category.schema.js";
import { AppError } from "../utils/app-error.js";

export function createCategoryService({ categories }: { categories: CategoryRepo }) {
  return {
    async list(userId: string) {
      return { items: await categories.list(userId) };
    },

    create(userId: string, input: CategoryInput) {
      return categories.create(userId, input.name);
    },

    async update(userId: string, id: string, input: CategoryInput) {
      const row = await categories.update(userId, id, input.name);
      if (!row) throw new AppError(404, "Category not found");
      return row;
    },

    async remove(userId: string, id: string) {
      // still has products -> 23503 -> 409 from the error handler
      if (!(await categories.remove(userId, id))) throw new AppError(404, "Category not found");
    },
  };
}

export type CategoryService = ReturnType<typeof createCategoryService>;