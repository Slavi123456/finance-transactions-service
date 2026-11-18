import type { Request, Response } from "express";
import type { CategoryService } from "../services/category.service.js";
import type { CategoryInput } from "../schemas/category.schema.js";
import { getUserId, validated } from "../utils/http.js";

export function createCategoryController(service: CategoryService) {
  return {
    list: async (_req: Request, res: Response) => {
      res.json(await service.list(getUserId(res)));
    },

    create: async (_req: Request, res: Response) => {
      const { body } = validated<{ body: CategoryInput }>(res);
      res.status(201).json(await service.create(getUserId(res), body));
    },

    update: async (_req: Request, res: Response) => {
      const { params, body } = validated<{ params: { id: string }; body: CategoryInput }>(res);
      res.json(await service.update(getUserId(res), params.id, body));
    },

    remove: async (_req: Request, res: Response) => {
      const { params } = validated<{ params: { id: string } }>(res);
      await service.remove(getUserId(res), params.id);
      res.status(204).end();
    },
  };
}

export type CategoryController = ReturnType<typeof createCategoryController>;