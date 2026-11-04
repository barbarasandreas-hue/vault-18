const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

// Números de referencia v3 (SPEC.md, sección 0). UF $41.065, tasa con subsidio 3,9 %,
// 30 años, seguros UF 0,7. Se acepta ±$1 por redondeo.
const referencia = [
  { nombre: 'Vivir individual (FOGAES 90 %)', lista: 2500, tipo: 'individual', modo: 'vivir', precioUF: 2500, pie: 10266250, dividendo: 464549, sinSubsidio: 496904 },
  { nombre: 'Vivir en grupo', lista: 2500, tipo: 'lote', modo: 'vivir', precioUF: 2375, pie: 9752938, dividendo: 442759, sinSubsidio: 473496 },
  { nombre: 'Invertir individual (80 %) + pie compartido', lista: 2500, tipo: 'individual', modo: 'arrendar', precioUF: 2500, pie: 5133125, dividendo: 416127, sinSubsidio: 444886, participacion: 15399375 },
  { nombre: 'Invertir en grupo + pie compartido', lista: 2500, tipo: 'lote', modo: 'arrendar', precioUF: 2375, pie: 4876469, dividendo: 396758, sinSubsidio: 424079, participacion: 14629406 }
];

function cerca(real, esperado, campo) {
  assert.ok(Math.abs(real - esperado) <= 1, `${campo}: ${real} debería ser ${esperado} (±1)`);
}

for (const r of referencia) {
  test(`escenario ${r.nombre}`, () => {
    const e = c.escenario(r.lista, r.tipo, r.modo, 10);
    assert.strictEqual(e.precioUF, r.precioUF);
    cerca(e.pie, r.pie, 'pie del usuario');
    cerca(e.dividendo, r.dividendo, 'dividendo + seguros');
    cerca(e.dividendoSinSubsidio, r.sinSubsidio, 'dividendo sin subsidio');
    assert.strictEqual(e.totalMes, e.dividendo, 'el usuario paga solo el dividendo');
    cerca(e.reparto.inversionistas, r.participacion || 0, 'participación de inversionistas');
  });
}

for (const r of referencia) {
  test(`las cifras de ${r.nombre} cuadran a la vista`, () => {
    const e = c.escenario(r.lista, r.tipo, r.modo, 10);
    assert.strictEqual(e.reparto.bci + e.reparto.inversionistas + e.reparto.usuario, e.precio);
    assert.strictEqual(e.pie + e.gastos, e.alEscriturar);
  });
}

test('no queda ningún préstamo de inversionistas a UF + 8 %', () => {
  assert.strictEqual(c.cuotaInversionistasUF, undefined);
  assert.strictEqual(c.cuotaInversionUF, undefined);
  assert.strictEqual(c.SUPUESTOS.tasaInversionistas, undefined);
  assert.ok(c.SUPUESTOS.rentaParticipacion <= 0.0603, 'la renta queda bajo la tasa máxima convencional');
});

test('crédito según el modo: vivir 90 / 0 / 10, arrendar 80 / 15 / 5', () => {
  const v = c.repartoUF(2000, 'vivir');
  assert.deepStrictEqual([v.bci, v.inversionistas, v.usuario], [1800, 0, 200]);
  const a = c.repartoUF(2000, 'arrendar');
  assert.deepStrictEqual([a.bci, a.inversionistas, a.usuario], [1600, 300, 100]);
});

test('descuento de grupo: 3 % desde 5 unidades y 5 % desde 10', () => {
  assert.strictEqual(c.descuentoGrupo(4), 0);
  assert.strictEqual(c.descuentoGrupo(5), 0.03);
  assert.strictEqual(c.descuentoGrupo(9), 0.03);
  assert.strictEqual(c.descuentoGrupo(10), 0.05);
  assert.strictEqual(c.precioUF(2500, 'lote', 10), 2375);
  assert.strictEqual(c.precioUF(2500, 'lote', 8), 2425);
  assert.strictEqual(c.precioUF(2500, 'individual'), 2500);
});

test('al escriturar = pie del modo + gastos 2 %', () => {
  assert.strictEqual(c.pieUF(2000, 'arrendar'), 100);
  assert.strictEqual(c.pieUF(2000, 'vivir'), 200);
  assert.strictEqual(c.gastosUF(2000), 40);
  assert.strictEqual(c.alEscriturarUF(2000, 'arrendar'), 140);
});

