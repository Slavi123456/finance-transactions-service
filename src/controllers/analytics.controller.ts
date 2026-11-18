import type { Request, Response } from "express";
import type { AnalyticsService } from "../services/analytics.service.js";
import type { CheapestQuery, RangeQuery, SpendingQuery } from "../schemas/analytics.schema.js";
import { getUserId, validated } from "../utils/http.js";

export function createAnalyticsController(service: AnalyticsService) {
  return {
    spendingByCategory: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: SpendingQuery }>(res);
      res.json(await service.spendingByCategory(getUserId(res), query));
    },

    monthlySummary: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: RangeQuery }>(res);
      res.json(await service.monthlySummary(getUserId(res), query));
    },

    cheapestProducts: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: CheapestQuery }>(res);
      res.json(await service.cheapestProducts(getUserId(res), query));
    },

    priceHistory: async (_req: Request, res: Response) => {
      const { params } = validated<{ params: { id: string } }>(res);
      res.json(await service.priceHistory(getUserId(res), params.id));
    },

    bestShops: async (_req: Request, res: Response) => {
      const { query } = validated<{ query: { productId: string } }>(res);
      res.json(await service.bestShops(getUserId(res), query.productId));
    },
  };
}

export type AnalyticsController = ReturnType<typeof createAnalyticsController>;