// Product catalog data — iPhone Pro Max genuine repair parts (12 through 17)
// Prices captured directly from supplier account, July 2026, in USD. Estimates — verify before quoting.
// image filenames are placeholders; see image-manifest.json for the source links to fetch.
// gradeKey/category/colors are lookup keys translated via i18n.js. name/note have EN+ES pairs.

// Sourced from Injured Gadgets' own published shipping policy page
// (injuredgadgets.com/shipping-policy), captured 2026-07-31. Each method
// is genuinely NOT a flat rate - it's "pay this unless the item's price
// is over the freeOver threshold, then it's free." freeOver values are
// the site's own published free-shipping tiers. See app.js for how
// freeOver is applied per product price.
// Priority Overnight is priced by destination region: $18 if shipping to
// FL/GA/AL/SC/NC/TN, $25 for every other state. fedex-priority-ON below
// has no single `price` - it's computed per selected destination (see
// FEDEX_PRIORITY_LOW_TIER_STATES + SHIP_DESTINATIONS, applied in app.js).
// Re-verify against the policy page if Injured Gadgets updates its rates.
// transitDays = typical domestic business days from ship-out to arrival
// at the US drop address (a representative single number, not the full
// published range). cutoffHour = the method's weekday order cutoff, in
// Eastern time, as a decimal (19.5 = 7:30 PM). fridayOnly marks the one
// method that only ships on Fridays. pickup/combine have neither field,
// since they aren't a real shipment with a transit estimate.
const SHIPPING_OPTIONS = [
  { id: "usps", price: 6.00, freeOver: 100, transitDays: 5, cutoffHour: 15 },
  { id: "ups-ground", price: 7.00, freeOver: 350, transitDays: 3, cutoffHour: 19 },
  { id: "fedex-ground", price: 7.00, freeOver: 350, transitDays: 3, cutoffHour: 18 },
  { id: "ups-2day", price: 7.00, freeOver: 350, transitDays: 2, cutoffHour: 19 },
  { id: "fedex-2day", price: 7.00, freeOver: 350, transitDays: 2, cutoffHour: 19.5 },
  { id: "ups-nda-saver", price: 12.00, freeOver: 500, transitDays: 1, cutoffHour: 19 },
  { id: "fedex-standard-ON", price: 12.00, freeOver: 500, transitDays: 1, cutoffHour: 19.5 },
  { id: "ups-nda", price: 23.00, freeOver: 1000, transitDays: 1, cutoffHour: 19 },
  { id: "fedex-priority-ON", regional: true, priceLowTier: 18.00, priceOtherStates: 25.00, freeOver: 1000, transitDays: 1, cutoffHour: 19.5 },
  { id: "fedex-saturday-ON", price: 30.00, freeOver: 1750, fridayOnly: true, cutoffHour: 19.5 },
  { id: "pickup", price: 0.00, freeOver: 0 },
  { id: "combine", price: 0.00, freeOver: 0 }
];

// The Colombia leg of the trip, per Pablo: the US drop address hands the
// package to the freight consolidator the day after domestic arrival,
// and the international leg usually takes 3 more days from there.
const COLOMBIA_HANDOFF_DAYS = 1;
const COLOMBIA_TRANSIT_DAYS = 3;

// Suggested selling price = full landed cost (product + domestic
// shipping + Colombia shipping) x a selectable margin. Pablo picks one
// of these four tiers per product (50% is the default); each is a
// fraction added on top of 1x cost, e.g. 0.5 = cost x 1.5.
const SUGGESTED_PRICE_MARGIN_OPTIONS = [0.5, 0.6, 0.75, 1.0];
const SUGGESTED_PRICE_DEFAULT_MARGIN = 0.5;

// Optional checkbox: adds another 10% on top of the marked-up price, not
// on top of the raw cost, as a buffer for exchange-rate swings and
// shipping surprises.
const SUGGESTED_PRICE_MISHAP_MULTIPLIER = 1.10;