test('conversión UF a pesos', () => {
  assert.strictEqual(c.ufAPesos(1), 41065);
  assert.strictEqual(c.ufAPesos(118.75), 4876469);
});

test('formato de pesos con punto de miles', () => {
  assert.strictEqual(c.formatoPesos(6467738), '$6.467.738');
  assert.strictEqual(c.formatoPesos(396758), '$396.758');
  assert.strictEqual(c.formatoPesos(999), '$999');
  assert.strictEqual(c.formatoPesos(1000.4), '$1.000');
});

// ---------- Marketplace (S2-F2) ----------
const datos = require('../js/datos.js');

test('arriendo neto: $600.000 → $495.000', () => {
  assert.strictEqual(Math.round(c.arriendoNeto(600000)), 495000);
});

test('rentabilidad neta de UF 2.375: $400.000 pasa el filtro de 3,9 %, $370.000 no', () => {
  const alta = c.rentabilidad(400000, 2375);
  const baja = c.rentabilidad(370000, 2375);
  assert.strictEqual(c.formatoPorcentaje(alta, 1), '4,1\u00a0%');
  assert.strictEqual(c.pasaFiltroIA(alta), true);
  assert.strictEqual(c.formatoPorcentaje(baja, 1), '3,8\u00a0%');
  assert.strictEqual(c.pasaFiltroIA(baja), false);
});

test('ahorro por unirse a un lote de UF 2.500: 10 unidades → $5.133.125; 8 → $3.079.875', () => {
  assert.strictEqual(c.ufAPesos(c.ahorroPorUnirseUF(2500, 10)), 5133125);
  assert.strictEqual(c.ufAPesos(c.ahorroPorUnirseUF(2500, 8)), 3079875);
});

test('avance: 6 de 10 → 60 %', () => {
  assert.strictEqual(c.avance(6, 10), 0.6);
  assert.strictEqual(c.formatoPorcentaje(c.avance(6, 10), 0), '60\u00a0%');
  assert.strictEqual(c.avance(12, 10), 1);
  assert.strictEqual(c.avance(3, 0), 0);
  assert.strictEqual(c.porcentajeEntero(0.6), 60);
  assert.strictEqual(c.porcentajeEntero(0.355), 36);
});

test('participación por financiar: 15 % de UF 2.375 = UF 356,25 = $14.629.406', () => {
  assert.strictEqual(c.porFinanciarUF(2375), 356.25);
  assert.strictEqual(c.ufAPesos(c.porFinanciarUF(2375)), 14629406);
});

test('formato de fecha', () => {
  assert.strictEqual(c.formatoFecha('2026-12-15'), '15 de diciembre de 2026');
  assert.strictEqual(c.formatoFecha('2027-01-05'), '5 de enero de 2027');
});

test('resumen de un proyecto en compra en grupo', () => {
  const p = datos.buscarProyecto('mirador-independencia');
  const r = c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 0, 'arrendar');
  assert.strictEqual(r.tipoCompra, 'lote');
  assert.strictEqual(r.escenario.precioUF, 2375);
  assert.strictEqual(r.descuento, 0.05);
  assert.strictEqual(r.ahorro, 5133125);
  assert.strictEqual(r.avanceCupos, 0.6);
  assert.strictEqual(r.cuposLibres, 4);
  assert.strictEqual(r.pasaFiltro, true);
  const conCompra = c.resumenProyecto(p, datos.departamentosDe(p.id), 1, 0, 'arrendar');
  assert.strictEqual(conCompra.cuposTomados, 7);
  assert.strictEqual(conCompra.cuposLibres, 3);
  // El modo cambia el crédito, no el precio.
  const vivir = c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 0, 'vivir');
  assert.strictEqual(vivir.escenario.precioUF, 2375);
  assert.strictEqual(vivir.escenario.pctCredito, 0.9);
});

test('resumen de un proyecto de pie compartido', () => {
  const p = datos.buscarProyecto('jardin-independencia');
  const r = c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 0, 'arrendar');
  assert.strictEqual(r.tipoCompra, 'individual');
  assert.strictEqual(r.escenario.precioUF, 2450);
  assert.strictEqual(r.porFinanciarUF, 367.5);
  assert.strictEqual(r.avanceFinanciamiento, 0.6);
  assert.strictEqual(r.ahorro, 0);
});

