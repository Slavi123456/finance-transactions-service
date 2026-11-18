import { Router } from "express";
import type { ProductController } from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../schemas/common.js";
import { createProductSchema, listProductsQuery, updateProductSchema } from "../schemas/product.schema.js";

export function createProductRouter(c: ProductController) {
  const router = Router();
  router.get("/", validate({ query: listProductsQuery }), c.list);
  router.post("/", validate({ body: createProductSchema }), c.create);
  router.get("/:id", validate({ params: idParams }), c.get);
  router.patch("/:id", validate({ params: idParams, body: updateProductSchema }), c.update);
  router.delete("/:id", validate({ params: idParams }), c.remove);
  return router;
}