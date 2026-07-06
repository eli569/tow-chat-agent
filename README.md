# tow-chat-agent

AI shopping assistant for [The Organizing Warehouse](https://theorganizingwarehouse.co.uk), built for their Shopify store (`b4txwx-6t.myshopify.com`).

Two parts:

1. **`src/`** — a Node.js/Express backend that talks to the Anthropic API (Claude Haiku 4.5) with tool use wired up to the store's Shopify Storefront MCP endpoint. Deployable to [Railway](https://railway.app).
2. **`theme-snippet/`** — a self-contained Liquid snippet (inline CSS + JS) for a floating chat widget, plus plain-English instructions for pasting it into the Shopify theme editor.

## How it works

The storefront widget POSTs each message to `/chat` on the backend, along with the running conversation history. The backend streams Claude's reply back over Server-Sent Events. When Claude decides it needs live store data, it calls one of four tools, which the backend fulfils by making a JSON-RPC 2.0 request to the Shopify Storefront MCP endpoint (`https://b4txwx-6t.myshopify.com/api/mcp`):

- `search_shop_catalog` — natural-language product search
- `get_cart` — retrieve the current cart
- `update_cart` — add/remove/update cart lines
- `search_shop_policies_and_faqs` — shipping, returns, and other policy questions

The tool result is sent back to Claude, which then continues generating its reply.

## Local development

```bash
npm install
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY
npm run dev
```

The server starts on `http://localhost:3000` by default (`GET /health` to check it's alive).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key. |
| `PORT` | Yes (Railway sets this automatically) | Port the Express server listens on. |
| `SHOPIFY_MCP_ENDPOINT` | No | Overrides the Shopify Storefront MCP URL. Defaults to `https://b4txwx-6t.myshopify.com/api/mcp`. |

## Deploying to Railway

1. Push this repo to GitHub (already done if you're reading this from `github.com/eli569/tow-chat-agent`).
2. In [Railway](https://railway.app), click **New Project → Deploy from GitHub repo** and select `tow-chat-agent`.
3. Railway will detect `railway.json` and use Nixpacks to build it automatically — no extra build configuration needed.
4. In the Railway project's **Variables** tab, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - (Railway sets `PORT` itself — you don't need to add it manually.)
5. Deploy. Once live, copy the public Railway URL (e.g. `https://tow-chat-agent-production.up.railway.app`).
6. Paste that URL into `TOW_CHAT_BACKEND_URL` in `theme-snippet/tow-chat-widget.liquid` (see `theme-snippet/tow-chat-instructions.md` for exactly where).

## CORS

The backend only allows browser requests from:

- `https://theorganizingwarehouse.co.uk`
- `https://b4txwx-6t.myshopify.com`

If you test from a different domain (e.g. a custom preview URL), you'll need to add it to `ALLOWED_ORIGINS` in `src/server.js`.
