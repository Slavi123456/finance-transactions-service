import type { Request, Response } from "express";
import type { ProductService } from "../services/product.service.js";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../schemas/product.schema.js";
import { getUserId, validated } from "../utils/http.js";

type IdParams = { params: { id: string } };

export function createProductController(service: ProductService) {
  return {
    list: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: ListProductsQuery }>(res);
      res.json(await service.list(getUserId(res), query));
    },

    get: async (_req: Request, res: Response) => {
      const { params } = validated<IdParams>(res);
      res.json(await service.get(getUserId(res), params.id));
    },

    create: async (_req: Request, res: Response) => {
      const { body } = validated<{ body: CreateProductInput }>(res);
      res.status(201).json(await service.create(getUserId(res), body));
    },

    update: async (_req: Request, res: Response) => {
      const { params, body } = validated<IdParams & { body: UpdateProductInput }>(res);
      res.json(await service.update(getUserId(res), params.id, body));
    },

    remove: async (_req: Request, res: Response) => {
      const { params } = validated<IdParams>(res);
      await service.remove(getUserId(res), params.id);
      res.status(204).end();
    },
  };
}

export type ProductController = ReturnType<typeof createProductController>;