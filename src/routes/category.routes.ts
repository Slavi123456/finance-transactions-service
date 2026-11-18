import { Router } from "express";
import type { CategoryController } from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.js";
import { categorySchema } from "../schemas/category.schema.js";
import { idParams } from "../schemas/common.js";

export function createCategoryRouter(c: CategoryController) {
  const router = Router();
  router.get("/", c.list);
  router.post("/", validate({ body: categorySchema }), c.create);
  router.patch("/:id", validate({ params: idParams, body: categorySchema }), c.update);
  router.delete("/:id", validate({ params: idParams }), c.remove);
  return router;
}