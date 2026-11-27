import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowLeftRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const PresentationContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

export function ExchangePresentation({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [splash, setSplash] = useState<"visible" | "leaving" | "hidden">("visible");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dz-exchange-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
      if (sessionStorage.getItem("dz-exchange-introduced")) {
        setSplash("hidden");
        return;
      }
      sessionStorage.setItem("dz-exchange-introduced", "true");
    } catch { /* The app remains usable when browser storage is unavailable. */ }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = window.setTimeout(() => setSplash("leaving"), reduced ? 100 : 1400);
    const end = window.setTimeout(() => setSplash("hidden"), reduced ? 150 : 1850);
    return () => { window.clearTimeout(fade); window.clearTimeout(end); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("dz-exchange-theme", next); } catch { /* Optional preference only. */ }
  };

  return <PresentationContext.Provider value={{ theme, toggleTheme }}>
    <div className={`presentation-root ${theme === "dark" ? "dark" : ""}`}>{children}</div>
    {splash !== "hidden" && <div className="splash-screen" data-leaving={splash === "leaving"} role="status" aria-label="Ouverture de DZ Exchange">
      <div className="splash-identity"><span className="brand-mark splash-mark"><ArrowLeftRight strokeWidth={2.3} /></span><strong>DZ Exchange</strong><span className="splash-loader" aria-hidden="true"><i /><i /><i /></span></div>
    </div>}
  </PresentationContext.Provider>;
}

export function ThemeToggle() {
  const presentation = useContext(PresentationContext);
  if (!presentation) return null;
  const label = presentation.theme === "dark" ? "Passer au mode clair" : "Passer au mode sombre";
  return <Button variant="ghost" size="icon" className="theme-toggle" aria-label={label} title={label} onClick={presentation.toggleTheme}>{presentation.theme === "dark" ? <Sun /> : <Moon />}</Button>;
}