test('datos de ejemplo v3 (S8-F5)', () => {
  const conjunto = datos.PROYECTOS.filter((p) => p.tipo === 'conjunto');
  const financiamiento = datos.PROYECTOS.filter((p) => p.tipo === 'financiamiento');
  assert.ok(conjunto.length >= 2 && financiamiento.length >= 2);
  assert.ok(datos.DEPARTAMENTOS.length >= 10);
  const comunas = ['Independencia', 'Quinta Normal', 'Recoleta', 'Estación Central'];
  for (const p of datos.PROYECTOS) assert.ok(comunas.includes(p.comuna), `${p.id} en ${p.comuna}`);
  const bajos = datos.DEPARTAMENTOS.filter((d) => {
    const p = datos.buscarProyecto(d.proyectoId);
    const tipo = p.tipo === 'conjunto' ? 'lote' : 'individual';
    const precio = c.precioUF(d.listaUF, tipo, p.cupos);
    assert.ok(d.arriendoEstimadoIA > 0, `${d.id} sin arriendoEstimadoIA`);
    assert.strictEqual(d.origenArriendo, 'estimación IA (demo)');
    const bruta = d.arriendoEstimadoIA * 12 / (precio * c.SUPUESTOS.uf);
    assert.ok(bruta >= 0.04 && bruta <= 0.05, `${d.id}: rentabilidad bruta ${bruta}`);
    return !c.pasaFiltroIA(c.rentabilidad(d.arriendoEstimadoIA, precio));
  });
  assert.ok(bajos.length >= 2, `solo ${bajos.length} departamentos bajo 3,9 % neto`);
  assert.ok(datos.DEPARTAMENTOS.some((d) => d.dormitorios === 0 && Math.abs(d.listaUF - 1200) <= 100), 'falta un estudio de ≈ UF 1.200');
  assert.ok(datos.DEPARTAMENTOS.some((d) => d.dormitorios === 1 && Math.abs(d.listaUF - 1750) <= 100), 'falta un 1 dormitorio de ≈ UF 1.750');
  for (const p of datos.PROYECTOS) {
    assert.ok(datos.departamentosDe(p.id).length > 0, `${p.id} sin departamentos`);
    for (const k of ['tipo', 'cupos', 'cuposTomados', 'ufFinanciadas', 'cierre']) assert.ok(k in p, `${p.id} sin ${k}`);
  }
});

test('en modo arrendar la IA deja proyectos en las dos pestañas', () => {
  for (const tipo of ['conjunto', 'financiamiento']) {
    const visibles = datos.PROYECTOS.filter((p) => p.tipo === tipo)
      .filter((p) => c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 0, 'arrendar').pasaFiltro);
    assert.ok(visibles.length >= 1, `ninguno en ${tipo}`);
    assert.ok(visibles.length < datos.PROYECTOS.filter((p) => p.tipo === tipo).length, `el filtro no saca ninguno en ${tipo}`);
  }
});

// ---------- Postula: carga (S3-F1) ----------

test('carga: invertir en grupo con $1.500.000 + $1.000.000 → 15,9 %, holgado', () => {
  const total = c.escenario(2500, 'lote', 'arrendar', 10).totalMes;
  const k = c.carga(total, 1500000, 1000000);
  assert.strictEqual(c.formatoPorcentaje(k, 1), '15,9\u00a0%');
  assert.strictEqual(c.nivelCarga(k), 'holgado');
});

test('carga v3: dividendo de 28,3 % no aprueba (máximo 25 %)', () => {
  const total = c.escenario(2500, 'lote', 'arrendar', 10).totalMes;
  const k = c.carga(total, 900000, 500000);
  assert.strictEqual(c.formatoPorcentaje(k, 1), '28,3\u00a0%');
  assert.strictEqual(c.nivelCarga(k), 'no-aprueba');
});

test('carga v3: vivir individual con $1.000.000 + $500.000 → 31,0 %, no aprueba', () => {
  const total = c.escenario(2500, 'individual', 'vivir').totalMes;
  const k = c.carga(total, 1000000, 500000);
  assert.strictEqual(c.formatoPorcentaje(k, 1), '31,0\u00a0%');
  assert.strictEqual(c.nivelCarga(k), 'no-aprueba');
});

