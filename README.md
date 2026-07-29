# Pro Max parts catalog

A static, self-contained sales reference for genuine iPhone 12–17 Pro Max repair
parts (display, back housing, camera, charging port, speaker), plus a
USD/COP currency converter for quick quoting.

No build step, no server, no external accounts required to run it — it's
plain HTML/CSS/JS.

## Structure

- `index.html` / `styles.css` / `app.js` / `data.js` — the parts catalog:
  model tabs, search across all models, a per-part shipping calculator
  (part price + selected shipping option = total), a USD price plus its
  COP equivalent on every card, and an EN/ES toggle in the header.
- `i18n.js` — English/Spanish text for the catalog UI, grades, categories,
  colors, and shipping option labels.
- `rates.js` — shared USD→COP rate fetcher/cache (localStorage, refreshed
  once a day). Used by both the catalog's COP equivalents and
  `calculadora.html`, so they always agree on the same rate.
- `calculadora.html` — the standalone USD ⇄ COP converter ("Calculadora
  dólares/pesos"), linked from the catalog header. Falls back to the
  cached rate if offline.
- `image-manifest.json` / `fetch_images.py` — used once, locally, to pull
  the real product photos into `images/` before the first commit. Neither
  file is meant to end up in the published repo (see `.gitignore`).

## Updating prices and stock

Prices *and stock status* update themselves. A GitHub Actions workflow
(`.github/workflows/update-prices.yml`) runs every 2 days, logs into
Injured Gadgets with the credentials in your repo secrets, re-checks the
price and availability on each of the 39 tracked product pages
(`scripts/product_urls.json`), and commits straight to `data.js` if
anything changed — no manual editing, no OpenCode step, nothing to run
yourself.

If a product goes out of stock, its card on the site automatically gets
a red "Out of stock" badge, drops its price/shipping calculator (so Pablo
can't accidentally quote it), and sinks to the bottom of its category —
so he only ever sees "ready to quote" parts at a glance. If the site
can't tell whether something is in stock (page markup changed, page
didn't load, etc.), it leaves the last known status alone rather than
guessing — it will never silently assume something is available.

**One-time setup**, in the GitHub repo's Settings → Secrets and variables
→ Actions:
- `IG_EMAIL` — your Injured Gadgets account email
- `IG_PASSWORD` — your Injured Gadgets account password

That's it — the workflow already has write access to push commits.

**Worth knowing:**
- This logs into your real wholesale account on an unattended schedule.
  Some sites flag or rate-limit automated logins from cloud IP ranges;
  if that ever happens to your account, disable the workflow (Actions
  tab → "Update parts prices" → "..." → Disable) and fall back to
  editing `data.js` by hand.
- If Injured Gadgets changes their login page or price markup, the
  script will fail loudly (visible in the Actions tab) rather than
  silently writing bad data — `data.js` is only overwritten if a price
  was actually found and parsed.
- You can trigger a check manually any time from the Actions tab
  ("Update parts prices" → "Run workflow"), no need to wait 2 days.
- `colors` and `note` fields are not auto-updated — edit those in
  `data.js` by hand if they ever change.

## Running it locally

Just open `index.html` in a browser. For local testing with a simple
server: `python3 -m http.server` from this folder, then visit
`http://localhost:8000`.
