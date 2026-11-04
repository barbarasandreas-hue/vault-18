// Pruebas del Sprint 9: Tu mes real, reglas de recomendación, Todavía no, fichas y Comprar más barato.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const base = {
  modo: 'arrendar', sueldoPropio: 1500000, sueldoPareja: 1000000, arriendoActual: 450000,
  otrasCuotas: 0, ahorroActual: 3000000, ahorroMensual: 400000, hayGrupo: true
};

test('Tu mes real: ingreso − arriendo − otras cuotas − dividendo', () => {
  const m = c.mesReal(base, 396758);
  assert.strictEqual(m.queda, 2500000 - 450000 - 396758);
  assert.ok(Math.abs(m.pctQueda - 0.6613) < 0.0001);
  assert.strictEqual(m.alcanzaParaVivir, true);
});

test('Tu mes real: en modo vivir deja de pagar arriendo', () => {
  const m = c.mesReal({ ...base, modo: 'vivir', otrasCuotas: 100000 }, 442759);
  assert.strictEqual(m.arriendo, 0);
  assert.strictEqual(m.queda, 2500000 - 100000 - 442759);
});

test('Tu mes real: sin sueldos devuelve null', () => {
  assert.strictEqual(c.mesReal({ ...base, sueldoPropio: null, sueldoPareja: null }, 400000), null);
});

test('Tu mes real: menos de 40 % para vivir no alcanza', () => {
  // 1.000.000 − 400.000 de arriendo − 250.000 de dividendo = 350.000 (35 %)
  const m = c.mesReal({ ...base, sueldoPropio: 1000000, sueldoPareja: null, arriendoActual: 400000 }, 250000);
  assert.strictEqual(m.alcanzaParaVivir, false);
  // justo 40 % sí alcanza
  const j = c.mesReal({ ...base, sueldoPropio: 1000000, sueldoPareja: null, arriendoActual: 350000 }, 250000);
  assert.strictEqual(j.alcanzaParaVivir, true);
});

test('Caminos: los números de SPEC.md, sección 0', () => {
  assert.strictEqual(c.numerosCamino('individual-vivir', 2500).dividendo, 464549);
  assert.strictEqual(c.numerosCamino('grupo-vivir', 2500).dividendo, 442759);
  assert.strictEqual(c.numerosCamino('pie-compartido', 2500).dividendo, 416127);
  const ab = c.numerosCamino('grupo-pie-compartido', 2500);
  assert.strictEqual(ab.dividendo, 396758);
  assert.strictEqual(ab.dividendoSinSubsidio, 424079);
  assert.strictEqual(ab.pie, 4876469);
  assert.strictEqual(ab.inversionistas, 14629406);
  assert.strictEqual(c.numerosCamino('pie-compartido', 2500).mesesRecompra, 51);
  assert.strictEqual(c.numerosCamino('pie-compartido', 2500).mesesRecompraPeor, 57);
  assert.strictEqual(ab.mesesRecompra, 48);
  assert.strictEqual(ab.mesesRecompraPeor, 54);
  // A para invertir: el usuario pone el 20 % del precio con descuento
  assert.strictEqual(c.numerosCamino('grupo-invertir', 2500).pie, c.ufAPesos(2375 * 0.2));
  // Peor caso del grupo: si no se completa, a precio de lista
  assert.strictEqual(c.numerosCamino('grupo-vivir', 2500).dividendoSinGrupo, 464549);
});

test('Caminos: meses para juntar lo que falta', () => {
  const n = c.numerosCamino('grupo-pie-compartido', 2500, base);
  assert.strictEqual(n.faltaJuntar, 6827057 - 3000000);
  assert.strictEqual(n.meses, 10);
  assert.strictEqual(c.numerosCamino('grupo-pie-compartido', 2500, { ...base, ahorroActual: 9000000 }).meses, 0);
  assert.strictEqual(c.numerosCamino('grupo-pie-compartido', 2500, { ...base, ahorroMensual: null }).meses, null);
});

