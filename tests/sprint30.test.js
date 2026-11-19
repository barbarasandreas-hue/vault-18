// Sprint 30: menos texto, mejor camino (B1–B3). Pruebas de estructura sobre app.js y estilos.css.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');

test('S30-B1: Ayudas para llegar antes es una lista plegable, una abierta a la vez, con acción por ayuda', () => {
  assert.match(app, /Ayudas para llegar antes/);
  assert.doesNotMatch(app, /Ayudas que te acercan/);
  assert.match(app, /class="ayuda-cab"/);
  assert.match(app, /aria-expanded/);
  assert.match(app, /data-ayuda-filtro/);
  assert.match(app, /data-ayuda-mision="ds1"/);
  assert.doesNotMatch(app, /Dónde lo ves/);
  assert.match(css, /\.ayuda-barra i[^}]*scaleX/);
});
test('S30-B1: el filtro de cada ayuda existe como chip (ds1, ds19, sin-iva)', () => {
  ['ds1', 'ds19', 'sin-iva'].forEach(k => assert.match(app, new RegExp("filtro: '" + k + "'")));
});
test('S30-B2: la página de un camino ya no trae chips de ayudas ni "Cambiar de camino"; elegir tiene un solo nombre', () => {
  assert.match(app, /var TIRA_CAMINOS = false/);
  assert.match(app, /if \(!TIRA_CAMINOS\) return;/);
  assert.doesNotMatch(app, /Ver mis pasos con este camino/);
  assert.match(app, /Elegir este camino/);
  assert.match(app, /filtrosActivosHtml/);
  assert.match(app, /data-quitar-chip/);
});
test('S30-B2: un solo botón de términos por pantalla', () => {
  assert.match(app, /Qué significan estos términos/);
  assert.match(app, /function abrirTerminos/);
});
test('S30-B3: la hoja de elegir camino dice la fecha y los pasos, y deja la lista plegada', () => {
  assert.match(app, /abrirHojaContenido\('Elegir este camino'/);
  assert.match(app, /Tu fecha pasa de/);
  assert.match(app, /<details class="termino-detalle"><summary>Ver mis /);
});
test('S30-B4: Tus pasos sin tarjeta de fecha repetida y con enlace corto a caminos', () => {
  // S32-B8: Tus pasos pasó a Mi compra; el enlace corto a los caminos es «Comparar caminos ›».
  assert.match(app, /Comparar caminos ›/);
  assert.doesNotMatch(app, /pasos-misiones-sub/);
  assert.match(css, /Sprint 30 · B4/);
});
test('S30-B5: Explorar muestra camino destacado y otros caminos en filas; Otras formas solo fuera de vivir', () => {
  assert.match(app, /function cajaCaminos/);
  assert.match(app, /caminos-filas/);
  assert.match(app, /estado\.modo !== 'vivir'/);
  assert.match(css, /\.camino-destacado/);
});
test('S30-B6: elegir departamento redirige a Explorar, a la lista de tu camino', () => {
  assert.match(app, /function rutaElegir\(\)/);
  assert.match(app, /p\[1\] === 'elegir' \? rutaElegir\(\)/);
  // S32-B2: los caminos viven en #compra/caminos (q = la dirección desde 'caminos').
  assert.match(app, /renderUnCamino\(q\[1\], q\[2\] === 'elegir'\)/);
  assert.doesNotMatch(app, /'#camino\/elegir'/);
  assert.match(app, /Elige tu departamento<\/h1>/);
});
test('S30: app.js compila (sin errores de sintaxis)', () => {
  new (require('vm').Script)(app, { filename: 'app.js' });
});
test('S30: el monto del mes se cambia dentro de la transferencia, con aviso si es menor que la cuota', () => {
  assert.doesNotMatch(app, /Depositar otro monto/);
  assert.match(app, /tr-monto-campo/);
  assert.match(app, /llegarás más tarde a tu pie/);
});
