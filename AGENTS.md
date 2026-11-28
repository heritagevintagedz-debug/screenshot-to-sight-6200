<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Keep demo exchange state in the shared ExchangeProvider; session-only simulated identity and messaging must not be presented as real authentication, KYC, or encryption.
- Keep currency-pair validation, KYC action gating, and DZD calculations in the exchange model and provider, with concrete unit tests so every entry point follows the same rules.
- Use top-level TanStack routes for the market, exchange tracking, profile, and demo sign-in, with the shared shell in the root route to preserve navigation and session state.
- Keep theme preference and the once-per-tab introduction in ExchangePresentation, separate from ExchangeProvider, so visual changes cannot alter exchange state; browser storage holds presentation preferences only.
- Keep dashboard statistics as tested read-only projections of ExchangeProvider and dashboard offer shortcuts local to the dashboard; this avoids changing market behavior or inventing financial activity, payment confirmation, or missing dates.
