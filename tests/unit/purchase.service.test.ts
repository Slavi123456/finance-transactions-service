import { describe, expect, it } from "vitest";
import type { ProductRepo } from "../../src/repositories/product.repository.js";
import type { PurchaseRepo } from "../../src/repositories/purchase.repository.js";
import { createPurchaseService } from "../../src/services/purchase.service.js";

describe("purchase service", () => {
  it("rejects a purchase for a product the user does not own", async () => {
    const products = { findById: async () => null } as unknown as ProductRepo;
    const purchases = {
      create: () => {
        throw new Error("must not be called");
      },
    } as unknown as PurchaseRepo;

    const service = createPurchaseService({ purchases, products });

    await expect(
      service.create("user-1", { productId: crypto.randomUUID(), price: 1, purchasedOn: "2026-01-01" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});