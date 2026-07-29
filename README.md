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
- `gate.js` — a basic client-side password gate shown on first visit
  (per browser). Not real security — just enough to keep the link from
  being casually stumbled on. Change the password by generating a new
  SHA-256 hex hash (`node -e "console.log(require('crypto').createHash('sha256').update('NEWPASS').digest('hex'))"`)
  and swapping `HASH_HEX` in `gate.js`.
- Each product card (when in stock) has a "Download image for client"
  button — generates a plain PNG with just the product photo and its
  name (no price, grade, or sourcing info) for Pablo to send to his own
  customers.
- A "Hide prices" button in the header instantly hides every price, COP
  conversion, and shipping calculator on the page (the product photo,
  name, grade, and download button stay visible) — for browsing the
  catalog with someone else looking at the screen. It resets to visible
  on every fresh page load; it does not persist.

## Updating prices and stock

Prices *and stock status* update themselves. A GitHub Actions workflow
(`.github/workflows/update-prices.yml`) runs every 2 days, visits each of
the 39 tracked product pages (`scripts/product_urls.json`) on Injured
Gadgets **anonymously — no login, no account, no credentials** (confirmed
by checking their site logged out: prices and stock status are fully
public), and commits straight to `data.js` if anything changed. Nothing
to configure, nothing to run yourself, no GitHub secrets needed at all.

If a product goes out of stock, its card on the site automatically gets
a red "Out of stock" badge, drops its price/shipping calculator (so Pablo
can't accidentally quote it), and sinks to the bottom of its category —
so he only ever sees "ready to quote" parts at a glance. If the site
can't tell whether something is in stock (page markup changed, page
didn't load, etc.), it leaves the last known status alone rather than
guessing — it will never silently assume something is available.

**Worth knowing:**
- If Injured Gadgets changes their page markup, the script will fail
  loudly (visible in the Actions tab, and via the red banner on the live
  site) rather than silently writing bad data — `data.js` is only
  overwritten if a price/stock value was actually found and parsed.
- You can trigger a check manually any time from the Actions tab
  ("Update parts prices" → "Run workflow"), no need to wait 2 days.
- `colors` and `note` fields are not auto-updated — edit those in
  `data.js` by hand if they ever change.

## Running it locally

Just open `index.html` in a browser. For local testing with a simple
server: `python3 -m http.server` from this folder, then visit
`http://localhost:8000`.
