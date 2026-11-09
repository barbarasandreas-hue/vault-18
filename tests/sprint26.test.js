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

test('Tu departamento se construye con tu pie: terreno, cada 20 % una parte y pie listo', () => {
  assert.strictEqual(c.etapaPie(0, 10000000, true), 0);
  assert.strictEqual(c.etapaPie(3000000, 10000000, false), 0); // sin cuenta de vivienda: terreno
  assert.strictEqual(c.etapaPie(100000, 10000000, true), 1);
  assert.strictEqual(c.etapaPie(2800000, 10000000, true), 2);
  assert.strictEqual(c.etapaPie(5000000, 10000000, true), 3);
  assert.strictEqual(c.etapaPie(9990000, 10000000, true), 5);
  assert.strictEqual(c.etapaPie(10000000, 10000000, true), 6);
  assert.strictEqual(c.ETAPAS_PIE[6], 'Pie listo');
});
