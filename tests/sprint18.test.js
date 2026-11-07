// Pruebas del Sprint 18, Bloque 1: descuento real del grupo y un solo reloj.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');
const datos = require('../js/datos.js');

const mirador = datos.buscarProyecto('mirador-independencia'); // 6 de 10 cupos

test('precioUF sin unidades no supone el grupo completo', () => {
  assert.strictEqual(c.precioUF(2500, 'lote'), 2500);
  assert.strictEqual(c.precioUF(2500, 'lote', 10), 2375);
});

test('Descuento de hoy: cupos tomados más el tuyo', () => {
  assert.strictEqual(c.unidadesHoy(mirador, 0, false), 7);
  assert.strictEqual(c.unidadesHoy(mirador, 1, true), 7); // ya estás: no se cuenta dos veces
  assert.strictEqual(c.unidadesHoy(mirador, 9, true), 10); // nunca más que los cupos
  const r = c.resumenProyecto(mirador, datos.departamentosDe(mirador.id), 0, 0, 'vivir', { descuentoHoy: true, yaEstas: false });
  assert.strictEqual(r.descuento, 0.03);
  assert.strictEqual(r.escenario.precioUF, 2425);
  assert.strictEqual(r.ahorro, 3079875);
  assert.strictEqual(r.ahorroCompleto, 5133125); // el 5 % queda como posibilidad
  assert.strictEqual(r.descuentoCompleto, 0.05);
});

test('Si el grupo se completa, el precio baja al 5 %', () => {
  const r = c.resumenProyecto(mirador, datos.departamentosDe(mirador.id), 4, 0, 'vivir', { descuentoHoy: true, yaEstas: true });
  assert.strictEqual(r.descuento, 0.05);
  assert.strictEqual(r.escenario.precioUF, 2375);
});

test('Sin opciones (modo arrendar) se mantiene el cálculo de siempre', () => {
  const r = c.resumenProyecto(mirador, datos.departamentosDe(mirador.id), 0, 0, 'arrendar');
  assert.strictEqual(r.descuento, 0.05);
});

test('Un solo reloj: la fecha de la demo avanza mes a mes', () => {
  assert.strictEqual(c.fechaMasMeses('2026-11-03', 0), '2026-11-03');
  assert.strictEqual(c.fechaMasMeses('2026-11-03', 2), '2027-01-03');
  assert.strictEqual(c.fechaMasMeses('2026-01-31', 1), '2026-02-28');
  // La entrega de Mirador (15-dic-2027) queda a 14 meses de hoy (se cuenta el mes empezado) y a 0 al llegar a ese mes.
  assert.strictEqual(c.mesesEntre('2026-11-03', mirador.entregaEstimada), 14);
  assert.strictEqual(c.mesesEntre(c.fechaMasMeses('2026-11-03', 14), mirador.entregaEstimada), 0);
});

// Bloque 2
test('Datos: al menos 3 departamentos para vivir por rango, con un terminado y uno de hasta UF 2.200 en UF 2.000 a 2.500', () => {
  const vivir = datos.PROYECTOS.filter((p) => p.tipo === 'conjunto' || p.tipo === 'venta');
  for (const r of c.RANGOS_PRECIO) {
    const en = vivir.filter((p) => c.enRango(datos.departamentosDe(p.id)[0].listaUF, r));
    assert.ok(en.length >= 3, `${r.id}: ${en.length}`);
  }
  const r25 = c.RANGOS_PRECIO.find((r) => r.id === '2000-2500');
  const en25 = vivir.filter((p) => c.enRango(datos.departamentosDe(p.id)[0].listaUF, r25));
  assert.ok(en25.some((p) => p.tipo === 'venta'), 'falta un terminado');
  assert.ok(en25.some((p) => datos.departamentosDe(p.id)[0].listaUF <= 2200), 'falta uno de hasta UF 2.200');
  for (const p of datos.PROYECTOS.filter((x) => x.tipo === 'venta')) assert.strictEqual(p.etapaObra, 4);
});

test('Todavía no con piezas: la razón y el subsidio que lo cambia', () => {
  const solo = { modo: 'vivir', sueldoPropio: 1100000, sueldoPareja: 0, otrasCuotas: 0 };
  const pf = { ahorroActual: 0, ahorroMensual: 250000 };
  const sin = c.calcularPiezas(pf, {}, { listaUF: 1500, enObra: false, mesesEntrega: 0 }, '2026-11-03');
  assert.strictEqual(c.razonTodaviaNo(solo, sin.dividendo), 'La cuota pasa tu límite');
  const con = c.calcularPiezas(pf, { subsidio: true }, { listaUF: 1500, enObra: false, mesesEntrega: 0 }, '2026-11-03');
  assert.ok(con.dividendo < sin.dividendo);
  assert.strictEqual(c.razonTodaviaNo(solo, con.dividendo), null);
});

