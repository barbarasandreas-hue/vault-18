// S7-F2: contraste AA de las combinaciones de texto y fondo que usa la app,
// calculado con los colores reales de css/estilos.css.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
const color = {};
for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)) color[m[1]] = m[2];

function luminancia(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a, b) {
  const x = luminancia(color[a]);
  const y = luminancia(color[b]);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// [texto, fondo, ¿texto grande?, dónde se usa]. Texto grande = 24 px o más, o 18,66 px en negrita.
const combinaciones = [
  ['gray-dark', 'white', false, 'texto y títulos'],
  ['gray-dark', 'gray-light', false, 'texto sobre el fondo de la app'],
  ['gray-semidark', 'white', false, 'texto de apoyo en tarjetas'],
  ['gray-semidark', 'gray-light', false, 'texto de apoyo sobre el fondo'],
  ['white', 'green-normal', true, 'botón primario (negrita de 19 px)'],
  ['white', 'green-dark', false, 'botón small, selección, pestaña activa y paso actual'],
  ['green-dark', 'white', false, 'botón secundario, barra activa y filtro'],
  ['green-dark', 'green-20', false, 'sello sin plusvalía, logro y paso actual'],
  ['gray-dark', 'green-20', false, 'texto en el logro y en la cascada'],
  ['gray-semidark', 'white', false, 'botón terciario'],
  ['gray-dark', 'gray-semilight', false, 'botón deshabilitado'],
  ['blue-dark', 'white', false, 'enlaces y botones de ayuda'],
  ['blue-dark', 'gray-light', false, 'enlaces sobre el fondo'],
  ['blue-dark', 'blue-20', false, 'chips y avisos'],
  ['gray-dark', 'blue-20', false, 'explicaciones a un toque'],
  ['gray-dark', 'red-20', false, 'mensajes de error'],
  ['white', 'gray-dark', false, 'toast (S11)'],
  ['red-dark', 'red-20', false, 'semáforo No aprueba'],
  ['red-dark', 'white', false, 'botón de borrar'],
  ['gray-dark', 'yellow-normal', false, 'semáforo En el límite'],
  ['gray-dark', 'yellow-20', false, 'sugerencias'],
  ['blue-dark', 'yellow-20', false, 'enlaces dentro de una sugerencia']
];

for (const [texto, fondo, grande, uso] of combinaciones) {
  test(`contraste AA: ${uso} (--${texto} sobre --${fondo})`, () => {
    assert.ok(color[texto] && color[fondo], 'el color existe en el CSS');
    const r = contraste(texto, fondo);
    const minimo = grande ? 3 : 4.5;
    assert.ok(r >= minimo, `${r.toFixed(2)}:1 es menor que ${minimo}:1`);
  });
}

test('el amarillo nunca se usa como color de texto', () => {
  assert.ok(!/(^|[^-])color:\s*var\(--yellow/m.test(css), 'hay un "color: var(--yellow…)" en el CSS');
});
