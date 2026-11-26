import { describe, expect, it } from "vitest";
import { calculateTotal, canTransact, isAllowedPair, convertAmount, validTradeAmount, offerAction } from "./model";
describe("Strict exchange rules", () => {
  it("converts 100 EUR to 25800 DZD at a rate of 258", () => expect(convertAmount(100, "foreign", 258)).toEqual({ foreign: 100, dinars: 25800 }));
  it("converts 25800 DZD back to 100 EUR", () => expect(convertAmount(25800, "DZD", 258)).toEqual({ foreign: 100, dinars: 25800 }));
  it("rejects a quantity above the offer availability", () => { expect(validTradeAmount(1201, 1200)).toBe(false); expect(validTradeAmount(100, 1200)).toBe(true); });
  it("labels counterparty selling offers Acheter and buying offers Vendre", () => { expect(offerAction("sell")).toBe("Acheter"); expect(offerAction("buy")).toBe("Vendre"); });
  it.each(["EUR", "USD", "CAD"])("allows %s only against DZD", (currency) => expect(isAllowedPair(currency, "DZD")).toBe(true));
  it.each([["EUR", "USD"], ["USD", "CAD"], ["CAD", "EUR"], ["GBP", "DZD"]])("rejects %s/%s", (a, b) => expect(isAllowedPair(a, b)).toBe(false));
  it("blocks publishing and chat when KYC is required", () => expect(canTransact("required")).toBe(false));
  it("blocks publishing and chat while KYC is pending", () => expect(canTransact("pending")).toBe(false));
  it("unlocks publishing and chat only after verification", () => expect(canTransact("verified")).toBe(true));
  it("calculates the total exclusively in DZD", () => expect(calculateTotal(1200, 258)).toBe(309600));
  it("rejects invalid or non-positive amounts", () => { expect(calculateTotal(-1, 258)).toBe(0); expect(calculateTotal(10, Infinity)).toBe(0); });
});