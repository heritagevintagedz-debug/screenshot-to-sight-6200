import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, LockKeyhole, Star, SlidersHorizontal, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchange } from "@/features/exchange/context";
import { CustodyBanner } from "@/features/exchange/shared";
import { currencies, rates, number, calculateTotal, canTransact, type Currency, type Direction, type Offer } from "@/features/exchange/model";
import coinAsset from "@/assets/dz-exchange-coins.asset.json";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Marché P2P — DZ Exchange" },
    { name: "description", content: "Consultez les offres EUR/DZD, USD/DZD et CAD/DZD. Échanges directs entre pairs, sans conservation de fonds." },
    { property: "og:title", content: "Marché P2P — DZ Exchange" },
    { property: "og:description", content: "Vos devises, votre contrôle. Le marché P2P contre le dinar algérien." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});
function Index() {
  const { offers, requestPublish } = useExchange();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [direction, setDirection] = useState<Direction | "all">("all");
  const [payment, setPayment] = useState("all");
  const [sort, setSort] = useState("recommended");
  const filtered = offers.filter((offer) => offer.currency === currency && (direction === "all" || offer.direction === direction) && (payment === "all" || offer.payments.includes(payment)));
  const displayed = sort === "rate" ? [...filtered].sort((a, b) => a.rate - b.rate) : sort === "amount" ? [...filtered].sort((a, b) => b.amount - a.amount) : filtered;
  return <>
    <div className="intro"><div><div className="eyebrow"><span className="live-dot" />L’échange, en toute confiance</div><h1>Marché P2P</h1><p className="subtitle">Vos devises. Vos conditions. Échangez directement entre pairs.</p></div><Button variant="gold" className="intro-action h-10 text-xs" onClick={requestPublish}><Plus size={16} />Publier une offre</Button></div>
    <div className="market-overview">{currencies.map((c, i) => <div className="rate-card" key={c}><div className="rate-top"><span className="currency-icon">{rates[c].symbol}</span><div><strong>{c} / DZD</strong><small>{rates[c].name}</small></div><ArrowUpRight size={13} className="ml-auto text-muted-foreground" /></div><div className="rate-value">{number(rates[c].value, 2)} <small>DZD</small></div><div className="rate-bottom"><span>↗ {rates[c].change}</span><svg viewBox="0 0 80 25" className="sparkline" aria-hidden="true"><path d={i === 1 ? "M0 21 L8 16 L15 18 L23 9 L30 12 L39 8 L46 12 L55 5 L63 7 L71 3 L80 1" : "M0 21 L7 17 L15 19 L23 13 L30 16 L38 9 L45 11 L54 7 L61 10 L70 4 L80 2"} fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></div></div>)}<div className="visual-card"><img src={coinAsset.url} alt="Pièces dorées avec flèches d’échange et anneau de verre aubergine" /><div className="visual-card-content"><ShieldCheck size={19} className="mb-2 text-primary" /><strong>Votre argent.<br />Votre contrôle.</strong><p>Des échanges directs.<br />Zéro fonds conservé.</p></div></div></div>
    <CustodyBanner />
    <div className="market-heading"><div><h2>Les offres du marché</h2><p>{displayed.length} offres disponibles · Contreparties vérifiées</p></div><span className="live-label"><span className="live-dot" />Taux indicatifs</span></div>
    <div className="market-tools"><div className="pair-tabs" aria-label="Paire de devises">{currencies.map((c) => <Button key={c} variant="tab" size="sm" className="h-9 px-4 text-[10px]" data-active={currency === c} aria-pressed={currency === c} onClick={() => setCurrency(c)}>{c}<ArrowRight size={10} />DZD</Button>)}</div><div className="filters"><div className="segments" aria-label="Sens de l’offre"><Button variant="segment" size="sm" className="h-7 text-[10px]" data-active={direction === "all"} aria-pressed={direction === "all"} onClick={() => setDirection("all")}>Toutes</Button><Button variant="segment" size="sm" className="h-7 text-[10px]" data-active={direction === "sell"} aria-pressed={direction === "sell"} onClick={() => setDirection("sell")}>Vente {currency}</Button><Button variant="segment" size="sm" className="h-7 text-[10px]" data-active={direction === "buy"} aria-pressed={direction === "buy"} onClick={() => setDirection("buy")}>Achat {currency}</Button></div><select className="field-select" aria-label="Moyen de paiement" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="all">Tous les paiements</option>{["BaridiMob", "CCP", "Wise", "Paysera", "Zelle", "Interac", "Espèces"].map((p) => <option key={p}>{p}</option>)}</select></div></div>
    <div className="mb-4 flex items-center justify-between text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><ShieldCheck size={12} />Identité vérifiée sur les offres de démonstration</span><label className="flex items-center gap-1.5"><SlidersHorizontal size={11} /><select aria-label="Trier les offres" className="bg-background text-[10px] outline-none" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommandées</option><option value="rate">Taux croissant</option><option value="amount">Montant décroissant</option></select></label></div>
    <div className="offer-grid">{displayed.map((offer) => <OfferCard key={offer.id} offer={offer} />)}{displayed.length === 0 && <div className="empty-state"><p>Aucune offre ne correspond à ces critères.</p><Button variant="link" onClick={() => { setPayment("all"); setDirection("all"); }}><RefreshCw />Réinitialiser les filtres</Button></div>}</div>
    <div className="mt-7 text-center text-[10px] text-muted-foreground">Les taux sont fixés par les utilisateurs. Aucun conseil financier, aucun fonds détenu.</div>
  </>;
}
function OfferCard({ offer }: { offer: Offer }) {
  const { kyc, signedIn, requestChat } = useExchange();
  const unlocked = signedIn && canTransact(kyc);
  return <article className="offer-card"><div className="offer-top"><div className="seller"><span className="avatar">{offer.initials}</span><div><strong>{offer.username}<ShieldCheck aria-label="Identité vérifiée en démonstration" /></strong><small><Star />{offer.trades} échanges · {number(offer.reliability, offer.reliability % 1 ? 1 : 0)} %</small></div></div><span className={`direction ${offer.direction === "buy" ? "buy" : ""}`}>{offer.direction === "sell" ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}{offer.direction === "sell" ? "VENTE" : "ACHAT"}</span></div><div className="offer-amount">{number(offer.amount)}<small>{offer.currency}</small></div><p className="offer-available">{offer.direction === "sell" ? "Montant disponible" : "Montant recherché"}</p><div className="offer-details"><div className="detail-row"><span>Taux de change</span><strong>{number(offer.rate, 2)} DZD / {offer.currency}</strong></div><div className="detail-row"><span>Total en dinars</span><strong className="total">{number(calculateTotal(offer.amount, offer.rate))} DZD</strong></div></div><div className="payment-row">{offer.payments.map((p) => <span key={p} className="payment-tag">{p}</span>)}</div><div className="offer-footer"><span className="live-label"><span className="live-dot" />Disponible</span><Button variant="chat" size="sm" className="h-8 px-3" onClick={() => requestChat(offer)}><LockKeyhole size={12} />{unlocked ? "Chat E2EE" : "Débloquer KYC"}<ArrowUpRight size={12} /></Button></div></article>;
}