test('carga v3: con otras cuotas, hasta 30 % es en el límite y sobre 30 % no aprueba', () => {
  // ingreso $1.000.000: dividendo 20 %
  assert.strictEqual(c.evaluarCarga(200000, 0, 600000, 400000).nivel, 'holgado');
  assert.strictEqual(c.evaluarCarga(200000, 50000, 600000, 400000).nivel, 'holgado');   // 25,0 %
  assert.strictEqual(c.evaluarCarga(200000, 51000, 600000, 400000).nivel, 'limite');    // 25,1 %
  assert.strictEqual(c.evaluarCarga(200000, 100000, 600000, 400000).nivel, 'limite');   // 30,0 %
  assert.strictEqual(c.evaluarCarga(200000, 101000, 600000, 400000).nivel, 'no-aprueba'); // 30,1 %
  // dividendo sobre 25 % no aprueba aunque no tenga cuotas
  assert.strictEqual(c.evaluarCarga(251000, 0, 600000, 400000).nivel, 'no-aprueba');
  const ev = c.evaluarCarga(396758, 500000, 1500000, 1000000);
  assert.strictEqual(c.formatoPorcentaje(ev.cargaDividendo, 1), '15,9\u00a0%');
  assert.strictEqual(c.formatoPorcentaje(ev.cargaTotal, 1), '35,9\u00a0%');
  assert.strictEqual(ev.nivel, 'no-aprueba');
  assert.strictEqual(c.evaluarCarga(400000, 0, null, null), null);
});

test('carga v3: el semáforo usa la carga redondeada que muestra la pantalla', () => {
  // 25,03 % se ve "25,0 %": holgado. 25,05 % se ve "25,1 %": no aprueba (dividendo).
  assert.strictEqual(c.nivelCarga(c.carga(250300, 600000, 400000)), 'holgado');
  assert.strictEqual(c.nivelCarga(c.carga(250499, 600000, 400000)), 'holgado');
  assert.strictEqual(c.nivelCarga(c.carga(250500, 600000, 400000)), 'no-aprueba');
  // con cuotas: 30,0499 % se ve "30,0 %" (límite); 30,05 % se ve "30,1 %" (no aprueba)
  assert.strictEqual(c.evaluarCarga(200000, 100499, 600000, 400000).nivel, 'limite');
  assert.strictEqual(c.evaluarCarga(200000, 100500, 600000, 400000).nivel, 'no-aprueba');
  assert.strictEqual(c.cargaRedondeada(null), null);
});

test('ingreso total, mínimo y faltante (v3)', () => {
  assert.strictEqual(c.ingresoTotal(900000, 800000), 1700000);
  assert.strictEqual(c.ingresoTotal(900000, null), 900000);
  const total = c.escenario(2500, 'lote', 'arrendar', 10).totalMes; // $396.758
  // sin cuotas manda el 25 %: 396.758 / 0,25
  assert.strictEqual(c.ingresoMinimo(total), 1587032);
  assert.strictEqual(c.ingresoFaltante(total, 700000, 500000), 387032);
  assert.strictEqual(c.ingresoFaltante(total, 1500000, 1000000), 0);
  assert.strictEqual(c.evaluarCarga(total, 0, 1587032, null).nivel, 'holgado');
  // con $200.000 de cuotas manda el 30 %: 596.758 / 0,30
  assert.strictEqual(c.ingresoMinimo(total, 200000), 1989194);
  assert.notStrictEqual(c.evaluarCarga(total, 200000, 1989194, null).nivel, 'no-aprueba');
});

test('carga: sin ingreso no calcula', () => {
  assert.strictEqual(c.carga(500000, 0, 0), null);
  assert.strictEqual(c.carga(500000, null, null), null);
  assert.strictEqual(c.nivelCarga(null), null);
});

test('mejor alternativa: la carga más baja con cuotas, solo si mejora', () => {
  const opciones = [{ id: 'a', totalMes: 700000 }, { id: 'b', totalMes: 520000 }, { id: 'c', totalMes: 600000 }];
  const actual = c.carga(752318, 1500000, 1000000);
  const m = c.mejorAlternativa(actual, opciones, 1500000, 1000000);
  assert.strictEqual(m.id, 'b');
  assert.strictEqual(c.formatoPorcentaje(m.carga, 1), '20,8\u00a0%');
  assert.strictEqual(m.nivel, 'holgado');
  assert.strictEqual(c.mejorAlternativa(0.1, opciones, 1500000, 1000000), null);
  // con $200.000 de cuotas, la carga de b es 28,8 %: en el límite
  const conCuotas = c.mejorAlternativa(0.5, opciones, 1500000, 1000000, 200000);
  assert.strictEqual(conCuotas.nivel, 'limite');
});

