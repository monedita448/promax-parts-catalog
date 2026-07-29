(function () {
  var tabsEl = document.getElementById('tabs');
  var gridEl = document.getElementById('grid');
  var searchEl = document.getElementById('search');
  var notesEl = document.getElementById('notes');
  var brandEl = document.getElementById('brand');
  var calcLinkEl = document.getElementById('calcLink');
  var langBtn = document.getElementById('langBtn');

  var activeModel = CATALOG[0].model;
  var lang = getLang();
  var rateState = { rate: null, offline: false, loaded: false };

  var ERROR_BANNER_LINE1 = "hay un error en el sistema que actualiza los precios, por favor llamar a felipe antes de proceder";
  var ERROR_BANNER_LINE2 = "por favor mandar una foto de la siguiente frase a felipe inmediatamente, [the injured gadgets account where you where fetching your prices from has probably rate limit your traffic, your data.js flle is probably corrupted] Gracias";

  function checkStatusBanner() {
    fetch('status.json', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || data.status !== 'error') return;
        var banner = document.getElementById('errorBanner');
        banner.querySelector('.error-banner-line1').textContent = ERROR_BANNER_LINE1;
        banner.querySelector('.error-banner-line2').textContent = ERROR_BANNER_LINE2;
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

  function buildCard(product) {
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
        : '<p class="price">' + money(product.price) + '</p>' +
          copHtml +
          '<div class="shipping-row">' +
            '<label>' + t(UI_STRINGS).shippingLabel + '</label>' +
            '<select>' + shippingOptionsHtml(SHIPPING_OPTIONS[0].id) + '</select>' +
            '<div class="total-line"><span class="label">' + t(UI_STRINGS).totalLabel + '</span><span class="value total-value">' + money(product.price) + '</span></div>' +
            '<div class="total-line cop-total-line"><span></span><span class="value total-cop-value">' + (copEquivalent(product.price) || '') + '</span></div>' +
          '</div>');

    if (!outOfStock) {
      var select = card.querySelector('select');
      var totalValue = card.querySelector('.total-value');
      var totalCopValue = card.querySelector('.total-cop-value');
      select.addEventListener('change', function () {
        var opt = SHIPPING_OPTIONS.filter(function (o) { return o.id === select.value; })[0];
        var total = product.price + (opt ? opt.price : 0);
        totalValue.textContent = money(total);
        totalCopValue.textContent = copEquivalent(total) || '';
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
      matches.forEach(function (p) { row.appendChild(buildCard(p)); });
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

  renderAll();
  checkStatusBanner();

  RATES.ensureRate(false, function (result) {
    rateState.rate = result.rate;
    rateState.offline = result.offline;
    rateState.loaded = true;
    renderGrid();
  });
})();
