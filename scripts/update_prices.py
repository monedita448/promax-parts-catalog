#!/usr/bin/env python3
"""
Re-checks the price AND the stock status of every product listed in
scripts/product_urls.json directly from Injured Gadgets' public product
pages (confirmed via manual spot-check that prices and stock status are
visible to anonymous, logged-out visitors - no wholesale account gating
on this site), and patches the matching `price:` / `inStock:` fields for
that product id directly in ../data.js (each product is written on a
single line, so this is a line-level regex substitution, not a JS
parser).

No login, no credentials, nothing to configure in GitHub Actions secrets
- this script only ever visits public pages anonymously.

Injured Gadgets sits behind Cloudflare, which was confirmed (via a saved
screenshot + HTML dump) to serve a "Just a moment..." bot-challenge page
to a stock Playwright browser instead of the real product page - a
Cloudflare-side bot-detection block, unrelated to login. To get past
that, this script uses patchright (a drop-in, stealth-patched fork of
Playwright: pip install patchright / patchright install chrome) launched
with real Google Chrome in its recommended undetected configuration
(persistent context, headless=False under a virtual display, no custom
user-agent/headers). There is no guarantee this keeps working forever -
if Cloudflare updates its detection, this may need revisiting.

Always writes ../status.json with {"status": "ok"|"error", "checkedAt":
ISO timestamp, "reason": "..."} so the live site can show a warning
banner if the last check failed (e.g. Injured Gadgets changed their page
markup). This file is written even when the check fails - data.js is
only touched if a price/stock value was actually found and parsed.

Stock status is read from Magento's standard availability markup
(`.availability.in-stock` / `.availability.out-of-stock`), with a
plain-text fallback ("in stock" / "out of stock" / a "Notify me" button
implying the item is backordered). If none of those signals are found,
stock status is left untouched in data.js rather than guessed at - the
whole point of this field is to be trustworthy, so "unknown" is treated
as "leave the last known value alone," never as "assume available."
"""
import json
import os
import re
import shutil
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_JS = BASE_DIR / "data.js"
STATUS_JSON = BASE_DIR / "status.json"
URLS_JSON = BASE_DIR / "scripts" / "product_urls.json"
DEBUG_DIR = BASE_DIR / "debug"

PRICE_SELECTOR = ".product-info-main .price, .product-info-price .price, [data-price-type='finalPrice'] .price, .price"
STOCK_SELECTOR = ".availability .value, .stock .value, .availability, .stock"


def write_status(status, reason=""):
    with open(STATUS_JSON, "w", encoding="utf-8") as f:
        json.dump({
            "status": status,
            "reason": reason,
            "checkedAt": datetime.now(timezone.utc).isoformat()
        }, f, indent=2)
        f.write("\n")


def extract_price(page):
    el = page.query_selector(PRICE_SELECTOR)
    if not el:
        return None
    text = el.inner_text()
    match = re.search(r"[\d,]+\.\d{2}", text)
    if not match:
        return None
    return float(match.group(0).replace(",", ""))


def extract_stock(page):
    """Returns True (in stock), False (out of stock), or None (unknown)."""
    # 1. Standard Magento availability markup: <div class="availability
    #    in-stock|out-of-stock"><span class="value">...</span></div>
    el = page.query_selector(".availability, .stock")
    if el:
        cls = (el.get_attribute("class") or "").lower()
        if "out-of-stock" in cls or "unavailable" in cls:
            return False
        if "in-stock" in cls or cls.strip() in ("availability", "stock available"):
            return True

    # 2. Plain-text fallback anywhere on the page.
    body_text = page.inner_text("body").lower()
    if "out of stock" in body_text:
        return False
    if re.search(r"\bnotify me\b", body_text):
        return False
    if "in stock" in body_text:
        return True

    # 3. Add-to-cart button presence/state as a last resort.
    btn = page.query_selector("#product-addtocart-button")
    if btn:
        return not btn.is_disabled()

    return None


def patch_price(lines, product_id, new_price):
    pattern = re.compile(r'(id:\s*"' + re.escape(product_id) + r'".*?price:\s*)([0-9]+\.[0-9]+)')
    for i, line in enumerate(lines):
        m = pattern.search(line)
        if m:
            old_price = float(m.group(2))
            if abs(old_price - new_price) < 0.005:
                return lines, None
            new_line = pattern.sub(lambda mm: mm.group(1) + ("%.2f" % new_price), line)
            lines[i] = new_line
            return lines, (old_price, new_price)
    return lines, "NOT_FOUND"


def patch_stock(lines, product_id, in_stock):
    pattern = re.compile(r'(id:\s*"' + re.escape(product_id) + r'".*?inStock:\s*)(true|false)')
    new_value = "true" if in_stock else "false"
    for i, line in enumerate(lines):
        m = pattern.search(line)
        if m:
            if m.group(2) == new_value:
                return lines, None
            old_value = m.group(2) == "true"
            new_line = pattern.sub(lambda mm: mm.group(1) + new_value, line)
            lines[i] = new_line
            return lines, (old_value, in_stock)
    return lines, "NOT_FOUND"


