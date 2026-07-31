// UI text + shared vocabulary for the catalog, English and Spanish.

const UI_STRINGS = {
  en: {
    brand: "Pro Max parts catalog",
    searchPlaceholder: "Search across all models — e.g. 14 Pro Max screen, back housing, charging port...",
    calcLink: "Calculadora dólares/pesos",
    shippingLabel: "Shipping",
    colombiaShippingLabel: "Shipping to Colombia (optional)",
    colombiaShippingHint: "$25 USD for every 6 items in this shipment",
    colombiaQtyPlaceholder: "Items in this shipment",
    colombiaShippingCostLabel: "Colombia shipping",
    totalLabel: "Total",
    suggestedPriceLabel: "Suggested selling price",
    marginOptionsLabel: "Profit margin",
    suggestedPriceMarginNoteTemplate: "Includes a {pct}% markup",
    mishapCheckboxLabel: "Add an additional 10% for currency and shipping fluctuations",
    piroboCheckboxLabel: "Add \"pirobo\" surcharge (extra 2.5% on cost, shipping, and handling)",
    piroboWarning: "Use only in case of client disrespect",
    piroboBreakdownTemplate: "\"Pirobo\" adds 2.5% to the product cost, 2.5% to US shipping, and 2.5% to Colombia shipping (mathematically the same as 2.5% on their total), then a further 2.5% for \"handling\" on top of that already-inflated subtotal — about {pct}% extra on the suggested price overall.",
    free: "free",
    emptyState: "No parts match that search.",
    notesTitle: "Notes",
    ratePending: "Loading COP rate...",
    rateOffline: "offline rate",
    langButton: "Español",
    outOfStock: "Out of stock",
    outOfStockNote: "Currently unavailable from the supplier — do not offer this to a customer until it shows in stock again.",
    downloadClientImage: "Download image for client",
    hidePrices: "Hide prices",
    showPrices: "Show prices",
    pricesHiddenNote: "Pricing hidden",
    quantityLabel: "Quantity to order",
    orderButtonLabel: "Order via WhatsApp",
    orderButtonMissingNumber: "No WhatsApp number is set up for ordering yet.",
    suggestedShippingTemplate: "Suggested option: {label}"
  },
  es: {
    brand: "Catálogo de piezas Pro Max",
    searchPlaceholder: "Busca en todos los modelos — ej. pantalla 14 Pro Max, carcasa trasera, puerto de carga...",
    calcLink: "Calculadora dólares/pesos",
    shippingLabel: "Envío",
    colombiaShippingLabel: "Envío a Colombia (opcional)",
    colombiaShippingHint: "$25 USD por cada 6 artículos en este envío",
    colombiaQtyPlaceholder: "Artículos en este envío",
    colombiaShippingCostLabel: "Envío a Colombia",
    totalLabel: "Total",
    suggestedPriceLabel: "Precio sugerido de venta",
    marginOptionsLabel: "Margen de ganancia",
    suggestedPriceMarginNoteTemplate: "Incluye un margen del {pct}%",
    mishapCheckboxLabel: "Agregar un 10% adicional por fluctuaciones en cambio de moneda y envío",
    piroboCheckboxLabel: "Agregar cargo \"pirobo\" (2.5% extra en costo, envíos y manejo)",
    piroboWarning: "Usar solo en caso de falta de respeto del cliente",
    piroboBreakdownTemplate: "El cargo \"pirobo\" suma 2.5% al costo del producto, 2.5% al envío a EE. UU. y 2.5% al envío a Colombia (matemáticamente lo mismo que sumar 2.5% a su total), y luego otro 2.5% de \"manejo\" sobre ese subtotal ya inflado — en total, aproximadamente un {pct}% adicional sobre el precio sugerido.",
    free: "gratis",
    emptyState: "Ninguna pieza coincide con esa búsqueda.",
    notesTitle: "Notas",
    ratePending: "Cargando tasa COP...",
    rateOffline: "tasa sin conexión",
    langButton: "EN",
    outOfStock: "Agotado",
    outOfStockNote: "No disponible con el proveedor por el momento — no ofrecer este producto a un cliente hasta que vuelva a aparecer disponible.",
    downloadClientImage: "Descargar imagen para cliente",
    hidePrices: "Ocultar precios",
    showPrices: "Mostrar precios",
    pricesHiddenNote: "Precio oculto",
    quantityLabel: "Cantidad a pedir",
    orderButtonLabel: "Pedir por WhatsApp",
    orderButtonMissingNumber: "Todavía no hay un número de WhatsApp configurado para pedidos.",
    suggestedShippingTemplate: "Opción sugerida: {label}"
  }
};

