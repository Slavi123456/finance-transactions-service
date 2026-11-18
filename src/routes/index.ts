import { Router } from "express";
import type { AnalyticsController } from "../controllers/analytics.controller.js";
import type { CategoryController } from "../controllers/category.controller.js";
import type { ExportController } from "../controllers/export.controller.js";
import type { ProductController } from "../controllers/product.controller.js";
import type { PurchaseController } from "../controllers/purchase.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { statementQuery } from "../schemas/analytics.schema.js";
import { createAnalyticsRouter } from "./analytics.routes.js";
import { createCategoryRouter } from "./category.routes.js";
import { createProductRouter } from "./product.routes.js";
import { createPurchaseRouter } from "./purchase.routes.js";

export interface Controllers {
  categories: CategoryController;
  products: ProductController;
  purchases: PurchaseController;
  analytics: AnalyticsController;
  exports: ExportController;
}

export function createV1Router(c: Controllers) {
  const router = Router();

  router.use(authenticate); // every v1 route requires a valid token

  router.use("/categories", createCategoryRouter(c.categories));
  router.use("/products", createProductRouter(c.products));
  router.use("/purchases", createPurchaseRouter(c.purchases));
  router.use("/analytics", createAnalyticsRouter(c.analytics));
  router.get("/exports/statement.pdf", validate({ query: statementQuery }), c.exports.statement);

  return router;
}