import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/exchange/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Tableau de bord — DZ Exchange" },
    { name: "description", content: "Votre tableau de bord DZ Exchange : suivi de vos échanges, annonces P2P et devises EUR, USD et CAD contre DZD. Démonstration sans fonds détenus." },
    { property: "og:title", content: "Tableau de bord — DZ Exchange" },
    { property: "og:description", content: "Retrouvez votre activité, vos annonces et les offres de devises dans votre espace personnel DZ Exchange." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});