(function () {
  var tabsEl = document.getElementById('tabs');
  var gridEl = document.getElementById('grid');
  var searchEl = document.getElementById('search');
  var notesEl = document.getElementById('notes');
  var brandEl = document.getElementById('brand');
  var calcLinkEl = document.getElementById('calcLink');
  var langBtn = document.getElementById('langBtn');
  var hidePricesBtn = document.getElementById('hidePricesBtn');

  var activeModel = CATALOG[0].model;
  var lang = getLang();
  var rateState = { rate: null, offline: false, loaded: false };
  // Not persisted on purpose: prices should default back to visible on a
  // fresh load, and only be hidden with a deliberate tap right before
  // showing the screen to someone else.
  var pricesHidden = false;

  var ERROR_BANNER_LINE1 = "Hay un problema con el sistema que verifica los precios y la disponibilidad — por favor llama a Felipe antes de cotizar con esta información.";

  function checkStatusBanner() {
    fetch('status.json', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || data.status !== 'error') return;
        var banner = document.getElementById('errorBanner');
        banner.querySelector('.error-banner-line1').textContent = ERROR_BANNER_LINE1;
        banner.style.display = 'block';
      })
      .catch(function () {});
  }

  function t(dict) {
    return dict[lang] || dict.en;
  }

  function money(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
  }

  function copEquivalent(usd) {
    if (!rateState.rate) return null;
    var cop = usd * rateState.rate;
    return '≈ ' + Math.round(cop).toLocaleString('es-CO') + ' COP' + (rateState.offline ? ' (' + t(UI_STRINGS).rateOffline + ')' : '');
  }

  function gradeBadgeClass(gradeKey) {
    return gradeKey.indexOf('genuine') === 0 ? 'genuine' : 'premium';
  }

  // --- Estimated arrival in Colombia -----------------------------------
  // Domestic leg (per selected shipping method) + 1 day for the US drop
  // address to hand off to the freight consolidator + 3 days for the
  // international leg to Colombia. Cutoff times are in Eastern time
  // (where Injured Gadgets ships from), read via Intl so it's correct
  // regardless of the visitor's own timezone or DST.

  function nowInEastern() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    return new Date(parseInt(map.year, 10), parseInt(map.month, 10) - 1, parseInt(map.day, 10), parseInt(map.hour, 10), parseInt(map.minute, 10));
  }

  function addBusinessDays(date, days) {
    var result = new Date(date.getTime());
    var remaining = days;
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      var dow = result.getDay();
      if (dow !== 0 && dow !== 6) remaining--;
    }
    return result;
  }

  // Next date strictly after `date` that falls on `targetDow` (0=Sun..6=Sat).
  function nextWeekdayAfter(date, targetDow) {
    var result = new Date(date.getTime());
    result.setDate(result.getDate() + 1);
    while (result.getDay() !== targetDow) {
      result.setDate(result.getDate() + 1);
    }
    return result;
  }

  function formatEtaDate(date) {
    var locale = lang === 'es' ? 'es-CO' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // UTC offset (in minutes) of `timeZone` at the given instant - handles
  // DST automatically since it's evaluated at that specific date.
  function getUtcOffsetMinutes(timeZone, date) {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: timeZone, timeZoneName: 'shortOffset' }).formatToParts(date);
    var tzPart = parts.filter(function (p) { return p.type === 'timeZoneName'; })[0];
    var match = tzPart ? /GMT([+-]\d+)/.exec(tzPart.value) : null;
    var hours = match ? parseInt(match[1], 10) : -5;
    return hours * 60;
  }

  // The real UTC instant for a given Eastern-time wall clock (year/month/
  // day/hour), used only to convert the business-rule cutoff (always
  // evaluated in Eastern time) into a real instant we can then re-display
  // in the visitor's own local time.
  function easternWallTimeToInstant(year, month, day, hourDecimal) {
    var h = Math.floor(hourDecimal);
    var m = Math.round((hourDecimal - h) * 60);
    var approx = new Date(Date.UTC(year, month, day, h, m));
    var offsetMin = getUtcOffsetMinutes('America/New_York', approx);
    return new Date(Date.UTC(year, month, day, h, m) - offsetMin * 60000);
  }

  // Displays the cutoff time in the visitor's own local time (no timeZone
  // passed, so it uses the browser's local zone) and with no timezone
  // label - just a plain local clock time, so it can't be misread as
  // Eastern time.
  function formatLocalCutoffTime(cutoffHour, shipDate) {
    var instant = easternWallTimeToInstant(shipDate.getFullYear(), shipDate.getMonth(), shipDate.getDate(), cutoffHour);
    var locale = lang === 'es' ? 'es-CO' : 'en-US';
    return instant.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Shared date math for both the domestic (US drop address) and Colombia
  // ETA messages, so they always agree on the same ship date / cutoff.
  // Returns null for methods with no real transit estimate (pickup, combine).
  function computeEtaDates(opt) {
    if (!opt || (!opt.transitDays && !opt.fridayOnly)) return null;

    var easternNow = nowInEastern();
    var dow = easternNow.getDay();
    var hourDecimal = easternNow.getHours() + easternNow.getMinutes() / 60;
    var isWeekday = dow >= 1 && dow <= 5;
    var beforeCutoff = hourDecimal < opt.cutoffHour;

    var shipDate;
    var orderIsToday;

    if (opt.fridayOnly) {
      if (dow === 5 && beforeCutoff) {
        shipDate = new Date(easternNow.getTime());
        orderIsToday = true;
      } else {
        shipDate = nextWeekdayAfter(easternNow, 5);
        orderIsToday = false;
      }
    } else if (isWeekday && beforeCutoff) {
      shipDate = new Date(easternNow.getTime());
      orderIsToday = true;
    } else {
      var tmp = new Date(easternNow.getTime());
      tmp.setDate(tmp.getDate() + 1);
      while (tmp.getDay() === 0 || tmp.getDay() === 6) tmp.setDate(tmp.getDate() + 1);
      shipDate = tmp;
      orderIsToday = false;
    }

    var domesticArrival;
    if (opt.fridayOnly) {
      // "Saturday Delivery" per policy - the day right after the Friday ship date.
      domesticArrival = new Date(shipDate.getTime());
      domesticArrival.setDate(domesticArrival.getDate() + 1);
    } else {
      domesticArrival = addBusinessDays(shipDate, opt.transitDays);
    }

    var handoff = new Date(domesticArrival.getTime());
    handoff.setDate(handoff.getDate() + COLOMBIA_HANDOFF_DAYS);

    var colombiaArrival = new Date(handoff.getTime());
    colombiaArrival.setDate(colombiaArrival.getDate() + COLOMBIA_TRANSIT_DAYS);

    // Shown in the visitor's own local time, not Eastern - the cutoff
    // itself is still evaluated in Eastern time above (that's the real
    // business rule), this is just a friendlier display conversion.
    var cutoffStr = formatLocalCutoffTime(opt.cutoffHour, shipDate);

    var dayPhrase;
    if (orderIsToday) {
      dayPhrase = lang === 'es' ? 'hoy' : 'today';
    } else {
      var weekdayNames = lang === 'es'
        ? ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var name = weekdayNames[shipDate.getDay()];
      dayPhrase = lang === 'es' ? ('el ' + name) : ('on ' + name);
    }

    return {
      shipDate: shipDate,
      domesticArrival: domesticArrival,
      colombiaArrival: colombiaArrival,
      cutoffStr: cutoffStr,
      dayPhrase: dayPhrase,
      fridayOnly: !!opt.fridayOnly
    };
  }

  // Returns a warning string like "Most likely in Colombia by Thursday,
  // August 6 if ordered before 7:00 PM (Eastern Time) today." or null for
  // methods with no real transit estimate (pickup, combine).
  function colombiaEtaMessage(opt) {
    var d = computeEtaDates(opt);
    if (!d) return null;
    var dateStr = formatEtaDate(d.colombiaArrival);

    if (lang === 'es') {
      return (d.fridayOnly ? 'Este método solo se envía los viernes. ' : '') +
        'Llegaría a Colombia aproximadamente el ' + dateStr + ' si se ordena antes de las ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
    }
    return (d.fridayOnly ? 'This method only ships on Fridays. ' : '') +
      'Most likely in Colombia by ' + dateStr + ' if ordered before ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
  }

  // Approximate arrival at the US drop address (Casa F / Tía Express)
  // itself, before it's forwarded on to Colombia. Returns null for
  // methods with no real transit estimate (pickup, combine).
  function domesticEtaMessage(opt, destLabel) {
    var d = computeEtaDates(opt);
    if (!d) return null;
    var dateStr = formatEtaDate(d.domesticArrival);

    if (lang === 'es') {
      return 'Llegaría a ' + destLabel + ' aproximadamente el ' + dateStr + ' si se ordena antes de las ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
    }
    return 'Most likely at ' + destLabel + ' by ' + dateStr + ' if ordered before ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
  }

  // Injured Gadgets' published shipping rates are NOT flat - each method
  // is free once the item's price clears that method's freeOver
  // threshold, otherwise it costs the listed price. This mirrors their
  // own shipping-policy page rather than a flat per-method number.
  // fedex-priority-ON is also region-priced - destinationState decides
  // whether it's the $18 or $25 tier.
  function shippingCost(opt, productPrice, destinationState) {
    if (!opt) return 0;
    var basePrice = opt.regional
      ? (FEDEX_PRIORITY_LOW_TIER_STATES.indexOf(destinationState) !== -1 ? opt.priceLowTier : opt.priceOtherStates)
      : opt.price;
    return productPrice >= opt.freeOver ? 0 : basePrice;
  }

  function shippingOptionsHtml(selectedId, productPrice, destinationState) {
    // Spanish (Pablo's view) gets a trimmed list - one option per carrier
    // plus a fast option - so it isn't cluttered with near-duplicate
    // expedited tiers. English keeps the full list intact.
    var visibleOptions = lang === 'es'
      ? SHIPPING_OPTIONS.filter(function (opt) { return SHIPPING_OPTIONS_ES_VISIBLE.indexOf(opt.id) !== -1; })
      : SHIPPING_OPTIONS;
    return visibleOptions.map(function (opt) {
      var sel = opt.id === selectedId ? ' selected' : '';
      var label = t(SHIPPING_I18N[opt.id]);
      var cost = shippingCost(opt, productPrice, destinationState);
      var priceLabel = cost === 0 ? t(UI_STRINGS).free : money(cost);
      return '<option value="' + opt.id + '"' + sel + '>' + label + ' (' + priceLabel + ')</option>';
    }).join('');
  }

  function destinationOptionsHtml(productId, selectedId) {
    return SHIP_DESTINATIONS.map(function (dest) {
      var checked = dest.id === selectedId ? ' checked' : '';
      var inputId = 'dest-' + productId + '-' + dest.id;
      return '<label class="destination-option" for="' + inputId + '">' +
        '<input type="radio" id="' + inputId + '" name="dest-' + productId + '" value="' + dest.id + '"' + checked + '> ' +
        dest.label +
      '</label>';
    }).join('');
  }

  function applyStaticStrings() {
    var s = t(UI_STRINGS);
    document.documentElement.lang = lang;
    brandEl.textContent = s.brand;
    searchEl.placeholder = s.searchPlaceholder;
    calcLinkEl.textContent = s.calcLink;
    langBtn.textContent = s.langButton;
    hidePricesBtn.textContent = pricesHidden ? s.showPrices : s.hidePrices;
  }

  function renderTabs() {
    tabsEl.innerHTML = CATALOG.map(function (m) {
      var cls = 'tab-btn' + (m.model === activeModel ? ' active' : '');
      return '<button class="' + cls + '" data-model="' + m.model + '">' + m.label + '</button>';
    }).join('');

    Array.prototype.forEach.call(tabsEl.querySelectorAll('.tab-btn'), function (btn) {
      btn.addEventListener('click', function () {
        activeModel = btn.getAttribute('data-model');
        searchEl.value = '';
        renderTabs();
        renderGrid();
      });
    });
  }

  // Recommends a shipping method given the selected margin, balancing
  // speed against cost: at higher margin tiers (75%/100%) there's enough
  // cushion to suggest the fastest option regardless of a modest shipping
  // cost; at lower tiers (50%/60%) it suggests the cheapest option so the
  // shipping cost doesn't eat into the thinner margin. This is shown only
  // as a suggestion under the dropdown - it never changes the selection.
  function suggestBestShippingId(visibleOptions, productPrice, destinationState, margin) {
    var candidates = visibleOptions
      .filter(function (o) { return typeof o.transitDays === 'number'; })
      .map(function (o) {
        return { id: o.id, cost: shippingCost(o, productPrice, destinationState), transitDays: o.transitDays };
      });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) {
      if (margin >= 0.75) {
        return (a.transitDays - b.transitDays) || (a.cost - b.cost);
      }
      return (a.cost - b.cost) || (a.transitDays - b.transitDays);
    });
    return candidates[0].id;
  }

  // Builds the plain-text order message sent to Pablo's own WhatsApp
  // number: every detail he'd need to place and quote the order - part,
  // quantity, shipping method, pickup address, Colombia freight and ETA,
  // total landed cost, margin, and suggested price. No source-website
  // link - that's only relevant on the sourcing side, not for Pablo.
  function buildOrderMessage(details) {
    var shippingLabel = t(SHIPPING_I18N[details.shippingOptId] || { en: details.shippingOptId, es: details.shippingOptId });
    var lines = lang === 'es'
      ? [
          details.modelLabel + ' — ' + t(details.product.name),
          'Cantidad: ' + details.qty,
          'Envío: ' + shippingLabel,
          'Dirección de recogida: ' + details.destLabel
        ]
      : [
          details.modelLabel + ' — ' + t(details.product.name),
          'Quantity: ' + details.qty,
          'Shipping: ' + shippingLabel,
          'Pickup address: ' + details.destLabel
        ];

    if (details.domesticEtaText) {
      lines.push(details.domesticEtaText);
    }
    if (details.colombiaShippingText) {
      lines.push((lang === 'es' ? 'Envío a Colombia: ' : 'Colombia shipping: ') + details.colombiaShippingText);
    }
    if (details.etaText) {
      lines.push((lang === 'es' ? 'Llegada estimada a Colombia: ' : 'Estimated arrival in Colombia: ') + details.etaText);
    }
    lines.push((lang === 'es' ? 'Total (costo real): ' : 'Total (actual cost): ') + details.totalText);
    lines.push((lang === 'es' ? 'Margen aplicado: ' : 'Margin applied: ') + Math.round(details.margin * 100) + '%');
    lines.push((lang === 'es' ? 'Precio sugerido al cliente: ' : 'Suggested price to client: ') + details.suggestedPriceText);

    return lines.join('\n');
  }

  function openOrderChat(message) {
    if (!ORDER_WHATSAPP_NUMBER) {
      alert(t(UI_STRINGS).orderButtonMissingNumber);
      return;
    }
    var url = 'https://wa.me/' + ORDER_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
  }

  function buildCard(product, modelLabel) {
    var badgeClass = gradeBadgeClass(product.gradeKey);
    var gradeLabel = t(GRADE_I18N[product.gradeKey]);
    var name = t(product.name);
    var note = t(product.note);
    var outOfStock = product.inStock === false;
    var colorsLabel = product.colors && product.colors.length
      ? product.colors.map(function (c) { return t(COLOR_I18N[c] || { en: c, es: c }); }).join(' · ')
      : '';
    var colorsHtml = colorsLabel ? '<p class="colors">' + colorsLabel + '</p>' : '';
    var noteHtml = note ? '<p class="note">' + note + '</p>' : '';
    var cop = copEquivalent(product.price);
    var copHtml = cop ? '<p class="cop-line">' + cop + '</p>' : '';
    var stockBadgeHtml = outOfStock
      ? '<span class="badge out-of-stock">' + t(UI_STRINGS).outOfStock + '</span>'
      : '';

    var card = document.createElement('div');
    card.className = 'card' + (outOfStock ? ' is-out-of-stock' : '');
    card.innerHTML =
      '<img src="' + product.img + '" alt="' + name + '" loading="lazy" onerror="this.style.opacity=0.25">' +
      '<div class="badge-row">' +
        '<span class="badge ' + badgeClass + '">' + gradeLabel + '</span>' +
        stockBadgeHtml +
      '</div>' +
      '<h3>' + name + '</h3>' +
      colorsHtml +
      noteHtml +
      (outOfStock
        ? '<p class="out-of-stock-note">' + t(UI_STRINGS).outOfStockNote + '</p>'
        : '<p class="price-hidden-note">' + t(UI_STRINGS).pricesHiddenNote + '</p>' +
          '<p class="price">' + money(product.price) + '</p>' +
          copHtml +
          '<div class="shipping-row">' +
            '<div class="destination-row">' + destinationOptionsHtml(product.id, SHIP_DESTINATIONS[0].id) + '</div>' +
            '<label>' + t(UI_STRINGS).shippingLabel + '</label>' +
            '<select>' + shippingOptionsHtml(SHIPPING_OPTIONS[0].id, product.price, SHIP_DESTINATIONS[0].state) + '</select>' +
            '<p class="suggested-shipping-note"></p>' +
            '<label class="colombia-label">' + t(UI_STRINGS).colombiaShippingLabel + '</label>' +
            '<input type="number" class="colombia-qty-input" min="0" step="1" inputmode="numeric" placeholder="' + t(UI_STRINGS).colombiaQtyPlaceholder + '">' +
            '<p class="colombia-hint">' + t(UI_STRINGS).colombiaShippingHint + '</p>' +
            '<div class="total-line colombia-cost-line"><span class="label">' + t(UI_STRINGS).colombiaShippingCostLabel + '</span><span class="value colombia-cost-value">' + money(0) + '</span></div>' +
            '<div class="total-line"><span class="label">' + t(UI_STRINGS).totalLabel + '</span><span class="value total-value">' + money(product.price) + '</span></div>' +
            '<div class="total-line cop-total-line"><span></span><span class="value total-cop-value">' + (copEquivalent(product.price) || '') + '</span></div>' +
            '<p class="colombia-eta-line"></p>' +
            '<div class="suggested-price-box">' +
              '<p class="suggested-price-label">' + t(UI_STRINGS).suggestedPriceLabel + '</p>' +
              '<p class="margin-options-label">' + t(UI_STRINGS).marginOptionsLabel + '</p>' +
              '<div class="margin-options">' +
                SUGGESTED_PRICE_MARGIN_OPTIONS.map(function (m) {
                  var pct = Math.round(m * 100);
                  var knives = new Array(SUGGESTED_PRICE_MARGIN_OPTIONS.indexOf(m) + 2).join('🔪');
                  var checkedAttr = m === SUGGESTED_PRICE_DEFAULT_MARGIN ? ' checked' : '';
                  return '<label class="margin-option">' +
                    '<input type="radio" name="margin-' + product.id + '" value="' + m + '"' + checkedAttr + '>' +
                    '<span class="margin-option-inner"><span class="margin-knives" aria-hidden="true">' + knives + '</span><span class="margin-pct">' + pct + '%</span></span>' +
                    '</label>';
                }).join('') +
              '</div>' +
              '<p class="suggested-price-value"></p>' +
              '<p class="suggested-price-margin-note"></p>' +
              '<label class="mishap-checkbox-label"><input type="checkbox" class="mishap-checkbox"> ' + t(UI_STRINGS).mishapCheckboxLabel + '</label>' +
              '<label class="pirobo-checkbox-label"><input type="checkbox" class="pirobo-checkbox"> ' + t(UI_STRINGS).piroboCheckboxLabel + '</label>' +
              '<p class="pirobo-warning">⚠ ' + t(UI_STRINGS).piroboWarning + '</p>' +
              '<p class="pirobo-breakdown" style="display:none;"></p>' +
            '</div>' +
            '<label class="quantity-label">' + t(UI_STRINGS).quantityLabel + '</label>' +
            '<input type="number" class="quantity-input" min="1" step="1" inputmode="numeric" value="1">' +
          '</div>' +
          '<button class="order-btn" type="button">' + t(UI_STRINGS).orderButtonLabel + '</button>');

    if (!outOfStock) {
      var select = card.querySelector('select');
      var colombiaQtyInput = card.querySelector('.colombia-qty-input');
      var colombiaCostValue = card.querySelector('.colombia-cost-value');
      var totalValue = card.querySelector('.total-value');
      var totalCopValue = card.querySelector('.total-cop-value');
      var etaLine = card.querySelector('.colombia-eta-line');
      var mishapCheckbox = card.querySelector('.mishap-checkbox');
      var piroboCheckbox = card.querySelector('.pirobo-checkbox');
      var piroboBreakdown = card.querySelector('.pirobo-breakdown');
      var marginNoteEl = card.querySelector('.suggested-price-margin-note');
      var suggestedPriceValue = card.querySelector('.suggested-price-value');
      var suggestedShippingNote = card.querySelector('.suggested-shipping-note');
      var quantityInput = card.querySelector('.quantity-input');

      function selectedDestination() {
        var checked = card.querySelector('.destination-row input:checked');
        var destId = checked ? checked.value : SHIP_DESTINATIONS[0].id;
        return SHIP_DESTINATIONS.filter(function (d) { return d.id === destId; })[0] || SHIP_DESTINATIONS[0];
      }

      function selectedMargin() {
        var checked = card.querySelector('.margin-option input:checked');
        return checked ? parseFloat(checked.value) : SUGGESTED_PRICE_DEFAULT_MARGIN;
      }

      function recomputeTotal() {
        var opt = SHIPPING_OPTIONS.filter(function (o) { return o.id === select.value; })[0];
        var domesticShipping = shippingCost(opt, product.price, selectedDestination().state);
        var qty = parseInt(colombiaQtyInput.value, 10);
        // $25 USD per every 6 items in the shipment, rounded up, so Pablo
        // can see the full landed cost in Colombia (product + domestic
        // shipping + Colombia freight) before adding his margin.
        var colombiaShipping = (qty && qty > 0) ? Math.ceil(qty / 6) * 25 : 0;
        colombiaCostValue.textContent = money(colombiaShipping);
        var total = product.price + domesticShipping + colombiaShipping;
        totalValue.textContent = money(total);
        totalCopValue.textContent = copEquivalent(total) || '';

        var etaMsg = colombiaEtaMessage(opt);
        etaLine.textContent = etaMsg || '';
        etaLine.style.display = etaMsg ? 'block' : 'none';

        // Suggested selling price: full landed cost x the selected margin
        // tier (50/60/75/100%, picked via the radio row), plus another
        // 10% on top if the mishap checkbox is on, plus two compounding
        // 2.5% passes if the "pirobo" checkbox is on. Shown in COP only -
        // this is Pablo's price to quote, not a USD-facing number.
        var margin = selectedMargin();
        marginNoteEl.textContent = t(UI_STRINGS).suggestedPriceMarginNoteTemplate.replace('{pct}', Math.round(margin * 100));

        var suggestedUsdEquivalent = total * (1 + margin) *
          (mishapCheckbox.checked ? SUGGESTED_PRICE_MISHAP_MULTIPLIER : 1) *
          (piroboCheckbox.checked ? PIROBO_STEP_MULTIPLIER * PIROBO_STEP_MULTIPLIER : 1);
        suggestedPriceValue.textContent = copEquivalent(suggestedUsdEquivalent) || '';

        if (piroboCheckbox.checked) {
          var piroboPct = Math.round(((PIROBO_STEP_MULTIPLIER * PIROBO_STEP_MULTIPLIER) - 1) * 1000) / 10;
          piroboBreakdown.textContent = t(UI_STRINGS).piroboBreakdownTemplate.replace('{pct}', piroboPct);
          piroboBreakdown.style.display = 'block';
        } else {
          piroboBreakdown.style.display = 'none';
        }

        // Suggested shipping method, balancing speed against margin - only
        // ever shown as a hint under the dropdown, never auto-selected.
        var visibleOptions = lang === 'es'
          ? SHIPPING_OPTIONS.filter(function (o) { return SHIPPING_OPTIONS_ES_VISIBLE.indexOf(o.id) !== -1; })
          : SHIPPING_OPTIONS;
        var suggestedId = suggestBestShippingId(visibleOptions, product.price, selectedDestination().state, margin);
        if (suggestedId) {
          var suggestedLabel = t(SHIPPING_I18N[suggestedId]);
          suggestedShippingNote.textContent = t(UI_STRINGS).suggestedShippingTemplate.replace('{label}', suggestedLabel);
          suggestedShippingNote.style.display = 'block';
        } else {
          suggestedShippingNote.style.display = 'none';
        }
      }

      // Changing the destination can change the fedex-priority-ON price
      // tier shown in the dropdown, so rebuild its option labels rather
      // than just recomputing the total.
      function onDestinationChange() {
        var currentSelection = select.value;
        select.innerHTML = shippingOptionsHtml(currentSelection, product.price, selectedDestination().state);
        recomputeTotal();
      }

      select.addEventListener('change', recomputeTotal);
      colombiaQtyInput.addEventListener('input', recomputeTotal);
      mishapCheckbox.addEventListener('change', recomputeTotal);
      piroboCheckbox.addEventListener('change', recomputeTotal);
      Array.prototype.forEach.call(card.querySelectorAll('.margin-option input'), function (radio) {
        radio.addEventListener('change', recomputeTotal);
      });
      Array.prototype.forEach.call(card.querySelectorAll('.destination-row input'), function (radio) {
        radio.addEventListener('change', onDestinationChange);
      });

      var orderBtn = card.querySelector('.order-btn');
      orderBtn.addEventListener('click', function () {
        var qty = parseInt(quantityInput.value, 10) || 1;
        var dest = selectedDestination();
        var opt = SHIPPING_OPTIONS.filter(function (o) { return o.id === select.value; })[0];
        var message = buildOrderMessage({
          product: product,
          modelLabel: modelLabel,
          shippingOptId: select.value,
          destLabel: dest.label,
          qty: qty,
          margin: selectedMargin(),
          suggestedPriceText: suggestedPriceValue.textContent,
          totalText: totalValue.textContent + (totalCopValue.textContent ? ' / ' + totalCopValue.textContent : ''),
          colombiaShippingText: colombiaCostValue.textContent !== money(0) ? colombiaCostValue.textContent : '',
          domesticEtaText: domesticEtaMessage(opt, dest.label),
          etaText: etaLine.textContent
        });
        openOrderChat(message);
      });

      // Populate the ETA line immediately, without waiting for the first
      // change event.
      recomputeTotal();
    }

    return card;
  }

  function matchesSearch(product, modelLabel, query) {
    if (!query) return true;
    var name = t(product.name);
    var grade = t(GRADE_I18N[product.gradeKey]);
    var category = t(CATEGORY_I18N[product.category]);
    var colors = (product.colors || []).map(function (c) { return t(COLOR_I18N[c] || { en: c, es: c }); });
    var haystack = (modelLabel + ' ' + name + ' ' + category + ' ' + grade + ' ' + colors.join(' ')).toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function renderGrid() {
    var query = searchEl.value.trim();
    gridEl.innerHTML = '';

    var modelsToShow = query
      ? CATALOG
      : CATALOG.filter(function (m) { return m.model === activeModel; });

    var anyResults = false;

    modelsToShow.forEach(function (m) {
      var matches = m.products.filter(function (p) { return matchesSearch(p, m.label, query); });
      if (!matches.length) return;
      anyResults = true;

      // In-stock items first, so Pablo never has to scroll past
      // unavailable parts to find what he can actually quote.
      matches = matches.slice().sort(function (a, b) {
        var aOut = a.inStock === false ? 1 : 0;
        var bOut = b.inStock === false ? 1 : 0;
        return aOut - bOut;
      });

      if (query) {
        var heading = document.createElement('div');
        heading.className = 'category-heading';
        heading.textContent = m.label;
        gridEl.appendChild(heading);
      }

      var row = document.createElement('div');
      row.className = 'grid';
      matches.forEach(function (p) { row.appendChild(buildCard(p, m.label)); });
      gridEl.appendChild(row);
    });

    if (!anyResults) {
      gridEl.innerHTML = '<p class="empty-state">' + t(UI_STRINGS).emptyState + '</p>';
    }
  }

  function renderNotes() {
    notesEl.innerHTML = '<strong>' + t(UI_STRINGS).notesTitle + '</strong><ul>' +
      CATALOG_NOTES.map(function (n) { return '<li>' + t(n) + '</li>'; }).join('') +
      '</ul>';
  }

  function renderAll() {
    applyStaticStrings();
    renderTabs();
    renderGrid();
    renderNotes();
  }

  searchEl.addEventListener('input', renderGrid);

  langBtn.addEventListener('click', function () {
    lang = lang === 'en' ? 'es' : 'en';
    setLang(lang);
    renderAll();
  });

  hidePricesBtn.addEventListener('click', function () {
    pricesHidden = !pricesHidden;
    document.body.classList.toggle('prices-hidden', pricesHidden);
    hidePricesBtn.textContent = pricesHidden ? t(UI_STRINGS).showPrices : t(UI_STRINGS).hidePrices;
  });

  renderAll();
  checkStatusBanner();

  RATES.ensureRate(false, function (result) {
    rateState.rate = result.rate;
    rateState.offline = result.offline;
    rateState.loaded = true;
    renderGrid();
  });
})();
