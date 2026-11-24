// Sprint 33: ajustes de Bárbara a la nueva navegación.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('C1 (E1, E2): la barra te habla de «tú» y «Tus pasos» reemplaza a «Tu recorrido»', () => {
  assert.ok(html.includes('</svg>Tu compra</a>') && html.includes('</svg>Tu pie</a>'));
  assert.doesNotMatch(app, /Mi compra|Mi pie/);
  assert.match(app, /<h2 id="titulo-recorrido" class="h5">Tus pasos<\/h2>/);
});
test('C2 (E4, E7): Tus pasos como línea de metro con el edificio al final, «Ahora» adentro y «Tu edificio»', () => {
  assert.match(app, /function edificioMeta\(listo\)/);
  assert.match(app, /class="metro-linea"/);
  assert.match(app, /tarjetaSiguientePaso\(true\)/);
  assert.match(app, /Ver con fechas ›/);
  assert.match(app, /function tuEdificioHtml\(s\)/);
  assert.match(app, /function misionesCompraHtml\(ms, hoy\)/);
  // Ajuste: «Ver tu pie» es una flecha a la derecha del azul.
  assert.match(app, /aria-label', 'Ver tu pie'/);
});
test('C3: Misiones en mosaico y fechas en una línea de tiempo', () => {
  assert.match(app, /class="mosaico-misiones"/);
  assert.match(app, /class="linea-fechas"/);
});
test('C4 (E6): Tu pie siempre con la obra; si juntas y la cuota en una tarjeta; grupo y protección visual', () => {
  assert.match(app, /if \(p\[0\] === 'pie'\) return r\('pie', 'pie', renderTuPie\);/);
  assert.match(app, /if \(p\[0\] === 'compra' && p\[1\] === 'pie'\) return r\('pie', 'pie', function \(\) \{ location\.replace\('#pie'\); \}\);/);
  assert.match(app, /deslizadorPie\(true\)/);
  assert.match(app, /function grupoEnPieHtml\(\)/);
  assert.match(app, /protegido-visual/);
});
test('C5 (E5): las ventanas son pantallas aparte, salvo las confirmaciones', () => {
  assert.match(app, /function abrirHojaContenido\(titulo, html, boton, alAbrir, opciones\)/);
  assert.match(app, /hoja-pantalla/);
  assert.ok((app.match(/\{ confirmacion: true \}\)/g) || []).length >= 5);
  assert.match(css, /\.hoja-inferior\.hoja-pantalla/);
});
test('C6 (E3): Conoce los caminos, con ilustración y pasos con íconos', () => {
  assert.match(app, /function ilustracionCamino\(id, clase\)/);
  assert.match(app, /function pasosVisuales\(id\)/);
  assert.match(app, /conoceCaminosHtml\(ids\)/);
});
test('C7: el grupo compacto y comprar sin grupo como opción secundaria', () => {
  assert.match(app, /grupo-confianza compacta/);
  assert.match(app, /¿Prefieres comprarlo sin grupo\? ›/);
  assert.match(app, /Sería tuyo <strong>aprox. /); // S36: antes «Con este, es tuyo»
});
test('C8 (E8): perfil de ejemplo con avatar, sin nombres en la interfaz', () => {
  assert.match(app, /function usarPerfilEjemplo\(\)/);
  assert.match(app, /Usar el perfil de ejemplo/);
  assert.match(app, /var AVATAR_EJEMPLO = /);
  assert.doesNotMatch(app, /Camila|Javiera/);
});
test('C9 (E9): preaprobación sin «Paso N de 6» repetido, con tiempo de respuesta y avanzar el tiempo', () => {
  assert.doesNotMatch(app, /'<p class="ceja-paso">Paso '/);
  assert.match(app, /Avanzar 3 días/);
  assert.match(app, /respuestaLista !== false/);
  assert.match(app, /class="enlace pp-deptos"/); // S34: mirar otros departamentos es secundario
});
test('C0: en grupo, la aprobación final va después del pie', () => {
  assert.match(app, /paso >= \(c\.sinGrupo \|\| !esGrupo\(\) \? 2 : 3\)/);
});

test('Ajustes 2: novedades en la campana, misiones en ventana chica, edificio real separado del pie', () => {
  assert.match(app, /function novedadesHtml\(\)/);
  assert.match(app, /\(estado\.novedades \|\| \[\]\)\.length/);
  assert.match(app, /\{ hoja: true \}\)/);
  assert.match(app, /Tu edificio real/);
  assert.match(app, /Así se construye tu pie/); // S35: el pie vuelve a ser un edificio en obra
});
