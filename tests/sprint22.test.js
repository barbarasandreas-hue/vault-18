// Pruebas del Sprint 22: datos y chips de Explorar (S22-F4).
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');
const datos = require('../js/datos.js');

const p = (id) => datos.buscarProyecto(id);
const d = (id) => datos.departamentosDe(id)[0];

test('S22-F4: Sin IVA solo terminados con recepción antes del 17-oct-2026', () => {
  assert.ok(c.cumpleChip('sin-iva', p('acacias-quinta'), d('acacias-quinta')));
  assert.ok(!c.cumpleChip('sin-iva', p('cerezos-recoleta'), d('cerezos-recoleta')), 'recepción después del corte');
  assert.ok(!c.cumpleChip('sin-iva', p('mirador-independencia'), d('mirador-independencia')), 'en obra');
  // Todos los terminados tienen fecha de recepción.
  datos.PROYECTOS.filter((x) => x.tipo === 'venta').forEach((x) => assert.match(x.recepcionDefinitiva, /^\d{4}-\d{2}-\d{2}$/));
});

test('S22-F4: DS1 hasta UF 4.000, DS19 por proyecto y DFL-2 hasta 140 m²', () => {
  assert.ok(c.cumpleChip('ds1', p('terrazas-quinta'), { listaUF: 2800 }));
  assert.ok(!c.cumpleChip('ds1', p('terrazas-quinta'), { listaUF: 4200 }));
  assert.ok(c.cumpleChip('ds19', p('pasaje-recoleta'), d('pasaje-recoleta')));
  assert.ok(!c.cumpleChip('ds19', p('mirador-independencia'), d('mirador-independencia')));
  assert.ok(c.cumpleChip('dfl2', p('plaza-estacion'), { m2: 140 }));
  assert.ok(!c.cumpleChip('dfl2', p('plaza-estacion'), { m2: 141 }));
});

test('S22-F4: chips según el modo y bloqueo con su razón', () => {
  assert.deepStrictEqual(c.chipsDelModo('vivir'), ['sin-iva', 'ds1', 'ds19']);
  assert.deepStrictEqual(c.chipsDelModo('arrendar'), ['sin-iva', 'dfl2']);
  assert.strictEqual(c.bloqueoChip('sin-iva', c.CAMINOS['grupo-vivir']), 'Es en obra');
  assert.strictEqual(c.bloqueoChip('sin-iva', c.CAMINOS['individual-vivir']), null);
  assert.ok(c.bloqueoChip('sin-iva', c.CAMINOS['grupo-vivir']).split(' ').length <= 3);
});

test('S22-F4: al menos 3 usados de ejemplo en las comunas de los ejemplos', () => {
  const comunas = new Set(datos.PROYECTOS.map((x) => x.comuna));
  assert.ok(datos.USADOS.length >= 3);
  datos.USADOS.forEach((u) => {
    assert.ok(comunas.has(u.comuna), u.comuna);
    assert.strictEqual(typeof u.dfl2, 'boolean');
    assert.ok(u.listaUF > 0 && u.m2 > 0);
  });
});

test('S22-F1: una foto o dibujo por etapa de obra', () => {
  assert.strictEqual(c.FOTOS_ETAPA.length, c.ETAPAS_OBRA.length);
  assert.deepStrictEqual(c.FOTOS_ETAPA.slice(0, 4), ['excavacion', 'obra-gruesa', 'terminaciones', 'recepcion']);
});

test('S22: pasado el cierre del DS1, la misión no muestra una fecha vencida', () => {
  const s = { grupo: false, numeros: true, cuentaVivienda: true, ahorrado: 0, meta: 1e7, ds1: { montoUF: 410 } };
  const m = c.misiones(s, new Date('2027-07-03T12:00:00')).find((x) => x.id === 'ds1');
  assert.strictEqual(m.fecha, null);
  assert.match(m.titulo, /próximo llamado/);
  assert.notStrictEqual(c.siguientePaso(s, new Date('2027-07-03T12:00:00')).plazo, '2026-11-27');
});

test('S22-F2: un ¡Bien! por hito o misión, de alguien del equipo y sin nombres', () => {
  const equipo = [{ id: 'm1', relacion: 'mamá' }, { id: 'm2', relacion: 'mascota' }, { id: 'm3', relacion: 'amiga' }];
  let r = c.animosNuevos(['numeros', 'cuenta'], [], equipo);
  assert.deepStrictEqual(r.nuevos.map((x) => [x.clave, x.relacion]), [['cuenta', 'mamá']]);
  assert.deepStrictEqual(r.dados, ['cuenta']);
  // El mismo hito no se celebra dos veces.
  r = c.animosNuevos(['cuenta', 'ahorro-auto'], r.dados, equipo);
  assert.deepStrictEqual(r.nuevos.map((x) => x.clave), ['ahorro-auto']);
  assert.notStrictEqual(r.nuevos[0].relacion, 'mascota');
  // Sin equipo: se anota, pero nadie manda ánimo.
  const sin = c.animosNuevos(['cuenta'], [], []);
  assert.deepStrictEqual([sin.nuevos.length, sin.dados.length], [0, 1]);
  // A lo más 2 a la vez.
  assert.ok(c.animosNuevos(['cuenta', 'pie', 'documentos', 'rsh'], [], equipo).nuevos.length <= 2);
});

test('S22-F3: el mensaje del regalo no expone montos ni datos personales', () => {
  const enlace = c.enlaceRegalo('ab12cd34');
  assert.strictEqual(enlace, 'https://primerpeldano.cl/regalo/ab12cd34');
  assert.strictEqual(c.enlaceRegalo('ab/../1 2;x'), 'https://primerpeldano.cl/regalo/ab12x');
  const m = c.mensajeRegalo({ ocasion: 'Cumpleaños', pct: 42.4, mesesFaltan: 14, enlace });
  assert.match(m, /^Para mi cumpleaños: estoy/);
  assert.match(m, /42 %/);
  assert.match(m, /14 meses/);
  assert.doesNotMatch(m, /\$|UF|millones|RUT/);
  assert.ok(m.endsWith(enlace));
  assert.doesNotMatch(c.mensajeRegalo({ ocasion: 'Otra ocasión', pct: 100, mesesFaltan: 0, enlace }), /faltan/);
});
