#!/usr/bin/env python3
"""
Re-checks the price AND the stock status of every product in the
catalog, for BOTH suppliers, and patches the matching `price:` /
`inStock:` fields for that product id directly in ../data.js (each
product is written on a single line, so this is a line-level regex
substitution, not a JS parser).

Injured Gadgets (Supplier 1): one page per product, listed in
scripts/product_urls.json - prices/stock are visible to anonymous,
logged-out visitors (confirmed via manual spot-check, no wholesale
account gating on this site).

MobileSentrix (Supplier 2): has no per-SKU page like that - instead each
Pro Max model's whole genuine-parts catalog is one page
(scripts/mobilesentrix_categories.json lists the 6 category page URLs,
one per model, plus an include/exclude substring matcher per catalog
product id telling this script which tile on that model's page is which
product - see that file's own _comment for how the matchers work).

No login, no credentials, nothing to configure in GitHub Actions secrets
for either supplier - this script only ever visits public pages
anonymously.

Injured Gadgets sits behind Cloudflare, which was confirmed (via a saved
screenshot + HTML dump) to serve a "Just a moment..." bot-challenge page
to a stock Playwright browser instead of the real product page - a
Cloudflare-side bot-detection block, unrelated to login. To get past
that, this script uses patchright (a drop-in, stealth-patched fork of
Playwright: pip install patchright / patchright install chrome) launched
with real Google Chrome in its recommended undetected configuration
(persistent context, headless=False under a virtual display, no custom
user-agent/headers). There is no guarantee this keeps working forever -
if Cloudflare updates its detection, this may need revisiting. The same
browser session is reused for MobileSentrix afterwards, both as a
convenience and because there's no reason to assume MobileSentrix is any
less likely to bot-block a plain scraper than Injured Gadgets was.

Always writes ../status.json with {"status": "ok"|"error", "checkedAt":
ISO timestamp, "reason": "..."} so the live site can show a warning
banner if the last check failed (e.g. either supplier changed their page
markup). This file is written even when the check fails - data.js is
only touched if a price/stock value was actually found and parsed.

Stock status: for Injured Gadgets, read from Magento's standard
availability markup (`.availability.in-stock` / `.availability.out-of-
stock`), with a plain-text fallback ("in stock" / "out of stock" / a
"Notify me" button implying the item is backordered). For MobileSentrix,
read directly from each product tile's own add-to-cart button text
("Add to Cart" vs "Notify Me"). In both cases, if no stock signal can be
found at all, stock status is left untouched in data.js rather than
guessed at - the whole point of this field is to be trustworthy, so
"unknown" is treated as "leave the last known value alone," never as
"assume available."
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
MS_CATEGORIES_JSON = BASE_DIR / "scripts" / "mobilesentrix_categories.json"
DEBUG_DIR = BASE_DIR / "debug"

PRICE_SELECTOR = ".product-info-main .price, .product-info-price .price, [data-price-type='finalPrice'] .price, .price"
STOCK_SELECTOR = ".availability .value, .stock .value, .availability, .stock"

# MobileSentrix's own markup (confirmed live, 31 jul 2026): product tiles
# are `li.item` inside `ul.product-listing.products-grid`; the name is in
# `h2.product-name`; the price actually charged (what this catalog uses,
# the "Without Core" tier) is oddly under a span classed
# `regular-price price` rather than `special-price` - the higher,
# strikethrough MSRP-like reference number is under `old-price price`
# instead. Stock is read straight off the tile's own add-to-cart button
# text rather than any separate availability element.
MS_TILE_SELECTOR = "ul.product-listing.products-grid li.item"
MS_NAME_SELECTOR = "h2.product-name"
MS_PRICE_SELECTOR = ".price-box .regular-price.price"
MS_CART_BUTTON_SELECTOR = ".btn-cart, .notify_btn button"


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


def extract_ms_tiles(page):
    """Reads every product tile on a MobileSentrix category page into a
    list of {"name", "price", "inStock"} dicts. price/inStock are None
    when that particular tile is missing the expected markup - callers
    treat that the same as "couldn't find it," never as a guessed value.
    """
    tiles = page.query_selector_all(MS_TILE_SELECTOR)
    results = []
    for tile in tiles:
        name_el = tile.query_selector(MS_NAME_SELECTOR)
        if not name_el:
            continue
        name = name_el.inner_text().strip()

        price = None
        price_el = tile.query_selector(MS_PRICE_SELECTOR)
        if price_el:
            m = re.search(r"[\d,]+\.\d{2}", price_el.inner_text())
            if m:
                price = float(m.group(0).replace(",", ""))

        in_stock = None
        btn = tile.query_selector(MS_CART_BUTTON_SELECTOR)
        if btn:
            btn_text = btn.inner_text().strip().lower()
            if btn_text:
                in_stock = "notify" not in btn_text

        results.append({"name": name, "price": price, "inStock": in_stock})
    return results


def match_ms_tile(tiles, matcher):
    """Finds the one tile on a model's category page that corresponds to
    a given catalog product id, per its include/exclude/preferExcluding
    substring rules (see mobilesentrix_categories.json's own _comment).
    Returns None if nothing matches - callers leave data.js untouched for
    that id rather than guessing.
    """
    include = matcher.get("include", [])
    exclude = matcher.get("exclude", [])
    prefer_excluding = matcher.get("preferExcluding", [])

    def is_match(t):
        n = t["name"].lower()
        return all(s in n for s in include) and not any(s in n for s in exclude)

    candidates = [t for t in tiles if is_match(t)]
    if not candidates:
        return None
    if prefer_excluding:
        narrowed = [t for t in candidates if not any(s in t["name"].lower() for s in prefer_excluding)]
        if narrowed:
            candidates = narrowed
    return candidates[0]


def scrape_mobilesentrix(page, lines):
    """Visits each Pro Max model's MobileSentrix genuine-parts category
    page once, matches every MobileSentrix catalog product id against a
    tile on the right page, and patches data.js the same way the
    Injured Gadgets loop in run() does. Returns the (possibly patched)
    lines plus a summary dict for the console report / status.json.
    """
    with open(MS_CATEGORIES_JSON, encoding="utf-8") as f:
        config = json.load(f)

    tiles_by_model = {}
    page_failures = []
    for cat in config["categoryPages"]:
        try:
            page.goto(cat["url"], wait_until="networkidle")
            tiles_by_model[cat["model"]] = extract_ms_tiles(page)
        except Exception as e:
            page_failures.append(cat["model"] + ": " + str(e))
            tiles_by_model[cat["model"]] = []

    price_changes = []
    stock_changes = []
    not_found = []
    stock_unknown = []

    for matcher in config["matchers"]:
        pid = matcher["id"]
        tile = match_ms_tile(tiles_by_model.get(matcher["model"], []), matcher)
        if not tile:
            not_found.append(pid)
            continue

        if tile["price"] is not None:
            lines, result = patch_price(lines, pid, tile["price"])
            if result == "NOT_FOUND":
                not_found.append(pid + " (id missing from data.js)")
            elif result is not None:
                price_changes.append((pid, result[0], result[1]))

        if tile["inStock"] is None:
            stock_unknown.append(pid)
        else:
            lines, result = patch_stock(lines, pid, tile["inStock"])
            if result is not None and result != "NOT_FOUND":
                stock_changes.append((pid, result[0], result[1]))

    summary = {
        "price_changes": price_changes,
        "stock_changes": stock_changes,
        "not_found": not_found,
        "stock_unknown": stock_unknown,
        "page_failures": page_failures,
        "all_pages_failed": len(page_failures) == len(config["categoryPages"]),
    }
    return lines, summary


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

            # Same browser session, same undetected Chrome setup - reused
            # for MobileSentrix (Supplier 2) right after Injured Gadgets
            # (Supplier 1) so this stays a single script/workflow run with
            # a single commit, rather than needing a second scheduled job.
            lines, ms_summary = scrape_mobilesentrix(page, lines)

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

    print("=== MobileSentrix check summary ===")
    if ms_summary["price_changes"]:
        for pid, old, new in ms_summary["price_changes"]:
            print("PRICE CHANGED %-16s $%.2f -> $%.2f" % (pid, old, new))
    else:
        print("No price changes.")
    if ms_summary["stock_changes"]:
        for pid, old, new in ms_summary["stock_changes"]:
            old_label = "in stock" if old else "out of stock"
            new_label = "in stock" if new else "out of stock"
            print("STOCK CHANGED %-16s %s -> %s" % (pid, old_label, new_label))
    else:
        print("No stock changes.")
    if ms_summary["not_found"]:
        print("Could not match a tile to these catalog ids:", ", ".join(ms_summary["not_found"]))
    if ms_summary["stock_unknown"]:
        print("Stock status unknown (left as-is):", ", ".join(ms_summary["stock_unknown"]))
    if ms_summary["page_failures"]:
        print("Category pages that failed to load:")
        for f_ in ms_summary["page_failures"]:
            print(" -", f_)

    # Only write data.js if something actually changed, from either supplier.
    if price_changes or stock_changes or ms_summary["price_changes"] or ms_summary["stock_changes"]:
        with open(DATA_JS, "w", encoding="utf-8") as f:
            f.writelines(lines)

    # If every single Injured Gadgets product failed to fetch, or every
    # single MobileSentrix category page failed to load, treat that as a
    # systemic problem for that supplier (e.g. the site changed its page
    # markup, or is serving a block/rate-limit page) rather than a
    # handful of one-off misses, and surface which supplier broke.
    ig_broken = bool(failures) and len(failures) == len(products)
    ms_broken = ms_summary["all_pages_failed"]
    if ig_broken and ms_broken:
        write_status("error", "all_price_fetches_failed_both_suppliers")
        return False
    if ig_broken:
        write_status("error", "all_price_fetches_failed_injured_gadgets")
        return False
    if ms_broken:
        write_status("error", "all_category_pages_failed_mobilesentrix")
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