test('leer y mostrar montos de un campo', () => {
  assert.strictEqual(c.leerMonto('1.500.000'), 1500000);
  assert.strictEqual(c.leerMonto('$ 800.000'), 800000);
  assert.strictEqual(c.leerMonto(''), null);
  assert.strictEqual(c.leerMonto('abc'), null);
  assert.strictEqual(c.leerMonto('0'), 0);
  assert.strictEqual(c.formatoMiles(1500000), '1.500.000');
});

// ---------- Tu 5 %: meses para la meta (S4-F1) ----------

test('meses: invertir en grupo ($6.827.057 al escriturar) ahorrando $500.000 → 14 meses', () => {
  const meta = c.escenario(2500, 'lote', 'arrendar', 10).alEscriturar;
  assert.strictEqual(meta, 6827057);
  assert.strictEqual(c.mesesParaMeta(meta, 500000), 14);
});

test('meses: ahorro cero o vacío → error (null), no infinito', () => {
  assert.strictEqual(c.mesesParaMeta(6467738, 0), null);
  assert.strictEqual(c.mesesParaMeta(6467738, null), null);
  assert.strictEqual(c.mesesParaMeta(6467738, undefined), null);
  assert.strictEqual(c.mesesParaMeta(6467738, -100), null);
});

test('meses: redondea hacia arriba y descuenta lo ahorrado', () => {
  assert.strictEqual(c.mesesParaMeta(1000000, 500000), 2);
  assert.strictEqual(c.mesesParaMeta(1000001, 500000), 3);
  assert.strictEqual(c.mesesRestantes(6467738, 3000000, 500000), 7);
  assert.strictEqual(c.mesesRestantes(6467738, 6467738, 500000), 0);
});

test('ahorro: hitos alcanzados y un mes más sin pasarse de la meta', () => {
  assert.deepStrictEqual(c.hitosAlcanzados(0, 1000), []);
  assert.deepStrictEqual(c.hitosAlcanzados(500, 1000), [0.25, 0.5]);
  assert.deepStrictEqual(c.hitosAlcanzados(1000, 1000), [0.25, 0.5, 0.75, 1]);
  assert.strictEqual(c.sumarMes(6000000, 500000, 6467738), 6467738);
  assert.strictEqual(c.sumarMes(0, 500000, 6467738), 500000);
});

// ---------- Inicio: ¿cuánto puedo comprar? (S5-F0) ----------

for (const [propio, pareja, modo, uf] of [
  [1500000, 1000000, 'arrendar', 3847],
  [1500000, 1000000, 'vivir', 3420],
  [1200000, 800000, 'vivir', 2703],
  [2000000, 1000000, 'arrendar', 4654]
]) {
  test(`capacidad (${modo}): $${propio} + $${pareja} → UF ${uf}`, () => {
    const cap = c.capacidadCompraUF(propio, pareja, modo);
    assert.strictEqual(cap, uf);
    const e = c.escenario(cap, 'individual', modo);
    assert.ok(c.carga(e.totalMes, propio, pareja) <= 0.25, 'la carga debe quedar en 25 % o menos');
    // Una UF más ya pasa del 25 %.
    assert.ok(c.carga(c.escenario(cap + 1, 'individual', modo).totalMes, propio, pareja) > 0.25);
  });
}

test('capacidad en modo vivir no pasa del tope del FOGAES (UF 4.500)', () => {
  assert.strictEqual(c.capacidadCompraUF(3000000, 3000000, 'vivir'), 4500);
});

test('capacidad: sin sueldos devuelve null', () => {
  assert.strictEqual(c.capacidadCompraUF(null, null), null);
  assert.strictEqual(c.capacidadCompraUF(0, 0), null);
});

test('formato UF', () => {
  assert.strictEqual(c.formatoUF(2472), 'UF\u00a02.472');
  assert.strictEqual(c.formatoUF(337.5), 'UF\u00a0337,5');
  // Redondea primero a un decimal: nunca "337,9" para 337,95 ni "1.234,10" para 1.234,999.
  assert.strictEqual(c.formatoUF(337.95), 'UF\u00a0338');
  assert.strictEqual(c.formatoUF(337.94), 'UF\u00a0337,9');
  assert.strictEqual(c.formatoUF(1234.999), 'UF\u00a01.235');
});

