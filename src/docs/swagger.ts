import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import type { ZodObject, ZodType } from "zod";
import { bestShopsQuery, cheapestQuery, rangeQuery, spendingQuery, statementQuery } from "../schemas/analytics.schema.js";
import { categorySchema } from "../schemas/category.schema.js";
import { idParams } from "../schemas/common.js";
import { createProductSchema, listProductsQuery, updateProductSchema } from "../schemas/product.schema.js";
import { createPurchaseSchema, listPurchasesQuery, updatePurchaseSchema } from "../schemas/purchase.schema.js";

const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});


interface RouteDoc {
  method: "get" | "post" | "patch" | "delete";
  path: string; // relative to the server URL /api/v1, params as {id}
  tag: string;
  summary: string;
  params?: ZodObject;
  query?: ZodObject;
  body?: ZodType;
  ok?: number;
}

function doc(r: RouteDoc) {
  registry.registerPath({
    method: r.method,
    path: r.path,
    tags: [r.tag],
    summary: r.summary,
    security: [{ [bearerAuth.name]: [] }],
    request: {
      ...(r.params && { params: r.params }),
      ...(r.query && { query: r.query }),
      ...(r.body && { body: { content: { "application/json": { schema: r.body } } } }),
    },
    responses: {
      [r.ok ?? 200]: { description: "Success" },
      400: { description: "Validation failed" },
      401: { description: "Missing or invalid access token" },
      404: { description: "Not found (also returned for another user's data)" },
    },
  });
}

doc({ method: "get", path: "/categories", tag: "categories", summary: "List categories" });
doc({ method: "post", path: "/categories", tag: "categories", summary: "Create a category", body: categorySchema, ok: 201 });
doc({ method: "patch", path: "/categories/{id}", tag: "categories", summary: "Rename a category", params: idParams, body: categorySchema });
doc({ method: "delete", path: "/categories/{id}", tag: "categories", summary: "Delete a category (409 if it has products)", params: idParams, ok: 204 });

doc({ method: "get", path: "/products", tag: "products", summary: "List products", query: listProductsQuery });
doc({ method: "post", path: "/products", tag: "products", summary: "Create a product", body: createProductSchema, ok: 201 });
doc({ method: "get", path: "/products/{id}", tag: "products", summary: "Get a product", params: idParams });
doc({ method: "patch", path: "/products/{id}", tag: "products", summary: "Update a product", params: idParams, body: updateProductSchema });
doc({ method: "delete", path: "/products/{id}", tag: "products", summary: "Delete a product (409 if it has purchases)", params: idParams, ok: 204 });

doc({ method: "get", path: "/purchases", tag: "purchases", summary: "List purchases", query: listPurchasesQuery });
doc({ method: "post", path: "/purchases", tag: "purchases", summary: "Create a purchase", body: createPurchaseSchema, ok: 201 });
doc({ method: "get", path: "/purchases/{id}", tag: "purchases", summary: "Get a purchase", params: idParams });
doc({ method: "patch", path: "/purchases/{id}", tag: "purchases", summary: "Update a purchase", params: idParams, body: updatePurchaseSchema });
doc({ method: "delete", path: "/purchases/{id}", tag: "purchases", summary: "Delete a purchase", params: idParams, ok: 204 });

doc({ method: "get", path: "/analytics/cheapest-products", tag: "analytics", summary: "Cheapest products per category and month", query: cheapestQuery });
doc({ method: "get", path: "/analytics/spending-by-category", tag: "analytics", summary: "Spending per category (optionally per month)", query: spendingQuery });
doc({ method: "get", path: "/analytics/monthly-summary", tag: "analytics", summary: "Monthly totals with change versus the previous month", query: rangeQuery });
doc({ method: "get", path: "/analytics/products/{id}/price-history", tag: "analytics", summary: "Price history of one product", params: idParams });
doc({ method: "get", path: "/analytics/best-shops", tag: "analytics", summary: "Shops ranked by average price for a product", query: bestShopsQuery });

doc({ method: "get", path: "/exports/statement.pdf", tag: "exports", summary: "Monthly statement as PDF", query: statementQuery });

export function mountDocs(app: Express) {
  const document = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.0",
    info: { title: "Finance Transactions Service", version: "1.0.0" },
    servers: [{ url: "/api/" }],
  });

  app.get("/docs.json", (_req, res) => res.json(document));
  if (process.env.NODE_ENV !== "production") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
  }
}