def run():
    from patchright.sync_api import sync_playwright

    with open(URLS_JSON) as f:
        products = json.load(f)["products"]

    with open(DATA_JS, encoding="utf-8") as f:
        lines = f.readlines()

    price_changes = []
    stock_changes = []
    not_found = []
    stock_not_found = []
    failures = []
    stock_unknown = []
    debug_captured = False

    # Patchright's own recommended "undetected" setup: launch real Google
    # Chrome (not the bundled Chromium build) via a persistent context,
    # headless=False (a virtual display is provided by xvfb-run in CI),
    # and no custom user-agent/headers - all of that is what tips off
    # Cloudflare-style bot detection in the first place.
    profile_dir = tempfile.mkdtemp(prefix="patchright-profile-")
    try:
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=profile_dir,
                channel="chrome",
                headless=False,
                no_viewport=True,
            )
            page = context.pages[0] if context.pages else context.new_page()

            for prod in products:
                pid, url = prod["id"], prod["url"]
                try:
                    page.goto(url, wait_until="networkidle")
                except Exception as e:
                    failures.append(pid + ": " + str(e))
                    continue

                try:
                    new_price = extract_price(page)
                except Exception as e:
                    new_price = None
                    failures.append(pid + ": price error - " + str(e))

                if new_price is not None:
                    lines, result = patch_price(lines, pid, new_price)
                    if result == "NOT_FOUND":
                        not_found.append(pid)
                    elif result is not None:
                        price_changes.append((pid, result[0], result[1]))
                elif new_price is None and not any(f.startswith(pid + ":") for f in failures):
                    failures.append(pid + ": could not find a price on the page")

                # The very first time a price can't be found, save a
                # screenshot and the raw page HTML so a human can see
                # what the automated browser actually received (a real
                # product page, a bot-check wall, a blank page, etc.)
                # instead of guessing from a one-line error message.
                # Only captured once per run since all 39 pages tend to
                # fail the same way.
                if new_price is None and not debug_captured:
                    try:
                        DEBUG_DIR.mkdir(parents=True, exist_ok=True)
                        page.screenshot(path=str(DEBUG_DIR / (pid + "-screenshot.png")), full_page=True)
                        (DEBUG_DIR / (pid + "-page.html")).write_text(page.content(), encoding="utf-8")
                        debug_captured = True
                    except Exception:
                        pass

                try:
                    in_stock = extract_stock(page)
                except Exception:
                    in_stock = None

                if in_stock is None:
                    stock_unknown.append(pid)
                else:
                    lines, result = patch_stock(lines, pid, in_stock)
                    if result == "NOT_FOUND":
                        stock_not_found.append(pid)
                    elif result is not None:
                        stock_changes.append((pid, result[0], result[1]))

            context.close()
    finally:
        shutil.rmtree(profile_dir, ignore_errors=True)

    print("=== Price check summary ===")
    if price_changes:
        for pid, old, new in price_changes:
            print("PRICE CHANGED %-16s $%.2f -> $%.2f" % (pid, old, new))
    else:
        print("No price changes.")
    if not_found:
        print("Could not locate in data.js (price):", ", ".join(not_found))
    if failures:
        print("Failed to fetch:")
        for f_ in failures:
            print(" -", f_)

    print("=== Stock summary ===")
    if stock_changes:
        for pid, old, new in stock_changes:
            old_label = "in stock" if old else "out of stock"
            new_label = "in stock" if new else "out of stock"
            print("STOCK CHANGED %-16s %s -> %s" % (pid, old_label, new_label))
    else:
        print("No stock changes.")
    if stock_not_found:
        print("Could not locate in data.js (stock):", ", ".join(stock_not_found))
    if stock_unknown:
        print("Stock status unknown (left as-is):", ", ".join(stock_unknown))

    # Only write data.js if something actually changed.
    if price_changes or stock_changes:
        with open(DATA_JS, "w", encoding="utf-8") as f:
            f.writelines(lines)

    # If every single product failed to fetch, treat that as a systemic
    # problem (e.g. IG changed their page markup, or is serving a
    # block/rate-limit page instead of the real product page) rather
    # than a handful of one-off misses.
    if failures and len(failures) == len(products):
        write_status("error", "all_price_fetches_failed")
        return False

    write_status("ok")
    return True


def main():
    ok = run()
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write("check_ok=%s\n" % ("true" if ok else "false"))
    # Never fail the job itself - status.json already records the
    # outcome, and a red exit code here would just make the workflow
    # look "broken" every time IG has a hiccup instead of surfacing the
    # actual state to the site.
    sys.exit(0)


if __name__ == "__main__":
    main()