// ---------- Mi departamento: el mes (S5-F1) ----------

test('mes en arrendar con pie compartido: arriendo $420.000 → neto $346.500, todo a los inversionistas', () => {
  const m = c.cascadaMes(416127, 375, 420000, 1);
  assert.strictEqual(m.neto, 346500);
  assert.strictEqual(m.administracion + m.vacancia + m.neto, 420000);
  assert.strictEqual(m.renta, 76997);       // 6 % anual de UF 375, un mes
  assert.strictEqual(m.recompra, 269503);
  assert.strictEqual(m.aInversionistas, 346500);
  assert.strictEqual(m.aUsuario, 0);
  assert.strictEqual(m.pone, 416127);       // paga el dividendo con su sueldo
});

test('mes en arrendar con 80 % a la recompra: el 20 % ayuda con el dividendo', () => {
  const m = c.cascadaMes(416127, 375, 420000, 0.8);
  assert.strictEqual(m.aUsuario, 69300);
  assert.strictEqual(m.pone, 346827);
  assert.strictEqual(m.recompra, 200203);
});

test('mes en arrendar ya dueño del 100 %: el arriendo cubre parte del dividendo', () => {
  const m = c.cascadaMes(416127, 0, 420000, 1);
  assert.strictEqual(m.aUsuario, 346500);
  assert.strictEqual(m.pone, 69627);
  assert.strictEqual(m.excedente, 0);
  const alto = c.cascadaMes(300000, 0, 420000, 1);
  assert.strictEqual(alto.excedente, 46500);
});

// Recompra (SPEC.md, sección 0): individual UF 375 y grupo UF 356,25.
for (const [nombre, participacion, bruto, fraccion, meses] of [
  ['individual, $420.000, 100 %', 375, 420000, 1, 51],
  ['individual, $420.000, 80 %', 375, 420000, 0.8, 66],
  ['individual, $380.000, 100 %', 375, 380000, 1, 57],
  ['individual, $380.000, 80 %', 375, 380000, 0.8, 74],
  ['grupo, $420.000, 100 %', 356.25, 420000, 1, 48],
  ['grupo, $420.000, 80 %', 356.25, 420000, 0.8, 62],
  ['grupo, $380.000, 100 %', 356.25, 380000, 1, 54],
  ['grupo, $380.000, 80 %', 356.25, 380000, 0.8, 70]
]) {
  test(`recompra ${nombre} → ${meses} meses`, () => {
    const neto = c.arriendoNeto(bruto) / c.SUPUESTOS.uf;
    const m = c.mesesRecompra(participacion, neto, fraccion);
    assert.ok(Math.abs(m - meses) <= 1, `${m} meses, debería ser ${meses} (±1)`);
    assert.ok(m <= c.SUPUESTOS.topeRecompraMeses);
    assert.ok(c.saldoParticipacionUF(participacion, neto, m, fraccion) < 1e-9);
    assert.ok(c.saldoParticipacionUF(participacion, neto, m - 1, fraccion) > 0);
  });
}

test('participación de inversionistas: 15 % del precio', () => {
  assert.strictEqual(c.participacionUF(2500), 375);
  assert.strictEqual(c.porFinanciarUF(2375), c.participacionUF(2375));
});

test('recompra con tope de 84 meses: con $250.000 de arriendo no alcanza a terminar', () => {
  const neto = c.arriendoNeto(250000) / c.SUPUESTOS.uf;
  const pl = c.plazoRecompra(375, neto, 1);
  assert.ok(pl.meses > 84);
  assert.strictEqual(pl.superaTope, true);
  assert.strictEqual(pl.noAlcanza, false);
  const ok = c.plazoRecompra(375, c.arriendoNeto(420000) / c.SUPUESTOS.uf, 1);
  assert.strictEqual(ok.superaTope, false);
  assert.strictEqual(ok.meses, 51);
  // el tope cuenta los meses que ya pasaron: en el mes 40, quedan 44 de tope
  assert.strictEqual(c.plazoRecompra(375, c.arriendoNeto(420000) / c.SUPUESTOS.uf, 1, 40).superaTope, true);
  assert.strictEqual(c.plazoRecompra(375, 1, 1).noAlcanza, true);
});

