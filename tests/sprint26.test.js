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

test('Arriendo con opción de compra: entras con 5 %, compras al 80 % sin subsidio y desde el mes 24', () => {
  const perfil = { modo: 'vivir', sueldoPropio: 1400000, sueldoPareja: 900000, otrasCuotas: 0, ahorroActual: 1500000, ahorroMensual: 400000 };
  const a = c.arriendoOpcion(2200, 360000, perfil);
  assert.strictEqual(a.aporte, c.ufAPesos(2200 * 11.7 / 3500));
  assert.strictEqual(a.mensualidad, 360000 + a.aporte);
  assert.strictEqual(a.entrada, c.ufAPesos(2200 * 0.05));
  assert.strictEqual(a.meta, c.ufAPesos(2200 * 0.20 + c.gastosUF(2200)));
  // Le faltan $3 millones para el 5 %: los junta con su ahorro de hoy antes de mudarse.
  assert.strictEqual(a.mesesEntrada, Math.ceil((a.entrada - 1500000) / 400000));
  assert.strictEqual(a.mesesPie, Math.ceil((a.meta - a.entrada) / a.aporte));
  assert.strictEqual(a.mesCompra, Math.max(a.mesesPie, 24));
  assert.strictEqual(a.mesesTuyo, a.mesesEntrada + a.mesCompra + 2);
  // Segunda venta: sin subsidio a la tasa.
  assert.strictEqual(a.dividendo, c.ufAPesos(c.cuotaFija(2200 * 0.8, c.SUPUESTOS.tasaSinSubsidio, c.SUPUESTOS.mesesBci) + c.SUPUESTOS.segurosUF));
  assert.ok(a.cumple, a.razon);
  // Con el 5 % ya ahorrado se muda de inmediato; nunca compra antes del mes 24.
  const rico = c.arriendoOpcion(2200, 360000, Object.assign({}, perfil, { ahorroActual: 20000000 }));
  assert.strictEqual(rico.mesesEntrada, 0);
  assert.strictEqual(rico.mesCompra, 24);
  // Sin ahorro mensual ni 5 %, no puede entrar.
  assert.strictEqual(c.arriendoOpcion(2200, 360000, Object.assign({}, perfil, { ahorroActual: 0, ahorroMensual: 0 })).razon, 'Necesitas el 5 % para entrar');
  // Con un sueldo bajo, la mensualidad no deja el 40 % para vivir.
  const bajo = c.arriendoOpcion(2200, 360000, { modo: 'vivir', sueldoPropio: 900000, sueldoPareja: 0, otrasCuotas: 0, ahorroActual: 5000000 });
  assert.strictEqual(bajo.razon, 'Te quedaría poco para vivir');
  // Si te vas: recuperas tu ahorro inicial y el 80 % de tus aportes; si Bci no aprueba, todo.
  assert.strictEqual(c.devolucionArriendo(4500000, 10000000, 'te-vas'), 12500000);
  assert.strictEqual(c.devolucionArriendo(4500000, 10000000, 'credito'), 14500000);
  assert.strictEqual(d.ARRIENDOS_OPCION.length, 4);
});
