import { createContext, useContext, useState, type ReactNode } from "react";
import { canTransact, demoOffers, isAllowedPair, calculateTotal, type KycStatus, type Offer } from "./model";

export type Message = { id: string; text: string; mine: boolean; time: string; media?: { kind: "image" | "video" | "audio"; url: string; name: string } };
type ExchangeState = {
  username: string; signedIn: boolean; kyc: KycStatus; offers: Offer[];
  gateOpen: boolean; publishOpen: boolean; chatOffer: Offer | null;
  conversations: Record<string, Message[]>; activeIds: string[]; completedIds: string[];
  setGateOpen: (open: boolean) => void; setPublishOpen: (open: boolean) => void;
  setChatOffer: (offer: Offer | null) => void; setKyc: (status: KycStatus) => void;
  enterDemo: (username: string) => void; signOut: () => void;
  requestPublish: () => void; requestChat: (offer: Offer) => void;
  addOffer: (offer: Offer) => boolean; sendMessage: (id: string, text: string) => void;
  completeExchange: (id: string) => void;
  tradeOffer: Offer | null; setTradeOffer: (offer: Offer | null) => void;
  tradeAmounts: Record<string, number>; confirmTrade: (offer: Offer, amount: number) => boolean;
  profilePhoto: string; setProfilePhoto: (url: string) => void;
  sendMedia: (id: string, media: NonNullable<Message["media"]>) => void;
};
const ExchangeContext = createContext<ExchangeState | null>(null);
export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("Karim_G");
  const [signedIn, setSignedIn] = useState(true);
  const [kyc, setKyc] = useState<KycStatus>("required");
  const [offers, setOffers] = useState(demoOffers);
  const [gateOpen, setGateOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [chatOffer, setChatOffer] = useState<Offer | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [tradeOffer, setTradeOffer] = useState<Offer | null>(null);
  const [tradeAmounts, setTradeAmounts] = useState<Record<string, number>>({});
  const [profilePhoto, setProfilePhoto] = useState("");
  const allowed = signedIn && canTransact(kyc);
  const requestPublish = () => allowed ? setPublishOpen(true) : setGateOpen(true);
  const requestChat = (offer: Offer) => {
    if (!allowed) { setGateOpen(true); return; }
    setChatOffer(offer);
    setActiveIds((ids) => ids.includes(offer.id) ? ids : [...ids, offer.id]);
    setConversations((all) => all[offer.id] ? all : { ...all, [offer.id]: [{ id: "welcome", text: `Bonjour ! Mon offre de ${offer.amount} ${offer.currency} est disponible. Quel moyen de règlement préférez-vous ?`, mine: false, time: "10:42" }] });
  };
  const addOffer = (offer: Offer) => {
    if (!allowed || !isAllowedPair(offer.currency, "DZD") || calculateTotal(offer.amount, offer.rate) === 0 || offer.payments.length === 0) return false;
    setOffers((all) => [offer, ...all]); setPublishOpen(false); return true;
  };
  const sendMessage = (id: string, text: string) => {
    if (!allowed || !text.trim() || !activeIds.includes(id)) return;
    const time = new Intl.DateTimeFormat("fr", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setConversations((all) => ({ ...all, [id]: [...(all[id] ?? []), { id: crypto.randomUUID(), text: text.trim(), mine: true, time }] }));
  };
  const enterDemo = (name: string) => { setUsername(name.trim() || "Karim_G"); setSignedIn(true); setKyc("required"); };
  const signOut = () => { setSignedIn(false); setKyc("required"); setChatOffer(null); setPublishOpen(false); setGateOpen(false); setConversations({}); setActiveIds([]); setCompletedIds([]); setOffers(demoOffers); };
  const completeExchange = (id: string) => { if (!allowed) return; setCompletedIds((ids) => ids.includes(id) ? ids : [...ids, id]); };
  const confirmTrade = (offer: Offer, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0 || amount > offer.amount) return false;
    if (!allowed) { setTradeOffer(null); setGateOpen(true); return false; }
    setTradeAmounts((all) => ({ ...all, [offer.id]: amount }));
    setTradeOffer(null); requestChat(offer); return true;
  };
  const sendMedia = (id: string, media: NonNullable<Message["media"]>) => {
    if (!allowed || !activeIds.includes(id)) return;
    const time = new Intl.DateTimeFormat("fr", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setConversations((all) => ({ ...all, [id]: [...(all[id] ?? []), { id: crypto.randomUUID(), text: "", mine: true, time, media }] }));
  };
  const cleanSignOut = () => { signOut(); setProfilePhoto(""); setTradeOffer(null); setTradeAmounts({}); };
  return <ExchangeContext.Provider value={{ username, signedIn, kyc, offers, gateOpen, publishOpen, chatOffer, conversations, activeIds, completedIds, setGateOpen, setPublishOpen, setChatOffer, setKyc, enterDemo, signOut: cleanSignOut, requestPublish, requestChat, addOffer, sendMessage, completeExchange, tradeOffer, setTradeOffer, tradeAmounts, confirmTrade, profilePhoto, setProfilePhoto, sendMedia }}>{children}</ExchangeContext.Provider>;
}
export function useExchange() {
  const value = useContext(ExchangeContext);
  if (!value) throw new Error("ExchangeProvider is required");
  return value;
}