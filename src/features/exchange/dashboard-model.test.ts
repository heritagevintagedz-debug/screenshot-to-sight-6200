import { describe, expect, it } from "vitest";
import { dashboardSummary } from "./dashboard-model";
import { demoOffers } from "./model";

describe("Dashboard uses existing session data only", () => {
  it("shows zero transactions and volume without user exchanges", () => {
    const result = dashboardSummary(demoOffers, [], [], {}, "Karim_G", true);
    expect([result.total, result.completed, result.ongoing, result.published, result.volume]).toEqual([0, 0, 0, 0, 0]);
    expect(result.recent).toEqual([]);
  });
  it("counts completed and ongoing exchanges without duplicates or unrelated IDs", () => {
    const result = dashboardSummary(demoOffers, ["eur-1", "usd-1", "eur-1"], ["eur-1", "eur-1", "missing"], {}, "Karim_G", true);
    expect([result.total, result.completed, result.ongoing]).toEqual([2, 1, 1]);
  });
  it("calculates completed volume using negotiated amounts, excluding ongoing offers", () => {
    const result = dashboardSummary(demoOffers, ["eur-1", "usd-1"], ["eur-1"], { "eur-1": 100, "usd-1": 200 }, "Karim_G", true);
    expect(result.volume).toBe(25800);
  });
  it("never substitutes the full advertised amount for an unknown exchanged amount", () => {
    const result = dashboardSummary(demoOffers, ["eur-1"], ["eur-1"], {}, "Karim_G", true);
    expect(result.volume).toBe(0);
    expect(result.missingAmounts).toBe(true);
  });
  it("counts only the signed-in user's published offers", () => {
    expect(dashboardSummary(demoOffers, [], [], {}, "Amine_DZ", true).published).toBe(2);
    expect(dashboardSummary(demoOffers, [], [], {}, "Amine_DZ", false).published).toBe(0);
  });
});