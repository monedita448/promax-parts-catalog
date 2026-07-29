// Product catalog data — iPhone Pro Max genuine repair parts (12 through 17)
// Prices captured directly from supplier account, July 2026, in USD. Estimates — verify before quoting.
// image filenames are placeholders; see image-manifest.json for the source links to fetch.
// gradeKey/category/colors are lookup keys translated via i18n.js. name/note have EN+ES pairs.

const SHIPPING_OPTIONS = [
  { id: "usps", price: 0.00 },
  { id: "ups-ground", price: 7.00 },
  { id: "fedex-ground", price: 7.00 },
  { id: "ups-2day", price: 7.00 },
  { id: "fedex-2day", price: 7.00 },
  { id: "ups-nda-saver", price: 12.00 },
  { id: "fedex-standard-ON", price: 12.00 },
  { id: "ups-nda", price: 18.00 },
  { id: "fedex-priority-ON", price: 18.00 },
  { id: "pickup", price: 0.00 },
  { id: "combine", price: 0.00 },
  { id: "local", price: 30.00 }
];

const CATALOG = [
  {
    model: "12",
    label: "iPhone 12 Pro Max",
    products: [
      { id: "12-screen", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "premium-refurbished", inStock: true, price: 139.95, colors: ["Black"], img: "images/12pm-screen.jpg", note: { en: "", es: "" } },
      { id: "12-housing", category: "Back housing", name: { en: "Back housing", es: "Carcasa trasera" }, gradeKey: "genuine-oem-pull", inStock: true, price: 86.92, colors: ["Graphite", "Gold", "Pacific Blue", "Silver"], img: "images/12pm-housing.jpg", note: { en: "", es: "" } },
      { id: "12-rearcam", category: "Camera", name: { en: "Rear camera module (wide, 1x)", es: "Módulo de cámara trasera (gran angular, 1x)" }, gradeKey: "genuine", inStock: true, price: 17.00, colors: [], img: "images/12pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x) and telephoto (2.5x) modules also available on request.", es: "También disponibles los módulos ultra gran angular (0.5x) y telefoto (2.5x) bajo pedido." } },
      { id: "12-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 4.49, colors: [], img: "images/12pm-frontcam.jpg", note: { en: "", es: "" } },
      { id: "12-charging", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "premium", inStock: true, price: 13.50, colors: ["Gold", "Graphite", "Pacific Blue", "Silver"], img: "images/12pm-charging.jpg", note: { en: "", es: "" } },
      { id: "12-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 20.13, colors: [], img: "images/12pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { id: "12-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: true, price: 8.56, colors: [], img: "images/12pm-earspeaker.jpg", note: { en: "", es: "" } }
    ]
  },
  {
    model: "13",
    label: "iPhone 13 Pro Max",
    products: [
      { id: "13-screen", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "premium-refurbished", inStock: true, price: 119.95, colors: ["Black"], img: "images/13pm-screen.jpg", note: { en: "", es: "" } },
      { id: "13-housing", category: "Back housing", name: { en: "Back housing", es: "Carcasa trasera" }, gradeKey: "genuine-oem-pull", inStock: true, price: 88.78, colors: ["Graphite", "Gold", "Silver"], img: "images/13pm-housing.jpg", note: { en: "", es: "" } },
      { id: "13-rearcam", category: "Camera", name: { en: "Rear camera module (wide)", es: "Módulo de cámara trasera (gran angular)" }, gradeKey: "genuine", inStock: true, price: 66.90, colors: [], img: "images/13pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x, $19.22) and telephoto (3x, $23.44) modules also available.", es: "También disponibles los módulos ultra gran angular (0.5x, $19.22) y telefoto (3x, $23.44)." } },
      { id: "13-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 2.71, colors: [], img: "images/13pm-frontcam.jpg", note: { en: "", es: "" } },
      { id: "13-charging", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "premium", inStock: true, price: 14.30, colors: ["Gold", "Graphite", "Silver"], img: "images/13pm-charging.jpg", note: { en: "", es: "" } },
      { id: "13-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 10.50, colors: [], img: "images/13pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { id: "13-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: true, price: 9.07, colors: [], img: "images/13pm-earspeaker.jpg", note: { en: "", es: "" } }
    ]
  },
  {
    model: "14",
    label: "iPhone 14 Pro Max",
    products: [
      { id: "14-screen", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "premium-refurbished", inStock: true, price: 165.00, colors: ["Black"], img: "images/14pm-screen.jpg", note: { en: "A \"complete/pairable\" upgrade tier is available for $236.66 if pre-pairing is required.", es: "Existe una versión superior \"completa/emparejable\" por $236.66 si se requiere preemparejamiento." } },
      { id: "14-housing", category: "Back housing", name: { en: "Back housing", es: "Carcasa trasera" }, gradeKey: "genuine-oem-pull", inStock: true, price: 103.64, colors: ["Space Black", "Silver", "Gold", "Deep Purple"], img: "images/14pm-housing.jpg", note: { en: "", es: "" } },
      { id: "14-rearcam", category: "Camera", name: { en: "Rear camera module (main)", es: "Módulo de cámara trasera (principal)" }, gradeKey: "genuine", inStock: true, price: 47.95, colors: [], img: "images/14pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x) module also available, $23.44.", es: "También disponible el módulo ultra gran angular (0.5x), $23.44." } },
      { id: "14-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 18.30, colors: [], img: "images/14pm-frontcam.jpg", note: { en: "", es: "" } },
      { id: "14-charging", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "premium", inStock: false, price: 19.95, colors: ["Deep Purple", "Gold", "Silver"], img: "images/14pm-charging.jpg", note: { en: "", es: "" } },
      { id: "14-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "premium", inStock: true, price: 6.19, colors: [], img: "images/14pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { id: "14-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: true, price: 13.57, colors: [], img: "images/14pm-earspeaker.jpg", note: { en: "", es: "" } }
    ]
  },
  {
    model: "15",
    label: "iPhone 15 Pro Max",
    products: [
      { id: "15-screen", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "premium-refurbished", inStock: false, price: 177.00, colors: ["Black"], img: "images/15pm-screen.jpg", note: { en: "", es: "" } },
      { id: "15-housing", category: "Back housing", name: { en: "Back glass w/ small parts", es: "Tapa trasera de vidrio con piezas pequeñas" }, gradeKey: "genuine-oem-pull", inStock: true, price: 79.00, colors: ["White Titanium", "Black Titanium"], img: "images/15pm-housing.jpg", note: { en: "A lower Grade B+ cosmetic tier is available for $68.79.", es: "Existe una versión cosmética Grado B+ más económica por $68.79." } },
      { id: "15-rearcam", category: "Camera", name: { en: "Telephoto rear camera (3x)", es: "Cámara trasera telefoto (3x)" }, gradeKey: "genuine", inStock: true, price: 47.17, colors: [], img: "images/15pm-rearcam.jpg", note: { en: "Ultra-wide (0.5x) module also available, $16.95.", es: "También disponible el módulo ultra gran angular (0.5x), $16.95." } },
      { id: "15-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 25.00, colors: [], img: "images/15pm-frontcam.jpg", note: { en: "Requires Face ID transfer from the original module to calibrate.", es: "Requiere transferir el Face ID del módulo original para calibrarse." } },
      { id: "15-charging", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "premium", inStock: true, price: 26.50, colors: ["Natural Titanium", "Blue Titanium", "White Titanium"], img: "images/15pm-charging.jpg", note: { en: "", es: "" } },
      { id: "15-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 14.07, colors: [], img: "images/15pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { id: "15-earspeaker", category: "Speaker", name: { en: "Ear speaker", es: "Auricular" }, gradeKey: "genuine", inStock: false, price: 12.24, colors: [], img: "images/15pm-earspeaker.jpg", note: { en: "Proximity sensor flex sold separately, $11.32.", es: "El flex del sensor de proximidad se vende por separado, $11.32." } }
    ]
  },
  {
    model: "16",
    label: "iPhone 16 Pro Max",
    products: [
      { id: "16-screen", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "premium-refurbished", inStock: true, price: 295.00, colors: ["Black"], img: "images/16pm-screen.jpg", note: { en: "", es: "" } },
      { id: "16-housing", category: "Back housing", name: { en: "Back glass w/ small parts", es: "Tapa trasera de vidrio con piezas pequeñas" }, gradeKey: "genuine-oem-pull", inStock: true, price: 135.00, colors: ["Black Titanium", "White Titanium"], img: "images/16pm-housing.jpg", note: { en: "", es: "" } },
      { id: "16-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 86.03, colors: [], img: "images/16pm-frontcam.jpg", note: { en: "Requires Face ID transfer from the original module to calibrate. Rear camera module: limited genuine stock — confirm availability before quoting.", es: "Requiere transferir el Face ID del módulo original para calibrarse. Módulo de cámara trasera: stock genuino limitado — confirmar disponibilidad antes de cotizar." } },
      { id: "16-charging", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "premium", inStock: true, price: 35.00, colors: ["Black Titanium", "White Titanium", "Natural Titanium"], img: "images/16pm-charging.jpg", note: { en: "", es: "" } },
      { id: "16-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 11.53, colors: [], img: "images/16pm-loudspeaker.jpg", note: { en: "", es: "" } },
      { id: "16-earspeaker", category: "Speaker", name: { en: "Ear speaker w/ WiFi flex", es: "Auricular con flex WiFi" }, gradeKey: "genuine", inStock: true, price: 11.53, colors: [], img: "images/16pm-earspeaker.jpg", note: { en: "", es: "" } }
    ]
  },
  {
    model: "17",
    label: "iPhone 17 Pro Max",
    products: [
      { id: "17-screen", category: "Display", name: { en: "Display assembly", es: "Pantalla completa" }, gradeKey: "premium-refurbished", inStock: true, price: 349.95, colors: ["Black"], img: "images/17pm-screen.jpg", note: { en: "", es: "" } },
      { id: "17-rearcam", category: "Camera", name: { en: "Rear camera module", es: "Módulo de cámara trasera" }, gradeKey: "genuine", inStock: true, price: 61.73, colors: [], img: "images/17pm-rearcam.jpg", note: { en: "Shared part number with 17 Pro.", es: "Mismo número de pieza que el 17 Pro." } },
      { id: "17-frontcam", category: "Camera", name: { en: "Front camera module", es: "Módulo de cámara frontal" }, gradeKey: "genuine", inStock: true, price: 53.95, colors: [], img: "images/17pm-frontcam.jpg", note: { en: "", es: "" } },
      { id: "17-charging", category: "Charging port", name: { en: "Charging port flex", es: "Flex del puerto de carga" }, gradeKey: "premium", inStock: true, price: 55.29, colors: ["Silver", "Cosmic Orange", "Deep Blue"], img: "images/17pm-charging.jpg", note: { en: "", es: "" } },
      { id: "17-loudspeaker", category: "Speaker", name: { en: "Loud speaker", es: "Altavoz" }, gradeKey: "genuine", inStock: true, price: 11.32, colors: [], img: "images/17pm-loudspeaker.jpg", note: { en: "", es: "" } }
    ]
  }
];

const CATALOG_NOTES = [
  { en: "Batteries are not listed: no genuine/OEM-pull battery cell is currently available for these models — only aftermarket cells, which are excluded from this catalog by policy.",
    es: "Las baterías no están en el catálogo: actualmente no hay ninguna celda genuina/OEM pull disponible para estos modelos — solo celdas de terceros, que se excluyen de este catálogo por política." },
  { en: "iPhone 16 Pro Max rear camera module and iPhone 17 Pro Max back housing are not yet available in genuine grade — donor supply for these very recent models is still thin. Check current stock before quoting.",
    es: "El módulo de cámara trasera del iPhone 16 Pro Max y la carcasa trasera del iPhone 17 Pro Max aún no están disponibles en grado genuino — la oferta de equipos donantes para estos modelos tan recientes sigue siendo escasa. Confirma el stock actual antes de cotizar." },
  { en: "Prices are supplier cost, captured July 2026, and will drift over time — confirm current cost before finalizing a customer quote.",
    es: "Los precios son el costo del proveedor, capturado en julio de 2026, y cambiarán con el tiempo — confirma el costo actual antes de finalizar una cotización al cliente." },
  { en: "Shipping totals below are estimates for planning purposes only.",
    es: "Los totales de envío a continuación son estimados solo para fines de planificación." },
  { en: "COP equivalents are calculated from the same live exchange rate used by the dollars/pesos calculator, cached once per day.",
    es: "Los equivalentes en COP se calculan con la misma tasa de cambio en vivo que usa la calculadora dólares/pesos, almacenada en caché una vez al día." }
];
