import type { Request, Response } from "express";
import type { PurchaseService } from "../services/purchase.service.js";
import type {
  CreatePurchaseInput,
  ListPurchasesQuery,
  UpdatePurchaseInput,
} from "../schemas/purchase.schema.js";
import { getUserId, validated } from "../utils/http.js";

type IdParams = { params: { id: string } };

export function createPurchaseController(service: PurchaseService) {
  return {
    list: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: ListPurchasesQuery }>(res);
      res.json(await service.list(getUserId(res), query));
    },

    get: async (_req: Request, res: Response) => {
      const { params } = validated<IdParams>(res);
      res.json(await service.get(getUserId(res), params.id));
    },

    create: async (_req: Request, res: Response) => {
      const { body } = validated<{ body: CreatePurchaseInput }>(res);
      res.status(201).json(await service.create(getUserId(res), body));
    },

    update: async (_req: Request, res: Response) => {
      const { params, body } = validated<IdParams & { body: UpdatePurchaseInput }>(res);
      res.json(await service.update(getUserId(res), params.id, body));
    },

    remove: async (_req: Request, res: Response) => {
      const { params } = validated<IdParams>(res);
      await service.remove(getUserId(res), params.id);
      res.status(204).end();
    },
  };
}

export type PurchaseController = ReturnType<typeof createPurchaseController>;