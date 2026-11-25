import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, LayoutGrid, ShieldCheck, LogOut, ChevronDown, LockKeyhole, Globe, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchange } from "./context";
import type { ReactNode } from "react";

export function CustodyBanner({ compact = false }: { compact?: boolean }) {
  return <div className="custody-banner"><ShieldCheck /><div><strong>Vos fonds restent entre vos mains.</strong>{" "}<span>{compact ? "Règlement direct entre pairs. DZ Exchange ne conserve aucun fonds." : "DZ Exchange ne détient ni ne séquestre aucun fonds. Vos règlements se font directement entre pairs, selon le moyen convenu."}</span></div></div>;
}
export function KycBadge() {
  const { kyc } = useExchange();
  return <span className={`status-pill ${kyc === "verified" ? "verified" : ""}`}><ShieldCheck size={12} />{kyc === "verified" ? "KYC vérifié · démo" : kyc === "pending" ? "KYC en attente" : "KYC requis"}</span>;
}
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { username, signedIn, activeIds, signOut } = useExchange();
  const navigate = useNavigate();
  const initials = username.split(/[_\s]+/).map((part) => part.charAt(0)).slice(0, 2).join("").toUpperCase();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-mark"><ArrowLeftRight size={22} strokeWidth={2.3} /></span><span>DZ Exchange<small>La confiance, sans frontières</small></span></Link>
      <div className="nav-caption">Votre espace</div>
      <nav aria-label="Navigation principale">
        <Link to="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}><LayoutGrid />Marché P2P</Link>
        <Link to="/exchanges" className={`nav-item ${pathname === "/exchanges" ? "active" : ""}`}><ArrowLeftRight />Mes Échanges{activeIds.length > 0 && <span className="nav-count">{activeIds.length}</span>}</Link>
        <Link to="/profile" className={`nav-item ${pathname === "/profile" ? "active" : ""}`}><ShieldCheck />Profil & Sécurité</Link>
      </nav>
      <div className="sidebar-bottom">
        <div className="security-note"><strong><ShieldCheck size={16} className="text-primary" />100 % non-custodial</strong><p>Vous échangez. Vous gardez le contrôle. Nous ne conservons jamais vos fonds.</p></div>
        <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground"><span className="flex items-center gap-2"><Globe size={13} />Français</span><span>DZ / DZD</span></div>
      </div>
    </aside>
    <header className="topbar"><span className="topbar-title"><span className="hidden md:inline">Espace d’échange / </span><span className="md:hidden">DZ Exchange</span><span className="hidden md:inline text-foreground">{pathname === "/" ? "Marché P2P" : pathname === "/exchanges" ? "Mes Échanges" : pathname === "/profile" ? "Profil & Sécurité" : "Connexion"}</span></span><div className="topbar-right"><span className="live-label"><span className="live-dot" />Marché de démonstration</span><span className="demo-label">DÉMO</span>{signedIn ? <><Button variant="ghost" asChild className="h-auto p-0"><Link to="/profile"><span className="avatar">{initials}</span><span className="hidden lg:block text-xs">{username}</span><ChevronDown size={12} /></Link></Button><Button variant="ghost" size="icon" title="Se déconnecter" aria-label="Se déconnecter" onClick={() => { signOut(); void navigate({ to: "/auth" }); }}><LogOut /></Button></> : <Button variant="gold" size="sm" asChild><Link to="/auth">Se connecter</Link></Button>}</div></header>
    <main className="page">{children}<footer className="page-footer"><span>© 2026 DZ Exchange. L’échange direct, en toute confiance.</span><div className="footer-trust"><span><ShieldCheck size={11} />Non-custodial</span><span><LockKeyhole size={11} />Confidentialité</span><Link to="/profile" className="flex items-center gap-1">Sécurité & KYC<ArrowUpRight size={11} /></Link></div></footer></main>
  </div>;
}