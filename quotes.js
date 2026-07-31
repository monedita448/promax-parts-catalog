// Funny-but-motivational Spanish "hustle" quotes shown in the scrolling
// ticker - the actual staff-only warning now lives elsewhere (a stop-sign
// icon near the top), so this ticker shows only the quote itself. Purely
// cosmetic - rotates to a new quote each page load/refresh, cycling
// through the whole list in order (via a localStorage index) before
// repeating, rather than repeating the same one or picking randomly.
(function () {
  var HUSTLE_QUOTES = [
    "El dinero no cae del cielo, cae de los que no duermen.",
    "Si no sudas, no facturas.",
    "La pereza no paga el arriendo.",
    "El café es la gasolina, la meta es la ruta.",
    "No hay descanso para quien quiere Ferrari.",
    "Trabaja en silencio, que hablen las transferencias.",
    "El hustle no tiene festivos.",
    "Cada \"no\" de un cliente es un \"sí\" más cerca.",
    "El que vende dormido, despierta pobre.",
    "La plata no llega sola, toca ir a buscarla a punta de mensajes.",
    "Hoy vendes, mañana inviertes, pasado mañana... sigues vendiendo.",
    "El lunes no es el enemigo, la pereza sí.",
    "No se trata de suerte, se trata de mandar un mensaje más.",
    "Mientras ellos ven Netflix, tú ves ganancias.",
    "El que madruga, cobra primero.",
    "Un cliente que no contesta hoy, contesta con plata mañana.",
    "Las excusas no pagan el inventario.",
    "Se descansa cuando factura, no cuando cansa.",
    "El teléfono no se contesta solo, pero la comisión sí se gasta sola.",
    "Cero ventas, cero excusas válidas."
  ];

  var STORAGE_KEY = 'hustleQuoteIndex';
  var current = -1;
  try {
    var stored = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!isNaN(stored)) current = stored;
  } catch (e) {}

  var next = (current + 1) % HUSTLE_QUOTES.length;
  try { localStorage.setItem(STORAGE_KEY, String(next)); } catch (e) {}

  var quote = HUSTLE_QUOTES[next];

  var textEls = document.querySelectorAll('.staff-warning-text');
  Array.prototype.forEach.call(textEls, function (el) {
    el.textContent = quote;
  });
})();
