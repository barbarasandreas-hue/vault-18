// Pruebas del Sprint 21: hitos, misiones y siguiente paso (funciones puras de js/calculos.js).
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const HOY = new Date('2026-11-07T12:00:00');
const base = (extra) => Object.assign({
  grupo: false, numeros: true, cuentaVivienda: false, ahorrado: 0, meta: 10000000, preaprobado: false,
  asegurado: false, esTuyo: false, ds1: null, rsh: false, ds1Postulado: false, documentos: false,
  bajoLlave: false, ahorroAutomatico: false, equipo: false, eligio: false, cuotaPendiente: false
}, extra);

test('S21: seis hitos, en orden distinto según el camino', () => {
  assert.deepStrictEqual(c.HITOS_CAMINO.individual, ['numeros', 'cuenta', 'pie', 'preaprobacion', 'asegurar', 'es-tuyo']);
  assert.deepStrictEqual(c.HITOS_CAMINO.grupo, ['numeros', 'cuenta', 'preaprobacion', 'pie', 'aprobacion', 'es-tuyo']);
});

test('S21: hitoActual es el primero que falta', () => {
  assert.strictEqual(c.hitoActual(base({ numeros: false })).id, 'numeros');
  assert.strictEqual(c.hitoActual(base()).indice, 2);
  const h = c.hitoActual(base({ cuentaVivienda: true, ahorrado: 4000000 }));
  assert.strictEqual(h.id, 'pie');
  assert.strictEqual(h.indice, 3);
  assert.deepStrictEqual(h.hitos.map((x) => x.estado), ['hecho', 'hecho', 'actual', 'pendiente', 'pendiente', 'pendiente']);
  // En grupo, después de la cuenta viene la preaprobación (asegura el cupo), antes del pie.
  assert.strictEqual(c.hitoActual(base({ grupo: true, cuentaVivienda: true })).id, 'preaprobacion');
  assert.strictEqual(c.hitoActual(base({ grupo: true, cuentaVivienda: true })).nombre, 'Preaprobación y tu cupo');
});

test('S21: con el pie juntado sigue la preaprobación; es tuyo termina todo', () => {
  assert.strictEqual(c.hitoActual(base({ cuentaVivienda: true, ahorrado: 10000000 })).id, 'preaprobacion');
  const fin = c.hitoActual(base({ esTuyo: true }));
  assert.ok(fin.terminado);
  assert.ok(fin.hitos.every((x) => x.estado === 'hecho'));
});

test('S21: misiones según el caso; las hechas van al final', () => {
  const sinDs1 = c.misiones(base(), HOY).map((x) => x.id);
  assert.ok(!sinDs1.includes('ds1') && !sinDs1.includes('rsh'));
  assert.ok(!sinDs1.includes('bajo-llave'), 'bajo llave pide la cuenta de vivienda');
  const ms = c.misiones(base({ ds1: { montoUF: 410 }, cuentaVivienda: true, ahorroAutomatico: true }), HOY);
  assert.strictEqual(ms[0].id, 'ds1', 'el DS1 cierra el 27 de noviembre: va primero');
  assert.strictEqual(ms[0].etiqueta, '+UF 410');
  assert.strictEqual(ms[ms.length - 1].id, 'ahorro-auto', 'la hecha va al final');
  assert.ok(ms[ms.length - 1].hecho);
});

test('S21: siguientePaso, 1) lo que vence pronto, con su requisito primero', () => {
  // DS1 cierra en 20 días: primero la cuenta de vivienda (requisito), con el plazo del DS1.
  let p = c.siguientePaso(base({ ds1: { montoUF: 410 } }), HOY);
  assert.deepStrictEqual([p.tipo, p.id, p.plazo], ['hito', 'cuenta', '2026-11-27']);
  p = c.siguientePaso(base({ ds1: { montoUF: 410 }, cuentaVivienda: true }), HOY);
  assert.deepStrictEqual([p.tipo, p.id], ['mision', 'rsh']);
  p = c.siguientePaso(base({ ds1: { montoUF: 410 }, cuentaVivienda: true, rsh: true }), HOY);
  assert.deepStrictEqual([p.tipo, p.id], ['mision', 'ds1']);
  // Pasado el cierre ya no apura.
  p = c.siguientePaso(base({ ds1: { montoUF: 410 }, cuentaVivienda: true }), new Date('2026-12-15T12:00:00'));
  assert.notStrictEqual(p.id, 'rsh');
});

test('S21: siguientePaso, 2) destraba el hito actual', () => {
  assert.strictEqual(c.siguientePaso(base(), HOY).id, 'cuenta');
  const listo = { cuentaVivienda: true, ahorrado: 10000000 };
  assert.strictEqual(c.siguientePaso(base(listo), HOY).id, 'documentos');
  assert.strictEqual(c.siguientePaso(base(Object.assign({ documentos: true }, listo)), HOY).id, 'preaprobacion');
  assert.strictEqual(c.siguientePaso(base(Object.assign({ preaprobado: true }, listo)), HOY).id, 'elegir');
  // En grupo, para la preaprobación y el cupo hay que elegir antes.
  assert.strictEqual(c.siguientePaso(base({ grupo: true, cuentaVivienda: true, documentos: true }), HOY).id, 'elegir');
});

test('S21: siguientePaso, 3) mientras juntas el pie: cuota el día de pago o lo que adelanta', () => {
  const s = { cuentaVivienda: true, ahorrado: 2000000 };
  assert.strictEqual(c.siguientePaso(base(s), HOY).id, 'ahorro-auto');
  assert.strictEqual(c.siguientePaso(base(Object.assign({ cuotaPendiente: true }, s)), HOY).tipo, 'cuota');
  const p = c.siguientePaso(base(s), HOY);
  assert.deepStrictEqual(p.hito, { indice: 3, total: 6 });
  assert.ok(p.titulo && p.gana && p.cuesta);
});

test('S21: la tarjeta cambia al completar un paso', () => {
  const a = c.siguientePaso(base(), HOY);
  const b = c.siguientePaso(base({ cuentaVivienda: true }), HOY);
  assert.notStrictEqual(a.id, b.id);
  assert.strictEqual(c.siguientePaso(base({ esTuyo: true }), HOY).tipo, 'listo');
});

test('S21: fechas que importan, en orden', () => {
  const f = c.FECHAS_IMPORTAN.map((x) => x.fecha);
  assert.deepStrictEqual(f.slice().sort(), f);
  assert.strictEqual(c.diasHastaFecha('2026-11-27', HOY), 20);
});