// Optional "pirobo" surcharge checkbox: conceptually a 2.5% markup on
// the product cost, a 2.5% markup on domestic shipping, and a 2.5%
// markup on Colombia shipping, summed - which is mathematically the
// same as a single 2.5% markup on their total - followed by a further
// 2.5% for "processing and handling" on top of that. Two compounding
// 2.5% passes on the already-computed suggested price. Meant to be used
// only when a client has been disrespectful, never as a default add-on.
const PIROBO_STEP_MULTIPLIER = 1.025;

// States that qualify for FedEx Priority Overnight's cheaper $18 tier,
// per Injured Gadgets' published policy. Every other state pays $25.
const FEDEX_PRIORITY_LOW_TIER_STATES = ["FL", "GA", "AL", "SC", "NC", "TN"];

// WhatsApp number the "Order" button messages, in international format
// with no +, spaces, or dashes. wa.me only supports opening a chat with a
// single number and prefilling text into it - it cannot auto-send into an
// existing multi-person group. This is the only chat window the button
// ever opens/shows on screen - it's Pablo's own summary (pricing, margin,
// ETAs), nothing about where the part is sourced from.
const ORDER_WHATSAPP_NUMBER = "573046273122"; // Pablo (+57 304 6273122)

// Sourcing/ordering notification: sent as a silent background request via
// Formspree (https://formspree.io) so it never opens any window or popup
// on Pablo's screen - he never sees this happen at all. Set this to the
// form endpoint Formspree gives you after creating a free form there
// (looks like "https://formspree.io/f/xxxxxxxx"); configure that form's
// destination address to qenterprise9@gmail.com in the Formspree
// dashboard. Left blank until that's set up - the notification silently
// no-ops (logs a console warning only) until then.
const SOURCING_FORM_ENDPOINT = "";

// The two US drop addresses this catalog quotes shipping to. Pablo picks
// one above the shipping dropdown; it determines which Priority
// Overnight tier applies (both are FL right now, so no visible price
// difference between them yet, but this is ready for a non-FL address).
const SHIP_DESTINATIONS = [
  { id: "casa-f", label: "Casa F", address: "Lantana, FL 33462", state: "FL" },
  { id: "tia-express", label: "Tía Express", address: "Coral Springs, FL 33065", state: "FL" }
];

// The English dropdown shows all options above. The Spanish dropdown
// (Pablo's view) is intentionally trimmed to one option per carrier plus
// a fast option, so it isn't cluttered with near-duplicate expedited
// tiers he doesn't need day-to-day.
const SHIPPING_OPTIONS_ES_VISIBLE = ["usps", "ups-ground", "fedex-ground", "ups-nda"];

// MobileSentrix's own published domestic shipping rates
// (mobilesentrix.com/shipping), captured 31 jul 2026. Same freeOver
// mechanic as Injured Gadgets above (free once the item's price clears
// that method's threshold), but the actual rates/thresholds/cutoffs are
// different, so this is a separate table rather than reusing
// SHIPPING_OPTIONS - using Injured Gadgets' rates for a MobileSentrix
// product would have been wrong. Two things worth flagging: (1) the
// site's shipping page lists three near-identical "Ground" rows with
// slightly different cutoff times - only the UPS- and FedEx-branded ones
// are kept here since USPS Ground is already its own separate row; (2) a
// promo banner on that page advertises "2 day air shipping until 10:30pm
// EST," which doesn't match the 2:00pm weekday cutoff printed in the
// rate table itself - the table's 2:00pm figure is used below since it's
// the documented rate-table value, but re-check this if it matters for a
// specific order. transitDays are representative single-day estimates
// from MobileSentrix's own shipping FAQ text (which gives ranges, e.g.
// "Ground orders typically take 2-4 days"), not officially guaranteed
// figures - re-verify against the policy page if MobileSentrix updates
// its rates.
const MOBILESENTRIX_SHIPPING_OPTIONS = [
  { id: "ms-standard-overnight", price: 5.00, freeOver: 500, transitDays: 1, cutoffHour: 18.5 },
  { id: "ms-priority-overnight", price: 25.00, freeOver: Infinity, transitDays: 1, cutoffHour: 18.5 },
  { id: "ms-2day", price: 5.00, freeOver: 350, transitDays: 2, cutoffHour: 14 },
  { id: "ms-ups-ground", price: 3.99, freeOver: 350, transitDays: 3, cutoffHour: 18 },
  { id: "ms-fedex-ground", price: 3.99, freeOver: 350, transitDays: 3, cutoffHour: 19 },
  { id: "ms-usps-ground", price: 3.99, freeOver: 350, transitDays: 4, cutoffHour: 18 },
  { id: "ms-priority-mail", price: 10.00, freeOver: 500, transitDays: 2, cutoffHour: 17 },
  { id: "ms-priority-mail-express", price: 15.00, freeOver: 1000, transitDays: 1, cutoffHour: 17 },
  { id: "ms-saturday-fedex", price: 30.00, freeOver: 1800, fridayOnly: true, cutoffHour: 14 },
  { id: "ms-pickup", price: 0.00, freeOver: 0 },
  { id: "ms-reserve", price: 0.00, freeOver: 0 }
];

