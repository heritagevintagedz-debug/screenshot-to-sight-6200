import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, LockKeyhole, Send, ArrowRight, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useExchange } from "./context";
import { CustodyBanner } from "./shared";
import { calculateTotal, currencies, number, rates, type Currency, type Direction } from "./model";
import { TradeDialog } from "./trade-dialog";
import { MediaComposer } from "./media-composer";

export function ExchangeModals() {
  const state = useExchange();
  return <>
    <Dialog open={state.gateOpen} onOpenChange={state.setGateOpen}><DialogContent><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck size={26} /></div><DialogTitle>La confiance commence par la vérification</DialogTitle><DialogDescription>{!state.signedIn ? "Connectez-vous pour vérifier votre identité et échanger avec la communauté." : state.kyc === "pending" ? "Votre vérification est en attente. La publication et la messagerie restent verrouillées jusqu’à sa validation." : "Vérifiez votre identité pour publier une offre et accéder au chat E2EE. Le marché reste librement accessible."}</DialogDescription><Button variant="gold" asChild onClick={() => state.setGateOpen(false)}><Link to={state.signedIn ? "/profile" : "/auth"}>{state.signedIn ? "Compléter ma vérification" : "Se connecter"}<ArrowRight /></Link></Button><p className="text-center text-[10px] text-muted-foreground">Parcours simulé : aucune identité réelle n’est vérifiée.</p></DialogContent></Dialog>
    <PublishDialog />
    <ChatDialog />
    <TradeDialog />
  </>;
}
function PublishDialog() {
  const { publishOpen, setPublishOpen, username, addOffer } = useExchange();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [direction, setDirection] = useState<Direction>("sell");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("257.5");
  const [payments, setPayments] = useState<string[]>(["BaridiMob"]);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const success = addOffer({ id: crypto.randomUUID(), username, initials: username.slice(0, 2).toUpperCase(), currency, direction, amount: Number(amount), rate: Number(rate), payments, trades: 0, reliability: 100 });
    if (!success) { setError("Saisissez un montant et un taux positifs, puis sélectionnez un moyen de règlement."); return; }
    setAmount(""); setError("");
  };
  return <Dialog open={publishOpen} onOpenChange={setPublishOpen}><DialogContent><DialogTitle>Publier une offre P2P</DialogTitle><DialogDescription>Votre offre de démonstration sera visible sur le marché.</DialogDescription><form className="form-stack" onSubmit={submit}>
    <div className="form-columns"><label>Devise<select className="field-select" value={currency} onChange={(e) => { const value = currencies.find((c) => c === e.target.value); if (value) { setCurrency(value); setRate(String(rates[value].value)); } }}>{currencies.map((c) => <option key={c} value={c}>{c} / DZD</option>)}</select></label><label>Opération<select className="field-select" value={direction} onChange={(e) => setDirection(e.target.value === "buy" ? "buy" : "sell")}><option value="sell">Vendre {currency} → DZD</option><option value="buy">Acheter {currency} avec DZD</option></select></label></div>
    <div className="form-columns"><label>Montant en {currency}<Input type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1 000" /></label><label>Taux en DZD<Input type="number" min="0.01" step="0.01" required value={rate} onChange={(e) => setRate(e.target.value)} /></label></div>
    <div className="form-total"><span className="text-xs text-muted-foreground">Total de l’échange</span><strong>{number(calculateTotal(Number(amount), Number(rate)), 2)} <small className="text-xs">DZD</small></strong></div>
    <div><p className="mb-3 text-[11px] text-muted-foreground">Moyens de règlement convenus</p><div className="check-options">{["BaridiMob", "CCP", "Wise", "Paysera", "Zelle", "Interac", "Espèces"].map((payment) => <label key={payment}><input type="checkbox" checked={payments.includes(payment)} onChange={(e) => setPayments((all) => e.target.checked ? [...all, payment] : all.filter((p) => p !== payment))} />{payment}</label>)}</div></div>
    <CustodyBanner compact />{error && <p className="form-error" role="alert">{error}</p>}<Button type="submit" variant="gold"><Plus />Publier mon offre</Button>
  </form></DialogContent></Dialog>;
}
function ChatDialog() {
  const { chatOffer, setChatOffer, conversations, sendMessage, tradeAmounts } = useExchange();
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const messages = chatOffer ? conversations[chatOffer.id] ?? [] : [];
  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [messages.length]);
  const submit = (e: FormEvent) => { e.preventDefault(); if (!chatOffer || !text.trim()) return; sendMessage(chatOffer.id, text); setText(""); };
  return <Dialog open={chatOffer !== null} onOpenChange={(open) => { if (!open) { setChatOffer(null); setText(""); } }}><DialogContent className="chat-modal"><div className="chat-header"><span className="avatar">{chatOffer?.initials}</span><div><DialogTitle>{chatOffer?.username}</DialogTitle><p className="mt-2 text-[10px] text-muted-foreground">{chatOffer?.currency} / DZD · {number(chatOffer ? tradeAmounts[chatOffer.id] ?? chatOffer.amount : 0, 2)} {chatOffer?.currency}</p></div></div><DialogDescription className="flex items-center gap-2 text-primary"><LockKeyhole size={13} />Discussion privée · démonstration</DialogDescription><p className="text-[10px] leading-relaxed text-muted-foreground">Messages et médias locaux, non transmis et non chiffrés. Le chiffrement E2EE n’est pas encore connecté.</p><CustodyBanner compact /><div className="chat-messages" aria-live="polite">{messages.map((message) => <div key={message.id} className={`chat-bubble ${message.mine ? "mine" : ""}`}>{message.text}{message.media?.kind === "image" && <img className="message-image" src={message.media.url} alt={message.media.name} />}{message.media?.kind === "video" && <video className="message-video" src={message.media.url} controls playsInline />}{message.media?.kind === "audio" && <audio className="message-audio" src={message.media.url} controls />}<small>{message.time}{message.mine && <Check size={10} className="ml-1 inline text-primary" />}</small></div>)}<div ref={bottom} /></div><form className="chat-input" onSubmit={submit}><Input aria-label="Votre message" placeholder="Écrire un message…" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} /><Button variant="gold" size="icon" type="submit" disabled={!text.trim()} aria-label="Envoyer le message"><Send /></Button></form>{chatOffer && <MediaComposer key={chatOffer.id} offerId={chatOffer.id} />}</DialogContent></Dialog>;
}