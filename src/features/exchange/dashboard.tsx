import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, ArrowLeftRight, Bell, CheckCheck, Clock3, FileText, Plus, ShieldCheck, ChartNoAxesCombined } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useExchange } from "./context";
import { KycBadge } from "./shared";
import { currencies, number, rates, type Currency, type Direction, type Offer } from "./model";
import { dashboardSummary } from "./dashboard-model";
import coins from "@/assets/dz-exchange-coins.asset.json";
import "./dashboard.css";

function SectionHeading({ title, note, children }: { title: string; note?: string; children?: ReactNode }) {
  return <div className="dashboard-section-heading"><div><h2>{title}</h2>{note && <p>{note}</p>}</div>{children}</div>;
}

function DashboardOffer({ offer, onSelect }: { offer: Offer; onSelect: (offer: Offer) => void }) {
  const { username, profilePhoto, kyc } = useExchange();
  const own = offer.username === username;
  return <article className="dashboard-offer">
    <div className="dashboard-offer-top"><div className="seller"><span className="avatar">{own && profilePhoto ? <img src={profilePhoto} alt={username} /> : offer.initials}</span><div><strong>{offer.username}{(!own || kyc === "verified") && <ShieldCheck aria-label="Vérifié en démonstration" />}</strong><small>{own ? (kyc === "verified" ? "Vérifié · démo" : "Vérification requise") : "Vérifié · démo"}</small></div></div><span>{offer.currency} / DZD</span></div>
    <div className="dashboard-offer-details"><strong>{number(offer.rate, 2)}<small>DZD / {offer.currency}</small></strong><span>{number(offer.amount, 2)} {offer.currency}<br />disponibles</span></div>
    <div className="dashboard-offer-bottom"><div className="payment-row">{offer.payments.map((payment) => <span className="payment-tag" key={payment}>{payment}</span>)}</div><Button variant="ghost" size="sm" aria-label={`Consulter l’annonce de ${offer.username} en ${offer.currency}`} onClick={() => onSelect(offer)}>Consulter<ArrowUpRight /></Button></div>
  </article>;
}