test('recompra: si el arriendo no alcanza ni para la renta, no termina (null)', () => {
  assert.strictEqual(c.mesesRecompra(375, 1, 1), null);
  assert.strictEqual(c.mesesRecompra(0, 8, 1), 0);
});

test('saldo de una deuda después de N cuotas (comparado con una tabla de amortización)', () => {
  const monto = 1800, tasa = 0.045, meses = 360;
  const cuota = c.cuotaFija(monto, tasa, meses);
  let saldo = monto;
  for (let n = 1; n <= 12; n++) saldo = saldo * (1 + tasa / 12) - cuota;
  assert.ok(Math.abs(c.saldoDeuda(monto, tasa, meses, 12) - saldo) < 1e-9);
  assert.strictEqual(c.saldoDeuda(monto, tasa, meses, 0), monto);
  assert.ok(c.saldoDeuda(monto, tasa, meses, 360) < 1e-6);
  assert.strictEqual(c.saldoDeuda(monto, tasa, meses, 400), c.saldoDeuda(monto, tasa, meses, 360));
  assert.ok(Math.abs(c.saldoBciUF(2250, 0, 'arrendar') - 1800) < 1e-9);
  assert.ok(Math.abs(c.saldoBciUF(2250, 0, 'vivir') - 2025) < 1e-9);
});

test('días entre fechas', () => {
  assert.strictEqual(c.diasEntre('2026-11-03', '2026-12-15'), 42);
  assert.strictEqual(c.diasEntre('2026-11-03', '2026-11-03'), 0);
  assert.strictEqual(c.diasEntre('2026-12-15', '2026-11-03'), -42);
});

// ---------- Invertir (S6) ----------

test('participación por financiar en Mirador Independencia (UF 2.375 en grupo) → UF 356,25', () => {
  const p = datos.buscarProyecto('mirador-independencia');
  const r = c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 0, 'arrendar');
  assert.strictEqual(r.porFinanciarUF, 356.25);
  assert.strictEqual(r.porFinanciar, 14629406);
  assert.strictEqual(r.faltaUF, 356.25);
});

test('invertir UF 10 en una participación de UF 375 con arriendo de $420.000 → $9.240 el primer mes', () => {
  const neto = c.arriendoNeto(420000) / c.SUPUESTOS.uf;
  assert.strictEqual(c.ufAPesos(c.flujoInversionUF(10, 375, neto, 1, 1)), 9240);
});

test('invertir: mínimo UF 10 y máximo lo que falta por financiar', () => {
  assert.strictEqual(c.validarInversion(null, 100), 'vacio');
  assert.strictEqual(c.validarInversion(9, 100), 'minimo');
  assert.strictEqual(c.validarInversion(10, 100), null);
  assert.strictEqual(c.validarInversion(100, 100), null);
  assert.strictEqual(c.validarInversion(101, 100), 'maximo');
  // Si falta menos que UF 10, el mínimo es lo que falta: el proyecto se puede completar.
  assert.strictEqual(c.inversionMinimaUF(5), 5);
  assert.strictEqual(c.inversionMinimaUF(337.5), 10);
  assert.strictEqual(c.validarInversion(5, 5), null);
  assert.strictEqual(c.validarInversion(4, 5), 'minimo');
  assert.strictEqual(c.validarInversion(10, 5), 'maximo');
  // Solo sin nada por financiar el proyecto está completo.
  assert.strictEqual(c.validarInversion(10, 0), 'completo');
  assert.strictEqual(c.validarInversion(null, 0), 'completo');
});

test('invertir: el avance del financiamiento sube con lo invertido', () => {
  const p = datos.buscarProyecto('jardin-independencia'); // UF 220,5 de 367,5 → 60 %
  const antes = c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 0, 'arrendar');
  const despues = c.resumenProyecto(p, datos.departamentosDe(p.id), 0, 73.5, 'arrendar');
  assert.strictEqual(antes.avanceFinanciamiento, 0.6);
  assert.strictEqual(despues.avanceFinanciamiento, 0.8);
  assert.strictEqual(despues.faltaUF, 73.5);
  assert.strictEqual(c.faltaFinanciarUF(100, 150), 0);
});

