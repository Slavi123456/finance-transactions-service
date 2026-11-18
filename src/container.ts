import { db } from "./db/client.js";
import { createAnalyticsController } from "./controllers/analytics.controller.js";
import { createCategoryController } from "./controllers/category.controller.js";
import { createExportController } from "./controllers/export.controller.js";
import { createProductController } from "./controllers/product.controller.js";
import { createPurchaseController } from "./controllers/purchase.controller.js";
import { createAnalyticsRepository } from "./repositories/analytics.repository.js";
import { createCategoryRepository } from "./repositories/category.repository.js";
import { createProductRepository } from "./repositories/product.repository.js";
import { createPurchaseRepository } from "./repositories/purchase.repository.js";
import { createV1Router } from "./routes/index.js";
import { createAnalyticsService } from "./services/analytics.service.js";
import { createCategoryService } from "./services/category.service.js";
import { createProductService } from "./services/product.service.js";
import { createPurchaseService } from "./services/purchase.service.js";
import { createStatementService } from "./services/statement.service.js";

const categoryRepo = createCategoryRepository(db);
const productRepo = createProductRepository(db);
const purchaseRepo = createPurchaseRepository(db);
const analyticsRepo = createAnalyticsRepository(db);

export const v1Router = createV1Router({
  categories: createCategoryController(createCategoryService({ categories: categoryRepo })),
  products: createProductController(
    createProductService({ products: productRepo, categories: categoryRepo }),
  ),
  purchases: createPurchaseController(
    createPurchaseService({ purchases: purchaseRepo, products: productRepo }),
  ),
  analytics: createAnalyticsController(
    createAnalyticsService({ analytics: analyticsRepo, products: productRepo }),
  ),
  exports: createExportController(createStatementService({ purchases: purchaseRepo })),
});