test('Regla 2: para vivir, grupo si hay; si no, crédito con FOGAES', () => {
  assert.strictEqual(c.recomendarCamino({ ...base, modo: 'vivir' }).id, 'grupo-vivir');
  const r = c.recomendarCamino({ ...base, modo: 'vivir', hayGrupo: false });
  assert.strictEqual(r.id, 'individual-vivir');
  assert.strictEqual(r.regla, 2);
  assert.ok(r.otros.includes('arriendo-opcion') && r.otros.includes('respaldo-familiar'));
});

test('Regla 3: invierte con ahorro menor al 20 %: A + B si hay grupo; si no, B', () => {
  const r = c.recomendarCamino(base);
  assert.strictEqual(r.id, 'grupo-pie-compartido');
  assert.strictEqual(r.regla, 3);
  assert.strictEqual(c.recomendarCamino({ ...base, hayGrupo: false }).id, 'pie-compartido');
});

test('Regla 4: invierte con 20 % o más ahorrado: A (o crédito al 80 %)', () => {
  const veinte = Math.ceil(2500 * 41065 * 0.2); // $20.532.500
  const r = c.recomendarCamino({ ...base, ahorroActual: veinte });
  assert.strictEqual(r.id, 'grupo-invertir');
  assert.strictEqual(r.regla, 4);
  assert.strictEqual(c.recomendarCamino({ ...base, ahorroActual: veinte, hayGrupo: false }).id, 'individual-invertir');
  assert.strictEqual(c.recomendarCamino({ ...base, ahorroActual: veinte - 1000 }).regla, 3);
});

test('Regla 1: si no cumple la carga o Tu mes real, Todavía no', () => {
  // Carga: 442.759 / 1.200.000 = 36,9 % > 25 %
  const r = c.recomendarCamino({ ...base, modo: 'vivir', sueldoPropio: 1200000, sueldoPareja: null });
  assert.strictEqual(r.todaviaNo, true);
  assert.strictEqual(r.regla, 1);
  assert.strictEqual(r.numeros.evaluacion.cumpleCarga, false);
  // Carga bien (15,9 %) pero arriendo alto: queda 38 % para vivir
  const m = c.recomendarCamino({ ...base, arriendoActual: 1150000 });
  assert.strictEqual(m.numeros.evaluacion.cumpleCarga, true);
  assert.strictEqual(m.todaviaNo, true);
  // Otras cuotas: 396.758 + 400.000 = 31,9 % > 30 %
  assert.strictEqual(c.recomendarCamino({ ...base, otrasCuotas: 400000, arriendoActual: 0 }).todaviaNo, true);
  assert.strictEqual(c.recomendarCamino(base).todaviaNo, false);
});

test('Recomendar sin sueldos devuelve null', () => {
  assert.strictEqual(c.recomendarCamino({ ...base, sueldoPropio: null, sueldoPareja: null }), null);
});

test('Todavía no: hasta 3 cambios calculados', () => {
  const p = { ...base, modo: 'vivir', sueldoPropio: 1200000, sueldoPareja: null, otrasCuotas: 200000, ahorroActual: 0, ahorroMensual: 200000 };
  const cambios = c.cambiosTodaviaNo(p, 'grupo-vivir');
  assert.deepStrictEqual(cambios.map((x) => x.tipo), ['cuotas', 'estudio', 'renta']);
  assert.ok(Math.abs(cambios[0].cargaTotal - 0.369) < 1e-9);
  assert.strictEqual(cambios[1].dividendo, c.numerosCamino('grupo-vivir', 1200).dividendo);
  assert.strictEqual(cambios[1].meses, Math.ceil(cambios[1].alEscriturar / 200000));
  // Renta necesaria: el mayor entre dividendo / 25 %, (dividendo + cuotas) / 30 % y lo que deja 40 % para vivir
  assert.strictEqual(cambios[2].ingreso, Math.ceil(Math.max(442759 / 0.25, 642759 / 0.30, 642759 / 0.60) / 1000) * 1000);
  // Con esa renta, el camino ya es sostenible
  const conRenta = { ...p, sueldoPropio: cambios[2].ingreso };
  assert.strictEqual(c.recomendarCamino({ ...conRenta, hayGrupo: true }).todaviaNo, false);
  // Sin otras cuotas no se sugiere terminarlas
  assert.deepStrictEqual(c.cambiosTodaviaNo({ ...p, otrasCuotas: 0 }, 'grupo-vivir').map((x) => x.tipo), ['estudio', 'renta']);
});