test('mis inversiones: cobrado a la fecha y lo del próximo mes', () => {
  const neto = c.arriendoNeto(420000) / c.SUPUESTOS.uf;
  const una = { montoUF: 10, participacionUF: 375, netoUF: neto, cuotasCobradas: 3 };
  const tres = [1, 2, 3].reduce((s, m) => s + c.flujoInversionUF(10, 375, neto, m, 1), 0);
  assert.ok(Math.abs(c.cobradoUF([una]) - tres) < 1e-12);
  assert.ok(Math.abs(c.cuotaMensualTotalUF([una]) - c.flujoInversionUF(10, 375, neto, 4, 1)) < 1e-12);
  // Al terminar la recompra recuperó su dinero más 6 % anual: ya no cobra más.
  const fin = { montoUF: 10, participacionUF: 375, netoUF: neto, cuotasCobradas: 200 };
  assert.ok(c.cobradoUF([fin]) > 10 && c.cobradoUF([fin]) < 12);
  assert.strictEqual(c.cuotaMensualTotalUF([fin]), 0);
  assert.strictEqual(c.cobradoUF([]), 0);
});

test('campo de UF: acepta un decimal con coma y punto de miles', () => {
  assert.strictEqual(c.limpiarCampoUF('12,5'), '12,5');
  assert.strictEqual(c.limpiarCampoUF('12,56'), '12,5');
  assert.strictEqual(c.limpiarCampoUF('1234'), '1.234');
  assert.strictEqual(c.limpiarCampoUF('1.234,5'), '1.234,5');
  assert.strictEqual(c.limpiarCampoUF('12,'), '12,');
  assert.strictEqual(c.limpiarCampoUF(''), '');
  assert.strictEqual(c.leerMontoUF('12,5'), 12.5);
  assert.strictEqual(c.leerMontoUF('337,5'), 337.5);
  assert.strictEqual(c.leerMontoUF('1.234'), 1234);
  assert.strictEqual(c.leerMontoUF(''), null);
  assert.strictEqual(c.validarInversion(c.leerMontoUF('337,5'), 337.5), null);
});

// ---------- Preaprobación simulada (S8-F1) ----------

for (const [nombre, propio, pareja, otras, tasa, uf] of [
  ['sin otras cuotas', 1500000, 1000000, 0, undefined, 3078],
  ['con $200.000 de otras cuotas', 1500000, 1000000, 200000, undefined, 2691],
  ['con $500.000 de otras cuotas', 1500000, 1000000, 500000, undefined, 1142],
  ['sin subsidio, sin otras cuotas', 1500000, 1000000, 0, 0.045, 2865],
  ['sin subsidio, con $200.000', 1500000, 1000000, 200000, 0.045, 2505],
  ['sin subsidio, con $500.000', 1500000, 1000000, 500000, 0.045, 1063]
]) {
  test(`preaprobación ${nombre} → UF ${uf}`, () => {
    const r = c.preaprobacion(propio, pareja, otras, tasa);
    assert.strictEqual(r.cumple, true);
    assert.strictEqual(r.creditoUF, uf);
    assert.ok(r.dividendo <= r.dividendoMax, 'el dividendo no pasa del máximo');
  });
}

test('preaprobación: dividendo máximo $624.925 con subsidio y $1,5 M + $1 M', () => {
  assert.strictEqual(c.preaprobacion(1500000, 1000000, 0).dividendo, 624925);
});

test('preaprobación: requisito de renta (UF 23 titular, o UF 39 familiar y UF 16 la pareja)', () => {
  const sola = c.preaprobacion(800000, 0, 0);
  assert.strictEqual(sola.cumple, false);
  assert.strictEqual(sola.motivo, 'renta');
  assert.strictEqual(c.preaprobacion(800000, 900000, 0).cumple, true);
  assert.strictEqual(c.preaprobacion(800000, 600000, 0).cumple, false);
});

test('preaprobación: si las otras cuotas no dejan espacio, no cumple por carga', () => {
  const r = c.preaprobacion(1500000, 1000000, 760000);
  assert.strictEqual(r.cumple, false);
  assert.strictEqual(r.motivo, 'carga');
  assert.strictEqual(r.creditoUF, 0);
});

test('preaprobación: sin sueldos devuelve null', () => {
  assert.strictEqual(c.preaprobacion(null, null, 0), null);
  assert.strictEqual(c.preaprobacion(0, 0, 0), null);
});
