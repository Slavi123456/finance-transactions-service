import { sql } from "drizzle-orm";
import {check, date, foreignKey, index, numeric, pgTable, text, timestamp, unique, uuid} from "drizzle-orm/pg-core";

const createdAt = timestamp('created_at', {withTimezone: true}).notNull().defaultNow();

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  created_at: createdAt
}, (t) => [
    unique("categories_user_name_uq").on(t.userId, t.name),
    unique("categories_id_user_uq").on(t.id, t.userId)
]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  categoryId: uuid("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: createdAt
}, (t) => [
    unique().on(t.userId, t.name),
    unique().on(t.id, t.userId),
    foreignKey({
        name: "products_category_user_fk",
        columns: [t.categoryId, t.userId],
        foreignColumns: [categories.id, categories.userId]
    }).onDelete('set null'),
   index("products_category_idx").on(t.categoryId)
]);

export const purchases = pgTable('purchases', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    productId: uuid("product_id").notNull(),
    shop: text("shop"),
    quantity: numeric("quantity", {precision: 10, scale: 3, mode:"number"}),
    unit: text("unit"),
    price: numeric("price", {precision: 12, scale: 2, mode:"number"}).notNull(),
    purchasedOn: date("purchased_on", { mode:"string"}).notNull(),
    createdAt: createdAt
},
    (t) => [
        foreignKey({
          name: "purchases_product_user_fk",
          columns: [t.productId, t.userId],
          foreignColumns: [products.id, products.userId]  
        }).onDelete('restrict'),
        check("purchases_price_nonneg", sql`${t.price} >= 0`),
        index("purchases_user_date_idx").on(t.userId, t.purchasedOn),
        index("purchases_product_idx").on(t.productId)
    ]
);

