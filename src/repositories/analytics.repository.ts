import { sql } from "drizzle-orm";
import type { Db } from "../db/client.js";

type CategoryTotal = { category: string; total: number };
type CategoryMonthTotal = { month: string; category: string; total: number };
type MonthSummary = { month: string; total: number; count: number; change: number | null };
type CheapestRow = { category: string; month: string; product: string; min_price: number; price_rank: number };
type PricePoint = { purchased_on: string; price: number; shop: string | null };
type ShopStats = { shop: string; avg_price: number; min_price: number; purchases: number };

export function createAnalyticsRepository(db: Db) {
  return {
    async spendingByCategory(userId: string, from: string, to: string) {
      const result = await db.execute<CategoryTotal>(sql`
        SELECT c.name AS category, SUM(pu.price)::float8 AS total
        FROM purchases pu
        JOIN products   p ON p.id = pu.product_id AND p.user_id = pu.user_id
        JOIN categories c ON c.id = p.category_id AND c.user_id = p.user_id
        WHERE pu.user_id = ${userId}::uuid
          AND pu.purchased_on BETWEEN ${from}::date AND ${to}::date
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `);
      return result.rows;
    },

    async spendingByCategoryAndMonth(userId: string, from: string, to: string) {
      const result = await db.execute<CategoryMonthTotal>(sql`
        SELECT to_char(date_trunc('month', pu.purchased_on), 'YYYY-MM') AS month,
               c.name AS category,
               SUM(pu.price)::float8 AS total
        FROM purchases pu
        JOIN products   p ON p.id = pu.product_id AND p.user_id = pu.user_id
        JOIN categories c ON c.id = p.category_id AND c.user_id = p.user_id
        WHERE pu.user_id = ${userId}::uuid
          AND pu.purchased_on BETWEEN ${from}::date AND ${to}::date
        GROUP BY 1, c.id, c.name
        ORDER BY 1, total DESC
      `);
      return result.rows;
    },

    // "change" compares with the previous month inside the requested range,
    // so the first month always has change = null. Ask for one extra month to see its change.
    async monthlySummary(userId: string, from: string, to: string) {
      const result = await db.execute<MonthSummary>(sql`
        WITH m AS (
          SELECT date_trunc('month', purchased_on) AS month,
                 SUM(price) AS total,
                 COUNT(*)   AS purchases
          FROM purchases
          WHERE user_id = ${userId}::uuid
            AND purchased_on BETWEEN ${from}::date AND ${to}::date
          GROUP BY 1
        )
        SELECT to_char(month, 'YYYY-MM') AS month,
               total::float8 AS total,
               purchases::int AS count,
               (total - LAG(total) OVER (ORDER BY month))::float8 AS change
        FROM m
        ORDER BY month
      `);
      return result.rows;
    },

    async cheapestProducts(userId: string, from: string, to: string, limit: number) {
      const result = await db.execute<CheapestRow>(sql`
        SELECT category, month, product, minPrice, price_rank::int AS priceRank
        FROM cheapest_products_by_month(${userId}::uuid, ${from}::date, ${to}::date, ${limit}::int)
      `);
      return result.rows;
    },

    async priceHistory(userId: string, productId: string) {
      const result = await db.execute<PricePoint>(sql`
        SELECT to_char(purchased_on, 'YYYY-MM-DD') AS purchasedOn, price::float8 AS price, shop
        FROM purchases
        WHERE user_id = ${userId}::uuid AND product_id = ${productId}::uuid
        ORDER BY purchased_on, created_at
      `);
      return result.rows;
    },

    async bestShops(userId: string, productId: string) {
      const result = await db.execute<ShopStats>(sql`
        SELECT shop,
               AVG(price)::float8 AS avgPrice,
               MIN(price)::float8 AS minPrice,
               COUNT(*)::int      AS purchases
        FROM purchases
        WHERE user_id = ${userId}::uuid AND product_id = ${productId}::uuid AND shop IS NOT NULL
        GROUP BY shop
        ORDER BY avg_price
      `);
      return result.rows;
    },
  };
}

export type AnalyticsRepo = ReturnType<typeof createAnalyticsRepository>;