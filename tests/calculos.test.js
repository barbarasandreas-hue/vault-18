const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

// Tabla de referencia de PLAN.md (UF $41.065). Se acepta ±$1 por redondeo.
const referencia = [
  { nombre: 'Arrendar, lote', lista: 2500, tipo: 'lote', precioUF: 2250, alEscriturar: 6467738, dividendo: 403272, cuota: 168153, total: 571425 },
  { nombre: 'Arrendar, individual', lista: 2500, tipo: 'individual', precioUF: 2500, alEscriturar: 7186375, dividendo: 444886, cuota: 186837, total: 631723 },
  { nombre: 'Vivir, lote', lista: 3000, tipo: 'lote', precioUF: 2700, alEscriturar: 7761285, dividendo: 478177, cuota: 201784, total: 679961 },
  { nombre: 'Vivir, individual', lista: 3000, tipo: 'individual', precioUF: 3000, alEscriturar: 8623650, dividendo: 528114, cuota: 224204, total: 752319 }
];

function cerca(real, esperado, campo) {
  assert.ok(Math.abs(real - esperado) <= 1, `${campo}: ${real} debería ser ${esperado} (±1)`);
}

for (const r of referencia) {
  test(`escenario ${r.nombre}`, () => {
    const e = c.escenario(r.lista, r.tipo);
    assert.strictEqual(e.precioUF, r.precioUF);
    cerca(e.alEscriturar, r.alEscriturar, 'al escriturar');
    cerca(e.dividendo, r.dividendo, 'dividendo + seguros');
    cerca(e.cuotaInversionistas, r.cuota, 'cuota inversionistas');
    cerca(e.totalMes, r.total, 'total al mes');
  });
}

for (const r of referencia) {
  test(`las cifras de ${r.nombre} cuadran a la vista`, () => {
    const e = c.escenario(r.lista, r.tipo);
    assert.strictEqual(e.dividendo + e.cuotaInversionistas, e.totalMes);
    assert.strictEqual(e.reparto.bci + e.reparto.inversionistas + e.reparto.usuario, e.precio);
    assert.strictEqual(e.pie + e.gastos, e.alEscriturar);
  });
}

test('precio en lote tiene 10 % de descuento', () => {
  assert.strictEqual(c.precioUF(2500, 'lote'), 2250);
  assert.strictEqual(c.precioUF(2500, 'individual'), 2500);
});

test('al escriturar = pie 5 % + gastos 2 %', () => {
  assert.strictEqual(c.pieUF(2000), 100);
  assert.strictEqual(c.gastosUF(2000), 40);
  assert.strictEqual(c.alEscriturarUF(2000), 140);
});

test('reparto 80 / 15 / 5 suma el precio', () => {
  const r = c.repartoUF(2250);
  assert.strictEqual(r.bci, 1800);
  assert.strictEqual(r.inversionistas, 337.5);
  assert.strictEqual(r.usuario, 112.5);
});

test('conversión UF a pesos', () => {
  assert.strictEqual(c.ufAPesos(1), 41065);
  assert.strictEqual(c.ufAPesos(157.5), 6467738);
});

test('formato de pesos con punto de miles', () => {
  assert.strictEqual(c.formatoPesos(6467738), '$6.467.738');
  assert.strictEqual(c.formatoPesos(571425), '$571.425');
  assert.strictEqual(c.formatoPesos(999), '$999');
  assert.strictEqual(c.formatoPesos(1000.4), '$1.000');
});
