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

// ---------- Marketplace (S2-F2) ----------
const datos = require('../js/datos.js');

test('arriendo neto: $600.000 → $495.000', () => {
  assert.strictEqual(Math.round(c.arriendoNeto(600000)), 495000);
});

test('rentabilidad de UF 2.250: $420.000 pasa el filtro, $400.000 no', () => {
  const alta = c.rentabilidad(420000, 2250);
  const baja = c.rentabilidad(400000, 2250);
  assert.strictEqual(c.formatoPorcentaje(alta, 1), '4,5 %');
  assert.strictEqual(c.pasaFiltroIA(alta), true);
  assert.strictEqual(c.formatoPorcentaje(baja, 1), '4,3 %');
  assert.strictEqual(c.pasaFiltroIA(baja), false);
});

test('ahorro por unirse a un lote de UF 2.500 → $10.266.250', () => {
  assert.strictEqual(c.ufAPesos(c.ahorroPorUnirseUF(2500)), 10266250);
  assert.strictEqual(c.ufAPesos(c.ahorroPorUnirseUF(3000)), 12319500);
});

test('avance: 6 de 10 → 60 %', () => {
  assert.strictEqual(c.avance(6, 10), 0.6);
  assert.strictEqual(c.formatoPorcentaje(c.avance(6, 10), 0), '60 %');
  assert.strictEqual(c.avance(12, 10), 1);
  assert.strictEqual(c.avance(3, 0), 0);
  assert.strictEqual(c.porcentajeEntero(0.6), 60);
  assert.strictEqual(c.porcentajeEntero(0.355), 36);
});

test('por financiar: 15 % de UF 2.250 = UF 337,5 = $13.859.438', () => {
  assert.strictEqual(c.porFinanciarUF(2250), 337.5);
  assert.strictEqual(c.ufAPesos(c.porFinanciarUF(2250)), 13859438);
});

test('formato de fecha', () => {
  assert.strictEqual(c.formatoFecha('2026-12-15'), '15 de diciembre de 2026');
  assert.strictEqual(c.formatoFecha('2027-01-05'), '5 de enero de 2027');
});

test('resumen de un proyecto en compra en conjunto', () => {
  const p = datos.buscarProyecto('alto-nunoa');
  const r = c.resumenProyecto(p, datos.departamentosDe(p.id), 0);
  assert.strictEqual(r.tipoCompra, 'lote');
  assert.strictEqual(r.escenario.precioUF, 2250);
  assert.strictEqual(r.ahorro, 10266250);
  assert.strictEqual(r.avanceCupos, 0.6);
  assert.strictEqual(r.cuposLibres, 4);
  assert.strictEqual(r.pasaFiltro, true);
  const conCompra = c.resumenProyecto(p, datos.departamentosDe(p.id), 1);
  assert.strictEqual(conCompra.cuposTomados, 7);
  assert.strictEqual(conCompra.cuposLibres, 3);
});

test('resumen de un proyecto de financiamiento del pie', () => {
  const p = datos.buscarProyecto('plaza-independencia');
  const r = c.resumenProyecto(p, datos.departamentosDe(p.id), 0);
  assert.strictEqual(r.tipoCompra, 'individual');
  assert.strictEqual(r.escenario.precioUF, 2250);
  assert.strictEqual(r.porFinanciar, 13859438);
  assert.strictEqual(r.avanceFinanciamiento, 0.6);
  assert.strictEqual(r.ahorro, 0);
});

test('datos de ejemplo cumplen S2-F1', () => {
  const conjunto = datos.PROYECTOS.filter((p) => p.tipo === 'conjunto');
  const financiamiento = datos.PROYECTOS.filter((p) => p.tipo === 'financiamiento');
  assert.ok(conjunto.length >= 2 && financiamiento.length >= 2);
  assert.ok(datos.DEPARTAMENTOS.length >= 10);
  const bajos = datos.DEPARTAMENTOS.filter((d) => {
    const p = datos.buscarProyecto(d.proyectoId);
    const tipo = p.tipo === 'conjunto' ? 'lote' : 'individual';
    return !c.pasaFiltroIA(c.rentabilidad(d.arriendoBruto, c.precioUF(d.listaUF, tipo)));
  });
  assert.ok(bajos.length >= 2, `solo ${bajos.length} departamentos bajo 4,5 %`);
  for (const p of datos.PROYECTOS) {
    assert.ok(datos.departamentosDe(p.id).length > 0, `${p.id} sin departamentos`);
    for (const k of ['tipo', 'cupos', 'cuposTomados', 'ufFinanciadas', 'cierre']) assert.ok(k in p, `${p.id} sin ${k}`);
  }
});

test('en modo arrendar la IA deja proyectos en las dos pestañas', () => {
  for (const tipo of ['conjunto', 'financiamiento']) {
    const visibles = datos.PROYECTOS.filter((p) => p.tipo === tipo)
      .filter((p) => c.resumenProyecto(p, datos.departamentosDe(p.id), 0).pasaFiltro);
    assert.ok(visibles.length >= 1, `ninguno en ${tipo}`);
    assert.ok(visibles.length < datos.PROYECTOS.filter((p) => p.tipo === tipo).length, `el filtro no saca ninguno en ${tipo}`);
  }
});

