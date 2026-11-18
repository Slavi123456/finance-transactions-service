import { Router } from "express";
import type { AnalyticsController } from "../controllers/analytics.controller.js";
import { validate } from "../middleware/validate.js";
import { bestShopsQuery, cheapestQuery, rangeQuery, spendingQuery } from "../schemas/analytics.schema.js";
import { idParams } from "../schemas/common.js";

export function createAnalyticsRouter(c: AnalyticsController) {
  const router = Router();
  router.get("/cheapest-products", validate({ query: cheapestQuery }), c.cheapestProducts);
  router.get("/spending-by-category", validate({ query: spendingQuery }), c.spendingByCategory);
  router.get("/monthly-summary", validate({ query: rangeQuery }), c.monthlySummary);
  router.get("/products/:id/price-history", validate({ params: idParams }), c.priceHistory);
  router.get("/best-shops", validate({ query: bestShopsQuery }), c.bestShops);
  return router;
}