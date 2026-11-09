// Pruebas del Sprint 26: Tu mes como dueño y Cómo es vivir ahí.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');
const d = require('../js/datos.js');

test('S26: el mes como dueño suma dividendo con seguros, gastos comunes y arreglos', () => {
  const m = c.mesDueno({ dividendo: 450000, m2: 48, precioUF: 2500, arriendo: 400000, ingreso: 2100000, otrasCuotas: 0 });
  assert.strictEqual(m.gastosComunes, 72000);                       // 48 m² × $1.500
  assert.strictEqual(m.dividendo + m.seguros, 450000);               // el dividendo ya trae los seguros
  assert.strictEqual(m.total, 450000 + m.gastosComunes + m.arreglos);
  assert.strictEqual(m.vsArriendo, m.total - 400000);
  assert.strictEqual(m.teQueda, 2100000 - m.total);
  assert.strictEqual(m.unaVez, m.alFirmar + m.mudanza);
  assert.ok(m.arreglos > 0 && m.arreglos < 50000);
});

test('S26: sin arriendo ni ingreso no se compara', () => {
  const m = c.mesDueno({ dividendo: 400000, m2: 40, precioUF: 2000, arriendo: null });
  assert.strictEqual(m.vsArriendo, null);
  assert.strictEqual(m.teQueda, null);
});

test('S26: todas las comunas de los proyectos tienen su barrio', () => {
  d.PROYECTOS.forEach((p) => assert.ok(d.BARRIOS[p.comuna], p.comuna));
});

test('Tu departamento se construye con tu pie: 37 partes, cada cuota se nota', () => {
  assert.strictEqual(c.PIEZAS_OBRA.length, 37);
  assert.strictEqual(c.avanceObra(3000000, 10000000, false).etapa, 'terreno'); // sin cuenta de vivienda
  assert.strictEqual(c.avanceObra(0, 10000000, true).listas, 0);
  const a = c.avanceObra(100000, 10000000, true);
  assert.strictEqual(a.etapa, 'cimientos');
  assert.ok(a.parcial > 0); // un aporte chico ya hace crecer la parte en obra
  // Pie de $12,3 millones y $400 mil al mes: cada cuota termina al menos una parte.
  for (let k = 1; k < 31; k++) {
    const antes = c.avanceObra(400000 * (k - 1), 12300000, true).listas;
    const ahora = c.avanceObra(400000 * k, 12300000, true).listas;
    assert.ok(ahora > antes || ahora === 37, `cuota ${k}`);
  }
  assert.strictEqual(c.avanceObra(10000000, 10000000, true).etapa, 'listo');
  assert.strictEqual(c.avanceObra(10000000 / 37 * 1.5, 10000000, true).etapa, 'estructura');
});