// ---------- Postula: carga (S3-F1) ----------

test('carga: arrendar en lote con $1.500.000 + $1.000.000 → 22,9 %, holgado', () => {
  const total = c.escenario(2500, 'lote').totalMes;
  const k = c.carga(total, 1500000, 1000000);
  assert.strictEqual(c.formatoPorcentaje(k, 1), '22,9 %');
  assert.strictEqual(c.nivelCarga(k), 'holgado');
});

test('carga: arrendar en lote con $1.200.000 + $800.000 → 28,6 %, en el límite', () => {
  const total = c.escenario(2500, 'lote').totalMes;
  const k = c.carga(total, 1200000, 800000);
  assert.strictEqual(c.formatoPorcentaje(k, 1), '28,6 %');
  assert.strictEqual(c.nivelCarga(k), 'limite');
});

test('carga: vivir individual con $1.500.000 + $1.000.000 → 30,1 %, no aprueba', () => {
  const total = c.escenario(3000, 'individual').totalMes;
  const k = c.carga(total, 1500000, 1000000);
  assert.strictEqual(c.formatoPorcentaje(k, 1), '30,1 %');
  assert.strictEqual(c.nivelCarga(k), 'no-aprueba');
});

test('carga: exactamente 25 % es holgado y exactamente 30 % es en el límite', () => {
  assert.strictEqual(c.nivelCarga(c.carga(250000, 600000, 400000)), 'holgado');
  assert.strictEqual(c.nivelCarga(c.carga(300000, 600000, 400000)), 'limite');
  assert.strictEqual(c.nivelCarga(c.carga(301000, 600000, 400000)), 'no-aprueba');
  assert.strictEqual(c.nivelCarga(c.carga(251000, 600000, 400000)), 'limite');
});

test('el semáforo usa la misma carga redondeada que muestra la pantalla', () => {
  const total = c.escenario(2500, 'lote').totalMes; // $571.425
  // 30,04 % se muestra "30,0 %": es "en el límite", no "no aprueba".
  const k30 = c.carga(total, 902214, 1000000);
  assert.ok(k30 > 0.30);
  assert.strictEqual(c.formatoPorcentaje(c.cargaRedondeada(k30), 1), '30,0 %');
  assert.strictEqual(c.nivelCarga(k30), 'limite');
  // 25,03 % se muestra "25,0 %": es "holgado".
  const k25 = c.carga(250300, 600000, 400000);
  assert.strictEqual(c.formatoPorcentaje(c.cargaRedondeada(k25), 1), '25,0 %');
  assert.strictEqual(c.nivelCarga(k25), 'holgado');
  // 30,06 % se muestra "30,1 %": no aprueba.
  const k301 = c.carga(300600, 600000, 400000);
  assert.strictEqual(c.formatoPorcentaje(c.cargaRedondeada(k301), 1), '30,1 %');
  assert.strictEqual(c.nivelCarga(k301), 'no-aprueba');
  assert.strictEqual(c.cargaRedondeada(null), null);
});

test('ingreso total, mínimo y faltante', () => {
  assert.strictEqual(c.ingresoTotal(900000, 800000), 1700000);
  assert.strictEqual(c.ingresoTotal(900000, null), 900000);
  const total = c.escenario(2500, 'lote').totalMes; // Alto Ñuñoa: $571.425
  assert.strictEqual(c.ingresoMinimo(total), 1904750);
  assert.strictEqual(c.ingresoFaltante(total, 900000, 800000), 204750);
  assert.strictEqual(c.ingresoFaltante(total, 1500000, 1000000), 0);
  assert.strictEqual(c.nivelCarga(c.carga(total, 1904750, 0)), 'limite');
});

test('carga: sin ingreso no calcula', () => {
  assert.strictEqual(c.carga(500000, 0, 0), null);
  assert.strictEqual(c.carga(500000, null, null), null);
  assert.strictEqual(c.nivelCarga(null), null);
});

test('mejor alternativa: elige la opción con la carga más baja, solo si mejora', () => {
  const opciones = [{ id: 'a', totalMes: 700000 }, { id: 'b', totalMes: 520000 }, { id: 'c', totalMes: 600000 }];
  const actual = c.carga(752318, 1500000, 1000000);
  const m = c.mejorAlternativa(actual, opciones, 1500000, 1000000);
  assert.strictEqual(m.id, 'b');
  assert.strictEqual(c.formatoPorcentaje(m.carga, 1), '20,8 %');
  assert.strictEqual(m.nivel, 'holgado');
  assert.strictEqual(c.mejorAlternativa(0.1, opciones, 1500000, 1000000), null);
});

test('leer y mostrar montos de un campo', () => {
  assert.strictEqual(c.leerMonto('1.500.000'), 1500000);
  assert.strictEqual(c.leerMonto('$ 800.000'), 800000);
  assert.strictEqual(c.leerMonto(''), null);
  assert.strictEqual(c.leerMonto('abc'), null);
  assert.strictEqual(c.leerMonto('0'), 0);
  assert.strictEqual(c.formatoMiles(1500000), '1.500.000');
});