export function Dashboard() {
  const exchange = useExchange();
  const { username, signedIn, profilePhoto, kyc, offers, activeIds, completedIds, tradeAmounts, requestPublish, setTradeOffer } = exchange;
  const summary = dashboardSummary(offers, activeIds, completedIds, tradeAmounts, username, signedIn);
  const [picker, setPicker] = useState<{ action: Direction; currency: Currency } | null>(null);
  const notices = summary.ongoing + (signedIn && kyc !== "verified" ? 1 : 0);
  const selectOffer = (offer: Offer) => { setPicker(null); setTradeOffer(offer); };
  const featured = currencies.flatMap((currency) => offers.filter((offer) => offer.currency === currency && offer.direction === "sell" && offer.username !== username).slice(0, 1)).slice(0, 2);
  const statistics = [
    { label: "Transactions au total", value: summary.total, icon: <ArrowLeftRight />, tone: "primary" },
    { label: "Transactions terminées", value: summary.completed, icon: <CheckCheck />, tone: "success" },
    { label: "Transactions en cours", value: summary.ongoing, icon: <Clock3 />, tone: "primary" },
    { label: "Annonces publiées", value: summary.published, icon: <FileText />, tone: "neutral" },
    { label: "Volume terminé · démo", value: summary.volume, icon: <ChartNoAxesCombined />, tone: "success", unit: "DZD" },
  ];
  return <div className="dashboard">
    <header className="dashboard-header"><div><div className="eyebrow">DZ Exchange · Votre tableau de bord</div><h1>{signedIn ? `Bonjour, ${username}.` : "Bienvenue sur DZ Exchange."}</h1><p>Un aperçu de vos échanges, en un seul endroit.</p></div><div className="dashboard-identity">
      <Button asChild variant="ghost" className="h-auto p-0" title="Accéder à mon profil"><Link to={signedIn ? "/profile" : "/auth"} aria-label={signedIn ? `Profil de ${username}` : "Se connecter"}><span className="avatar">{profilePhoto && signedIn ? <img src={profilePhoto} alt={username} /> : signedIn ? username.slice(0, 2).toUpperCase() : "DZ"}</span></Link></Button>
      {signedIn && <KycBadge />}
      <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="dashboard-notification" aria-label={`Notifications : ${notices} élément${notices === 1 ? "" : "s"} à suivre`} title="Notifications de suivi"><Bell /><span className="dashboard-notification-count">{notices}</span></Button></PopoverTrigger><PopoverContent align="end"><div className="dashboard-notice-list"><strong className="text-sm">À suivre</strong>{signedIn && kyc !== "verified" && <><p>{kyc === "pending" ? "Votre vérification de démonstration est en attente." : "Votre compte nécessite une vérification de démonstration."}</p><Button variant="outline" size="sm" asChild><Link to="/profile">Profil & sécurité<ArrowRight /></Link></Button></>}{summary.ongoing > 0 && <><p>{summary.ongoing} échange{summary.ongoing > 1 ? "s" : ""} en cours dans cette session.</p><Button variant="outline" size="sm" asChild><Link to="/exchanges">Mes échanges<ArrowRight /></Link></Button></>}{notices === 0 && <p>Aucun élément à suivre pour le moment.</p>}</div></PopoverContent></Popover>
    </div></header>

    <section aria-labelledby="dashboard-overview"><SectionHeading title="Vue d’ensemble"><span>Session de démonstration</span></SectionHeading><div className="dashboard-stats" id="dashboard-overview">{statistics.map((stat) => <article className="dashboard-stat" key={stat.label} data-tone={stat.tone}><div className="dashboard-stat-top"><span className="dashboard-stat-icon">{stat.icon}</span><span>Cette session</span></div><strong>{number(stat.value, stat.unit ? 2 : 0)}{stat.unit && <small>{stat.unit}</small>}</strong><p>{stat.label}</p></article>)}</div><p className="dashboard-section-note">{summary.missingAmounts ? "Volume partiel : certains montants ne sont pas renseignés. " : ""}Le suivi de démonstration ne confirme aucun paiement réel.</p></section>

    <section><SectionHeading title="Vos devises" note="Taux indicatifs de démonstration · Aucun cours en temps réel"><Button variant="link" size="sm" asChild><Link to="/market">Marché P2P<ArrowUpRight /></Link></Button></SectionHeading><div className="dashboard-currencies">{currencies.map((currency) => <article className="dashboard-currency" key={currency}><div className="dashboard-currency-top"><span className="dashboard-currency-symbol">{rates[currency].symbol}</span><div><strong>{currency} / DZD</strong><small>{rates[currency].name}</small></div></div><div className="dashboard-rate"><strong>{number(rates[currency].value, 2)}</strong><span>DZD / {currency}</span></div><div className="dashboard-currency-bottom"><span>Indicatif · démo</span><Button variant="link" onClick={() => setPicker({ action: "buy", currency })} aria-label={`Voir les offres ${currency} / DZD`}>Voir les offres<ArrowUpRight /></Button></div></article>)}</div></section>

    <section><SectionHeading title="Actions rapides" /><div className="dashboard-actions"><Button variant="outline" onClick={() => setPicker({ action: "buy", currency: "EUR" })}><ArrowDownLeft /><span>Acheter des devises</span></Button><Button variant="outline" onClick={() => setPicker({ action: "sell", currency: "EUR" })}><ArrowUpRight /><span>Vendre des devises</span></Button><Button variant="outline" onClick={requestPublish}><Plus /><span>Publier une annonce</span></Button><Button variant="outline" asChild><Link to="/exchanges"><ArrowLeftRight /><span>Consulter mes transactions</span></Link></Button></div></section>

    <div className="dashboard-lower"><section><SectionHeading title="Activité récente" note="Vos derniers échanges de cette session"><Button variant="link" size="sm" asChild><Link to="/exchanges">Voir tout<ArrowRight /></Link></Button></SectionHeading>{summary.recent.length === 0 ? <div className="dashboard-empty"><span className="dashboard-empty-icon"><ArrowLeftRight /></span><h3>Votre premier échange vous attend</h3><p>Vous n’avez pas encore de transaction.<br />Retrouvez les annonces disponibles sur le marché.</p><Button variant="outline" size="sm" asChild><Link to="/market">Explorer le marché<ArrowRight /></Link></Button></div> : <div className="dashboard-activity">{summary.recent.map((offer) => <article className="dashboard-activity-row" key={offer.id}><span className="avatar">{offer.initials}</span><div><strong>{offer.username}</strong><p>{tradeAmounts[offer.id] === undefined ? "Montant non renseigné" : `${number(tradeAmounts[offer.id] ?? 0, 2)} ${offer.currency}`} · {offer.currency} / DZD</p><small>Date non disponible</small></div><span className={`status-pill ${completedIds.includes(offer.id) ? "verified" : ""}`}>{completedIds.includes(offer.id) ? "Terminé · démo" : "En cours"}</span></article>)}</div>}<p className="dashboard-section-note">Règlement direct entre pairs, sans fonds détenus.</p></section>
    <section><SectionHeading title="Annonces à découvrir" note="Offres existantes du marché · Démonstration"><Button variant="link" size="sm" asChild><Link to="/market" aria-label="Toutes les annonces">Tout voir<ArrowRight /></Link></Button></SectionHeading><div className="dashboard-offers">{featured.map((offer) => <DashboardOffer key={offer.id} offer={offer} onSelect={selectOffer} />)}{featured.length === 0 && <p className="dashboard-section-note">Aucune annonce disponible.</p>}</div></section></div>

    <section className="dashboard-trust"><img src={coins.url} alt="Pièces symbolisant les échanges de devises" loading="lazy" /><ShieldCheck /><div><strong>Vos fonds restent entre vos mains.</strong><p>DZ Exchange ne conserve aucun fonds. Vos règlements se font directement entre pairs, selon le moyen convenu.</p></div></section>

    <Dialog open={picker !== null} onOpenChange={(open) => { if (!open) setPicker(null); }}><DialogContent><DialogHeader><DialogTitle>{picker?.action === "sell" ? "Vendre" : "Acheter"} {picker?.currency} / DZD</DialogTitle><DialogDescription>Offres existantes du marché P2P · Démonstration</DialogDescription></DialogHeader><div className="dashboard-picker-tabs">{currencies.map((currency) => <Button key={currency} variant="tab" size="sm" data-active={picker?.currency === currency} aria-pressed={picker?.currency === currency} onClick={() => setPicker((current) => current ? { ...current, currency } : null)}>{currency}</Button>)}</div><div className="dashboard-picker-list">{offers.filter((offer) => offer.currency === picker?.currency && offer.direction === (picker?.action === "buy" ? "sell" : "buy")).map((offer) => <DashboardOffer key={offer.id} offer={offer} onSelect={selectOffer} />)}</div><Button variant="link" asChild><Link to="/market" onClick={() => setPicker(null)}>Tous les filtres du marché<ArrowUpRight /></Link></Button></DialogContent></Dialog>
  </div>;
}