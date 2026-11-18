import { z } from "zod";
import { fromBeforeTo, fromBeforeToIssue, isoDate } from "./common.js";

const range = { from: isoDate, to: isoDate };

export const rangeQuery = z.object(range).refine(fromBeforeTo, fromBeforeToIssue);

export const spendingQuery = z
  .object({ ...range, groupBy: z.enum(["month"]).optional() })
  .refine(fromBeforeTo, fromBeforeToIssue);

export const cheapestQuery = z
  .object({ ...range, limit: z.coerce.number().int().min(1).max(50).default(10) })
  .refine(fromBeforeTo, fromBeforeToIssue);

export const bestShopsQuery = z.object({ productId: z.uuid() });

export const statementQuery = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
});

export type RangeQuery = z.infer<typeof rangeQuery>;
export type SpendingQuery = z.infer<typeof spendingQuery>;
export type CheapestQuery = z.infer<typeof cheapestQuery>;