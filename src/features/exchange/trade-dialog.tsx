import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useExchange } from "./context";
import { convertAmount, number, offerAction, validTradeAmount, type Offer } from "./model";
import { CustodyBanner } from "./shared";
export function TradeDialog() {
  const { tradeOffer, setTradeOffer } = useExchange();
  return <Dialog open={tradeOffer !== null} onOpenChange={(open) => { if (!open) setTradeOffer(null); }}><DialogContent>{tradeOffer && <TradeForm key={tradeOffer.id} offer={tradeOffer} />}</DialogContent></Dialog>;
}
function TradeForm({ offer }: { offer: Offer }) {
  const { confirmTrade } = useExchange();
  const [unit, setUnit] = useState<"foreign" | "DZD">("foreign");
  const [value, setValue] = useState("");
  const converted = convertAmount(Number(value), unit, offer.rate);
  const valid = validTradeAmount(converted.foreign, offer.amount);
  const switchUnit = (next: "foreign" | "DZD") => { if (value && unit !== next) setValue(String(next === "DZD" ? converted.dinars : converted.foreign)); setUnit(next); };
  const submit = (e: FormEvent) => { e.preventDefault(); if (valid) confirmTrade(offer, converted.foreign); };
  return <><DialogTitle>{offerAction(offer.direction)} {offer.currency}</DialogTitle><DialogDescription>Avec {offer.username} · 1 {offer.currency} = {number(offer.rate, 2)} DZD</DialogDescription><form className="form-stack" onSubmit={submit}><div className="segments"><Button type="button" variant="segment" className="flex-1" data-active={unit === "foreign"} onClick={() => switchUnit("foreign")}>En {offer.currency}</Button><Button type="button" variant="segment" className="flex-1" data-active={unit === "DZD"} onClick={() => switchUnit("DZD")}>En dinars</Button></div><label>Montant en {unit === "foreign" ? offer.currency : "DZD"}<Input autoFocus type="number" inputMode="decimal" min="0.01" step="any" placeholder="100" value={value} onChange={(e) => setValue(e.target.value)} required /></label><div className="conversion-summary"><div><span>{offerAction(offer.direction) === "Acheter" ? "Vous recevez" : "Vous vendez"}</span><strong>{number(converted.foreign, 2)} {offer.currency}</strong></div><ArrowLeftRight size={20} /><div><span>{offerAction(offer.direction) === "Acheter" ? "Vous payez" : "Vous recevez"}</span><strong>{number(converted.dinars, 2)} DZD</strong></div></div><p className="text-[11px] text-muted-foreground">Disponible : {number(offer.amount)} {offer.currency} · {number(offer.amount * offer.rate)} DZD</p>{Number(value) > 0 && !valid && <p className="form-error" role="alert">Le montant dépasse la quantité disponible.</p>}<CustodyBanner compact /><Button variant={offer.direction === "sell" ? "purchase" : "sell"} type="submit" disabled={!valid}>Confirmer et ouvrir la discussion<ArrowRight /></Button><p className="text-center text-[10px] text-muted-foreground">Vérification KYC obligatoire · Aucun paiement sur la plateforme</p></form></>;
}