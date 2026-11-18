import { Router } from "express";
import type { PurchaseController } from "../controllers/purchase.controller.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../schemas/common.js";
import {
  createPurchaseSchema,
  listPurchasesQuery,
  updatePurchaseSchema,
} from "../schemas/purchase.schema.js";

export function createPurchaseRouter(c: PurchaseController) {
  const router = Router();
  router.get("/", validate({ query: listPurchasesQuery }), c.list);
  router.post("/", validate({ body: createPurchaseSchema }), c.create);
  router.get("/:id", validate({ params: idParams }), c.get);
  router.patch("/:id", validate({ params: idParams, body: updatePurchaseSchema }), c.update);
  router.delete("/:id", validate({ params: idParams }), c.remove);
  return router;
}