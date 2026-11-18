import type { AnalyticsRepo } from "../repositories/analytics.repository.js";
import type { ProductRepo } from "../repositories/product.repository.js";
import type { CheapestQuery, RangeQuery, SpendingQuery } from "../schemas/analytics.schema.js";
import { AppError } from "../utils/app-error.js";

interface Deps {
  analytics: AnalyticsRepo;
  products: ProductRepo;
}

export function createAnalyticsService({ analytics, products }: Deps) {
  async function assertProduct(userId: string, productId: string) {
    if (!(await products.findById(userId, productId))) throw new AppError(404, "Product not found");
  }

  return {
    spendingByCategory(userId: string, q: SpendingQuery) {
      return q.groupBy === "month"
        ? analytics.spendingByCategoryAndMonth(userId, q.from, q.to)
        : analytics.spendingByCategory(userId, q.from, q.to);
    },

    monthlySummary: (userId: string, q: RangeQuery) => analytics.monthlySummary(userId, q.from, q.to),

    async cheapestProducts(userId: string, q: CheapestQuery) {
      const rows = await analytics.cheapestProducts(userId, q.from, q.to, q.limit);
      return rows.map((r) => ({
        category: r.category,
        month: r.month,
        product: r.product,
        minPrice: r.min_price,
        rank: r.price_rank,
      }));
    },

    async priceHistory(userId: string, productId: string) {
      await assertProduct(userId, productId);
      const rows = await analytics.priceHistory(userId, productId);
      return rows.map((r) => ({ purchasedOn: r.purchased_on, price: r.price, shop: r.shop }));
    },

    async bestShops(userId: string, productId: string) {
      await assertProduct(userId, productId);
      const rows = await analytics.bestShops(userId, productId);
      return rows.map((r) => ({
        shop: r.shop,
        avgPrice: r.avg_price,
        minPrice: r.min_price,
        purchases: r.purchases,
      }));
    },
  };
}

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;