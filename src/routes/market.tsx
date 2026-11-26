import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowRight, ShieldCheck, Star, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExchange } from "@/features/exchange/context";
import { CustodyBanner } from "@/features/exchange/shared";
import { currencies, number, offerAction, type Currency, type Direction, type Offer } from "@/features/exchange/model";
export const Route = createFileRoute("/market")({
  head: () => ({ meta: [
    { title: "Marché P2P — DZ Exchange" },
    { name: "description", content: "Achetez et vendez EUR, USD et CAD contre DZD directement entre pairs, sans fonds conservés." },
    { property: "og:title", content: "Marché P2P — DZ Exchange" },
    { property: "og:description", content: "Choisissez votre devise, votre montant et votre contrepartie sur le marché P2P." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Market,
});
function Market() {
  const { offers, requestPublish } = useExchange();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [action, setAction] = useState<Direction>("buy");
  const [payment, setPayment] = useState("all");
  const [amount, setAmount] = useState("");
  const [sort, setSort] = useState("recommended");
  const filtered = offers.filter((offer) => offer.currency === currency && offer.direction === (action === "buy" ? "sell" : "buy") && (payment === "all" || offer.payments.includes(payment)) && (!amount || offer.amount >= Number(amount)));
  const displayed = sort === "rate" ? [...filtered].sort((a, b) => action === "buy" ? a.rate - b.rate : b.rate - a.rate) : sort === "amount" ? [...filtered].sort((a, b) => b.amount - a.amount) : filtered;
  return <>
    <div className="intro"><div><div className="eyebrow"><ShieldCheck size={13} />Directement entre pairs</div><h1>Marché P2P</h1><p className="subtitle">Achetez et vendez vos devises, selon vos conditions.</p></div><Button variant="gold" className="intro-action h-10 text-xs" onClick={requestPublish}><Plus />Publier une offre</Button></div>
    <div className="p2p-actions"><div className="segments"><Button variant="segment" data-active={action === "buy"} aria-pressed={action === "buy"} onClick={() => setAction("buy")}>Acheter</Button><Button variant="segment" data-active={action === "sell"} aria-pressed={action === "sell"} onClick={() => setAction("sell")}>Vendre</Button></div><span className="quote-label">DZD <ArrowRight size={14} /></span></div>
    <div className="p2p-filters"><select className="field-select" aria-label="Devise" value={currency} onChange={(e) => { const next = currencies.find((c) => c === e.target.value); if (next) setCurrency(next); }}>{currencies.map((c) => <option key={c} value={c}>{c} / DZD</option>)}</select><Input className="amount-filter" type="number" min="0" inputMode="decimal" aria-label="Montant recherché" placeholder={`Montant en ${currency}`} value={amount} onChange={(e) => setAmount(e.target.value)} /><select className="field-select" aria-label="Moyen de paiement" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="all">Tous les paiements</option>{["BaridiMob", "CCP", "Wise", "Paysera", "Zelle", "Interac", "Espèces"].map((p) => <option key={p}>{p}</option>)}</select><div className="sort-control"><SlidersHorizontal size={13} /><select className="field-select" aria-label="Trier les offres" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommandées</option><option value="rate">Meilleur taux</option><option value="amount">Montant décroissant</option></select></div></div>
    <div className="p2p-list-heading"><span>{displayed.length} annonces · {action === "buy" ? "Acheter" : "Vendre"} {currency}</span><span className="live-label"><span className="live-dot" />Offres de démonstration</span></div>
    <div className="p2p-list">{displayed.map((offer) => <OfferRow key={offer.id} offer={offer} />)}{displayed.length === 0 && <div className="empty-state"><p>Aucune annonce ne correspond à ces critères.</p><Button variant="link" onClick={() => { setPayment("all"); setAmount(""); }}><RefreshCw />Réinitialiser les filtres</Button></div>}</div>
    <div className="mt-6"><CustodyBanner /></div><p className="text-center text-[10px] text-muted-foreground">Taux fixés par les utilisateurs · Aucune conservation de fonds</p>
  </>;
}
function OfferRow({ offer }: { offer: Offer }) {
  const { setTradeOffer, profilePhoto, username } = useExchange();
  return <article className="p2p-offer"><div className="p2p-offer-main"><div className="seller"><span className="avatar">{offer.username === username && profilePhoto ? <img src={profilePhoto} alt={username} /> : offer.initials}</span><div><strong>{offer.username}<ShieldCheck aria-label="Identité vérifiée en démonstration" /></strong><small>{offer.trades} échanges · {number(offer.reliability, 1)} % réalisés</small></div></div><div className="p2p-reputation"><Star size={11} />{number(offer.reliability, 1)} %<span>·</span><span>Règlement direct</span></div><div className="p2p-price">{number(offer.rate, 2)}<small>DZD / {offer.currency}</small></div><div className="p2p-quantity"><span>Quantité disponible</span><strong>{number(offer.amount, 2)} {offer.currency}</strong></div><div className="p2p-quantity"><span>Équivalent maximum</span><strong>{number(offer.amount * offer.rate)} DZD</strong></div></div><div className="p2p-offer-side"><div className="p2p-payments">{offer.payments.map((payment) => <span key={payment}>{payment}</span>)}</div><Button variant={offer.direction === "sell" ? "purchase" : "sell"} className="p2p-trade-button" onClick={() => setTradeOffer(offer)}>{offerAction(offer.direction)}</Button></div></article>;
}
