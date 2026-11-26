export const currencies = ["EUR", "USD", "CAD"] as const;
export type Currency = (typeof currencies)[number];
export type KycStatus = "required" | "pending" | "verified";
export type Direction = "sell" | "buy";
export type Offer = {
  id: string; username: string; initials: string; currency: Currency; direction: Direction;
  amount: number; rate: number; payments: string[]; trades: number; reliability: number;
};
export const isAllowedPair = (foreign: string, quote: string) => currencies.some((value) => value === foreign) && quote === "DZD";
export const canTransact = (status: KycStatus) => status === "verified";
export const offerAction = (direction: Direction) => direction === "sell" ? "Acheter" : "Vendre";
export function convertAmount(value: number, unit: "foreign" | "DZD", rate: number) {
  if (!Number.isFinite(value) || !Number.isFinite(rate) || value <= 0 || rate <= 0) return { foreign: 0, dinars: 0 };
  return unit === "foreign" ? { foreign: value, dinars: calculateTotal(value, rate) } : { foreign: Math.round(value / rate * 1000000) / 1000000, dinars: value };
}
export const validTradeAmount = (amount: number, available: number) => Number.isFinite(amount) && amount > 0 && amount <= available;
export function calculateTotal(amount: number, rate: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount <= 0 || rate <= 0) return 0;
  return Math.round(amount * rate * 100) / 100;
}
export const number = (value: number, decimals = 0) => new Intl.NumberFormat("fr-DZ", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
export const rates: Record<Currency, { value: number; change: string; name: string; symbol: string }> = {
  EUR: { value: 257.5, change: "+0,58 %", name: "Euro", symbol: "€" },
  USD: { value: 238, change: "+0,32 %", name: "Dollar américain", symbol: "$" },
  CAD: { value: 171.2, change: "+0,24 %", name: "Dollar canadien", symbol: "C$" },
};
export const demoOffers: Offer[] = [
  { id: "eur-1", username: "Amine_DZ", initials: "AD", currency: "EUR", direction: "sell", amount: 1200, rate: 258, payments: ["BaridiMob", "Wise"], trades: 148, reliability: 99.3 },
  { id: "eur-2", username: "Sarah_Exchange", initials: "SE", currency: "EUR", direction: "buy", amount: 2500, rate: 256.5, payments: ["CCP", "Paysera"], trades: 86, reliability: 100 },
  { id: "eur-3", username: "Yacine_Paris", initials: "YP", currency: "EUR", direction: "sell", amount: 800, rate: 257.5, payments: ["BaridiMob", "Espèces"], trades: 213, reliability: 99.5 },
  { id: "eur-4", username: "Nour_FX", initials: "NF", currency: "EUR", direction: "sell", amount: 3000, rate: 258.5, payments: ["Wise", "CCP"], trades: 64, reliability: 98.4 },
  { id: "eur-5", username: "Karim_Alger", initials: "KA", currency: "EUR", direction: "buy", amount: 1500, rate: 257, payments: ["BaridiMob", "Espèces"], trades: 172, reliability: 100 },
  { id: "eur-6", username: "Lina_Trade", initials: "LT", currency: "EUR", direction: "sell", amount: 500, rate: 257, payments: ["Paysera", "BaridiMob"], trades: 97, reliability: 99 },
  { id: "usd-1", username: "Amine_DZ", initials: "AD", currency: "USD", direction: "sell", amount: 1000, rate: 238, payments: ["Zelle", "BaridiMob"], trades: 148, reliability: 99.3 },
  { id: "usd-2", username: "Sarah_Exchange", initials: "SE", currency: "USD", direction: "buy", amount: 2000, rate: 237, payments: ["Wise", "CCP"], trades: 86, reliability: 100 },
  { id: "usd-3", username: "Nour_FX", initials: "NF", currency: "USD", direction: "sell", amount: 700, rate: 239, payments: ["Zelle", "CCP"], trades: 64, reliability: 98.4 },
  { id: "cad-1", username: "Lina_Montréal", initials: "LM", currency: "CAD", direction: "sell", amount: 1500, rate: 171.2, payments: ["Interac", "BaridiMob"], trades: 112, reliability: 100 },
  { id: "cad-2", username: "Yacine_Paris", initials: "YP", currency: "CAD", direction: "buy", amount: 800, rate: 170.5, payments: ["Interac", "CCP"], trades: 213, reliability: 99.5 },
  { id: "cad-3", username: "Nour_FX", initials: "NF", currency: "CAD", direction: "sell", amount: 2200, rate: 172, payments: ["Wise", "BaridiMob"], trades: 64, reliability: 98.4 },
];