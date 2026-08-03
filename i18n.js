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
    piroboCheckboxLabel: "Add \"extra\" surcharge (2.5% on cost, shipping, and handling)",
    piroboWarning: "This surcharge could cost you the client",
    piroboBreakdownTemplate: "\"Extra\" adds 2.5% to the product cost, 2.5% to US shipping, and 2.5% to Colombia shipping (mathematically the same as 2.5% on their total), then a further 2.5% for \"handling\" on top of that already-inflated subtotal — about {pct}% extra on the suggested price overall.",
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
    suggestedShippingTemplate: "Suggested option: {label}",
    supplierLabel: "Supplier",
    supplierAll: "All suppliers"
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
    piroboCheckboxLabel: "Agregar cargo \"extra\" (2.5% en costo, envíos y manejo)",
    piroboWarning: "Este recargo puede costar el cliente",
    piroboBreakdownTemplate: "El cargo \"extra\" suma 2.5% al costo del producto, 2.5% al envío a EE. UU. y 2.5% al envío a Colombia (matemáticamente lo mismo que sumar 2.5% a su total), y luego otro 2.5% de \"manejo\" sobre ese subtotal ya inflado — en total, aproximadamente un {pct}% adicional sobre el precio sugerido.",
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
    suggestedShippingTemplate: "Opción sugerida: {label}",
    supplierLabel: "Proveedor",
    supplierAll: "Todos los proveedores"
  }
};

const CATEGORY_I18N = {
  "Display": { en: "Display", es: "Pantalla" },
  "Back housing": { en: "Back housing", es: "Carcasa trasera" },
  "Camera": { en: "Camera", es: "Cámara" },
  "Charging port": { en: "Charging port", es: "Puerto de carga" },
  "Speaker": { en: "Speaker", es: "Altavoz" },
  "Battery": { en: "Battery", es: "Batería" }
};

const GRADE_I18N = {
  "genuine": { en: "Genuine", es: "Genuino" },
  "genuine-oem-pull": { en: "Genuine OEM pull · Grade A", es: "Genuino OEM pull · Grado A" },
  "genuine-oem-apple": { en: "Genuine Apple OEM (new)", es: "Genuino Apple OEM (nuevo)" },
  "premium": { en: "Premium", es: "Premium" },
  "premium-refurbished": { en: "Premium refurbished", es: "Premium reacondicionado" }
};

// Shown to Pablo as generic "Provider 1/2" rather than the real supplier
// company names - same reasoning as never surfacing the sourcing website
// in client-facing text elsewhere in this catalog.
const SUPPLIER_I18N = {
  "injured-gadgets": { en: "Provider 1", es: "Proveedor 1" },
  "mobilesentrix": { en: "Provider 2", es: "Proveedor 2" }
};

// Every product left in the catalog is a genuine, original Apple part -
// "premium"/"premium-refurbished" (non-Apple aftermarket) were removed
// entirely. This legend explains the three remaining grades in plain
// language, since they all describe an authentic Apple part, just from
// a different source/condition - not "genuine vs. not genuine."
const GRADE_LEGEND = {
  title: { en: "Grade legend", es: "Leyenda de grados" },
  intro: {
    en: "Every part in this catalog is a genuine, original Apple part - there are no non-Apple \"aftermarket\" parts anymore. The grades below just describe where that genuine part came from.",
    es: "Todas las piezas de este catálogo son piezas originales y genuinas de Apple - ya no hay piezas \"aftermarket\" (no originales). Los grados de abajo solo describen de dónde viene esa pieza genuina."
  },
  items: [
    {
      grade: "genuine",
      en: "Genuine - an authentic Apple part; its condition isn't specially graded beyond \"working and genuine.\"",
      es: "Genuino - una pieza auténtica de Apple; su condición no tiene una calificación especial más allá de \"funciona y es genuina.\""
    },
    {
      grade: "genuine-oem-pull",
      en: "Genuine OEM pull · Grade A - an authentic Apple part removed from another iPhone, in excellent (Grade A) working and cosmetic condition. Not brand new, but 100% original Apple.",
      es: "Genuino OEM pull · Grado A - una pieza auténtica de Apple extraída de otro iPhone, en excelente estado (Grado A) de funcionamiento y apariencia. No es de fábrica, pero es 100% original de Apple."
    },
    {
      grade: "genuine-oem-apple",
      en: "Genuine Apple OEM (new) - a brand-new, factory Apple part, purchased through Apple's own Independent Repair Provider program (Provider 2). The highest-provenance option, and usually the most expensive.",
      es: "Genuino Apple OEM (nuevo) - una pieza de Apple nueva de fábrica, comprada a través del programa oficial de Apple para proveedores independientes de reparación (Proveedor 2). Es la opción de mayor procedencia, y normalmente la más costosa."
    }
  ]
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
  "combine": { en: "Combine with prior order", es: "Combinar con pedido anterior" },
  "ms-standard-overnight": { en: "Provider 2 Standard Overnight", es: "Provider 2 Standard Overnight" },
  "ms-priority-overnight": { en: "Provider 2 Priority Overnight", es: "Provider 2 Priority Overnight" },
  "ms-2day": { en: "Provider 2 2 Day", es: "Provider 2 2 días" },
  "ms-ups-ground": { en: "Provider 2 UPS Ground", es: "Provider 2 UPS terrestre" },
  "ms-fedex-ground": { en: "Provider 2 FedEx Ground", es: "Provider 2 FedEx terrestre" },
  "ms-usps-ground": { en: "Provider 2 USPS Ground", es: "Provider 2 USPS terrestre" },
  "ms-priority-mail": { en: "Provider 2 USPS Priority Mail", es: "Provider 2 USPS Priority Mail" },
  "ms-priority-mail-express": { en: "Provider 2 USPS Priority Mail Express", es: "Provider 2 USPS Priority Mail Express" },
  "ms-saturday-fedex": { en: "Provider 2 Saturday Delivery (Friday shipments only)", es: "Provider 2 entrega sábado (solo envíos los viernes)" },
  "ms-pickup": { en: "Provider 2 in-store pickup", es: "Recogida en tienda del Proveedor 2" },
  "ms-reserve": { en: "Provider 2 reserve order", es: "Pedido reservado del Proveedor 2" }
};

function getLang() {
  try {
    return localStorage.getItem('catalogLang') || 'en';
  } catch (e) { return 'en'; }
}

function setLang(lang) {
  try { localStorage.setItem('catalogLang', lang); } catch (e) {}
}
