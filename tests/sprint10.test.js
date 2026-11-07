// Pruebas del Sprint 10: modo propio, ¿Y si me arrepiento? y Sostener.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

test('modo propio: arrendar sin pie compartido, el usuario pone el 20 %', () => {
  const e = c.escenario(2500, 'lote', 'propio', 10);
  assert.strictEqual(e.pie, c.ufAPesos(2375 * 0.2));
  assert.strictEqual(e.pctInversionistas, 0);
  assert.strictEqual(e.reparto.inversionistas, 0);
  assert.strictEqual(e.dividendo, 377366); // mismo crédito del 80 %
  assert.strictEqual(e.modo, 'arrendar');
});

test('vender este mes: orden de pago sin plusvalía, en el mes 1 con pie compartido', () => {
  const precio = 2375;
  const saldoBci = c.saldoBciUF(precio, 1, 'arrendar');
  const v = c.ventaHoy(precio, saldoBci, 356.25);
  assert.strictEqual(v.valor, c.ufAPesos(2375));
  assert.strictEqual(v.costos, c.ufAPesos(2375 * 0.02));
  assert.strictEqual(v.inversionistas, c.ufAPesos(2375 * 0.98 * 0.15));
  assert.strictEqual(v.bci, c.ufAPesos(saldoBci));
  // Lo que queda para el comprador cuadra (±$2 por redondeo)
  assert.ok(Math.abs(v.valor - v.costos - v.inversionistas - v.bci - v.usuario) <= 2);
  assert.ok(v.usuario > 0);
  assert.strictEqual(v.faltaParaBci, 0);
});

test('vender este mes: sin inversionistas (vivir), todo lo que no es de Bci ni costos es del comprador', () => {
  const saldoBci = c.saldoBciUF(2500, 1, 'vivir');
  const v = c.ventaHoy(2500, saldoBci, 0);
  assert.strictEqual(v.inversionistas, 0);
  assert.ok(Math.abs(v.usuario - c.ufAPesos(2500 * 0.98 - saldoBci)) <= 1);
});

test('vender: si la deuda pasa lo que queda, Bci cobra hasta donde alcanza y se informa lo que falta', () => {
  const v = c.ventaHoy(1000, 990, 0);
  assert.strictEqual(v.bci, c.ufAPesos(980));
  assert.strictEqual(v.usuario, 0);
  assert.strictEqual(v.faltaParaBci, c.ufAPesos(10));
});

test('Sostener: pagar suma a la racha', () => {
  let r = { mes: 0, racha: 0, ultimoProtector: null };
  r = c.registrarMes(r, true); r = c.registrarMes(r, true);
  assert.strictEqual(r.racha, 2);
  assert.strictEqual(r.mes, 2);
  assert.strictEqual(r.resultado, 'pago');
});

test('Sostener: "Este mes no pude" usa el protector una vez cada 6 meses', () => {
  let r = { mes: 3, racha: 3, ultimoProtector: null };
  r = c.registrarMes(r, false);
  assert.strictEqual(r.resultado, 'protector');
  assert.strictEqual(r.racha, 3);
  assert.strictEqual(r.ultimoProtector, 4);
  assert.strictEqual(c.protectorDisponible(5, 4), false);
  assert.strictEqual(c.mesesParaProtector(5, 4), 5);
  // segunda vez antes de 6 meses: la racha vuelve a empezar (sin castigo al ahorro)
  const otra = c.registrarMes({ mes: 6, racha: 5, ultimoProtector: 4 }, false);
  assert.strictEqual(otra.resultado, 'reinicio');
  assert.strictEqual(otra.racha, 0);
  assert.strictEqual(otra.ultimoProtector, 4);
  // a los 6 meses vuelve a estar disponible
  assert.strictEqual(c.protectorDisponible(10, 4), true);
  assert.strictEqual(c.registrarMes({ mes: 9, racha: 5, ultimoProtector: 4 }, false).resultado, 'protector');
});
