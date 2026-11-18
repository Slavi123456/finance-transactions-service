import { expect, it } from "vitest";
import { monthRange } from "../../src/utils/dates.js";

it("computes the first and last day of a month", () => {
  expect(monthRange("2026-02")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  expect(monthRange("2028-02")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  expect(monthRange("2026-12")).toEqual({ from: "2026-12-01", to: "2026-12-31" });
});