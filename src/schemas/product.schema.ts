import { z } from "zod";
import { nonEmpty, pagination } from "./common.js";

const productBase = z.object({
  name: z.string().trim().min(1).max(100),
  categoryId: z.uuid(),
  description: z.string().trim().max(500).nullable().optional(),
});

export const createProductSchema = productBase;
export const updateProductSchema = productBase.partial().refine(nonEmpty, "Provide at least one field");

export const listProductsQuery = z.object({
  categoryId: z.uuid().optional(),
  search: z.string().trim().max(100).optional(),
  ...pagination,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuery>;