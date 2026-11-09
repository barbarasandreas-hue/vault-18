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
  assert.strictEqual(c.numerosCamino('individual-vivir', 2500).dividendo, 441586);
  assert.strictEqual(c.numerosCamino('grupo-vivir', 2500).dividendo, 420944);
  assert.strictEqual(c.numerosCamino('pie-compartido', 2500).dividendo, 395715);
  const ab = c.numerosCamino('grupo-pie-compartido', 2500);
  assert.strictEqual(ab.dividendo, 377366);
  assert.strictEqual(ab.dividendoSinSubsidio, 421765);
  assert.strictEqual(ab.pie, 4876469);
  assert.strictEqual(ab.inversionistas, 14629406);
  assert.strictEqual(c.numerosCamino('pie-compartido', 2500).mesesRecompra, 51);
  assert.strictEqual(c.numerosCamino('pie-compartido', 2500).mesesRecompraPeor, 57);
  assert.strictEqual(ab.mesesRecompra, 48);
  assert.strictEqual(ab.mesesRecompraPeor, 54);
  // A para invertir: el usuario pone el 20 % del precio con descuento
  assert.strictEqual(c.numerosCamino('grupo-invertir', 2500).pie, c.ufAPesos(2375 * 0.2));
  // Peor caso del grupo: si no se completa, a precio de lista
  assert.strictEqual(c.numerosCamino('grupo-vivir', 2500).dividendoSinGrupo, 441586);
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

test('Regla 3: invierte con ahorro menor al 20 %: pie compartido (S26: ya no se junta con el grupo)', () => {
  const r = c.recomendarCamino(base);
  assert.strictEqual(r.id, 'pie-compartido');
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
  // Ni terminar las cuotas ni el estudio alcanzan en este caso; la renta sí, siempre
  assert.deepStrictEqual(cambios.map((x) => x.cumple), [false, false, true]);
  assert.ok(cambios[0].evaluacion.cargaDividendo > 0.25);
  assert.ok(cambios[1].evaluacion.cargaTotal > 0.30);
  assert.ok(Math.abs(cambios[0].cargaTotal - 0.351) < 1e-9);
  assert.strictEqual(cambios[1].dividendo, c.numerosCamino('grupo-vivir', 1200).dividendo);
  assert.strictEqual(cambios[1].meses, Math.ceil(cambios[1].alEscriturar / 200000));
  // Renta necesaria: el mayor entre dividendo / 25 %, (dividendo + cuotas) / 30 % y lo que deja 40 % para vivir
  assert.strictEqual(cambios[2].ingreso, Math.ceil(Math.max(420944 / 0.25, 620944 / 0.30, 620944 / 0.60) / 1000) * 1000);
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
  assert.strictEqual(a.dividendoDespues, 441586);
});

test('Ficha respaldo familiar: 5 % propio, 10 % del familiar y cuándo se libera', () => {
  const r = c.respaldoFamiliar(2500);
  assert.strictEqual(r.pie, 5133125);
  assert.strictEqual(r.deposito, 10266250);
  const credito = 2500 * 0.95;
  assert.ok(c.saldoDeuda(credito, c.SUPUESTOS.tasaBci, 360, r.mesesLibera, []) <= 2000);
  assert.ok(c.saldoDeuda(credito, c.SUPUESTOS.tasaBci, 360, r.mesesLibera - 1, []) > 2000);
});

test('Comprar más barato: usado e IVA cero bajan el pie del mismo departamento', () => {
  // 9-nov: el IVA cero es el mismo 10 % en Comprar más barato y en las piezas.
  assert.strictEqual(c.SUPUESTOS_PIEZAS ? c.SUPUESTOS_PIEZAS.bajaIVA : 0.10, 0.10);
  const u = c.pieMasBarato(2500, 'individual', 'vivir', 1, 'usado');
  assert.strictEqual(u.pie, c.ufAPesos(2500 * 0.824 * 0.1));
  assert.strictEqual(u.baja, 10266250 - u.pie);
  assert.strictEqual(u.sinSubsidio, true);
  assert.strictEqual(u.dividendo, c.ufAPesos(c.dividendoUF(2500 * 0.824, 'vivir', c.SUPUESTOS.tasaSinSubsidio)));
  const i = c.pieMasBarato(2500, 'individual', 'vivir', 1, 'iva-cero');
  assert.strictEqual(i.pie, c.ufAPesos(2500 * 0.90 * 0.1));
  assert.strictEqual(i.sinSubsidio, false);
  // Sin ajuste (solo filtro de tamaño) no baja nada frente a sí mismo
  assert.strictEqual(c.pieMasBarato(1200, 'individual', 'vivir', 1, null).baja, 0);
  // Usado en un proyecto en grupo: sin descuento de grupo (Parque Quinta Normal, UF 1.750, lote de 8)
  const pq = c.pieMasBarato(1750, 'lote', 'arrendar', 8, 'usado');
  assert.strictEqual(pq.precio, c.ufAPesos(1750 * 0.824));
  assert.strictEqual(pq.pieSinAjuste, c.ufAPesos(1750 * 0.97 * 0.05));
  // IVA cero en grupo: con descuento de grupo, comparado con el mismo proyecto en grupo
  const ig = c.pieMasBarato(2500, 'lote', 'arrendar', 10, 'iva-cero');
  assert.strictEqual(ig.pie, c.ufAPesos(2500 * 0.90 * 0.95 * 0.05));
  assert.strictEqual(ig.baja, c.ufAPesos(2375 * 0.05) - ig.pie);
});

