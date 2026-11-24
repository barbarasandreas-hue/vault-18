// Sprint 34: arreglos del recorrido como usuaria (informe «dónde se confunde»).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const calc = fs.readFileSync(path.join(__dirname, '..', 'js', 'calculos.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const c = require('../js/calculos.js');

test('1: el paso 5 ya no da vueltas: «Ahora» abre la hoja y «Ver tu siguiente paso» también', () => {
  assert.match(app, /rutaPasoActual\(\) === 'pie' && sp\.id !== 'pie'\) return null/);
  assert.match(app, /id="btn-siguiente-hito">Ver tu siguiente paso/);
  assert.match(app, /if \(abrirPasoAlLlegar\)/);
  assert.doesNotMatch(app, /href="#compra">Ver tu siguiente hito/);
});

test('2: un nombre por paso, igual en la hoja y en «Ahora»', () => {
  ['camino', 'depto', 'pie', 'preaprobacion', 'aprobacion', 'es-tuyo'].forEach((id) => {
    assert.strictEqual(c.HITOS[id].nombre, c.HITOS[id].accion, id);
  });
  assert.match(calc, /depto: \{ nombre: 'Elige tu departamento', accion: 'Elige tu departamento', gana: 'Te unes al grupo de su edificio'/);
  assert.strictEqual(c.HITOS['es-tuyo'].nombre, 'Firma y recibe tus llaves');
  assert.doesNotMatch(calc, /'Preaprobación y tu cupo'|'Tu edificio'|'Revisa tu aprobación'/);
  assert.doesNotMatch(html, /6 pasos hasta las llaves/);
  assert.match(app, /'Según tu camino'/);
  assert.match(app, /Tu departamento<\/h2>/);
});

test('3: fechas y montos con su nombre', () => {
  assert.match(app, /estado\.ahorroIniciado \? estado\.ahorrado : estado\.ahorroActual/);
  assert.match(app, /Elige dos para verlos lado a lado/);
  assert.match(calc, /meses para juntar el pie de tu departamento/);
  assert.match(app, /Dividendo al mes \(con seguros\)/);
  assert.match(app, /Lo máximo que Bci acepta/);
  assert.match(app, /Firmas cuando juntes tu pie, aunque la obra termine antes/);
});

test('4: «postular» solo para el DS1 y los términos con explicación', () => {
  assert.doesNotMatch(app, /postular no te obliga|'Ir a postular'/);
  assert.match(app, /'preaprobacion': \{ termino: 'Preaprobación'/);
  assert.match(app, /'ds1': \{ termino: 'Subsidio DS1'/);
  assert.match(app, /20 % con crédito tradicional/);
  assert.match(calc, /'Para el DS1'/);
  assert.strictEqual(c.ETAPAS_OBRA_CLARA[1], 'Están levantando los muros');
});

test('5: el pie es una alcancía; en grupo, la cuenta va bloqueada sin «Activar»', () => {
  assert.match(app, /Así se construye tu pie/); // S35: vuelve el edificio en obra
  assert.match(app, /Bloqueado hasta la firma/);
  assert.match(calc, /s\.cuentaVivienda && !s\.grupo\) m\('bajo-llave'/);
});

test('6: los saltos de tiempo se avisan y las misiones dependen del camino', () => {
  assert.match(app, /Simulación: con cada cuota pasa un mes/);
  assert.match(app, /Cerró la postulación al DS1/);
  assert.match(app, /function fechasDelCamino\(s, hoy\)/);
  const base = { ds1: { montoUF: 300 }, caminoElegido: false };
  assert.ok(!c.misiones(base, '2026-11-19').some((m) => m.id === 'ds1'));
  assert.ok(c.misiones(Object.assign({}, base, { caminoElegido: true }), '2026-11-19').some((m) => m.id === 'ds1'));
});

test('7: preaprobación en grupo confirma el cupo y los documentos se suben antes de pedirla', () => {
  assert.match(app, /Tu cupo en el grupo está asegurado/);
  assert.match(app, /'Subir documentos \(' \+ listos \+ ' de ' \+ total \+ '\)'/);
  assert.match(app, /Seguir: junta tu pie/);
});

test('8: Perfil separa lo de las entrevistas y «Volver» no salta desde Avisos o Perfil', () => {
  assert.match(app, /Para las entrevistas<\/h2>/);
  assert.match(app, /function seccionDeRuta\(h\)/);
  assert.match(html, /href="#compra" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"\/><\/svg>Tu compra<\/a>\n        <h1 id="titulo-paso"/);
});