test('Recordarme: entre 3 y 24 meses; sin ahorro mensual, 6', () => {
  const p = { ...base, modo: 'vivir', sueldoPropio: 1200000, sueldoPareja: null, ahorroActual: 0 };
  assert.strictEqual(c.mesesRecordar({ ...p, ahorroMensual: null }, 'grupo-vivir'), 6);
  assert.strictEqual(c.mesesRecordar({ ...p, ahorroMensual: 100000 }, 'grupo-vivir'), 24);
  assert.strictEqual(c.mesesRecordar({ ...p, ahorroMensual: 5000000 }, 'grupo-vivir'), 3);
});

test('Ficha arriendo con opción de compra: pie de 10 % en 30 meses', () => {
  const a = c.arriendoConOpcion(2500);
  assert.strictEqual(a.mensualidad, a.arriendo + a.alPie);
  assert.ok(Math.abs(a.arriendo - 355000) < 1000);
  assert.ok(Math.abs(a.alPie - 343000) < 1000);
  assert.strictEqual(a.meses, 30);
  assert.strictEqual(a.dividendoDespues, 464549);
});

test('Ficha respaldo familiar: 5 % propio, 10 % del familiar y cuándo se libera', () => {
  const r = c.respaldoFamiliar(2500);
  assert.strictEqual(r.pie, 5133125);
  assert.strictEqual(r.deposito, 10266250);
  const credito = 2500 * 0.95;
  assert.ok(c.saldoDeuda(credito, 0.039, 360, r.mesesLibera, []) <= 2000);
  assert.ok(c.saldoDeuda(credito, 0.039, 360, r.mesesLibera - 1, []) > 2000);
});

test('Comprar más barato: usado e IVA cero bajan el pie', () => {
  const u = c.pieMasBarato(2500, 'individual', 'vivir', 1, 'usado');
  assert.strictEqual(u.pie, c.ufAPesos(2500 * 0.824 * 0.1));
  assert.strictEqual(u.baja, 10266250 - u.pie);
  assert.strictEqual(u.sinSubsidio, true);
  assert.strictEqual(u.dividendo, c.ufAPesos(c.dividendoUF(2500 * 0.824, 'vivir', 0.045)));
  const i = c.pieMasBarato(2500, 'individual', 'vivir', 1, 'iva-cero');
  assert.strictEqual(i.pie, c.ufAPesos(2500 * 0.935 * 0.1));
  assert.strictEqual(i.sinSubsidio, false);
  const sin = c.pieMasBarato(1200, 'individual', 'vivir', 1, null);
  assert.strictEqual(sin.baja, 10266250 - c.ufAPesos(120));
});

test('Registro: el texto para copiar', () => {
  const t = c.textoRegistro({ plazoAntes: 8, plazoDespues: 3, camino: 'pie-compartido', explicacion: 2, confianza: 4,
    meInteresa: ['respaldo-familiar'], recordarme: null }, '2026-11-04');
  assert.match(t, /Plazo que cree necesitar antes: 8 años/);
  assert.match(t, /Camino elegido: B · Pie compartido/);
  assert.match(t, /Me interesa: Respaldo familiar/);
  assert.match(c.textoRegistro({}, null), /Camino elegido: sin elegir/);
});

test('Ninguna regla se presenta como IA', () => {
  for (const id of Object.keys(c.CAMINOS)) assert.doesNotMatch(c.CAMINOS[id].nombre, /IA/);
});