const CATEGORY_I18N = {
  "Display": { en: "Display", es: "Pantalla" },
  "Back housing": { en: "Back housing", es: "Carcasa trasera" },
  "Camera": { en: "Camera", es: "Cámara" },
  "Charging port": { en: "Charging port", es: "Puerto de carga" },
  "Speaker": { en: "Speaker", es: "Altavoz" }
};

const GRADE_I18N = {
  "genuine": { en: "Genuine", es: "Genuino" },
  "genuine-oem-pull": { en: "Genuine OEM pull · Grade A", es: "Genuino OEM pull · Grado A" },
  "premium": { en: "Premium", es: "Premium" },
  "premium-refurbished": { en: "Premium refurbished", es: "Premium reacondicionado" }
};

const COLOR_I18N = {
  "Black": { en: "Black", es: "Negro" },
  "Gold": { en: "Gold", es: "Dorado" },
  "Silver": { en: "Silver", es: "Plateado" },
  "Graphite": { en: "Graphite", es: "Grafito" },
  "Pacific Blue": { en: "Pacific Blue", es: "Azul Pacífico" },
  "Space Black": { en: "Space Black", es: "Negro espacial" },
  "Deep Purple": { en: "Deep Purple", es: "Morado oscuro" },
  "White Titanium": { en: "White Titanium", es: "Titanio blanco" },
  "Black Titanium": { en: "Black Titanium", es: "Titanio negro" },
  "Natural Titanium": { en: "Natural Titanium", es: "Titanio natural" },
  "Blue Titanium": { en: "Blue Titanium", es: "Titanio azul" },
  "Cosmic Orange": { en: "Cosmic Orange", es: "Naranja cósmico" },
  "Deep Blue": { en: "Deep Blue", es: "Azul profundo" }
};

const SHIPPING_I18N = {
  "usps": { en: "USPS (1-7 business days)", es: "USPS (1-7 días hábiles)" },
  "ups-ground": { en: "UPS Ground", es: "UPS terrestre (1-5 días hábiles)" },
  "fedex-ground": { en: "FedEx Ground", es: "FedEx terrestre (1-5 días hábiles)" },
  "ups-2day": { en: "UPS 2 Business Days", es: "UPS 2 días hábiles" },
  "fedex-2day": { en: "FedEx 2 Business Days", es: "FedEx 2 días hábiles" },
  "ups-nda-saver": { en: "UPS Next Day Air Saver", es: "UPS Next Day Air Saver" },
  "fedex-standard-ON": { en: "FedEx Standard Overnight", es: "FedEx Standard Overnight" },
  "ups-nda": { en: "UPS Next Day Air", es: "UPS Next Day Air (Día Siguiente)" },
  "fedex-priority-ON": { en: "FedEx Priority Overnight", es: "FedEx Priority Overnight" },
  "fedex-saturday-ON": { en: "FedEx Saturday Priority Overnight (Friday shipments only)", es: "FedEx Saturday Priority Overnight (solo envíos los viernes)" },
  "pickup": { en: "In-store pickup", es: "Recogida en tienda" },
  "combine": { en: "Combine with prior order", es: "Combinar con pedido anterior" }
};

function getLang() {
  try {
    return localStorage.getItem('catalogLang') || 'en';
  } catch (e) { return 'en'; }
}

function setLang(lang) {
  try { localStorage.setItem('catalogLang', lang); } catch (e) {}
}
