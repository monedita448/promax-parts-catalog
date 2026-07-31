(function () {
  var gridEl = document.getElementById('grid');
  var brandEl = document.getElementById('brand');
  var langBtn = document.getElementById('langBtn');
  var hidePricesBtn = document.getElementById('hidePricesBtn');

  var lang = getLang();
  var rateState = { rate: null, offline: false, loaded: false };
  var pricesHidden = false;

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

  // Same eastern-time cutoff math as the phone catalog, trimmed to just
  // the Colombia ETA (no Friday-only methods in this small shipping set).
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

  function formatEtaDate(date) {
    var locale = lang === 'es' ? 'es-CO' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function getUtcOffsetMinutes(timeZone, date) {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: timeZone, timeZoneName: 'shortOffset' }).formatToParts(date);
    var tzPart = parts.filter(function (p) { return p.type === 'timeZoneName'; })[0];
    var match = tzPart ? /GMT([+-]\d+)/.exec(tzPart.value) : null;
    var hours = match ? parseInt(match[1], 10) : -5;
    return hours * 60;
  }

  function easternWallTimeToInstant(year, month, day, hourDecimal) {
    var h = Math.floor(hourDecimal);
    var m = Math.round((hourDecimal - h) * 60);
    var approx = new Date(Date.UTC(year, month, day, h, m));
    var offsetMin = getUtcOffsetMinutes('America/New_York', approx);
    return new Date(Date.UTC(year, month, day, h, m) - offsetMin * 60000);
  }

  function formatLocalCutoffTime(cutoffHour, shipDate) {
    var instant = easternWallTimeToInstant(shipDate.getFullYear(), shipDate.getMonth(), shipDate.getDate(), cutoffHour);
    var locale = lang === 'es' ? 'es-CO' : 'en-US';
    return instant.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function computeEtaDates(opt) {
    if (!opt || !opt.transitDays) return null;
    var easternNow = nowInEastern();
    var dow = easternNow.getDay();
    var hourDecimal = easternNow.getHours() + easternNow.getMinutes() / 60;
    var isWeekday = dow >= 1 && dow <= 5;
    var beforeCutoff = hourDecimal < opt.cutoffHour;

    var shipDate;
    var orderIsToday;
    if (isWeekday && beforeCutoff) {
      shipDate = new Date(easternNow.getTime());
      orderIsToday = true;
    } else {
      var tmp = new Date(easternNow.getTime());
      tmp.setDate(tmp.getDate() + 1);
      while (tmp.getDay() === 0 || tmp.getDay() === 6) tmp.setDate(tmp.getDate() + 1);
      shipDate = tmp;
      orderIsToday = false;
    }

    var domesticArrival = addBusinessDays(shipDate, opt.transitDays);
    var handoff = new Date(domesticArrival.getTime());
    handoff.setDate(handoff.getDate() + FUEGO_COLOMBIA_HANDOFF_DAYS);
    var colombiaArrival = new Date(handoff.getTime());
    colombiaArrival.setDate(colombiaArrival.getDate() + FUEGO_COLOMBIA_TRANSIT_DAYS);

    var cutoffStr = formatLocalCutoffTime(opt.cutoffHour, shipDate);
    var dayPhrase;
    if (orderIsToday) {
      dayPhrase = lang === 'es' ? 'hoy' : 'today';
    } else {
      var weekdayNames = lang === 'es'
        ? ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayPhrase = lang === 'es' ? ('el ' + weekdayNames[shipDate.getDay()]) : ('on ' + weekdayNames[shipDate.getDay()]);
    }

    return { domesticArrival: domesticArrival, colombiaArrival: colombiaArrival, cutoffStr: cutoffStr, dayPhrase: dayPhrase };
  }

  function colombiaEtaMessage(opt) {
    var d = computeEtaDates(opt);
    if (!d) return null;
    var dateStr = formatEtaDate(d.colombiaArrival);
    if (lang === 'es') {
      return 'Llegaría a Colombia aproximadamente el ' + dateStr + ' si se ordena antes de las ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
    }
    return 'Most likely in Colombia by ' + dateStr + ' if ordered before ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
  }

  function domesticEtaMessage(opt, destLabel) {
    var d = computeEtaDates(opt);
    if (!d) return null;
    var dateStr = formatEtaDate(d.domesticArrival);
    if (lang === 'es') {
      return 'Llegaría a ' + destLabel + ' aproximadamente el ' + dateStr + ' si se ordena antes de las ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
    }
    return 'Most likely at ' + destLabel + ' by ' + dateStr + ' if ordered before ' + d.cutoffStr + ' ' + d.dayPhrase + '.';
  }

  function shippingCost(opt, productPrice) {
    if (!opt) return 0;
    return productPrice >= opt.freeOver ? 0 : opt.price;
  }

  function shippingOptionsHtml(selectedId, productPrice) {
    return FUEGO_SHIPPING_OPTIONS.map(function (opt) {
      var sel = opt.id === selectedId ? ' selected' : '';
      var label = t(SHIPPING_I18N[opt.id]);
      var cost = shippingCost(opt, productPrice);
      var priceLabel = cost === 0 ? t(UI_STRINGS).free : money(cost);
      return '<option value="' + opt.id + '"' + sel + '>' + label + ' (' + priceLabel + ')</option>';
    }).join('');
  }

  function destinationOptionsHtml(productId, selectedId) {
    return FUEGO_SHIP_DESTINATIONS.map(function (dest) {
      var checked = dest.id === selectedId ? ' checked' : '';
      var inputId = 'dest-' + productId + '-' + dest.id;
      return '<label class="destination-option" for="' + inputId + '">' +
        '<input type="radio" id="' + inputId + '" name="dest-' + productId + '" value="' + dest.id + '"' + checked + '> ' +
        dest.label +
      '</label>';
    }).join('');
  }

  function suggestBestShippingId(productPrice, margin) {
    var candidates = FUEGO_SHIPPING_OPTIONS
      .filter(function (o) { return typeof o.transitDays === 'number'; })
      .map(function (o) { return { id: o.id, cost: shippingCost(o, productPrice), transitDays: o.transitDays }; });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) {
      if (margin >= 0.75) return (a.transitDays - b.transitDays) || (a.cost - b.cost);
      return (a.cost - b.cost) || (a.transitDays - b.transitDays);
    });
    return candidates[0].id;
  }

  function getNextOrderNumber() {
    var STORAGE_KEY = 'fuegoOrderCounter';
    var current = 0;
    try { current = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0; } catch (e) {}
    var next = current + 1;
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch (e) {}
    return next < 10000 ? ('0000' + next).slice(-4) : String(next);
  }

  function buildOrderMessage(details) {
    var shippingLabel = t(SHIPPING_I18N[details.shippingOptId] || { en: details.shippingOptId, es: details.shippingOptId });
    var lines = lang === 'es'
      ? [
          'Pedido #' + details.orderNumber,
          details.brand + ' — ' + t(details.product.name),
          'Cantidad: ' + details.qty,
          'Envío: ' + shippingLabel,
          'Dirección de recogida: ' + details.destLabel
        ]
      : [
          'Order #' + details.orderNumber,
          details.brand + ' — ' + t(details.product.name),
          'Quantity: ' + details.qty,
          'Shipping: ' + shippingLabel,
          'Pickup address: ' + details.destLabel
        ];
    if (details.domesticEtaText) lines.push(details.domesticEtaText);
    if (details.etaText) lines.push((lang === 'es' ? 'Llegada estimada a Colombia: ' : 'Estimated arrival in Colombia: ') + details.etaText);
    lines.push((lang === 'es' ? 'Total (costo real): ' : 'Total (actual cost): ') + details.totalText);
    lines.push((lang === 'es' ? 'Margen aplicado: ' : 'Margin applied: ') + Math.round(details.margin * 100) + '%');
    lines.push((lang === 'es' ? 'Precio sugerido al cliente: ' : 'Suggested price to client: ') + details.suggestedPriceText);
    return lines.join('\n');
  }

  function buildSourcingMessage(product, qty, orderNumber) {
    var lines = [
      'Order #' + orderNumber,
      'Please source/order this part from Walmart:',
      product.brand + ' — ' + product.name.en,
      'Quantity: ' + qty,
      'Walmart product page: ' + product.walmartUrl
    ];
    return lines.join('\n');
  }

  function sendWhatsAppMessage(number, message) {
    if (!number) {
      alert(t(UI_STRINGS).orderButtonMissingNumber);
      return;
    }
    var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
  }

  function sendSourcingNotification(subject, message) {
    if (!FUEGO_SOURCING_FORM_ENDPOINT) {
      console.warn('Sourcing notification skipped - FUEGO_SOURCING_FORM_ENDPOINT is not set in fuego-data.js yet.');
      return;
    }
    fetch(FUEGO_SOURCING_FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ subject: subject, message: message })
    }).catch(function () {});
  }

  function buildCard(product) {
    var name = t(product.name);
    var spec = t(product.spec);
    var cop = copEquivalent(product.price);
    var copHtml = cop ? '<p class="cop-line">' + cop + '</p>' : '';

    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<img src="' + product.img + '" alt="' + name + '" loading="lazy" decoding="async" onerror="this.style.opacity=0.25">' +
      '<div class="badge-row"><span class="badge genuine">' + product.brand + '</span></div>' +
      '<h3>' + name + '</h3>' +
      '<p class="note">' + spec + '</p>' +
      '<p class="price-hidden-note">' + t(UI_STRINGS).pricesHiddenNote + '</p>' +
      '<p class="price">' + money(product.price) + '</p>' +
      copHtml +
      '<div class="shipping-row">' +
        '<div class="destination-row">' + destinationOptionsHtml(product.id, FUEGO_SHIP_DESTINATIONS[0].id) + '</div>' +
        '<label>' + t(UI_STRINGS).shippingLabel + '</label>' +
        '<select>' + shippingOptionsHtml(FUEGO_SHIPPING_OPTIONS[0].id, product.price) + '</select>' +
        '<p class="suggested-shipping-note"></p>' +
        '<div class="total-line"><span class="label">' + t(UI_STRINGS).totalLabel + '</span><span class="value total-value">' + money(product.price) + '</span></div>' +
        '<div class="total-line cop-total-line"><span></span><span class="value total-cop-value">' + (copEquivalent(product.price) || '') + '</span></div>' +
        '<p class="colombia-eta-line"></p>' +
        '<div class="suggested-price-box">' +
          '<p class="suggested-price-label">' + t(UI_STRINGS).suggestedPriceLabel + '</p>' +
          '<p class="margin-options-label">' + t(UI_STRINGS).marginOptionsLabel + '</p>' +
          '<div class="margin-options">' +
            FUEGO_MARGIN_OPTIONS.map(function (m) {
              var pct = Math.round(m * 100);
              var knives = new Array(FUEGO_MARGIN_OPTIONS.indexOf(m) + 2).join('🔪');
              var checkedAttr = m === FUEGO_DEFAULT_MARGIN ? ' checked' : '';
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
      '<button class="order-btn" type="button">' + t(UI_STRINGS).orderButtonLabel + '</button>';

    var select = card.querySelector('select');
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
      var destId = checked ? checked.value : FUEGO_SHIP_DESTINATIONS[0].id;
      return FUEGO_SHIP_DESTINATIONS.filter(function (d) { return d.id === destId; })[0] || FUEGO_SHIP_DESTINATIONS[0];
    }

    function selectedMargin() {
      var checked = card.querySelector('.margin-option input:checked');
      return checked ? parseFloat(checked.value) : FUEGO_DEFAULT_MARGIN;
    }

    function recomputeTotal() {
      var opt = FUEGO_SHIPPING_OPTIONS.filter(function (o) { return o.id === select.value; })[0];
      var domesticShipping = shippingCost(opt, product.price);
      var total = product.price + domesticShipping;
      totalValue.textContent = money(total);
      totalCopValue.textContent = copEquivalent(total) || '';

      var etaMsg = colombiaEtaMessage(opt);
      etaLine.textContent = etaMsg || '';
      etaLine.style.display = etaMsg ? 'block' : 'none';

      var margin = selectedMargin();
      marginNoteEl.textContent = t(UI_STRINGS).suggestedPriceMarginNoteTemplate.replace('{pct}', Math.round(margin * 100));

      var suggestedUsdEquivalent = total * (1 + margin) *
        (mishapCheckbox.checked ? FUEGO_MISHAP_MULTIPLIER : 1) *
        (piroboCheckbox.checked ? FUEGO_PIROBO_STEP_MULTIPLIER * FUEGO_PIROBO_STEP_MULTIPLIER : 1);
      suggestedPriceValue.textContent = copEquivalent(suggestedUsdEquivalent) || '';

      if (piroboCheckbox.checked) {
        var piroboPct = Math.round(((FUEGO_PIROBO_STEP_MULTIPLIER * FUEGO_PIROBO_STEP_MULTIPLIER) - 1) * 1000) / 10;
        piroboBreakdown.textContent = t(UI_STRINGS).piroboBreakdownTemplate.replace('{pct}', piroboPct);
        piroboBreakdown.style.display = 'block';
      } else {
        piroboBreakdown.style.display = 'none';
      }

      var suggestedId = suggestBestShippingId(product.price, margin);
      if (suggestedId) {
        var suggestedLabel = t(SHIPPING_I18N[suggestedId]);
        suggestedShippingNote.textContent = t(UI_STRINGS).suggestedShippingTemplate.replace('{label}', suggestedLabel);
        suggestedShippingNote.style.display = 'block';
      } else {
        suggestedShippingNote.style.display = 'none';
      }
    }

    select.addEventListener('change', recomputeTotal);
    mishapCheckbox.addEventListener('change', recomputeTotal);
    piroboCheckbox.addEventListener('change', recomputeTotal);
    Array.prototype.forEach.call(card.querySelectorAll('.margin-option input'), function (radio) {
      radio.addEventListener('change', recomputeTotal);
    });
    Array.prototype.forEach.call(card.querySelectorAll('.destination-row input'), function (radio) {
      radio.addEventListener('change', recomputeTotal);
    });

    var orderBtn = card.querySelector('.order-btn');
    orderBtn.addEventListener('click', function () {
      var qty = parseInt(quantityInput.value, 10) || 1;
      var dest = selectedDestination();
      var opt = FUEGO_SHIPPING_OPTIONS.filter(function (o) { return o.id === select.value; })[0];
      var orderNumber = getNextOrderNumber();
      var message = buildOrderMessage({
        orderNumber: orderNumber,
        product: product,
        brand: product.brand,
        shippingOptId: select.value,
        destLabel: dest.label,
        qty: qty,
        margin: selectedMargin(),
        suggestedPriceText: suggestedPriceValue.textContent,
        totalText: totalValue.textContent + (totalCopValue.textContent ? ' / ' + totalCopValue.textContent : ''),
        domesticEtaText: domesticEtaMessage(opt, dest.label),
        etaText: etaLine.textContent
      });
      var sourcingMessage = buildSourcingMessage(product, qty, orderNumber);
      sendWhatsAppMessage(FUEGO_ORDER_WHATSAPP_NUMBER, message);
      sendSourcingNotification('Fuego Orden #' + orderNumber, sourcingMessage);
    });

    recomputeTotal();
    return card;
  }

  function renderGrid() {
    gridEl.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'grid';
    FUEGO_PRODUCTS.forEach(function (p) { row.appendChild(buildCard(p)); });
    gridEl.appendChild(row);
  }

  function applyStaticStrings() {
    var s = t(UI_STRINGS);
    document.documentElement.lang = lang;
    brandEl.textContent = lang === 'es' ? 'Sistemas de incendio' : 'Fire suppression systems';
    langBtn.textContent = s.langButton;
    hidePricesBtn.textContent = pricesHidden ? s.showPrices : s.hidePrices;
  }

  function renderAll() {
    applyStaticStrings();
    renderGrid();
  }

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

  RATES.ensureRate(false, function (result) {
    rateState.rate = result.rate;
    rateState.offline = result.offline;
    rateState.loaded = true;
    renderGrid();
  });
})();