// Spanish (Pablo's view) trimmed list, same idea as SHIPPING_OPTIONS_ES_VISIBLE:
// one option per carrier plus a fast option.
const MOBILESENTRIX_SHIPPING_OPTIONS_ES_VISIBLE = ["ms-usps-ground", "ms-ups-ground", "ms-fedex-ground", "ms-priority-overnight"];

// Two suppliers can now be picked from in the catalog. Supplier 1 (Injured
// Gadgets) is the original anonymous, no-login source. Supplier 2
// (MobileSentrix) was added 31 jul 2026 to source genuine, unmodified
// Apple OEM parts (via their Apple Independent Repair Provider program)
// for categories Injured Gadgets doesn't carry in genuine grade -
// screens, batteries, and (for 16/17 Pro Max) charging ports and
// speakers. See MS_NOTE_EN/MS_NOTE_ES below for the important caveats
// that apply to every MobileSentrix line item.
const SUPPLIERS = [
  { id: "injured-gadgets", label: "Injured Gadgets" },
  { id: "mobilesentrix", label: "MobileSentrix" }
];

// Real company names, used ONLY in the internal sourcing message
// (app.js's buildSourcingMessage) so whoever fulfills the order knows
// the actual website to buy from. Everywhere else in the UI - badges,
// supplier tabs, order messages to Pablo - shows the generic "Provider
// 1/2" label from SUPPLIER_I18N (i18n.js) instead.
const SUPPLIER_REAL_NAME_EN = {
  "injured-gadgets": "Injured Gadgets",
  "mobilesentrix": "MobileSentrix"
};

// Shown on every MobileSentrix product's note field. Real prices
// captured 31 jul 2026 from mobilesentrix.com, "Without Core" tier
// (no core/trade-in return required) - confirm before quoting, since
// these genuine-Apple-channel prices are the first ones sourced from
// this supplier and haven't been re-checked over time yet the way the
// Injured Gadgets prices are (those auto-update every 2 days via
// GitHub Actions - see README). Buying at this price also requires an
// approved/enrolled MobileSentrix account for genuine Apple parts (their
// site showed "Enroll to gain access" on at least one listing) - this is
// NOT an open/anonymous purchase like Injured Gadgets.
const MS_NOTE_EN = "Genuine Apple OEM part via Provider 2's Apple Independent Repair Provider program - requires an approved/enrolled account to purchase (not open/anonymous like Provider 1). Price captured 31 Jul 2026, \"Without Core\" tier - confirm current price and account access before quoting.";
const MS_NOTE_ES = "Pieza genuina Apple OEM vía el programa de Proveedor Independiente de Reparación de Apple del Proveedor 2 - requiere una cuenta aprobada/inscrita para comprar (no es compra abierta/anónima como con el Proveedor 1). Precio capturado el 31 jul 2026, nivel \"Without Core\" - confirma el precio actual y el acceso a la cuenta antes de cotizar.";

