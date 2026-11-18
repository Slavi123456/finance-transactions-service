import { z } from "zod";
import { fromBeforeTo, fromBeforeToIssue, isoDate, nonEmpty, pagination } from "./common.js";

const purchaseBase = z.object({
  productId: z.uuid(),
  shop: z.string().trim().max(100).nullable().optional(),
  quantity: z.number().positive().max(9_999_999).nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
  price: z.number().min(0).max(9_999_999_999), 
  purchasedOn: isoDate,
});

export const createPurchaseSchema = purchaseBase;
export const updatePurchaseSchema = purchaseBase.partial().refine(nonEmpty, "Provide at least one field");

export const listPurchasesQuery = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
    productId: z.uuid().optional(),
    categoryId: z.uuid().optional(),
    shop: z.string().trim().max(100).optional(),
    sort: z.enum(["date_desc", "date_asc", "price_desc", "price_asc"]).default("date_desc"),
    ...pagination,
  })
  .refine(fromBeforeTo, fromBeforeToIssue);

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type ListPurchasesQuery = z.infer<typeof listPurchasesQuery>;