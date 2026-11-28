import { calculateTotal, type Offer } from "./model";

// Read-only projections: no new transactions, payment confirmations or timestamps.
export function dashboardSummary(offers: Offer[], activeIds: string[], completedIds: string[], tradeAmounts: Record<string, number>, username: string, signedIn: boolean) {
  const active = new Set(activeIds);
  const completed = new Set(completedIds);
  const transactions = offers.filter((offer) => active.has(offer.id));
  const finished = transactions.filter((offer) => completed.has(offer.id));
  const volume = finished.reduce((sum, offer) => {
    const amount = tradeAmounts[offer.id];
    return sum + (amount === undefined ? 0 : calculateTotal(amount, offer.rate));
  }, 0);
  return {
    transactions,
    total: transactions.length,
    completed: finished.length,
    ongoing: transactions.length - finished.length,
    published: signedIn ? offers.filter((offer) => offer.username === username).length : 0,
    volume: Math.round(volume * 100) / 100,
    missingAmounts: finished.some((offer) => tradeAmounts[offer.id] === undefined),
    recent: [...transactions].sort((a, b) => activeIds.lastIndexOf(b.id) - activeIds.lastIndexOf(a.id)).slice(0, 4),
  };
}