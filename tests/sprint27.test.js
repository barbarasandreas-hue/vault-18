// Pruebas del Sprint 27 · B1: misiones con fecha (test con usuarios del 12-nov).
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const m = (id, fecha, hecho) => ({ id, titulo: id, fecha: fecha || null, hecho: !!hecho });

test('S27-B1: solo las pendientes con fecha, de la que vence primero a la última', () => {
  const ms = [m('b', '2027-03-01'), m('sin'), m('a', '2026-11-27'), m('hecha', '2026-11-20', true)];
  assert.deepStrictEqual(c.misionesConFecha(ms, new Date('2026-11-12T12:00:00')).map((x) => x.id), ['a', 'b']);
});

test('S27-B1: las vencidas no aparecen', () => {
  const ms = [m('a', '2026-11-27'), m('b', '2027-03-01')];
  assert.deepStrictEqual(c.misionesConFecha(ms, new Date('2026-12-01T12:00:00')).map((x) => x.id), ['b']);
});

test('S27-B1: con el DS1 abierto, su misión es la que vence primero', () => {
  const s = { grupo: false, numeros: true, cuentaVivienda: true, ahorrado: 0, meta: 10000000, preaprobado: false,
    asegurado: false, esTuyo: false, ds1: { montoUF: 410 }, rsh: false, ds1Postulado: false, documentos: false,
    bajoLlave: false, ahorroAutomatico: false, equipo: false, eligio: false, cuotaPendiente: false };
  const hoy = new Date('2026-11-12T12:00:00');
  const f = c.misionesConFecha(c.misiones(s, hoy), hoy);
  assert.strictEqual(f[0].id, 'ds1');
  assert.strictEqual(f[0].fecha, '2026-11-27');
});
