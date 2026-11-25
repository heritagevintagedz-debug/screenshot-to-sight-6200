import { describe, expect, it } from "vitest";
import { calculateTotal, canTransact, isAllowedPair } from "./model";
describe("Strict exchange rules", () => {
  it.each(["EUR", "USD", "CAD"])("allows %s only against DZD", (currency) => expect(isAllowedPair(currency, "DZD")).toBe(true));
  it.each([["EUR", "USD"], ["USD", "CAD"], ["CAD", "EUR"], ["GBP", "DZD"]])("rejects %s/%s", (a, b) => expect(isAllowedPair(a, b)).toBe(false));
  it("blocks publishing and chat when KYC is required", () => expect(canTransact("required")).toBe(false));
  it("blocks publishing and chat while KYC is pending", () => expect(canTransact("pending")).toBe(false));
  it("unlocks publishing and chat only after verification", () => expect(canTransact("verified")).toBe(true));
  it("calculates the total exclusively in DZD", () => expect(calculateTotal(1200, 258)).toBe(309600));
  it("rejects invalid or non-positive amounts", () => { expect(calculateTotal(-1, 258)).toBe(0); expect(calculateTotal(10, Infinity)).toBe(0); });
});