test('Sin IVA y subsidio se suman en un terminado de UF 2.300 (y bajan al tramo 3 del DS1)', () => {
  const pf = { ahorroActual: 3000000, ahorroMensual: 600000 };
  const d = { listaUF: 2300, enObra: false, mesesEntrega: 0 };
  // S20-T2: sin rebaja es tramo 4 (UF 410, sin 12 meses de cuenta); con IVA cero queda en UF 2.070, tramo 3.
  assert.strictEqual(c.bloqueoPieza('subsidio', {}, d), null);
  assert.strictEqual(c.calcularPiezas(pf, { subsidio: true }, d, '2026-11-03').ds1.tramo, 4);
  const r = c.calcularPiezas(pf, { iva: true, subsidio: true }, d, '2026-11-03');
  assert.ok(r.on.iva && r.on.subsidio);
  assert.strictEqual(Math.round(r.precioUF), 2070);
  assert.strictEqual(r.freno, 'cuenta-vivienda');
});

// Sprint 19, Bloque 4: razones para volver
test('Hito siguiente: cuántas cuotas faltan para el próximo hito', () => {
  assert.deepStrictEqual(c.hitoSiguiente(3000000, 12000000, 600000), { hito: 0.5, falta: 3000000, meses: 5 });
  assert.strictEqual(c.hitoSiguiente(100, 12000000, 600000).hito, 0.25);
  assert.strictEqual(c.hitoSiguiente(12000000, 12000000, 600000), null);
  assert.strictEqual(c.hitoSiguiente(0, 1000, 0).meses, null);
  assert.strictEqual(c.hitoSiguiente(2999000, 12000000, 600000).meses, 1); // nunca 0 meses
});

test('Desde tu última visita: cupos nuevos, avance de obra y cambio de fecha', () => {
  const antes = { proyecto: 'a', cupos: 6, etapa: 1, llegada: 15 };
  assert.deepStrictEqual(c.cambiosDesdeVisita(antes, { proyecto: 'a', cupos: 6, etapa: 1, llegada: 15 }), []);
  assert.deepStrictEqual(c.cambiosDesdeVisita(Object.assign({ mes: 2 }, antes), { proyecto: 'a', mes: 3, cupos: 6, etapa: 1, llegada: 15 }), [{ tipo: 'cuotas', n: 1 }]);
  assert.deepStrictEqual(c.cambiosDesdeVisita(antes, { proyecto: 'a', cupos: 8, etapa: 2, llegada: 14 }),
    [{ tipo: 'cupos', n: 2 }, { tipo: 'etapa', etapa: 2 }, { tipo: 'antes', n: 1 }]);
  assert.deepStrictEqual(c.cambiosDesdeVisita(antes, { proyecto: 'a', cupos: 6, etapa: 1, llegada: 17 }), [{ tipo: 'despues', n: 2 }]);
  assert.deepStrictEqual(c.cambiosDesdeVisita(antes, { proyecto: 'b', cupos: 9, etapa: 3, llegada: 1 }), []);
  assert.deepStrictEqual(c.cambiosDesdeVisita(null, antes), []);
});

test('Meta del mes: siempre una acción, y la que más acerca el sí', () => {
  assert.deepStrictEqual(c.metaDelMes({ ahorroMensual: 250000, otrasCuotas: 0, subsidio: 'con-otra', iva: 'con-otra' }),
    [{ tipo: 'ahorrar', monto: 250000 }, { tipo: 'subsidio', con: 'con-otra' }]);
  assert.deepStrictEqual(c.metaDelMes({ ahorroMensual: 0, otrasCuotas: 80000, subsidio: false, iva: false }), [{ tipo: 'cuota' }]);
  assert.deepStrictEqual(c.metaDelMes({ ahorroMensual: 100000, otrasCuotas: 0, subsidio: false, iva: 'sola' })[1], { tipo: 'iva', con: 'sola' });
  assert.strictEqual(c.metaDelMes({ ahorroMensual: 100000, otrasCuotas: 0, subsidio: false, iva: false })[1].tipo, 'rango');
});