test('Registro: el texto para copiar', () => {
  const t = c.textoRegistro({ plazoAntes: 8, plazoDespues: 3, camino: 'pie-compartido', explicacion: 2, confianza: 4,
    meInteresa: ['respaldo-familiar'], recordarme: null }, '2026-11-04');
  assert.match(t, /Plazo que cree necesitar antes: 8 años/);
  assert.match(t, /Camino elegido: Pie compartido/);
  assert.match(t, /Me interesa: Respaldo familiar/);
  assert.match(c.textoRegistro({}, null), /Camino elegido: sin elegir/);
});

test('Ninguna regla se presenta como IA', () => {
  for (const id of Object.keys(c.CAMINOS)) assert.doesNotMatch(c.CAMINOS[id].nombre, /IA/);
});

test('Todavía no con interruptores: cada cambio recalcula el camino', () => {
  const p = { ...base, modo: 'vivir', sueldoPropio: 1200000, sueldoPareja: null, otrasCuotas: 200000, ahorroActual: 0, ahorroMensual: 200000, hayGrupo: true };
  const nada = c.simularCambios(p, 'grupo-vivir', {});
  assert.strictEqual(nada.cumple, false);
  assert.strictEqual(nada.numeros.dividendo, 420944);
  // Sin cuotas: la carga baja pero el dividendo sigue sobre 25 %
  const sinCuotas = c.simularCambios(p, 'grupo-vivir', { cuotas: true });
  assert.strictEqual(sinCuotas.perfil.otrasCuotas, 0);
  assert.strictEqual(sinCuotas.cumple, false);
  // Estudio + sin cuotas: 227.472 / 1.200.000 = 19 % y queda más de 40 %
  const estudio = c.simularCambios(p, 'grupo-vivir', { cuotas: true, estudio: true });
  assert.strictEqual(estudio.listaUF, 1200);
  assert.strictEqual(estudio.cumple, true);
  // La renta siempre resuelve, y con el estudio pide menos renta que sin él
  const renta = c.simularCambios(p, 'grupo-vivir', { renta: true });
  assert.strictEqual(renta.cumple, true);
  const rentaEstudio = c.simularCambios(p, 'grupo-vivir', { renta: true, estudio: true });
  assert.ok(rentaEstudio.perfil.sueldoPropio <= Math.max(renta.perfil.sueldoPropio, 1200000));
  // No toca el perfil original
  assert.strictEqual(p.otrasCuotas, 200000);
});

test('Departamento elegido: precio, descuento de su grupo y su arriendo', () => {
  // Parque Quinta Normal: UF 1.750, lote de 8 (3 % de descuento), arriendo $280.000
  const meta = { ...base, listaUF: 1750, cuposGrupo: 8, arriendoMeta: 280000, hayGrupo: true };
  const r = { numeros: c.numerosCamino('grupo-pie-compartido', 1750, meta) };
  assert.strictEqual(r.numeros.precioUF, 1750 * 0.97);
  assert.strictEqual(r.numeros.pie, c.ufAPesos(1750 * 0.97 * 0.05));
  const neto = c.arriendoNeto(280000) / c.SUPUESTOS.uf;
  assert.strictEqual(r.numeros.mesesRecompra, c.mesesRecompra(1750 * 0.97 * 0.15, neto, 1));
  // Un departamento de pie compartido (sin grupo) lleva al camino B, a precio de lista
  const pe = c.recomendarCamino({ ...base, listaUF: 1200, arriendoMeta: 200000, hayGrupo: false });
  assert.strictEqual(pe.id, 'pie-compartido');
  assert.strictEqual(pe.numeros.precioUF, 1200);
  // Más barato que el de referencia: llega antes
  assert.ok(r.numeros.meses < c.recomendarCamino(base).numeros.meses);
});

test('Rango de precio: el plazo va del piso al techo del rango', () => {
  const r = c.buscarRango('1500-2000');
  assert.deepStrictEqual([r.desde, r.hasta], [1500, 2000]);
  assert.strictEqual(c.enRango(1750, r), true);
  assert.strictEqual(c.enRango(2450, r), false);
  assert.strictEqual(c.enRango(2500, c.buscarRango('2000-2500')), true);
  assert.strictEqual(c.enRango(2500, c.buscarRango('2500-3000')), false);
  const pr = c.plazoRango(base, r);
  assert.strictEqual(pr.desde.numeros.precioUF, 1500);
  assert.strictEqual(pr.hasta.numeros.precioUF, 2000);
  assert.ok(pr.desde.numeros.meses <= pr.hasta.numeros.meses);
  // El techo del rango es el caso conservador: si no conviene, el piso puede convenir igual
  const justo = { ...base, modo: 'vivir', sueldoPropio: 1300000, sueldoPareja: null, arriendoActual: 0 };
  const pj = c.plazoRango(justo, c.buscarRango('1500-2000'));
  assert.strictEqual(pj.hasta.todaviaNo, true);
  assert.strictEqual(pj.desde.todaviaNo, false);
  assert.strictEqual(c.buscarRango('no-existe'), null);
});
