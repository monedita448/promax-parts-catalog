// Product data for the "Sistemas de incendio" sample section - automatic
// fire suppression products, sourced only from Walmart.com (verified live
// listings, captured 2026-07-31). Real names, prices, and photos per
// product; walmartUrl is the exact live product page. This file is
// self-contained (doesn't share constants with data.js) since it's only
// ever loaded on incendio.html, never alongside the phone catalog.

const FUEGO_PRODUCTS = [
  {
    id: "fuego-ougist",
    brand: "Ougist",
    name: {
      en: "Automatic aerosol fire suppression device",
      es: "Dispositivo automático de extinción por aerosol"
    },
    spec: {
      en: "For car, truck, SUV, RV, boat, electrical panels, battery boxes and engine compartments · 0.2 lb · maintenance-free",
      es: "Para autos, camiones, SUV, RV, botes, paneles eléctricos, cajas de batería y compartimentos de motor · 0.2 lb · sin mantenimiento"
    },
    price: 17.70,
    img: "images/fuego-ougist-panel.jpg",
    walmartUrl: "https://www.walmart.com/ip/Ougist-0-2lbs-Small-Automatic-Fire-Extinguisher-Easy-Clean-Fire-Extinguisher-Car-Truck-SUV-Electric-Box-Ship-Cabin-Vehicle-Effectively-Extinguishes-A/7008366649"
  },
  {
    id: "fuego-ifundom",
    brand: "ifundom",
    name: {
      en: "Self-activating automatic fire extinguisher kit",
      es: "Kit de extintor automático de autoactivación"
    },
    spec: {
      en: "For cars, RVs and boats · rose-gold finish · mounts under hood or near battery compartment",
      es: "Para autos, RV y botes · acabado oro rosa · se instala bajo el capó o cerca del compartimento de batería"
    },
    price: 16.17,
    img: "images/fuego-ifundom-engine.jpg",
    walmartUrl: "https://www.walmart.com/ip/ifundom-Self-Activating-Automatic-Fire-Extinguisher-Kit-for-Cars-Rvs-Boats-in-Rose-Plated-Gold-Finish/20676917939"
  },
  {
    id: "fuego-sorrowso",
    brand: "Sorrowso",
    name: {
      en: "Automatic fire sprinkler head, K80 quick response",
      es: "Rociador automático contra incendios, respuesta rápida K80"
    },
    spec: {
      en: "155°F (68°C) standard response · 1/2\" NPT thread · for plumbed automatic sprinkler systems",
      es: "Respuesta estándar a 155°F (68°C) · rosca NPT 1/2\" · para sistemas de rociadores automáticos con tubería"
    },
    price: 14.31,
    img: "images/fuego-sorrowso-sprinkler.jpg",
    walmartUrl: "https://www.walmart.com/ip/Sorrowso-1-57-x2-76-155-F-68-C-Standard-Automatic-Fire-Sprinkler-K80-Quick-Response-for-Automatic-Fire-Sprinkler-System/1625942285"
  },
  {
    id: "fuego-yoopt",
    brand: "Yoopt",
    name: {
      en: "Automatic fire suppression system, 16-hole nozzle",
      es: "Sistema automático de extinción, boquilla de 16 orificios"
    },
    spec: {
      en: "For vehicles and electrical fires · rapid discharge · 10g compact canister",
      es: "Para vehículos e incendios eléctricos · descarga rápida · cilindro compacto de 10g"
    },
    price: 6.96,
    img: "images/fuego-yoopt-vehicle.jpg",
    walmartUrl: "https://www.walmart.com/ip/Automatic-Fire-Suppression-System-for-Vehicles-16-Hole-Nozzle-Rapid-Electrical-Fire-Extinguisher/20591418631"
  }
];

// Same domestic shipping structure as the phone catalog (generic carrier
// tiers, not a single published Walmart freight schedule - Walmart's
// actual per-order shipping varies by seller/item, so these represent
// typical small-package domestic rates for quoting purposes).
const FUEGO_SHIPPING_OPTIONS = [
  { id: "usps", price: 6.00, freeOver: 35, transitDays: 5, cutoffHour: 15 },
  { id: "ups-ground", price: 7.00, freeOver: 35, transitDays: 3, cutoffHour: 19 },
  { id: "fedex-ground", price: 7.00, freeOver: 35, transitDays: 3, cutoffHour: 18 },
  { id: "ups-2day", price: 7.00, freeOver: 35, transitDays: 2, cutoffHour: 19 },
  { id: "ups-nda-saver", price: 12.00, freeOver: 100, transitDays: 1, cutoffHour: 19 },
  { id: "pickup", price: 0.00, freeOver: 0 },
  { id: "combine", price: 0.00, freeOver: 0 }
];

const FUEGO_COLOMBIA_HANDOFF_DAYS = 1;
const FUEGO_COLOMBIA_TRANSIT_DAYS = 3;

const FUEGO_MARGIN_OPTIONS = [0.5, 0.6, 0.75, 1.0];
const FUEGO_DEFAULT_MARGIN = 0.5;
const FUEGO_MISHAP_MULTIPLIER = 1.10;
const FUEGO_PIROBO_STEP_MULTIPLIER = 1.025;

// Same two US drop addresses as the phone catalog, both FL.
const FUEGO_SHIP_DESTINATIONS = [
  { id: "casa-f", label: "Casa F", address: "Lantana, FL 33462", state: "FL" },
  { id: "tia-express", label: "Tía Express", address: "Coral Springs, FL 33065", state: "FL" }
];

// Same WhatsApp/Formspree setup as the phone catalog - Pablo's own
// summary opens visibly, the sourcing side gets a silent background
// notification only.
const FUEGO_ORDER_WHATSAPP_NUMBER = "573046273122";
const FUEGO_SOURCING_FORM_ENDPOINT = "";