const CATALOG = [
  {
    model: "12",
    label: "iPhone 12 Pro Max",
    products: [
      { supplier: "injured-gadgets", id: "12-housing", category: "Back housing", name: { en: "Back housing", es: "Carcasa trasera" }, gradeKey: "genuine-oem-pull", inStock: true, price: 86.92, colors: ["Graphite", "Gold", "Pacific Blue", "Silver"], img: "images/12pm-housing.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "12-rearcam", category: "Camera", name: { en: "Rear camera module (wide, 1x)", es: "Módulo de cámara trasera (gran angular, 1x)" }, gradeKey: "genuine", inStock: true, price: 17.00, colors: [], img: "images/12pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x) and telephoto (2.5x) modules also available on request.", es: "También disponibles los módulos ultra gran angular (0.5x) y telefoto (2.5x) bajo pedido." } },
      { supplier: "injured-gadgets", id: "12-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 4.49, colors: [], img: "images/12pm-frontcam.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "12-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 20.13, colors: [], img: "images/12pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "12-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: true, price: 8.56, colors: [], img: "images/12pm-earspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "mobilesentrix", id: "12-screen-ms", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "genuine-oem-apple", inStock: true, price: 302.62, colors: ["Black"], img: "images/12pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "12-battery-ms", category: "Battery", name: { en: "Battery", es: "Batería" }, gradeKey: "genuine-oem-apple", inStock: true, price: 46.98, colors: [], img: "images/battery-genuine-placeholder.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "12-frontcam-ms", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine-oem-apple", inStock: true, price: 146.40, colors: [], img: "images/12pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "12-rearcam-ms", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine-oem-apple", inStock: true, price: 173.22, colors: [], img: "images/12pm-rearcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } }
    ]
  },
  {
    model: "13",
    label: "iPhone 13 Pro Max",
    products: [
      { supplier: "injured-gadgets", id: "13-housing", category: "Back housing", name: { en: "Back housing", es: "Carcasa trasera" }, gradeKey: "genuine-oem-pull", inStock: true, price: 88.78, colors: ["Graphite", "Gold", "Silver"], img: "images/13pm-housing.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "13-rearcam", category: "Camera", name: { en: "Rear camera module (wide)", es: "Módulo de cámara trasera (gran angular)" }, gradeKey: "genuine", inStock: true, price: 66.90, colors: [], img: "images/13pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x, $19.22) and telephoto (3x, $23.44) modules also available.", es: "También disponibles los módulos ultra gran angular (0.5x, $19.22) y telefoto (3x, $23.44)." } },
      { supplier: "injured-gadgets", id: "13-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 2.71, colors: [], img: "images/13pm-frontcam.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "13-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 10.50, colors: [], img: "images/13pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "13-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: true, price: 9.07, colors: [], img: "images/13pm-earspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "mobilesentrix", id: "13-screen-ms", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "genuine-oem-apple", inStock: true, price: 302.62, colors: ["Black"], img: "images/13pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "13-battery-ms", category: "Battery", name: { en: "Battery", es: "Batería" }, gradeKey: "genuine-oem-apple", inStock: false, price: 46.98, colors: [], img: "images/battery-genuine-placeholder.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "13-frontcam-ms", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine-oem-apple", inStock: false, price: 173.22, colors: [], img: "images/13pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "13-rearcam-ms", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine-oem-apple", inStock: true, price: 173.22, colors: [], img: "images/13pm-rearcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } }
    ]
  },
  {
    model: "14",
    label: "iPhone 14 Pro Max",
    products: [
      { supplier: "injured-gadgets", id: "14-housing", category: "Back housing", name: { en: "Back housing", es: "Carcasa trasera" }, gradeKey: "genuine-oem-pull", inStock: true, price: 103.64, colors: ["Space Black", "Silver", "Gold", "Deep Purple"], img: "images/14pm-housing.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "14-rearcam", category: "Camera", name: { en: "Rear camera module (main)", es: "Módulo de cámara trasera (principal)" }, gradeKey: "genuine", inStock: true, price: 47.95, colors: [], img: "images/14pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x) module also available, $23.44.", es: "También disponible el módulo ultra gran angular (0.5x), $23.44." } },
      { supplier: "injured-gadgets", id: "14-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 18.30, colors: [], img: "images/14pm-frontcam.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "14-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: true, price: 13.57, colors: [], img: "images/14pm-earspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "mobilesentrix", id: "14-screen-ms", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "genuine-oem-apple", inStock: true, price: 349.29, colors: ["Black"], img: "images/14pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "14-battery-ms", category: "Battery", name: { en: "Battery", es: "Batería" }, gradeKey: "genuine-oem-apple", inStock: true, price: 52.76, colors: [], img: "images/battery-genuine-placeholder.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "14-frontcam-ms", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine-oem-apple", inStock: true, price: 173.22, colors: [], img: "images/14pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "14-rearcam-ms", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine-oem-apple", inStock: true, price: 191.11, colors: [], img: "images/14pm-rearcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } }
    ]
  },
  {
    model: "15",
    label: "iPhone 15 Pro Max",
    products: [
      { supplier: "injured-gadgets", id: "15-housing", category: "Back housing", name: { en: "Back glass w/ small parts", es: "Tapa trasera de vidrio con piezas pequeñas" }, gradeKey: "genuine-oem-pull", inStock: true, price: 79.00, colors: ["White Titanium", "Black Titanium"], img: "images/15pm-housing.jpg", note: { en: "A lower Grade B+ cosmetic tier is available for $68.79.", es: "Existe una versión cosmética Grado B+ más económica por $68.79." } },
      { supplier: "injured-gadgets", id: "15-rearcam", category: "Camera", name: { en: "Telephoto rear camera (3x)", es: "Cámara trasera telefoto (3x)" }, gradeKey: "genuine", inStock: true, price: 47.17, colors: [], img: "images/15pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x) module also available, $16.95.", es: "También disponible el módulo ultra gran angular (0.5x), $16.95." } },
      { supplier: "injured-gadgets", id: "15-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 25.00, colors: [], img: "images/15pm-frontcam.jpg", note: { en: "Requires Face ID transfer from the original module to calibrate.", es: "Requiere transferir el Face ID del módulo original para calibrarse." } },
      { supplier: "injured-gadgets", id: "15-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 14.07, colors: [], img: "images/15pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "15-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: false, price: 12.24, colors: [], img: "images/15pm-earspeaker.jpg", note: { en: "Proximity sensor flex sold separately, $11.32.", es: "El flex del sensor de proximidad se vende por separado, $11.32." } },
      { supplier: "mobilesentrix", id: "15-screen-ms", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "genuine-oem-apple", inStock: true, price: 349.29, colors: ["Black"], img: "images/15pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "15-battery-ms", category: "Battery", name: { en: "Battery", es: "Batería" }, gradeKey: "genuine-oem-apple", inStock: false, price: 52.76, colors: [], img: "images/battery-genuine-placeholder.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "15-frontcam-ms", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine-oem-apple", inStock: true, price: 173.22, colors: [], img: "images/15pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "15-rearcam-ms", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine-oem-apple", inStock: true, price: 217.93, colors: [], img: "images/15pm-rearcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "15-housing-ms", category: "Back housing", name: { en: "Back glass w/ MagSafe, NFC and flashlight flex", es: "Vidrio trasero con MagSafe, NFC y flex de linterna" }, gradeKey: "genuine-oem-apple", inStock: true, price: 137.46, colors: ["Natural Titanium", "White Titanium", "Black Titanium"], img: "images/15pm-housing.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } }
    ]
  },
  {
    model: "16",
    label: "iPhone 16 Pro Max",
    products: [
      { supplier: "injured-gadgets", id: "16-housing", category: "Back housing", name: { en: "Back glass w/ small parts", es: "Tapa trasera de vidrio con piezas pequeñas" }, gradeKey: "genuine-oem-pull", inStock: false, price: 135.00, colors: ["Black Titanium", "White Titanium"], img: "images/16pm-housing.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "16-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 86.03, colors: [], img: "images/16pm-frontcam.jpg", note: { en: "Requires Face ID transfer from the original module to calibrate. Rear camera module: limited genuine stock — confirm availability before quoting.", es: "Requiere transferir el Face ID del módulo original para calibrarse. Módulo de cámara trasera: stock genuino limitado — confirmar disponibilidad antes de cotizar." } },
      { supplier: "injured-gadgets", id: "16-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 11.53, colors: [], img: "images/16pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "16-earspeaker", category: "Speaker", name: { en: "Ear speaker w/ WiFi flex", es: "Auricular con flex WiFi" }, gradeKey: "genuine", inStock: true, price: 11.53, colors: [], img: "images/16pm-earspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "mobilesentrix", id: "16-screen-ms", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "genuine-oem-apple", inStock: true, price: 366.13, colors: ["Black"], img: "images/16pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-battery-ms", category: "Battery", name: { en: "Battery", es: "Batería" }, gradeKey: "genuine-oem-apple", inStock: true, price: 64.31, colors: [], img: "images/battery-genuine-placeholder.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-frontcam-ms", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine-oem-apple", inStock: true, price: 173.22, colors: [], img: "images/16pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-rearcam-ms", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine-oem-apple", inStock: false, price: 217.93, colors: [], img: "images/16pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-charging-ms", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "genuine-oem-apple", inStock: true, price: 74.21, colors: ["Natural Titanium", "Desert Titanium", "White Titanium", "Black Titanium"], img: "images/16pm-charging.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-loudspeaker-ms", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine-oem-apple", inStock: true, price: 147.06, colors: [], img: "images/16pm-loudspeaker.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-earspeaker-ms", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine-oem-apple", inStock: true, price: 147.06, colors: [], img: "images/16pm-earspeaker.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "16-housing-ms", category: "Back housing", name: { en: "Back glass w/ MagSafe, NFC and flashlight flex", es: "Vidrio trasero con MagSafe, NFC y flex de linterna" }, gradeKey: "genuine-oem-apple", inStock: true, price: 137.46, colors: ["Black Titanium", "White Titanium", "Desert Titanium", "Natural Titanium"], img: "images/16pm-housing.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } }
    ]
  },
  {
    model: "17",
    label: "iPhone 17 Pro Max",
    products: [
      { supplier: "injured-gadgets", id: "17-rearcam", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine", inStock: true, price: 61.73, colors: [], img: "images/17pm-rearcam.jpg", note: { en: "Shared part number with 17 Pro.", es: "Mismo número de pieza que el 17 Pro." } },
      { supplier: "injured-gadgets", id: "17-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 53.95, colors: [], img: "images/17pm-frontcam.jpg", note: { en: "", es: "" } },
      { supplier: "injured-gadgets", id: "17-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: false, price: 11.32, colors: [], img: "images/17pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { supplier: "mobilesentrix", id: "17-screen-ms", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "genuine-oem-apple", inStock: true, price: 395.61, colors: ["Black"], img: "images/17pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-battery-ms", category: "Battery", name: { en: "Battery", es: "Batería" }, gradeKey: "genuine-oem-apple", inStock: true, price: 64.31, colors: [], img: "images/battery-genuine-placeholder.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-frontcam-ms", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine-oem-apple", inStock: true, price: 173.22, colors: [], img: "images/17pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-rearcam-ms", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine-oem-apple", inStock: false, price: 217.93, colors: [], img: "images/17pm-rearcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-charging-ms", category: "Charging port", name: { en: "USB-C charging port flex", es: "Flex del puerto de carga USB-C" }, gradeKey: "genuine-oem-apple", inStock: true, price: 74.21, colors: ["Silver", "Cosmic Orange", "Deep Blue"], img: "images/17pm-charging.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-loudspeaker-ms", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine-oem-apple", inStock: true, price: 7.06, colors: [], img: "images/17pm-loudspeaker.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-earspeaker-ms", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine-oem-apple", inStock: true, price: 147.06, colors: [], img: "images/17pm-frontcam.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } },
      { supplier: "mobilesentrix", id: "17-housing-ms", category: "Back housing", name: { en: "Back glass w/ MagSafe, NFC and flashlight flex", es: "Vidrio trasero con MagSafe, NFC y flex de linterna" }, gradeKey: "genuine-oem-apple", inStock: true, price: 137.46, colors: ["Silver", "Cosmic Orange", "Deep Blue"], img: "images/17pm-screen.jpg", note: { en: MS_NOTE_EN, es: MS_NOTE_ES } }
    ]
  }
];

const CATALOG_NOTES = [
  { en: "Provider 1 now only lists genuine Apple parts — every non-Apple \"premium\" part and every \"premium refurbished\" screen (a genuine panel rebuilt into a non-original glass) was removed, since screens are now covered in genuine grade by Provider 2 instead. Only \"Genuine\" and \"Genuine OEM pull\" grades remain on Provider 1's side.",
    es: "El Proveedor 1 ahora solo lista piezas genuinas de Apple — se eliminaron todas las piezas \"premium\" (no son de Apple) y todas las pantallas \"premium reacondicionadas\" (un panel genuino reconstruido con un vidrio no original), ya que las pantallas ahora están cubiertas en grado genuino por el Proveedor 2. Solo quedan los grados \"Genuino\" y \"Genuino OEM pull\" del lado del Proveedor 1." },
  { en: "Batteries, all screens, and (for 16/17 Pro Max) charging ports and speakers, are only available in genuine grade from Provider 2 — Provider 1 doesn't carry a genuine/OEM-pull version of these. Use the supplier filter to see them.",
    es: "Las baterías, todas las pantallas, y (para el 16/17 Pro Max) los puertos de carga y altavoces, solo están disponibles en grado genuino con el Proveedor 2 — el Proveedor 1 no tiene una versión genuina/OEM pull de estos. Usa el filtro de proveedor para verlos." },
  { en: "iPhone 16 Pro Max rear camera module and iPhone 15/16/17 Pro Max back housing weren't available in genuine grade from Provider 1 — Provider 2 now covers those instead, at a higher genuine-Apple-channel price. Check current stock and account access before quoting.",
    es: "El módulo de cámara trasera del iPhone 16 Pro Max y la carcasa trasera del iPhone 15/16/17 Pro Max no estaban disponibles en grado genuino con el Proveedor 1 — el Proveedor 2 ahora los cubre, a un precio más alto por ser canal genuino de Apple. Confirma el stock y el acceso a la cuenta antes de cotizar." },
  { en: "No genuine charging port is currently available anywhere in this catalog for iPhone 12/13/14/15 Pro Max (only 16/17 Pro Max have one, from Provider 2) — do not offer a charging port repair for those older models until a genuine source is found. Also, iPhone 14 Pro Max's loud speaker (not ear speaker) has no genuine option from either provider right now.",
    es: "Actualmente no hay un puerto de carga genuino disponible en este catálogo para iPhone 12/13/14/15 Pro Max (solo 16/17 Pro Max tienen uno, del Proveedor 2) — no ofrezcas reparación de puerto de carga para esos modelos hasta encontrar una fuente genuina. Además, el altavoz (no el auricular) del iPhone 14 Pro Max no tiene opción genuina con ningún proveedor por ahora." },
  { en: "Prices are supplier cost, captured July 2026, and will drift over time — confirm current cost before finalizing a customer quote.",
    es: "Los precios son el costo del proveedor, capturado en julio de 2026, y cambiarán con el tiempo — confirma el costo actual antes de finalizar una cotización al cliente." },
  { en: "Shipping totals below are estimates for planning purposes only.",
    es: "Los totales de envío a continuación son estimados solo para fines de planificación." },
  { en: "COP equivalents are calculated from the same live exchange rate used by the dollars/pesos calculator, cached once per day.",
    es: "Los equivalentes en COP se calculan con la misma tasa de cambio en vivo que usa la calculadora dólares/pesos, almacenada en caché una vez al día." }
];
