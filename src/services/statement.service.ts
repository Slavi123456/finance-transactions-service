import type { PurchaseRepo } from "../repositories/purchase.repository.js";
import { monthRange } from "../utils/dates.js";

export function createStatementService({ purchases }: { purchases: PurchaseRepo }) {
  return {
    async getData(userId: string, month: string) {
      const { from, to } = monthRange(month);
      const rows = await purchases.findInRange(userId, from, to);
      const cents = rows.reduce((sum, p) => sum + Math.round(p.price * 100), 0);
      return { month, purchases: rows, total: cents / 100 };
    },
  };
}

export type StatementService = ReturnType<typeof createStatementService>;
export type StatementData = Awaited<ReturnType<StatementService["getData"]>>;