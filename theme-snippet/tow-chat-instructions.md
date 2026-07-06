# Adding the chat widget to your Shopify theme

These steps show you exactly where to paste the snippet so the chat widget appears on every page of theorganizingwarehouse.co.uk.

## Step 1 — Add the snippet file

1. In your Shopify admin, go to **Online Store → Themes**.
2. Find your live (published) theme, click the **⋮** (three dots) menu, and choose **Edit code**.
3. In the file list on the left, find the **Snippets** folder.
4. Click **Add a new snippet**.
5. Name it exactly: `tow-chat-widget` (Shopify will automatically save it as `tow-chat-widget.liquid`).
6. Open the new empty file, delete anything in it, and paste in the **entire contents** of `tow-chat-widget.liquid` from this repo.
7. Click **Save**.

## Step 2 — Set your backend URL

Before saving, find this line near the top of the `<script>` tag (about two-thirds of the way down the file):

```js
var TOW_CHAT_BACKEND_URL = 'https://your-app-name.up.railway.app';
```

Replace `https://your-app-name.up.railway.app` with the actual URL of your deployed Railway backend (see the main `README.md` for deployment steps). Keep the quotes, and make sure there's no trailing slash at the end of the URL.

## Step 3 — Render it on every page

1. Still in **Edit code**, open the **Layout** folder.
2. Open `theme.liquid` — this is the file that wraps every page of your store.
3. Scroll down and find the closing `</body>` tag near the bottom of the file.
4. Just **above** the `</body>` tag, add this single line:

```liquid
{% render 'tow-chat-widget' %}
```

5. Click **Save**.

That's it — the chat button will now appear in the bottom-right corner on every page of your storefront.

## Testing it

1. Visit your storefront (use the **Preview** button in the theme editor, or your live site).
2. You should see a round teal button in the bottom-right corner.
3. Click it to open the chat panel, type a question (e.g. "what shoe organisers do you have?"), and press Enter or tap the send button.
4. If nothing happens after sending a message, open your browser's developer console (right-click → Inspect → Console tab) and check for errors — the most common cause is the backend URL in Step 2 being wrong, or the backend not allowing your storefront's domain in CORS (see the main README).

## Changing the colours later

Near the top of the `<style>` block in `tow-chat-widget.liquid`, you'll find these two lines:

```css
--tow-chat-primary: #2a6b6b;
--tow-chat-primary-dark: #1f5252;
```

Change `#2a6b6b` to any hex colour to re-theme the button and header, and adjust `--tow-chat-primary-dark` to a slightly darker shade for the hover state.
