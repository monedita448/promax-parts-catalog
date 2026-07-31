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

  function shippingOptionsHtml(selectedId) {
    return SHIPPING_OPTIONS.map(function (opt) {
      var sel = opt.id === selectedId ? ' selected' : '';
      var label = t(SHIPPING_I18N[opt.id]);
      var priceLabel = opt.price === 0 ? t(UI_STRINGS).free : money(opt.price);
      return '<option value="' + opt.id + '"' + sel + '>' + label + ' (' + priceLabel + ')</option>';
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

  function sanitizeFilename(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '') || 'product';
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    var lines = [];
    words.forEach(function (word) {
      var testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = testLine;
      }
    });
    lines.push(line.trim());
    lines.forEach(function (l, i) {
      ctx.fillText(l, x, y + i * lineHeight);
    });
    return lines.length;
  }

  // Builds a plain, client-safe image: just the product photo and its
  // name, no price, no grade, no shipping, nothing that identifies where
  // it's sourced from. Meant for Pablo to send straight to a customer.
  function downloadProductImage(product, modelLabel) {
    var displayName = modelLabel + ' — ' + t(product.name);
    var img = new Image();
    img.onload = function () {
      var W = 800, H = 860;
      var boxSize = 680;
      var boxX = (W - boxSize) / 2;
      var boxY = 40;

      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      var scale = Math.min(boxSize / img.width, boxSize / img.height);
      var drawW = img.width * scale;
      var drawH = img.height * scale;
      var drawX = boxX + (boxSize - drawW) / 2;
      var drawY = boxY + (boxSize - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      ctx.fillStyle = '#1c1c1a';
      ctx.font = '600 30px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = 'center';
      wrapCanvasText(ctx, displayName, W / 2, boxY + boxSize + 60, W - 80, 38);

      canvas.toBlob(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = sanitizeFilename(displayName) + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      }, 'image/png');
    };
    img.onerror = function () {
      alert(lang === 'es' ? 'No se pudo generar la imagen.' : 'Could not generate the image.');
    };
    img.src = product.img;
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
            '<label>' + t(UI_STRINGS).shippingLabel + '</label>' +
            '<select>' + shippingOptionsHtml(SHIPPING_OPTIONS[0].id) + '</select>' +
            '<label class="colombia-label">' + t(UI_STRINGS).colombiaShippingLabel + '</label>' +
            '<input type="number" class="colombia-qty-input" min="0" step="1" inputmode="numeric" placeholder="' + t(UI_STRINGS).colombiaQtyPlaceholder + '">' +
            '<p class="colombia-hint">' + t(UI_STRINGS).colombiaShippingHint + '</p>' +
            '<div class="total-line colombia-cost-line"><span class="label">' + t(UI_STRINGS).colombiaShippingCostLabel + '</span><span class="value colombia-cost-value">' + money(0) + '</span></div>' +
            '<div class="total-line"><span class="label">' + t(UI_STRINGS).totalLabel + '</span><span class="value total-value">' + money(product.price) + '</span></div>' +
            '<div class="total-line cop-total-line"><span></span><span class="value total-cop-value">' + (copEquivalent(product.price) || '') + '</span></div>' +
          '</div>' +
          '<button class="download-btn" type="button">' + t(UI_STRINGS).downloadClientImage + '</button>');

    if (!outOfStock) {
      var select = card.querySelector('select');
      var colombiaQtyInput = card.querySelector('.colombia-qty-input');
      var colombiaCostValue = card.querySelector('.colombia-cost-value');
      var totalValue = card.querySelector('.total-value');
      var totalCopValue = card.querySelector('.total-cop-value');

      function recomputeTotal() {
        var opt = SHIPPING_OPTIONS.filter(function (o) { return o.id === select.value; })[0];
        var domesticShipping = opt ? opt.price : 0;
        var qty = parseInt(colombiaQtyInput.value, 10);
        // $25 USD per every 6 items in the shipment, rounded up, so Pablo
        // can see the full landed cost in Colombia (product + domestic
        // shipping + Colombia freight) before adding his margin.
        var colombiaShipping = (qty && qty > 0) ? Math.ceil(qty / 6) * 25 : 0;
        colombiaCostValue.textContent = money(colombiaShipping);
        var total = product.price + domesticShipping + colombiaShipping;
        totalValue.textContent = money(total);
        totalCopValue.textContent = copEquivalent(total) || '';
      }

      select.addEventListener('change', recomputeTotal);
      colombiaQtyInput.addEventListener('input', recomputeTotal);

      var downloadBtn = card.querySelector('.download-btn');
      downloadBtn.addEventListener('click', function () {
        downloadProductImage(product, modelLabel);
      });
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
