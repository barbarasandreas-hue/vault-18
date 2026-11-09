// Todas las fórmulas de Primer Peldaño.
// Los montos se calculan en UF y se convierten a pesos al final.
// Las pantallas solo llaman a estas funciones; nunca calculan por su cuenta.

var SUPUESTOS = {
  uf: 41065,                // pesos por UF
  pctGastos: 0.02,          // gastos de escritura
  // S20-T1: tasa de ejemplo (la fija cada banco según el cliente; ver CLAUDE.md, "Tasa de ejemplo").
  tasaBci: 0.0346,          // anual, con subsidio a la tasa: Bci, noviembre de 2026, 90 % a 30 años (CAE 3,99 %)
  tasaSinSubsidio: 0.0406,  // anual, sin subsidio (3,46 + 0,6; cálculo propio): el usado, que no tiene subsidio
  tasaPeorCaso: 0.0445,     // peor caso: tasa de referencia de Hacienda para bancos, nov-2026 (Res. Ex. 668)
  mesesBci: 360,
  segurosUF: 0.7,           // al mes
  rentaParticipacion: 0.06, // anual en UF, sobre la parte de los inversionistas (pie compartido)
  topeRecompraMeses: 84,    // si a los 84 meses no recompró todo, refinancia o vende
  topeFogaesUF: 4500,       // la garantía FOGAES llega a viviendas de hasta UF 4.500
  pctCostosVenta: 0.02,     // supuesto de diseño: corretaje y gastos si el comprador vende
  protectorCadaMeses: 6,    // "Este mes no pude": una vez cada 6 meses
  // S26: Tu mes como dueño. Estimados, no datos del edificio:
  gastoComunM2: 1500,       // $ por m² al mes. Assetplan (mar-2026): en Santiago Centro ≈ $72 mil para deptos de 1 y 2 dormitorios
  arreglosAnual: 0.0025,    // supuesto de diseño: guardar 0,25 % del valor al año para arreglos (depto nuevo)
  mudanza: 250000,          // supuesto de diseño: mudanza dentro de Santiago
  exentoContribucionesUF: 1450 // SII, 1.er semestre 2025: viviendas con avalúo fiscal bajo ≈ $56,8 M no pagan contribuciones
};

// Cómo se reparte el precio según para qué compra (modelo v3, CLAUDE.md).
// vivir: 90 % Bci con FOGAES + 10 % de pie del usuario.
// arrendar (invertir): 80 % Bci + 15 % de participación de inversionistas + 5 % del usuario.
// propio (S10): para arrendar sin pie compartido (camino A solo o crédito al 80 %): el usuario pone el 20 %.
var MODOS = {
  vivir: { credito: 0.90, usuario: 0.10, inversionistas: 0 },
  arrendar: { credito: 0.80, usuario: 0.05, inversionistas: 0.15 },
  propio: { credito: 0.80, usuario: 0.20, inversionistas: 0 }
};
function modoDe(modo) { return MODOS[modo] || MODOS.arrendar; }

// Descuento de la compra en grupo: 3 % desde 5 unidades, 5 % desde 10.
function descuentoGrupo(unidades) {
  if (unidades >= 10) return 0.05;
  if (unidades >= 5) return 0.03;
  return 0;
}

// Precio que paga el usuario. En lote (compra en grupo) se aplica el descuento según las unidades del lote.
function precioUF(listaUF, tipo, unidades) {
  if (tipo !== 'lote') return listaUF;
  var u = unidades === undefined ? 0 : unidades; // S18-F1: sin unidades no se supone el grupo completo
  return listaUF * (1 - descuentoGrupo(u));
}

function pieUF(precio, modo) { return precio * modoDe(modo).usuario; }
function gastosUF(precio) { return precio * SUPUESTOS.pctGastos; }
function alEscriturarUF(precio, modo) { return pieUF(precio, modo) + gastosUF(precio); }

// Cuota fija (sistema francés). Tasa mensual = tasa anual / 12.
function cuotaFija(monto, tasaAnual, meses) {
  var i = tasaAnual / 12;
  if (i === 0) return monto / meses;
  return monto * i / (1 - Math.pow(1 + i, -meses));
}

// Dividendo Bci sobre el crédito del modo, más seguros. Por defecto, con subsidio a la tasa.
function dividendoUF(precio, modo, tasa) {
  return cuotaFija(precio * modoDe(modo).credito, tasa || SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF;
}

// En v3 el usuario paga solo el dividendo: los inversionistas no cobran una cuota de su sueldo.
function totalMesUF(precio, modo) { return dividendoUF(precio, modo); }

// De dónde sale el precio según el modo.
function repartoUF(precio, modo) {
  var m = modoDe(modo);
  return { bci: precio * m.credito, inversionistas: precio * m.inversionistas, usuario: precio * m.usuario };
}

function ufAPesos(uf) { return Math.round(uf * SUPUESTOS.uf); }

// 6467738 -> "$6.467.738"
function formatoPesos(pesos) {
  var n = Math.round(pesos);
  var signo = n < 0 ? '-' : '';
  var texto = Math.abs(n).toLocaleString('es-CL', { maximumFractionDigits: 0 });
  // Respaldo por si el navegador no trae el formato chileno.
  if (texto.indexOf('.') === -1 && Math.abs(n) >= 1000) {
    texto = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return signo + '$' + texto;
}

// Todos los números de un escenario, en pesos, listos para mostrar.
// listaUF: precio de lista; tipo: 'lote' o 'individual'; modo: 'vivir' o 'arrendar';
// unidades: unidades del lote (define el descuento de grupo).
// Las cifras cuadran a la vista: Bci (la parte más grande) absorbe el redondeo del reparto.
function escenario(listaUF, tipo, modo, unidades) {
  var m = modoDe(modo);
  var precio = precioUF(listaUF, tipo, unidades);
  var precioPesos = ufAPesos(precio);
  var dividendo = ufAPesos(dividendoUF(precio, modo));
  var reparto = repartoUF(precio, modo);
  var inversionistas = ufAPesos(reparto.inversionistas);
  var usuario = ufAPesos(reparto.usuario);
  var bci = precioPesos - inversionistas - usuario;
  var gastos = ufAPesos(gastosUF(precio));
  return {
    modo: modo === 'vivir' ? 'vivir' : 'arrendar',
    listaUF: listaUF,
    precioUF: precio,
    precioLista: ufAPesos(listaUF),
    precio: precioPesos,
    descuento: tipo === 'lote' ? descuentoGrupo(unidades === undefined ? 0 : unidades) : 0,
    pctCredito: m.credito,
    pctUsuario: m.usuario,
    pctInversionistas: m.inversionistas,
    pie: usuario,
    gastos: gastos,
    alEscriturar: usuario + gastos,
    dividendo: dividendo,
    dividendoSinSubsidio: ufAPesos(dividendoUF(precio, modo, SUPUESTOS.tasaPeorCaso)),
    totalMes: dividendo,
    participacionUF: reparto.inversionistas,
    reparto: { bci: bci, inversionistas: inversionistas, usuario: usuario }
  };
}

// ---------- Marketplace ----------

// Arriendo neto = bruto − 10 % de administración − 1 mes vacío al año.
function arriendoNeto(bruto) {
  return bruto * 0.9 * 11 / 12;
}

// Rentabilidad anual del arriendo sobre el precio pagado (fracción: 0.045 = 4,5 %).
function rentabilidad(arriendoBruto, precioPagadoUF) {
  return arriendoNeto(arriendoBruto) * 12 / (precioPagadoUF * SUPUESTOS.uf);
}

// En modo arrendar la IA solo muestra departamentos con rentabilidad neta igual o mayor a la tasa
// con subsidio (bajo eso, el crédito cuesta más de lo que rinde el arriendo).
var RENTABILIDAD_MINIMA = SUPUESTOS.tasaBci;
function pasaFiltroIA(rent) { return rent >= RENTABILIDAD_MINIMA; }

// Ahorro por unirse a una compra en grupo: el descuento según las unidades del lote.
function ahorroPorUnirseUF(listaUF, unidades) {
  return listaUF * descuentoGrupo(unidades === undefined ? 0 : unidades);
}

// Lo que se reúne con inversionistas: la participación de 15 % del precio pagado.
function participacionUF(precio) { return precio * MODOS.arrendar.inversionistas; }
function porFinanciarUF(precio) { return participacionUF(precio); }

// Avance entre 0 y 1 (6 de 10 → 0.6).
function avance(parte, total) {
  if (!total || total <= 0) return 0;
  return Math.min(1, Math.max(0, parte / total));
}

// 0.6 → 60 (para el ancho de una barra o aria-valuenow).
function porcentajeEntero(fraccion) { return Math.round(fraccion * 100); }

// 0.045 → "4,5 %"; 0.6 con 0 decimales → "60 %".
function formatoPorcentaje(fraccion, decimales) {
  var d = decimales === undefined ? 1 : decimales;
  return (fraccion * 100).toFixed(d).replace('.', ',') + '\u00a0%'; // espacio que no se corta
}

var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// "2026-12-15" → "15 de diciembre de 2026".
function formatoFecha(iso) {
  var p = String(iso).split('-');
  return Number(p[2]) + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[0];
}

// Todo lo que se muestra de un proyecto, ya calculado.
// proyecto.tipo: 'conjunto' (compra en grupo, con descuento según las unidades del lote)
// o 'financiamiento' (pie compartido, a precio de lista).
// departamentos: los disponibles del proyecto (misma tipología y precio).
// cuposExtra: cupos que tomó el usuario en este teléfono (0 o 1).
// invertidoUF: lo que el usuario invirtió en este proyecto desde este teléfono.
// modo: 'vivir' o 'arrendar' (por defecto 'arrendar').
// S18-F1: con opciones.descuentoHoy, el precio usa el descuento que el grupo ya tiene asegurado:
// los cupos tomados más el tuyo (si aún no estás, opciones.yaEstas = false). Lo de completar el grupo
// queda como posibilidad en ahorroCompleto y descuentoCompleto. Sin opciones, supone el grupo completo (modo arrendar).
function unidadesHoy(proyecto, cuposExtra, yaEstas) {
  var tomados = proyecto.cuposTomados + (cuposExtra || 0);
  return Math.min(proyecto.cupos, tomados + (yaEstas ? 0 : 1));
}
function resumenProyecto(proyecto, departamentos, cuposExtra, invertidoUF, modo, opciones) {
  var tipoCompra = proyecto.tipo === 'conjunto' ? 'lote' : 'individual';
  var listaUF = departamentos[0].listaUF;
  var tomados = proyecto.cuposTomados + (cuposExtra || 0);
  var unidades = opciones && opciones.descuentoHoy && tipoCompra === 'lote'
    ? unidadesHoy(proyecto, cuposExtra, opciones.yaEstas) : proyecto.cupos;
  var e = escenario(listaUF, tipoCompra, modo, unidades);

  var rentabilidades = departamentos.map(function (d) {
    return rentabilidad(d.arriendoEstimadoIA, precioUF(d.listaUF, tipoCompra, unidades));
  });
  var rentMinima = Math.min.apply(null, rentabilidades);

  var porFinanciar = porFinanciarUF(e.precioUF);
  var financiadas = proyecto.ufFinanciadas + (invertidoUF || 0);

  return {
    tipoCompra: tipoCompra,
    escenario: e,
    ahorro: proyecto.tipo === 'conjunto' ? ufAPesos(ahorroPorUnirseUF(listaUF, unidades)) : 0,
    ahorroCompleto: proyecto.tipo === 'conjunto' ? ufAPesos(ahorroPorUnirseUF(listaUF, proyecto.cupos)) : 0,
    descuentoCompleto: proyecto.tipo === 'conjunto' ? descuentoGrupo(proyecto.cupos) : 0,
    descuento: e.descuento,
    arriendoBruto: departamentos[0].arriendoEstimadoIA,
    origenArriendo: departamentos[0].origenArriendo,
    netoMensualUF: arriendoNeto(departamentos[0].arriendoEstimadoIA) / SUPUESTOS.uf,
    rentabilidad: rentMinima,
    pasaFiltro: pasaFiltroIA(rentMinima),
    cuposTomados: tomados,
    cupos: proyecto.cupos,
    cuposLibres: Math.max(0, proyecto.cupos - tomados),
    avanceCupos: avance(tomados, proyecto.cupos),
    porFinanciarUF: porFinanciar,
    porFinanciar: ufAPesos(porFinanciar),
    financiadoUF: financiadas,
    financiado: ufAPesos(financiadas),
    faltaUF: faltaFinanciarUF(porFinanciar, financiadas),
    avanceFinanciamiento: avance(financiadas, porFinanciar)
  };
}

// ---------- Postula: carga del crédito ----------

// Ingreso del hogar: sueldo propio + sueldo de la pareja.
function ingresoTotal(sueldoPropio, sueldoPareja) {
  return (sueldoPropio || 0) + (sueldoPareja || 0);
}

// Carga = total al mes / ingreso del hogar. Fracción: 0.229 = 22,9 %.
function carga(totalMes, sueldoPropio, sueldoPareja) {
  var ingreso = ingresoTotal(sueldoPropio, sueldoPareja);
  if (ingreso <= 0) return null;
  return totalMes / ingreso;
}

// La carga que se muestra, redondeada a 1 decimal del porcentaje (0.30044 → 0.300).
// El semáforo usa este mismo valor, para que nunca diga "30,0 %" y "No aprueba" a la vez.
function cargaRedondeada(c) {
  if (c === null || c === undefined || isNaN(c)) return null;
  // El 1e-7 hace que los casos de justo la mitad (30,05 %) suban, como en el redondeo escolar,
  // aunque la multiplicación binaria dé 300,4999…
  return Math.round(c * 1000 + 1e-7) / 1000;
}

// Regla v3: el dividendo hasta 25 % del ingreso y el dividendo + otras cuotas hasta 30 %.
// Si se cumplen las dos: holgado (con cuotas hasta 25 %) o en el límite (con cuotas entre 25 y 30 %). Si no: no aprueba.
// Se compara la carga redondeada que ve el usuario.
var LIMITE_HOLGADO = 0.25;
var LIMITE_MAXIMO = 0.30;
var TOLERANCIA = 1e-9; // para que 0,25 y 0,30 no se pasen por redondeo binario
function nivelCarga(cargaDividendo, cargaTotal) {
  var d = cargaRedondeada(cargaDividendo);
  if (d === null) return null;
  var t = cargaTotal === undefined || cargaTotal === null ? d : cargaRedondeada(cargaTotal);
  if (d > LIMITE_HOLGADO + TOLERANCIA || t > LIMITE_MAXIMO + TOLERANCIA) return 'no-aprueba';
  if (t > LIMITE_HOLGADO + TOLERANCIA) return 'limite';
  return 'holgado';
}

// La carga v3 completa: dividendo solo y dividendo + otras cuotas, con su nivel.
function evaluarCarga(dividendo, otrasCuotas, sueldoPropio, sueldoPareja) {
  var cd = carga(dividendo, sueldoPropio, sueldoPareja);
  if (cd === null) return null;
  var ct = carga(dividendo + (otrasCuotas || 0), sueldoPropio, sueldoPareja);
  return { cargaDividendo: cargaRedondeada(cd), cargaTotal: cargaRedondeada(ct), nivel: nivelCarga(cd, ct) };
}

// Ingreso del hogar mínimo para que la carga no pase de 30 %.
function ingresoMinimo(dividendo, otrasCuotas) {
  var otras = otrasCuotas || 0;
  return Math.ceil(Math.max(dividendo / LIMITE_HOLGADO, (dividendo + otras) / LIMITE_MAXIMO));
}

// Cuánto ingreso al mes le falta al hogar para postular (0 si ya alcanza).
function ingresoFaltante(dividendo, sueldoPropio, sueldoPareja, otrasCuotas) {
  return Math.max(0, ingresoMinimo(dividendo, otrasCuotas) - ingresoTotal(sueldoPropio, sueldoPareja));
}

// De varias opciones { id, totalMes }, la que deja la carga más baja,
// solo si mejora la carga actual. Devuelve { id, carga, nivel } o null.
function mejorAlternativa(cargaActual, opciones, sueldoPropio, sueldoPareja, otrasCuotas) {
  var mejor = null;
  opciones.forEach(function (o) {
    var ev = evaluarCarga(o.totalMes, otrasCuotas, sueldoPropio, sueldoPareja);
    if (ev !== null && ev.cargaTotal < cargaActual && (!mejor || ev.cargaTotal < mejor.carga)) {
      mejor = { id: o.id, carga: ev.cargaTotal, nivel: ev.nivel };
    }
  });
  return mejor;
}

// Lee lo que escribió el usuario en un campo de dinero: "1.500.000" → 1500000.
// Vacío → null.
function leerMonto(texto) {
  var digitos = String(texto === undefined || texto === null ? '' : texto).replace(/\D/g, '');
  if (digitos === '') return null;
  return Number(digitos.slice(0, 12));
}

// 1500000 → "1.500.000" (sin el signo $, para mostrar dentro de un campo).
function formatoMiles(n) {
  return formatoPesos(n).replace('$', '');
}

// ---------- Tu 5 %: ahorro para la meta ----------

// Meses para juntar la meta ahorrando un monto fijo al mes (hacia arriba).
// Ahorro vacío o cero → null (no un número infinito).
function mesesParaMeta(meta, ahorroMensual) {
  if (!ahorroMensual || ahorroMensual <= 0) return null;
  return Math.ceil(Math.max(0, meta) / ahorroMensual);
}

// Meses que faltan, descontando lo que ya se juntó.
function mesesRestantes(meta, ahorrado, ahorroMensual) {
  return mesesParaMeta(Math.max(0, meta - (ahorrado || 0)), ahorroMensual);
}

// S13-F3: cuántos meses adelanta un aporte de la familia (0 si no alcanza a adelantar un mes).
function mesesQueAdelanta(meta, ahorrado, ahorroMensual, aporte) {
  var antes = mesesRestantes(meta, ahorrado, ahorroMensual);
  var despues = mesesRestantes(meta, Math.min(meta, (ahorrado || 0) + (aporte || 0)), ahorroMensual);
  if (antes === null || despues === null) return 0;
  return Math.max(0, antes - despues);
}

// S13-F3: a cuántos días de ahorro equivale un aporte (mes de 30 días).
function diasDeAhorro(aporte, ahorroMensual) {
  if (!(ahorroMensual > 0) || !(aporte > 0)) return 0;
  return Math.max(1, Math.round(aporte / ahorroMensual * 30));
}

// Hitos de la barra de avance del ahorro.
var HITOS_AHORRO = [0.25, 0.5, 0.75, 1];

// Hitos ya alcanzados con lo ahorrado (por ejemplo [0.25, 0.5]).
function hitosAlcanzados(ahorrado, meta) {
  var a = avance(ahorrado, meta);
  return HITOS_AHORRO.filter(function (h) { return a >= h; });
}

// S19-B4: el próximo hito del pie y cuántas cuotas faltan para llegar a él (los avisos hablan en meses, no en montos).
function hitoSiguiente(ahorrado, meta, mensual) {
  var a = avance(ahorrado, meta);
  var h = HITOS_AHORRO.filter(function (x) { return a < x; })[0];
  if (!h) return null;
  var falta = Math.max(0, meta * h - ahorrado);
  return { hito: h, falta: falta, meses: mensual > 0 ? Math.max(1, Math.ceil(falta / mensual)) : null };
}

// S19-B4: qué cambió desde la última vez que se vio Inicio.
// Cada foto es { proyecto, mes, cupos, etapa, llegada } (llegada = mes de la demo + meses que faltan).
function cambiosDesdeVisita(antes, ahora) {
  if (!antes || !ahora || antes.proyecto !== ahora.proyecto) return [];
  var c = [];
  if (ahora.mes > antes.mes) c.push({ tipo: 'cuotas', n: ahora.mes - antes.mes });
  if (ahora.cupos > antes.cupos) c.push({ tipo: 'cupos', n: ahora.cupos - antes.cupos });
  if (ahora.etapa > antes.etapa) c.push({ tipo: 'etapa', etapa: ahora.etapa });
  if (typeof antes.llegada === 'number' && typeof ahora.llegada === 'number' && ahora.llegada !== antes.llegada) {
    c.push({ tipo: ahora.llegada < antes.llegada ? 'antes' : 'despues', n: Math.abs(antes.llegada - ahora.llegada) });
  }
  return c;
}

// S19-B4: la meta de este mes cuando todavía no llega. Siempre una acción concreta:
// apartar lo que puede juntar y, además, lo que más acerca el "sí".
// o: { ahorroMensual, otrasCuotas, subsidio, iva } (subsidio e iva: 'sola', 'con-otra' o false, según si hacen caber).
function metaDelMes(o) {
  var lista = [];
  if (o.ahorroMensual > 0) lista.push({ tipo: 'ahorrar', monto: o.ahorroMensual });
  if (o.subsidio === 'sola' || o.subsidio === 'con-otra') lista.push({ tipo: 'subsidio', con: o.subsidio });
  else if (o.iva === 'sola' || o.iva === 'con-otra') lista.push({ tipo: 'iva', con: o.iva });
  else if (o.otrasCuotas > 0) lista.push({ tipo: 'cuota' });
  else lista.push({ tipo: 'rango' });
  return lista;
}

// Un mes más de ahorro, sin pasarse de la meta.
function sumarMes(ahorrado, ahorroMensual, meta) {
  return Math.min(meta, (ahorrado || 0) + (ahorroMensual || 0));
}

// ---------- Inicio: ¿cuánto puedo comprar? (S5-F0) ----------

// Mayor precio, en UF enteras hacia abajo, con un dividendo de 25 % o menos del ingreso (holgado).
// Dividendo = crédito del modo (90 % vivir, 80 % arrendar) a la tasa de ejemplo con subsidio y 360 meses + seguros.
// En modo vivir no pasa del tope del FOGAES (UF 4.500).
function capacidadCompraUF(sueldoPropio, sueldoPareja, modo) {
  var ingreso = ingresoTotal(sueldoPropio, sueldoPareja);
  if (!ingreso || ingreso <= 0) return null;
  var presupuestoUF = LIMITE_HOLGADO * ingreso / SUPUESTOS.uf - SUPUESTOS.segurosUF;
  if (presupuestoUF <= 0) return 0;
  var factor = modoDe(modo).credito * cuotaFija(1, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci);
  var cap = Math.floor(presupuestoUF / factor + 1e-9);
  return modo === 'vivir' ? Math.min(cap, SUPUESTOS.topeFogaesUF) : cap;
}

// 2472 → "UF 2.472"; 337.5 → "UF 337,5".
function formatoUF(uf) {
  var decimas = Math.round(uf * 10);          // primero se redondea a un decimal
  var entero = Math.floor(decimas / 10);
  var decimal = decimas - entero * 10;
  return 'UF' + '\u00a0' + formatoMiles(entero) + (decimal ? ',' + decimal : '');
}

// ---------- Mi departamento: el mes (S5-F1) ----------

// ---------- Pie compartido: participación y recompra (modelo v3) ----------

// Renta de un mes para los inversionistas: 6 % anual sobre lo que aún es de ellos (en UF).
function rentaParticipacionUF(saldoUF) {
  return Math.max(0, saldoUF) * SUPUESTOS.rentaParticipacion / 12;
}

// Un mes de recompra: del arriendo neto que va a la recompra (fraccion = 1 o 0,8),
// primero se paga la renta y con el resto el comprador recompra parte de la participación.
function pasoRecompra(saldoUF, netoUF, fraccion) {
  var flujo = Math.max(0, netoUF) * (fraccion === undefined ? 1 : fraccion);
  var renta = Math.min(rentaParticipacionUF(saldoUF), flujo);
  var recompra = Math.min(Math.max(0, flujo - renta), Math.max(0, saldoUF));
  return { renta: renta, recompra: recompra, pagado: renta + recompra, saldo: Math.max(0, saldoUF - recompra) };
}

// Los primeros N meses de recompra, mes a mes (todo en UF).
function simularRecompra(participacionUF, netoUF, fraccion, meses) {
  var saldo = participacionUF;
  var lista = [];
  for (var m = 1; m <= meses; m++) {
    var p = pasoRecompra(saldo, netoUF, fraccion);
    saldo = p.saldo;
    lista.push(p);
  }
  return lista;
}

// Lo que aún es de los inversionistas después de N meses de recompra (en UF).
function saldoParticipacionUF(participacionUF, netoUF, meses, fraccion) {
  var lista = simularRecompra(participacionUF, netoUF, fraccion, Math.max(0, meses || 0));
  return lista.length ? lista[lista.length - 1].saldo : participacionUF;
}

// Meses hasta que el comprador es dueño del 100 % (null si el arriendo no alcanza ni para la renta).
function mesesRecompra(participacionUF, netoUF, fraccion) {
  if (participacionUF <= 0) return 0;
  var saldo = participacionUF;
  for (var m = 1; m <= 1200; m++) {
    var p = pasoRecompra(saldo, netoUF, fraccion);
    if (p.recompra <= 0) return null;
    saldo = p.saldo;
    if (saldo <= 1e-9) return m;
  }
  return null;
}

// Plazo de la recompra con el tope de 84 meses (contando los meses que ya pasaron).
// meses: los que faltan, o null si el arriendo no alcanza ni para la renta.
// superaTope: si no se termina antes del mes 84; ahí el comprador refinancia o vende.
function plazoRecompra(participacionUF, netoUF, fraccion, mesesPasados) {
  var meses = mesesRecompra(participacionUF, netoUF, fraccion);
  var tope = SUPUESTOS.topeRecompraMeses - (mesesPasados || 0);
  return { meses: meses, noAlcanza: meses === null, superaTope: meses === null || meses > tope, tope: tope };
}

// Cómo se reparte el arriendo de un mes en la cuenta custodia (modo arrendar, v3).
// Bruto − 10 % de administración − 1 mes vacío al año = neto. Mientras haya participación,
// la fracción elegida del neto va a los inversionistas (renta y recompra) y el resto al usuario.
// El usuario paga el dividendo con su sueldo y recibe lo que le toca del arriendo.
function cascadaMes(dividendo, saldoParticipacionUF, arriendoBruto, fraccion) {
  var bruto = Math.max(0, arriendoBruto || 0);
  var administracion = Math.round(bruto * 0.10);
  var vacancia = Math.round((bruto - administracion) / 12);
  var neto = bruto - administracion - vacancia;
  var fr = fraccion === undefined ? 1 : fraccion;
  var hayParticipacion = saldoParticipacionUF > 1e-9;
  var paso = hayParticipacion ? pasoRecompra(saldoParticipacionUF, neto / SUPUESTOS.uf, fr) : null;
  var renta = paso ? ufAPesos(paso.renta) : 0;
  var recompra = paso ? ufAPesos(paso.recompra) : 0;
  var aInversionistas = renta + recompra;
  var aUsuario = neto - aInversionistas;
  return {
    bruto: bruto,
    administracion: administracion,
    vacancia: vacancia,
    neto: neto,
    renta: renta,
    recompra: recompra,
    aInversionistas: aInversionistas,
    aUsuario: aUsuario,
    dividendo: dividendo,
    pone: Math.max(0, dividendo - aUsuario),     // lo que pone de su bolsillo para el dividendo
    excedente: Math.max(0, aUsuario - dividendo), // lo que le sobra
    saldoDespuesUF: paso ? paso.saldo : 0
  };
}

// Saldo de una deuda en cuota fija después de N cuotas pagadas (todo en UF).
// abonos: lista de { mes, uf }. Cada abono se descuenta con los intereses que deja de generar
// desde el mes en que se hizo: uf × (1 + tasa mensual) elevado a los meses que pasaron.
function saldoDeuda(montoUF, tasaAnual, meses, cuotasPagadas, abonos) {
  var n = Math.min(Math.max(0, cuotasPagadas || 0), meses);
  var i = tasaAnual / 12;
  var cuota = cuotaFija(montoUF, tasaAnual, meses);
  var saldo = i === 0 ? montoUF - cuota * n
    : montoUF * Math.pow(1 + i, n) - cuota * (Math.pow(1 + i, n) - 1) / i;
  var descuento = (abonos || []).reduce(function (suma, a) {
    return suma + a.uf * Math.pow(1 + i, Math.max(0, n - a.mes));
  }, 0);
  return Math.max(0, saldo - descuento);
}

// pctCredito (S18-F7): la parte que presta Bci si no es la del modo (por ejemplo, con subsidio o respaldo).
function saldoBciUF(precio, cuotasPagadas, modo, pctCredito) {
  var pct = typeof pctCredito === 'number' ? pctCredito : modoDe(modo).credito;
  return saldoDeuda(precio * pct, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci, cuotasPagadas, []);
}

// Pesos a UF (para registrar un abono).
function pesosAUF(pesos) { return pesos / SUPUESTOS.uf; }

// Días entre dos fechas "AAAA-MM-DD" (negativo si la segunda ya pasó).
function diasEntre(desde, hasta) {
  var a = String(desde).split('-').map(Number);
  var b = String(hasta).split('-').map(Number);
  return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86400000);
}

// ---------- Invertir (S6-F2 y S6-F3) ----------

// La inversión mínima es UF 10.
var INVERSION_MINIMA_UF = 10;

// Lo que falta por financiar del 15 %, en UF (nunca negativo).
function faltaFinanciarUF(porFinanciar, financiadas) {
  return Math.max(0, porFinanciar - (financiadas || 0));
}

// Lo que recibe un inversionista en un mes: su parte (monto / participación total)
// de lo que pagó la recompra ese mes (renta + recompra), en UF.
function flujoInversionUF(montoUF, participacionUF, netoUF, mes, fraccion) {
  if (!(participacionUF > 0) || mes < 1) return 0;
  var lista = simularRecompra(participacionUF, netoUF, fraccion, mes);
  return montoUF / participacionUF * lista[mes - 1].pagado;
}

// Mínimo para invertir: UF 10, o lo que falta si queda menos (así el proyecto se puede completar).
function inversionMinimaUF(faltaUF) {
  return Math.min(INVERSION_MINIMA_UF, Math.max(0, faltaUF));
}

// Revisa un monto a invertir. Devuelve null si sirve, o 'vacio', 'completo', 'minimo' o 'maximo'.
function validarInversion(montoUF, faltaUF) {
  if (!(faltaUF > 1e-9)) return 'completo';
  if (montoUF === null || montoUF === undefined || isNaN(montoUF)) return 'vacio';
  if (montoUF < inversionMinimaUF(faltaUF) - 1e-9) return 'minimo';
  if (montoUF > faltaUF + 1e-9) return 'maximo';
  return null;
}

// 3. Campo de monto en UF con un decimal (coma decimal, punto de miles).
// Deja el texto como se debe ver mientras se escribe: "12345,67" → "12.345,6".
function limpiarCampoUF(texto) {
  var t = String(texto === undefined || texto === null ? '' : texto).replace(/\./g, '');
  var partes = t.split(',');
  var entero = partes[0].replace(/\D/g, '').slice(0, 9);
  var conComa = partes.length > 1;
  var decimal = conComa ? partes.slice(1).join('').replace(/\D/g, '').slice(0, 1) : '';
  if (entero === '' && !conComa) return '';
  var miles = entero === '' ? '0' : formatoMiles(Number(entero));
  return miles + (conComa ? ',' + decimal : '');
}

// Lee el monto en UF de ese campo: "12,5" → 12.5; "1.234" → 1234; vacío → null.
function leerMontoUF(texto) {
  var t = limpiarCampoUF(texto);
  if (t === '' || t === '0,' ) return null;
  var n = Number(t.replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

// Lo cobrado a la fecha por una lista de inversiones
// { montoUF, participacionUF, netoUF, cuotasCobradas }, en UF.
function cobradoUF(inversiones) {
  return (inversiones || []).reduce(function (suma, x) {
    if (!(x.participacionUF > 0)) return suma;
    var lista = simularRecompra(x.participacionUF, x.netoUF, 1, x.cuotasCobradas || 0);
    var total = lista.reduce(function (s, p) { return s + p.pagado; }, 0);
    return suma + x.montoUF / x.participacionUF * total;
  }, 0);
}

// Lo que recibe el próximo mes por todas sus inversiones (0 cuando ya recuperó todo), en UF.
function cuotaMensualTotalUF(inversiones) {
  return (inversiones || []).reduce(function (suma, x) {
    return suma + flujoInversionUF(x.montoUF, x.participacionUF, x.netoUF, (x.cuotasCobradas || 0) + 1, 1);
  }, 0);
}

// ---------- Preaprobación simulada (S8-F1) ----------

// Requisito de renta (referencial, Bci): el titular gana al menos UF 23, o la renta familiar
// es de al menos UF 39 y la pareja gana al menos UF 16.
var RENTA_MINIMA_TITULAR_UF = 23;
var RENTA_MINIMA_FAMILIAR_UF = 39;
var RENTA_MINIMA_PAREJA_UF = 16;

// Dividendo máximo = el menor entre 25 % de la renta y 30 % de la renta menos otras cuotas.
// Devuelve null sin sueldos, o { cumple, motivo, creditoUF, dividendoMax, dividendo }.
// motivo: null, 'renta' (no llega a la renta mínima) o 'carga' (las otras cuotas no dejan espacio).
function preaprobacion(sueldoPropio, sueldoPareja, otrasCuotas, tasa) {
  var propio = sueldoPropio || 0, pareja = sueldoPareja || 0;
  var renta = propio + pareja;
  if (!(renta > 0)) return null;
  var uf = SUPUESTOS.uf;
  var cumpleRenta = propio >= RENTA_MINIMA_TITULAR_UF * uf ||
    (renta >= RENTA_MINIMA_FAMILIAR_UF * uf && pareja >= RENTA_MINIMA_PAREJA_UF * uf);
  var dividendoMax = Math.min(LIMITE_HOLGADO * renta, LIMITE_MAXIMO * renta - (otrasCuotas || 0));
  var t = tasa || SUPUESTOS.tasaBci;
  var creditoUF = Math.max(0, Math.floor((dividendoMax / uf - SUPUESTOS.segurosUF) / cuotaFija(1, t, SUPUESTOS.mesesBci) + 1e-9));
  var motivo = !cumpleRenta ? 'renta' : (creditoUF <= 0 ? 'carga' : null);
  return {
    cumple: motivo === null,
    motivo: motivo,
    creditoUF: motivo === null ? creditoUF : 0,
    dividendoMax: Math.max(0, Math.round(dividendoMax)),
    dividendo: motivo === null ? ufAPesos(cuotaFija(creditoUF, t, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF) : 0
  };
}

// ---------- Sprint 9: Tu mes real, Tus caminos y Todavía no ----------

// Departamento de referencia (CLAUDE.md) y supuestos de diseño de los caminos.
var LISTA_REFERENCIA_UF = 2500;
var MINIMO_PARA_VIVIR = 0.40;   // supuesto de diseño: queda al menos 40 % del ingreso (a validar)
var UMBRAL_AHORRO = 0.20;       // con 20 % del precio ahorrado no necesita el pie compartido
var ESTUDIO_UF = 1200;          // estudio de referencia para "Todavía no"
var ARRIENDO_REFERENCIA = 420000; // arriendo bruto de referencia del pie compartido (SPEC.md, sección 0)
var PEOR_CASO_ARRIENDO = 0.9;   // peor caso: arriendo 10 % más bajo

// Cada camino: cuánto presta Bci, cuánto pone el usuario y cuánto los inversionistas.
// grupo: compra en grupo (5 % de descuento, lote de 10). existeHoy: si se puede hacer hoy en Chile.
// ficha: camino informativo (no se compra desde la app).
var CAMINOS = {
  'grupo-vivir': { nombre: 'Compra en grupo', corto: 'Compra en grupo', modo: 'vivir', grupo: true,
    credito: 0.90, usuario: 0.10, inversionistas: 0, existeHoy: false },
  'individual-vivir': { nombre: 'Crédito con garantía del Estado', corto: 'Crédito con FOGAES', modo: 'vivir', grupo: false,
    credito: 0.90, usuario: 0.10, inversionistas: 0, existeHoy: true },
  'grupo-pie-compartido': { nombre: 'Grupo y pie compartido', corto: 'Grupo y pie compartido', modo: 'arrendar', grupo: true,
    credito: 0.80, usuario: 0.05, inversionistas: 0.15, existeHoy: false },
  'pie-compartido': { nombre: 'Pie compartido', corto: 'Pie compartido', modo: 'arrendar', grupo: false,
    credito: 0.80, usuario: 0.05, inversionistas: 0.15, existeHoy: false },
  'grupo-invertir': { nombre: 'Compra en grupo', corto: 'Compra en grupo', modo: 'arrendar', grupo: true,
    credito: 0.80, usuario: 0.20, inversionistas: 0, existeHoy: false },
  'individual-invertir': { nombre: 'Crédito al 80 %', corto: 'Crédito al 80 %', modo: 'arrendar', grupo: false,
    credito: 0.80, usuario: 0.20, inversionistas: 0, existeHoy: true },
  'arriendo-opcion': { nombre: 'Arriendo con opción de compra', corto: 'Arriendo con opción de compra', modo: 'vivir',
    ficha: true, existeHoy: true },
  'respaldo-familiar': { nombre: 'Respaldo familiar', corto: 'Respaldo familiar', modo: 'ambos',
    ficha: true, existeHoy: false }
};

// S18-F5: ¿Cabe con estas piezas? La misma regla (carga y Tu mes real) con la cuota que dan las piezas.
// Devuelve null si cabe, o la razón en pocas palabras.
function razonTodaviaNo(perfil, dividendo) {
  var s = sostenible(perfil, dividendo);
  if (!s || s.cumple) return null;
  return !s.cumpleCarga ? 'La cuota pasa tu límite' : 'Te quedaría poco para vivir';
}

// Los caminos de cada modo, en el orden en que se muestran.
function caminosDelModo(modo) {
  return modo === 'vivir'
    ? ['grupo-vivir', 'individual-vivir', 'arriendo-opcion', 'respaldo-familiar']
    // S26: para invertir, o en grupo o con pie compartido; ya no los dos juntos.
    : ['pie-compartido', 'grupo-invertir', 'individual-invertir', 'respaldo-familiar'];
}

// Tu mes real: ingreso − arriendo que sigue pagando − otras cuotas − dividendo.
// En modo vivir se muda al departamento: deja de pagar arriendo.
// En modo arrendar sigue arrendando donde vive, y no se cuenta el arriendo que recibe (peor caso).
function mesReal(perfil, dividendo) {
  var ingreso = ingresoTotal(perfil.sueldoPropio, perfil.sueldoPareja);
  if (!ingreso) return null;
  var arriendo = perfil.modo === 'vivir' ? 0 : (perfil.arriendoActual || 0);
  var otras = perfil.otrasCuotas || 0;
  var queda = ingreso - arriendo - otras - dividendo;
  return {
    ingreso: ingreso, arriendo: arriendo, otras: otras, dividendo: dividendo, queda: queda,
    pctQueda: queda / ingreso,
    alcanzaParaVivir: queda / ingreso >= MINIMO_PARA_VIVIR - TOLERANCIA
  };
}

// ¿El camino es sostenible? Dividendo ≤ 25 %, dividendo + otras cuotas ≤ 30 % y queda ≥ 40 % para vivir.
// Se comparan las cargas redondeadas que ve el usuario.
function sostenible(perfil, dividendo) {
  var ingreso = ingresoTotal(perfil.sueldoPropio, perfil.sueldoPareja);
  if (!ingreso) return null;
  var otras = perfil.otrasCuotas || 0;
  var ev = evaluarCarga(dividendo, otras, perfil.sueldoPropio, perfil.sueldoPareja);
  var cargaDividendo = ev.cargaDividendo;
  var cargaTotal = ev.cargaTotal;
  var m = mesReal(perfil, dividendo);
  var cumpleCarga = ev.nivel !== 'no-aprueba';
  return {
    cargaDividendo: cargaDividendo, cargaTotal: cargaTotal, cumpleCarga: cumpleCarga,
    mes: m, cumple: cumpleCarga && m.alcanzaParaVivir
  };
}

// Todos los números de un camino de compra para un precio de lista, en pesos.
// tasa: por defecto con subsidio; el usado no tiene subsidio a la tasa.
// Con un departamento elegido, perfil.cuposGrupo da el descuento real de su grupo y
// perfil.arriendoMeta su arriendo estimado; sin él, se usa el de referencia (lote de 10, $420.000 por UF 2.500).
function numerosCamino(id, listaUF, perfil, tasa) {
  var c = CAMINOS[id];
  var cupos = perfil && perfil.cuposGrupo ? perfil.cuposGrupo : 10;
  var precio = c.grupo ? listaUF * (1 - descuentoGrupo(cupos)) : listaUF;
  var dividendo = ufAPesos(cuotaFija(precio * c.credito, tasa || SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
  var sinSubsidio = ufAPesos(cuotaFija(precio * c.credito, SUPUESTOS.tasaPeorCaso, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
  var pie = ufAPesos(precio * c.usuario);
  var gastos = ufAPesos(gastosUF(precio));
  var alEscriturar = pie + gastos;
  var p = perfil || {};
  var falta = Math.max(0, alEscriturar - (p.ahorroActual || 0));
  var r = {
    id: id, precioUF: precio, precio: ufAPesos(precio), credito: c.credito, usuario: c.usuario,
    inversionistas: ufAPesos(precio * c.inversionistas),
    pie: pie, gastos: gastos, alEscriturar: alEscriturar,
    dividendo: dividendo, dividendoSinSubsidio: sinSubsidio,
    faltaJuntar: falta,
    meses: falta === 0 ? 0 : mesesParaMeta(falta, p.ahorroMensual),
    existeHoy: c.existeHoy
  };
  // Peor caso de cada camino.
  if (c.grupo) {
    // Si el grupo no se completa: compra a precio de lista.
    r.dividendoSinGrupo = ufAPesos(cuotaFija(listaUF * c.credito, tasa || SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
  }
  if (c.inversionistas > 0) {
    // Arriendo 10 % más bajo: la recompra toma más meses (con todo el arriendo a la recompra).
    var arriendo = (perfil && perfil.arriendoMeta) || ARRIENDO_REFERENCIA * (listaUF / LISTA_REFERENCIA_UF);
    r.mesesRecompra = mesesRecompra(precio * c.inversionistas, arriendoNeto(arriendo) / SUPUESTOS.uf, 1);
    r.mesesRecompraPeor = mesesRecompra(precio * c.inversionistas, arriendoNeto(arriendo * PEOR_CASO_ARRIENDO) / SUPUESTOS.uf, 1);
  }
  if (perfil) r.evaluacion = sostenible(perfil, dividendo);
  return r;
}

// Las reglas de recomendación (SPEC.md, sección 0). Son reglas, no IA.
// perfil: { modo, sueldoPropio, sueldoPareja, arriendoActual, otrasCuotas, ahorroActual, ahorroMensual, hayGrupo }
// Devuelve { id, regla, razon, numeros, todaviaNo, otros } o null si no hay sueldos.
// razon: 'vivir-grupo' | 'vivir-sin-grupo' | 'invertir-poco-ahorro' | 'invertir-poco-ahorro-sin-grupo'
//        | 'invertir-ahorro' | 'invertir-ahorro-sin-grupo'
function recomendarCamino(perfil) {
  if (!ingresoTotal(perfil.sueldoPropio, perfil.sueldoPareja)) return null;
  var lista = perfil.listaUF || LISTA_REFERENCIA_UF;
  var id, regla, razon;
  if (perfil.modo === 'vivir') {
    regla = 2;
    id = perfil.hayGrupo ? 'grupo-vivir' : 'individual-vivir';
    razon = perfil.hayGrupo ? 'vivir-grupo' : 'vivir-sin-grupo';
  } else {
    var ahorroPct = (perfil.ahorroActual || 0) / ufAPesos(lista);
    if (ahorroPct < UMBRAL_AHORRO - TOLERANCIA) {
      regla = 3;
      id = 'pie-compartido';
      razon = 'invertir-poco-ahorro';
    } else {
      regla = 4;
      id = perfil.hayGrupo ? 'grupo-invertir' : 'individual-invertir';
      razon = perfil.hayGrupo ? 'invertir-ahorro' : 'invertir-ahorro-sin-grupo';
    }
  }
  var numeros = numerosCamino(id, lista, perfil);
  // Regla 1: si no cumple la carga o Tu mes real, Todavía no.
  var todaviaNo = !numeros.evaluacion.cumple;
  return {
    id: id,
    regla: todaviaNo ? 1 : regla,
    razon: razon,
    numeros: numeros,
    todaviaNo: todaviaNo,
    otros: caminosDelModo(perfil.modo).filter(function (x) { return x !== id; })
  };
}

// Renta familiar con la que un dividendo ya es sostenible (hacia arriba, en miles).
function ingresoNecesario(perfil, dividendo) {
  var arriendo = perfil.modo === 'vivir' ? 0 : (perfil.arriendoActual || 0);
  var otras = perfil.otrasCuotas || 0;
  var r = Math.max(dividendo / LIMITE_HOLGADO, (dividendo + otras) / LIMITE_MAXIMO,
    (arriendo + otras + dividendo) / (1 - MINIMO_PARA_VIVIR));
  return Math.ceil(r / 1000) * 1000;
}

// Todavía no: hasta 3 cambios calculados que lo harían sostenible.
// Devuelve una lista de { tipo, ... } en este orden: cuotas, estudio, renta.
function cambiosTodaviaNo(perfil, id) {
  var lista = perfil.listaUF || LISTA_REFERENCIA_UF;
  var actual = numerosCamino(id, lista, perfil);
  var cambios = [];
  if ((perfil.otrasCuotas || 0) > 0) {
    var sinCuotas = Object.assign({}, perfil, { otrasCuotas: 0 });
    var ev = sostenible(sinCuotas, actual.dividendo);
    cambios.push({ tipo: 'cuotas', otras: perfil.otrasCuotas, cargaTotal: ev.cargaTotal,
      queda: ev.mes.queda, cumple: ev.cumple, evaluacion: ev });
  }
  if (lista > ESTUDIO_UF) {
    var e = numerosCamino(id, ESTUDIO_UF, perfil);
    cambios.push({ tipo: 'estudio', listaUF: ESTUDIO_UF, alEscriturar: e.alEscriturar, dividendo: e.dividendo,
      cumple: e.evaluacion.cumple, meses: e.meses, evaluacion: e.evaluacion });
  }
  var necesario = ingresoNecesario(perfil, actual.dividendo);
  var ingreso = ingresoTotal(perfil.sueldoPropio, perfil.sueldoPareja);
  // Con esa renta (sumada al sueldo propio) el camino ya es sostenible: este cambio siempre resuelve.
  var conRenta = Object.assign({}, perfil, { sueldoPropio: necesario, sueldoPareja: null });
  var evRenta = sostenible(conRenta, actual.dividendo);
  cambios.push({ tipo: 'renta', ingreso: necesario, falta: Math.max(0, necesario - ingreso),
    cumple: evRenta.cumple, evaluacion: evRenta });
  return cambios.slice(0, 3);
}

// "Recordarme en N meses": lo que tarda en juntar su parte de un estudio, entre 3 y 24 meses.
// Sin ahorro mensual, 6 meses.
function mesesRecordar(perfil, id) {
  var e = numerosCamino(id, ESTUDIO_UF, perfil);
  if (e.meses === null) return 6;
  return Math.min(24, Math.max(3, e.meses));
}

// Rangos de precio que elige la usuaria en Inicio (pregunta 4), en UF de lista.
var RANGOS_PRECIO = [
  { id: 'hasta-1500', desde: 1000, hasta: 1500 },
  { id: '1500-2000', desde: 1500, hasta: 2000 },
  { id: '2000-2500', desde: 2000, hasta: 2500 },
  { id: '2500-3000', desde: 2500, hasta: 3000 }
];
function buscarRango(id) {
  for (var i = 0; i < RANGOS_PRECIO.length; i++) if (RANGOS_PRECIO[i].id === id) return RANGOS_PRECIO[i];
  return null;
}
// Cada rango incluye su techo y no su piso: un departamento de UF 2.500 está en "UF 2.000 a 2.500".
function enRango(listaUF, rango) { return listaUF > rango.desde && listaUF <= rango.hasta; }

// El plazo de un rango: el camino recomendado en el piso y en el techo del rango.
// "hasta" es el caso conservador (el más caro del rango) y es el que define el camino y la evaluación.
function plazoRango(perfil, rango) {
  var desde = recomendarCamino(Object.assign({}, perfil, { listaUF: rango.desde }));
  var hasta = recomendarCamino(Object.assign({}, perfil, { listaUF: rango.hasta }));
  return { desde: desde, hasta: hasta };
}

// S11-F3: Todavía no con interruptores. Aplica los cambios activos y devuelve los números del camino.
// activos: { cuotas: terminar las otras cuotas, estudio: un estudio de UF 1.200, renta: la renta necesaria }.
// La renta se calcula después de los otros cambios, sobre lo que queda.
function simularCambios(perfil, id, activos) {
  var a = activos || {};
  var p = Object.assign({}, perfil);
  var lista = a.estudio ? ESTUDIO_UF : (perfil.listaUF || LISTA_REFERENCIA_UF);
  if (a.cuotas) p.otrasCuotas = 0;
  if (a.renta) {
    var antes = numerosCamino(id, lista, p);
    var necesario = ingresoNecesario(p, antes.dividendo);
    if (necesario > ingresoTotal(p.sueldoPropio, p.sueldoPareja)) { p.sueldoPropio = necesario; p.sueldoPareja = null; }
  }
  var n = numerosCamino(id, lista, p);
  return { numeros: n, perfil: p, listaUF: lista, cumple: n.evaluacion.cumple };
}

// ---------- Fichas informativas (S9-F4) ----------

// Arriendo con opción de compra, con las proporciones de Hogarízate (DF, 2023):
// en UF 3.500, mensualidad de UF 23,8 = 12,1 de arriendo + 11,7 que va al pie.
// La meta es el pie de 10 % (crédito con FOGAES), sin aporte inicial.
function arriendoConOpcion(listaUF) {
  var arriendo = ufAPesos(listaUF * 12.1 / 3500);
  var alPie = ufAPesos(listaUF * 11.7 / 3500);
  var meta = ufAPesos(listaUF * 0.10);
  return {
    arriendo: arriendo, alPie: alPie, mensualidad: arriendo + alPie, meta: meta,
    meses: mesesParaMeta(meta, alPie),
    dividendoDespues: ufAPesos(dividendoUF(listaUF, 'vivir'))
  };
}

// Respaldo familiar (referente: Barclays Family Springboard). El comprador pone 5 %, Bci presta 95 %
// y un familiar deja 10 % del precio en una cuenta bloqueada de Bci, que se libera cuando la deuda
// baja al 80 % del precio (sin plusvalía).
var RESPALDO = { credito: 0.95, usuario: 0.05, deposito: 0.10, liberaBajoDe: 0.80 };
function respaldoFamiliar(listaUF) {
  var credito = listaUF * RESPALDO.credito;
  var meses = 0;
  while (meses < SUPUESTOS.mesesBci &&
    saldoDeuda(credito, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci, meses, []) > listaUF * RESPALDO.liberaBajoDe) meses++;
  return {
    pie: ufAPesos(listaUF * RESPALDO.usuario),
    deposito: ufAPesos(listaUF * RESPALDO.deposito),
    dividendo: ufAPesos(cuotaFija(credito, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF),
    mesesLibera: meses
  };
}

// ---------- Comprar más barato (S9-F5) ----------

// Ajustes de precio: usado (−17,6 %, TOCTOC 2024) e IVA cero (−10 %, supuesto; el gobierno estima hasta ~14 %).
// 9-nov: un solo valor del IVA cero en toda la app; las piezas lo leen de aquí.
// El usado no tiene subsidio a la tasa (exige primera venta) ni IVA cero.
var MAS_BARATO = {
  usado: { descuento: 0.176, sinSubsidio: true },
  'iva-cero': { descuento: 0.10, sinSubsidio: false, desde: '2026-12-01', hasta: '2027-12-01' }
};

// Pie y dividendo de un departamento con un ajuste (o ninguno), y cuánto baja el pie frente
// al mismo departamento sin el ajuste. El usado no es compra en grupo: no lleva descuento de grupo.
function pieMasBarato(listaUF, tipoCompra, modo, unidades, ajuste) {
  var a = MAS_BARATO[ajuste];
  var lista = a ? listaUF * (1 - a.descuento) : listaUF;
  var precio = precioUF(lista, ajuste === 'usado' ? 'individual' : tipoCompra, unidades);
  var tasa = a && a.sinSubsidio ? SUPUESTOS.tasaSinSubsidio : SUPUESTOS.tasaBci;
  var pie = ufAPesos(pieUF(precio, modo));
  var pieSinAjuste = ufAPesos(pieUF(precioUF(listaUF, tipoCompra, unidades), modo));
  return {
    precio: ufAPesos(precio), pie: pie, pieSinAjuste: pieSinAjuste,
    baja: pieSinAjuste - pie,
    dividendo: ufAPesos(dividendoUF(precio, modo, tasa)),
    sinSubsidio: !!(a && a.sinSubsidio)
  };
}

// ---------- Registro de la sesión de prueba (S9-F6) ----------

// Texto para copiar. registro: { plazoAntes, plazoDespues, camino, explicacion, confianza, meInteresa, recordarme }.
function textoRegistro(registro, fechaISO) {
  var r = registro || {};
  var nombre = function (id) { return CAMINOS[id] ? CAMINOS[id].nombre : 'sin elegir'; };
  var valor = function (v, sufijo) { return v === null || v === undefined || v === '' ? 'sin dato' : v + (sufijo || ''); };
  return [
    'Primer Peldaño · Sesión de prueba',
    'Fecha: ' + (fechaISO ? formatoFecha(fechaISO) : 'sin dato'),
    'Plazo que cree necesitar antes: ' + valor(r.plazoAntes, ' años'),
    'Plazo que cree necesitar después: ' + valor(r.plazoDespues, ' años'),
    'Camino elegido: ' + nombre(r.camino),
    'Explicación del camino (0 a 3): ' + valor(r.explicacion),
    'Confianza (1 a 5): ' + valor(r.confianza),
    'Me interesa: ' + ((r.meInteresa || []).length ? r.meInteresa.map(nombre).join(', ') : 'nada'),
    'Pidió que le recordemos: ' + (r.recordarme ? 'en ' + r.recordarme + ' meses' : 'no'),
    '¿Volvería el próximo mes?: ' + valor(r.volveria),
    'Aviso que la haría volver: ' + valor(r.avisoVolver)
  ].join('\n');
}

// ---------- Sprint 10: ¿Y si me arrepiento?, Sostener ----------

// Si el comprador vende este mes, sin plusvalía: el orden de pago de la venta.
// 1) Bci cobra lo que se le debe; 2) los inversionistas reciben su parte del valor neto de costos
// (ganancias y pérdidas según la parte de cada uno); 3) los costos de venta; 4) el resto es del comprador.
function ventaHoy(precioUF, saldoBciUF, saldoParticipacionUF) {
  var costos = precioUF * SUPUESTOS.pctCostosVenta;
  var parteInversionistas = precioUF > 0 ? (saldoParticipacionUF || 0) / precioUF : 0;
  var inversionistas = (precioUF - costos) * parteInversionistas;
  var bci = Math.min(saldoBciUF, precioUF - costos - inversionistas);
  var usuario = precioUF - costos - inversionistas - bci;
  return {
    valor: ufAPesos(precioUF), bci: ufAPesos(bci), inversionistas: ufAPesos(inversionistas),
    costos: ufAPesos(costos), usuario: ufAPesos(usuario), faltaParaBci: ufAPesos(Math.max(0, saldoBciUF - bci))
  };
}

// Sostener: un mes de ahorro. pago = true si ahorró, false si tocó "Este mes no pude".
// Si no pudo y tiene el protector (una vez cada 6 meses), la racha se mantiene; si no, vuelve a 0.
// Lo ahorrado nunca se pierde: solo cambia la racha.
function protectorDisponible(mes, ultimoProtector) {
  return ultimoProtector === null || ultimoProtector === undefined || mes - ultimoProtector >= SUPUESTOS.protectorCadaMeses;
}
function mesesParaProtector(mes, ultimoProtector) {
  return protectorDisponible(mes, ultimoProtector) ? 0 : SUPUESTOS.protectorCadaMeses - (mes - ultimoProtector);
}
function registrarMes(r, pago) {
  var mes = (r.mes || 0) + 1;
  if (pago) return { mes: mes, racha: (r.racha || 0) + 1, ultimoProtector: r.ultimoProtector === undefined ? null : r.ultimoProtector, resultado: 'pago' };
  if (protectorDisponible(mes, r.ultimoProtector)) {
    return { mes: mes, racha: r.racha || 0, ultimoProtector: mes, resultado: 'protector' };
  }
  return { mes: mes, racha: 0, ultimoProtector: r.ultimoProtector, resultado: 'reinicio' };
}

// ---------- Sprint 13: volver a la app ----------

// S13-F4: el descuento del grupo según los cupos ya tomados, y cuántas personas faltan para el siguiente escalón.
// El descuento que muestra el proyecto supone que el grupo se completa; aquí se ve lo asegurado hoy.
function cuposParaMasDescuento(tomados, cupos) {
  var asegurado = descuentoGrupo(tomados);
  var escalones = [{ desde: 5, descuento: 0.03 }, { desde: 10, descuento: 0.05 }].filter(function (e) {
    return e.desde <= cupos && e.desde > tomados;
  });
  var siguiente = escalones[0] || null;
  return {
    asegurado: asegurado,
    faltan: siguiente ? siguiente.desde - tomados : 0,
    descuentoSiguiente: siguiente ? siguiente.descuento : null
  };
}

// S13-F4: etapas de la obra (la última es la escritura).
var ETAPAS_OBRA = ['Excavación', 'Obra gruesa', 'Terminaciones', 'Recepción', 'Escritura'];
// S22-F1: nombre del archivo de la foto referencial de cada etapa (fotos/obra/<nombre>.jpg).
var FOTOS_ETAPA = ['excavacion', 'obra-gruesa', 'terminaciones', 'recepcion', 'recepcion'];

// S13-F5: lo tuyo en el departamento, sin plusvalía: precio − lo que se debe a Bci − la parte de los inversionistas.
function patrimonioUF(precioUF, saldoBciUF, saldoParticipacionUF) {
  return Math.max(0, precioUF - saldoBciUF - (saldoParticipacionUF || 0));
}
// Cuánto creció en un mes: lo que se recompró más lo que bajó la deuda con Bci.
function crecimientoMesUF(precioUF, mes, modo, recompraUF, pctCredito) {
  var antes = saldoBciUF(precioUF, mes - 1, modo, pctCredito);
  var despues = saldoBciUF(precioUF, mes, modo, pctCredito);
  return (recompraUF || 0) + (antes - despues);
}

// S13-F1: los avisos del mes, según la etapa y lo que la usuaria dejó encendido.
// Cada aviso nombra la meta concreta. Máximo uno por semana: días 1, 8, 15 y 22. La cuota va el día 1 (nuevo comienzo).
// c: { etapa: 'camino' | 'pie' | 'departamento' | 'inversion', lugar, meses, cuota, ultimoMes ('pago'|'protector'|'reinicio'),
//      grupo: { faltan, descuentoSiguiente }, obra: { etapa }, crecioPesos, porcentajeTuyo, inversiones: [{ nombre, pesos }],
//      apagados: { cuota, grupo, obra, departamento } }
// ---------- Sprint 14: emoción, juego y grupo ----------

// S14-F2: lo que el grupo lleva entre todos en sus cuentas Bci (cada uno en la suya; es una suma, no un fondo común).
// otros: compradores que ya venían ahorrando; cuotaPromedio y meses: datos simulados del proyecto.
function totalGrupo(otros, cuotaPromedio, meses, tuAhorrado) {
  return Math.max(0, otros) * Math.max(0, cuotaPromedio) * Math.max(0, meses) + Math.max(0, tuAhorrado || 0);
}

// S14-F2: si al pasar de "antes" a "despues" compradores el grupo cruza un escalón de descuento (5 o 10).
// Devuelve { cupos, descuento } del escalón cruzado, o null.
function escalonCruzado(antes, despues) {
  var escalones = [{ cupos: 10, descuento: 0.05 }, { cupos: 5, descuento: 0.03 }];
  for (var i = 0; i < escalones.length; i++) {
    if (antes < escalones[i].cupos && despues >= escalones[i].cupos) return escalones[i];
  }
  return null;
}

// S14-F3: el aviso de un hito del pie, conectado con la obra cuando es compra en grupo.
var NOMBRE_HITO = { 0.25: 'Llevas un cuarto de tu pie.', 0.5: 'Vas en la mitad de tu pie.', 0.75: 'Llevas tres cuartos de tu pie.', 1: 'Juntaste tu pie.' };
function textoHito(hito, etapaObra) {
  var base = NOMBRE_HITO[hito] || '';
  var etapa = typeof etapaObra === 'number' ? ETAPAS_OBRA[etapaObra] : null;
  return etapa ? base + ' Tu edificio va en ' + etapa.toLowerCase() + '.' : base;
}

// S14-F4: días que faltan para una fecha (0 si ya pasó). hoy es un Date.
function diasHasta(fechaISO, hoy) {
  var fin = new Date(fechaISO + 'T00:00:00');
  var inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.max(0, Math.round((fin - inicio) / 86400000));
}

// ---------- Sprint 15: navegación y confianza ----------

// S15-F3: el crédito de siempre de cada modo (existe hoy en Bci). Es la vara de comparación.
function caminoBase(modo) { return modo === 'vivir' ? 'individual-vivir' : 'individual-invertir'; }

// S15-F3: qué caminos se muestran. No todos: el recomendado, siempre el crédito base,
// y a lo más un camino viable más. Los demás van a "Por qué no te mostramos otros", con su razón.
// rec: lo que devuelve recomendarCamino(perfil). Las fichas (arriendo con opción, respaldo familiar)
// no son caminos: son puentes o aceleradores, y no entran en esta lista.
// Devuelve { base, mostrados: [ids], noMostrados: [{ id, razon }] }.
var RAZON_NO_MOSTRADO = {
  'otro-modo-arrendar': 'es para comprar y arrendar.',
  'otro-modo-vivir': 'es para comprar y vivir.',
  'sin-grupo': 'no hay grupos en tu rango.',
  'no-alcanza': 'con tus números te dejaría muy justo.',
  'parecido': 'se parece a los que ya te mostramos.'
};
function caminosParaMostrar(perfil, rec) {
  var base = caminoBase(perfil.modo);
  var lista = perfil.listaUF || LISTA_REFERENCIA_UF;
  var mostrados = [rec.id];
  if (base !== rec.id) mostrados.push(base);
  var noMostrados = [];
  caminosDelModo(perfil.modo).forEach(function (id) {
    if (CAMINOS[id].ficha || mostrados.indexOf(id) !== -1) return;
    var razon = null;
    if (CAMINOS[id].grupo && !perfil.hayGrupo) razon = 'sin-grupo';
    else if (!numerosCamino(id, lista, perfil).evaluacion.cumple) razon = 'no-alcanza';
    else if (mostrados.length >= 3) razon = 'parecido';
    if (razon) noMostrados.push({ id: id, razon: razon });
    else mostrados.push(id);
  });
  // Lo que es de otro modo se nombra una vez, para que se entienda por qué no está.
  if (perfil.modo === 'vivir') noMostrados.push({ id: 'pie-compartido', razon: 'otro-modo-arrendar' });
  else noMostrados.push({ id: 'individual-vivir', razon: 'otro-modo-vivir' });
  return { base: base, mostrados: mostrados, noMostrados: noMostrados };
}

// S15-F3: cuánto gana un camino frente al crédito base. n y nBase: lo que devuelve numerosCamino.
// Devuelve { descuento (fracción del precio), mesesAntes, pieMenos (pesos al escriturar), enCuotas }.
function diferenciaConBase(id, n, nBase) {
  var c = CAMINOS[id];
  var mesesAntes = (typeof n.meses === 'number' && typeof nBase.meses === 'number') ? Math.max(0, nBase.meses - n.meses) : 0;
  return {
    descuento: Math.max(0, 1 - n.precioUF / nBase.precioUF),
    mesesAntes: mesesAntes,
    pieMenos: Math.max(0, nBase.alEscriturar - n.alEscriturar),
    enCuotas: !!c.grupo
  };
}

// S15-F7: la Hoja de Simulación de un crédito hipotecario (Decreto 49, vigente desde el 27-feb-2027):
// tasa, dividendo con y sin seguros, CAE y costo total del crédito.
// CAE: tasa interna de retorno mensual × 12 de los flujos del crédito: recibes el crédito menos los gastos
// de escritura (tasación, estudio de títulos, notaría, conservador e impuesto), y pagas 360 dividendos con seguros.
// Supuesto de diseño: todos los gastos de escritura se cuentan como gastos del crédito.
function simulacionCredito(precioUF, fraccionCredito, tasa) {
  var t = tasa || SUPUESTOS.tasaBci;
  var n = SUPUESTOS.mesesBci;
  var credito = precioUF * fraccionCredito;
  var cuota = cuotaFija(credito, t, n);
  var pago = cuota + SUPUESTOS.segurosUF;
  var gastos = gastosUF(precioUF);
  var recibe = credito - gastos;
  // Tasa mensual que iguala lo recibido con los pagos (bisección).
  var bajo = 0, alto = 0.05;
  for (var k = 0; k < 100; k++) {
    var medio = (bajo + alto) / 2;
    var valor = pago * (1 - Math.pow(1 + medio, -n)) / medio;
    if (valor > recibe) bajo = medio; else alto = medio;
  }
  return {
    creditoUF: credito,
    tasa: t,
    dividendoSinSeguros: ufAPesos(cuota),
    dividendoConSeguros: ufAPesos(pago),
    gastos: ufAPesos(gastos),
    cae: (bajo + alto) / 2 * 12,
    costoTotal: ufAPesos(pago * n + gastos),
    meses: n
  };
}

var TIPOS_AVISO = ['cuota', 'grupo', 'obra', 'departamento'];
function avisosDelMes(c) {
  var lista = [];
  var apagado = function (tipo) { return c.apagados && c.apagados[tipo]; };
  if (c.etapa === 'camino' && c.meses !== null && c.meses !== undefined) {
    lista.push({ tipo: 'cuota', titulo: 'Nuevo mes', texto: 'Faltan ' + c.meses + ' meses para tu departamento ' + c.lugar + '.' });
  }
  if (c.etapa === 'pie') {
    var nuevaRacha = c.ultimoMes === 'protector' || c.ultimoMes === 'reinicio';
    lista.push({ tipo: 'cuota', titulo: nuevaRacha ? 'Nuevo mes, nueva racha' : 'Nuevo mes: tu cuota de ' + formatoPesos(c.cuota),
      texto: (c.meses === 0 ? 'Ya juntaste tu pie para tu departamento ' : 'Faltan ' + c.meses + ' meses para tu departamento ') + c.lugar + '.' });
  }
  if (c.grupo && c.grupo.faltan > 0) {
    lista.push({ tipo: 'grupo', titulo: 'Tu grupo',
      texto: 'Con ' + (c.grupo.faltan === 1 ? '1 persona' : c.grupo.faltan + ' personas') + ' más, el descuento sube a ' + formatoPorcentaje(c.grupo.descuentoSiguiente, 0) + '.' });
  }
  if (c.obra) {
    lista.push({ tipo: 'obra', titulo: 'Tu obra', texto: 'Tu edificio va en ' + ETAPAS_OBRA[c.obra.etapa].toLowerCase() + '.' });
  }
  if (c.etapa === 'departamento' && c.crecioPesos > 0) {
    lista.push({ tipo: 'departamento', titulo: 'Lo tuyo creció ' + formatoPesos(c.crecioPesos) + ' este mes',
      texto: c.porcentajeTuyo < 100 ? 'Ya es tuyo el ' + c.porcentajeTuyo + ' % de tu departamento.' : 'Sin contar plusvalía.' });
  }
  (c.inversiones || []).forEach(function (x) {
    lista.push({ tipo: 'departamento', titulo: 'Recibiste ' + formatoPesos(x.pesos), texto: 'De ' + x.nombre + '.' });
  });
  var DIAS = [1, 8, 15, 22];
  return lista.filter(function (a) { return !apagado(a.tipo); }).slice(0, 4).map(function (a, i) {
    return Object.assign({}, a, { dia: DIAS[i] });
  });
}

// ---------- Sprint 16: avatar, tu equipo y la carrera a la puerta ----------
// El avatar no tiene género: todos los peinados, colores y accesorios son para todos.
var AVATAR_PELOS = ['corto', 'largo', 'moño', 'rizado', 'rapado', 'ondulado'];
var AVATAR_ACCESORIOS = ['lentes', 'audifonos', 'mochila', 'gorro', 'planta'];
// Relaciones de Tu equipo. Se pueden repetir (dos mamás, dos papás…). La pareja es siempre "tu pareja".
var RELACIONES_EQUIPO = ['pareja', 'mamá', 'papá', 'hermana', 'hermano', 'abuela', 'abuelo', 'tía', 'tío', 'amiga', 'amigo', 'mascota'];
var MAXIMO_EQUIPO = 12;

// Deja solo lo que el creador ofrece; lo que no se eligió queda en null (se dibuja neutro).
function normalizarAvatar(a) {
  if (!a || typeof a !== 'object') return null;
  function entero(v, max) { return Number.isInteger(v) && v >= 0 && v < max ? v : null; }
  return {
    piel: entero(a.piel, 5),
    pelo: AVATAR_PELOS.indexOf(a.pelo) !== -1 ? a.pelo : null,
    colorPelo: entero(a.colorPelo, 6),
    ropa: entero(a.ropa, 6),
    accesorios: Array.isArray(a.accesorios) ? AVATAR_ACCESORIOS.filter(function (x) { return a.accesorios.indexOf(x) !== -1; }) : [],
    mascota: a.mascota === 'perro' || a.mascota === 'gato' ? a.mascota : ''
  };
}

// Agrega a alguien a Tu equipo. Devuelve una lista nueva (o la misma si la relación no existe o está lleno).
function agregarMiembro(equipo, relacion, avatar) {
  var lista = Array.isArray(equipo) ? equipo : [];
  if (RELACIONES_EQUIPO.indexOf(relacion) === -1 || lista.length >= MAXIMO_EQUIPO) return lista;
  var siguiente = lista.reduce(function (m, x) { return Math.max(m, Number(String(x.id).replace(/\D/g, '')) || 0); }, 0) + 1;
  return lista.concat([{ id: 'm' + siguiente, relacion: relacion, avatar: normalizarAvatar(avatar) }]);
}

// Cuántas personas y mascotas acompañan a la usuaria (sin contarla a ella).
function contarEquipo(equipo, mascotaPropia) {
  var lista = Array.isArray(equipo) ? equipo : [];
  var mascotas = lista.filter(function (x) { return x.relacion === 'mascota'; }).length + (mascotaPropia ? 1 : 0);
  return { personas: lista.filter(function (x) { return x.relacion !== 'mascota'; }).length, mascotas: mascotas };
}

// Carrera a la puerta: 1 = en la puerta, 0 = en la partida. El camino más lento igual avanza un poco
// (la escala es 25 % más larga que el plazo mayor). Sin plazo (falta el ahorro) queda en la partida.
function posicionCarrera(meses, mesesMax) {
  if (meses === null || meses === undefined || !isFinite(meses)) return 0;
  if (meses <= 0) return 1;
  if (!(mesesMax > 0)) return 1;
  return Math.min(1, Math.max(0, 1 - meses / (mesesMax * 1.25)));
}

// ---------- Sprint 17: un solo plazo, números según lo decidido y piezas que se suman ----------

// Meses completos entre dos fechas ISO (hacia arriba; nunca negativo).
function mesesEntre(desdeISO, hastaISO) {
  var a = String(desdeISO).split('-').map(Number), b = String(hastaISO).split('-').map(Number);
  var m = (b[0] - a[0]) * 12 + (b[1] - a[1]) + (b[2] > a[2] ? 1 : 0);
  return Math.max(0, m);
}
// El mes de las llaves: "noviembre de 2027".
// S18-F2: la fecha de la demo después de N meses (mismo día, o el último del mes si no existe).
function fechaMasMeses(fechaISO, meses) {
  var p = String(fechaISO).split('-').map(Number);
  var t = p[1] - 1 + (meses || 0);
  var anio = p[0] + Math.floor(t / 12), mes = ((t % 12) + 12) % 12;
  var ultimo = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  var dos = function (n) { return (n < 10 ? '0' : '') + n; };
  return anio + '-' + dos(mes + 1) + '-' + dos(Math.min(p[2], ultimo));
}
function fechaLlaves(meses, hoyISO) {
  var p = String(hoyISO).split('-').map(Number);
  var t = p[1] - 1 + (meses || 0);
  return MESES[t % 12] + ' de ' + (p[0] + Math.floor(t / 12));
}
// S17-F1: el plazo es el mayor entre lo que toma juntar lo que falta y las fechas mínimas
// (la entrega del edificio, los 12 meses de la cuenta de vivienda). freno dice cuál manda.
// faltaPesos: lo que falta juntar; pisos: [{ meses, freno }]. basta: lo que alcanza con juntar al mes.
function plazoConPisos(faltaPesos, ahorroMensual, pisos) {
  var falta = Math.max(0, faltaPesos || 0);
  var mesesAhorro = falta === 0 ? 0 : mesesParaMeta(falta, ahorroMensual);
  var meses = mesesAhorro, freno = falta === 0 ? 'ninguno' : 'ahorro';
  (pisos || []).forEach(function (x) {
    if (x && x.meses > 0 && (meses === null || x.meses > meses)) { meses = x.meses; freno = x.freno; }
  });
  var basta = falta === 0 ? 0 : (freno === 'ahorro' || meses === null ? ahorroMensual : falta / meses);
  return { meses: meses, freno: freno, basta: basta, mesesAhorro: mesesAhorro };
}

// S17-F2: la precisión va con lo que la persona ya decidió (CLAUDE.md).
function formatoRedondeado(pesos) {
  var n = Math.abs(pesos || 0);
  if (n >= 1e6) {
    var m = Math.round(n / 1e5) / 10;
    return '$' + String(m).replace('.', ',') + ' millones';
  }
  return '$' + formatoMiles(Math.round(n / 1000)) + ' mil';
}
function formatoRango(desde, hasta) {
  var a = Math.min(desde, hasta), b = Math.max(desde, hasta);
  if (b >= 1e6) {
    var ma = Math.floor(a / 1e6), mb = Math.ceil(b / 1e6);
    if (ma === mb || a < 1e6) return formatoRedondeado(b);
    return 'entre $' + ma + ' y $' + mb + ' millones';
  }
  var ka = Math.floor(a / 10000) * 10, kb = Math.ceil(b / 10000) * 10;
  if (ka === kb) return formatoRedondeado(b);
  return 'entre $' + ka + ' y $' + kb + ' mil';
}
// etapa: 'rango' (valor = { desde, hasta }), 'redondeado' o 'exacto'.
function formatoSegunEtapa(valor, etapa) {
  if (etapa === 'rango') return formatoRango(valor.desde, valor.hasta);
  if (etapa === 'redondeado') return formatoRedondeado(valor);
  return formatoPesos(valor);
}

// S17-F7: las piezas del modo vivir. Cada una baja el precio, pone dinero en el pie o fija una fecha.
// existeHoy: false = propuesta del proyecto. cond: una línea, se muestra solo en "?".
var SUPUESTOS_PIEZAS = {
  descuentoGrupo: 0.05,       // lote de 10 (descuentoGrupo)
  // El DS1 (subsidio del Estado) va en DS1, abajo: dos tramos según el precio (S20-T2).
  bajaIVA: MAS_BARATO['iva-cero'].descuento, // el mismo de Comprar más barato
  finIVA: '2027-12-01',
  regalo: 300000,
  creditoSiempre: 0.80
};
var PIEZAS_VIVIR = {
  grupo: { nombre: 'Descuento en grupo', grupo: 'menos', existeHoy: false,
    cond: '5 % menos. Solo edificios en obra. Tu pie va a una cuenta Bci bloqueada.' },
  subsidio: { nombre: 'Subsidio del Estado', grupo: 'menos', existeHoy: true,
    cond: 'Hasta UF 4.000, sin otra vivienda. Cuenta de vivienda con UF 80 a 200 y Registro Social de Hogares.' },
  iva: { nombre: 'Sin IVA', grupo: 'menos', existeHoy: true,
    cond: 'Solo terminados antes del 17 de octubre de 2026. Firma la promesa hasta noviembre de 2027.' },
  regalo: { nombre: 'Regalo de tu familia', grupo: 'ayuda', existeHoy: false,
    cond: '$300 mil en una ocasión. Hasta nov-2027, si tu familia te dona por escritura, paga la mitad del impuesto.' },
  respaldo: { nombre: 'Respaldo familiar', grupo: 'ayuda', existeHoy: false,
    cond: 'Un familiar deja el 10 % en garantía y lo recupera. Sube lo que pagas al mes.' }
};
var ORDEN_PIEZAS = ['grupo', 'subsidio', 'iva', 'regalo', 'respaldo'];

// S20-T2: el DS1 en dos tramos (Región Metropolitana). Fuentes: guía del Serviu RM (tramo 3) y
// Res. Ex. 1.649 del Minvu, 29-oct-2026 (tramo 4). rentaMax: ingreso neto mensual del núcleo por número
// de integrantes (1, 2, 3, 4 o más); solo se exige a quien está sobre el 90 % del Registro Social de Hogares.
var DS1 = {
  tramo3: { hastaUF: 2200, ahorroUF: 80, mesesCuenta: 12, rentaMax: [1992086, 2788921, 3107655, 3426388] },
  tramo4: { hastaUF: 4000, ahorroUF: 200, mesesCuenta: 0, montoUF: 410, rentaMax: [2673511, 3496130, 3825177, 4154225] }
};
// Tramo 3: 850 − 0,375 × precio, entre UF 250 y 400 (de UF 1.600 a 2.200 son UF 250).
function montoDS1Tramo3(precioUF) { return Math.min(400, Math.max(250, 850 - 0.375 * precioUF)); }
// El DS1 para un precio (sin el subsidio) y un perfil: { tramo, montoUF, ahorroUF, mesesCuenta } o { bloqueo }.
// perfil.rshSobre90: false si la persona dice estar en el 90 % del Registro Social (sin tope de sueldo);
// sin respuesta se aplica el tope, que es el caso más común de un joven profesional.
function ds1Para(precioUF, perfil) {
  if (perfil && perfil.modo === 'arrendar')
    return { bloqueo: { razon: 'Para invertir', como: 'El DS1 exige no tener otra vivienda: no sirve para comprar y arrendar.' } };
  if (precioUF > DS1.tramo4.hastaUF + 1e-9) return { bloqueo: { razon: 'Sobre UF 4.000', como: 'Elige uno de hasta UF 4.000.' } };
  var tramo = precioUF <= DS1.tramo3.hastaUF + 1e-9 ? 3 : 4;
  var t = tramo === 3 ? DS1.tramo3 : DS1.tramo4;
  var ingreso = perfil ? (perfil.sueldoPropio || 0) + (perfil.sueldoPareja || 0) : 0;
  var n = perfil && perfil.sueldoPareja ? 2 : 1;
  if (perfil && perfil.rshSobre90 !== false && ingreso > t.rentaMax[n - 1])
    return { bloqueo: { razon: 'Sobre tope de sueldo', como: 'Tu sueldo pasa el tope de este tramo. Si estás en el 90 % del Registro Social, no hay tope.' } };
  return { tramo: tramo, montoUF: tramo === 3 ? montoDS1Tramo3(precioUF) : t.montoUF, ahorroUF: t.ahorroUF, mesesCuenta: t.mesesCuenta };
}

// depto: { listaUF, enObra, mesesEntrega, descuento (del grupo, opcional) }. Sin departamento elegido, comprar en grupo implica en obra.
function deptoPiezas(depto, on) {
  if (depto) return depto;
  return { listaUF: LISTA_REFERENCIA_UF, enObra: !!(on && on.grupo), mesesEntrega: 0 };
}
function precioConPiezas(listaUF, on, descuento) {
  var p = listaUF;
  if (on.grupo) p *= 1 - (descuento === undefined ? SUPUESTOS_PIEZAS.descuentoGrupo : descuento);
  if (on.iva) p *= 1 - SUPUESTOS_PIEZAS.bajaIVA;
  return p;
}
// Por qué una pieza no se suma (razón en dos palabras y cómo desbloquearla), o null.
function bloqueoPieza(id, on, depto, perfil) {
  var d = deptoPiezas(depto, on);
  if (id === 'grupo' && depto && !depto.enObra) return { razon: 'Terminado', como: 'Elige uno en obra.' };
  if (id === 'iva' && d.enObra) return { razon: 'En obra', como: 'Elige uno terminado.' };
  if (id === 'subsidio') {
    var p = precioConPiezas(d.listaUF, Object.assign({}, on, { subsidio: false }), d.descuento);
    var ds1 = ds1Para(p, perfil);
    if (ds1.bloqueo) return ds1.bloqueo;
  }
  return null;
}
// Todo lo que muestra Llega antes para un departamento (o un precio de referencia) y unas piezas.
// perfil: { ahorroActual, ahorroMensual }; hoyISO: fecha de la demo.
function calcularPiezas(perfil, onEntrada, depto, hoyISO) {
  var on = {};
  ORDEN_PIEZAS.forEach(function (id) { on[id] = !!(onEntrada && onEntrada[id]); });
  var d = deptoPiezas(depto, on);
  ORDEN_PIEZAS.forEach(function (id) { if (on[id] && bloqueoPieza(id, on, depto, perfil)) on[id] = false; });
  var S = SUPUESTOS_PIEZAS;
  var p = precioConPiezas(d.listaUF, on, d.descuento);
  var creditoMax = (on.respaldo ? 1 : MODOS.vivir.credito) * p;
  // S20-T2: el DS1 según su tramo. Crédito = precio − ahorro − subsidio, con tope de 90 %.
  var ds1 = on.subsidio ? ds1Para(p, perfil) : null;
  var subsidio = ds1 ? ds1.montoUF : 0;
  var pie = Math.max(ds1 ? ds1.ahorroUF : 0, p - creditoMax - subsidio);
  var gastos = gastosUF(p);
  var metaUF = pie + gastos;
  var tienesUF = ((perfil && perfil.ahorroActual) || 0) / SUPUESTOS.uf + (on.regalo ? S.regalo / SUPUESTOS.uf : 0);
  var faltaUF = Math.max(0, metaUF - tienesUF);
  var pisos = [];
  if (d.enObra && d.mesesEntrega > 0) pisos.push({ meses: d.mesesEntrega, freno: 'entrega' });
  if (ds1 && ds1.mesesCuenta > 0) pisos.push({ meses: ds1.mesesCuenta, freno: 'cuenta-vivienda' });
  var plazo = plazoConPisos(ufAPesos(faltaUF), perfil && perfil.ahorroMensual, pisos);
  var credito = p - subsidio - pie;
  var dividendo = ufAPesos(cuotaFija(credito, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
  var hoy = hoyISO || '2026-11-03';
  return {
    on: on, precioUF: p, creditoUF: credito, pctCredito: credito / p, subsidioUF: subsidio,
    ds1: ds1 ? { tramo: ds1.tramo, montoUF: ds1.montoUF, ahorroUF: ds1.ahorroUF, mesesCuenta: ds1.mesesCuenta } : null,
    pie: ufAPesos(pie), gastos: ufAPesos(gastos), meta: ufAPesos(metaUF), tienes: ufAPesos(tienesUF), falta: ufAPesos(faltaUF),
    meses: plazo.meses, freno: plazo.freno, basta: plazo.basta, avance: metaUF > 0 ? Math.min(1, tienesUF / metaUF) : 1,
    dividendo: dividendo,
    // Peor caso: sin subsidio a la tasa (si se acaban los cupos).
    dividendoSinSubsidio: ufAPesos(cuotaFija(credito, SUPUESTOS.tasaPeorCaso, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF),
    ivaTarde: on.iva && plazo.meses !== null && plazo.meses > mesesEntre(hoy, S.finIVA),
    llaves: plazo.meses === null ? null : fechaLlaves(plazo.meses, hoy)
  };
}
// El crédito de siempre (80 %), para la línea tachada.
function plazoCreditoSiempre(perfil, listaUF) {
  var meta = ufAPesos(listaUF * (1 - SUPUESTOS_PIEZAS.creditoSiempre) + gastosUF(listaUF));
  return plazoConPisos(meta - ((perfil && perfil.ahorroActual) || 0), perfil && perfil.ahorroMensual, []).meses;
}
// El efecto de sumar (o quitar) una pieza, en un solo número: "−1 mes", "−$5 millones" o "−$438 mil al mes".
function efectoPieza(id, perfil, on, depto, hoyISO) {
  var sin = Object.assign({}, on); sin[id] = false;
  var con = Object.assign({}, on); con[id] = true;
  var a = calcularPiezas(perfil, sin, depto, hoyISO), b = calcularPiezas(perfil, con, depto, hoyISO);
  if (a.meses !== null && b.meses !== null && a.meses - b.meses > 0) {
    var dm = a.meses - b.meses;
    return { texto: '−' + dm + ' ' + (dm === 1 ? 'mes' : 'meses'), meses: dm };
  }
  var dp = ufAPesos(a.precioUF - b.precioUF);
  if (dp > 100000) return { texto: '−' + formatoRedondeado(dp), meses: 0 };
  var db = (a.basta || 0) - (b.basta || 0);
  if (db > 20000) return { texto: '−' + formatoRedondeado(db) + ' al mes', meses: 0 };
  return { texto: 'Misma fecha', meses: 0 };
}
// La pieza que más acerca ahora. Nunca propone el respaldo familiar: depende de otra persona.
function mejorPieza(perfil, on, depto, hoyISO) {
  var a = calcularPiezas(perfil, on, depto, hoyISO), mejor = null;
  ORDEN_PIEZAS.forEach(function (id) {
    if (on[id] || id === 'respaldo' || bloqueoPieza(id, on, depto, perfil)) return;
    var con = Object.assign({}, on); con[id] = true;
    var b = calcularPiezas(perfil, con, depto, hoyISO);
    if (b.ivaTarde || a.meses === null || b.meses === null) return;
    var puntaje = (a.meses - b.meses) * 1e7 + ((a.basta || 0) - (b.basta || 0));
    if (puntaje > 30000 && (!mejor || puntaje > mejor.puntaje)) mejor = { id: id, puntaje: puntaje };
  });
  return mejor ? mejor.id : null;
}


// ---------- Sprint 21: hitos, misiones y siguiente paso ----------
// Funciones puras: reciben una foto del estado (s) que arma app.js:
// { grupo, numeros, cuentaVivienda, ahorrado, meta, preaprobado, asegurado, esTuyo,
//   ds1: null | { montoUF }, rsh, ds1Postulado, documentos, bajoLlave, ahorroAutomatico, equipo, eligio, cuotaPendiente }
var HITOS_CAMINO = {
  individual: ['numeros', 'cuenta', 'pie', 'preaprobacion', 'asegurar', 'es-tuyo'],
  grupo: ['numeros', 'cuenta', 'preaprobacion', 'pie', 'aprobacion', 'es-tuyo']
};
var HITOS = {
  numeros: { nombre: 'Tus números', accion: 'Cuéntanos tus números', gana: 'Sabes cuándo llegas', cuesta: '2 minutos' },
  cuenta: { nombre: 'Tu cuenta de vivienda', accion: 'Abre tu cuenta de vivienda', gana: 'Tu pie crece en UF', cuesta: '5 minutos' },
  pie: { nombre: 'Juntar tu pie', accion: 'Mira tu pie', gana: 'Llegas a tu meta', cuesta: 'Cada mes' },
  preaprobacion: { nombre: 'Preaprobación Bci', accion: 'Pide tu preaprobación', gana: 'Sabes cuánto te presta Bci', cuesta: '10 minutos' },
  asegurar: { nombre: 'Asegurar tu departamento', accion: 'Elige tu departamento', gana: 'Reservas tu departamento', cuesta: '15 minutos' },
  aprobacion: { nombre: 'Aprobación final', accion: 'Revisa tu aprobación', gana: 'Bci confirma tu crédito', cuesta: '15 minutos' },
  'es-tuyo': { nombre: 'Es tuyo', accion: 'Prepara tu firma', gana: 'Recibes tus llaves', cuesta: '1 día' }
};
// En grupo, el hito 3 también asegura tu cupo y el pie se paga en cuotas durante la obra.
var HITOS_GRUPO = {
  preaprobacion: { nombre: 'Preaprobación y tu cupo', accion: 'Pide tu preaprobación', gana: 'Aseguras tu cupo en el grupo' },
  pie: { nombre: 'Juntar tu pie en cuotas', gana: 'Pagas tu pie durante la obra' }
};
function datosHito(id, grupo) { return Object.assign({ id: id }, HITOS[id], grupo ? HITOS_GRUPO[id] : null); }

function hitoHecho(id, s) {
  switch (id) {
    case 'numeros': return !!s.numeros;
    case 'cuenta': return !!s.cuentaVivienda;
    case 'pie': return s.meta > 0 && s.ahorrado >= s.meta;
    case 'preaprobacion': return !!s.preaprobado;
    case 'asegurar': case 'aprobacion': return !!s.asegurado;
    case 'es-tuyo': return !!s.esTuyo;
  }
  return false;
}

// El hito actual es el primero que falta. Devuelve { indice (1 a 6), id, nombre, total, terminado, hitos }.
function hitoActual(s) {
  var ids = HITOS_CAMINO[s.grupo ? 'grupo' : 'individual'];
  var todo = !!s.esTuyo;
  var hechos = ids.map(function (id) { return todo || hitoHecho(id, s); });
  var i = hechos.indexOf(false);
  var terminado = i === -1;
  if (terminado) i = ids.length - 1;
  return {
    indice: i + 1, id: ids[i], nombre: datosHito(ids[i], s.grupo).nombre, total: ids.length, terminado: terminado,
    hitos: ids.map(function (id, k) {
      return Object.assign(datosHito(id, s.grupo), { estado: hechos[k] ? 'hecho' : (k === i && !terminado ? 'actual' : 'pendiente') });
    })
  };
}

// Fechas que importan (validadas el 7-nov-2026; CLAUDE.md).
var FECHAS_IMPORTAN = [
  { id: 'ds1', texto: 'Cierra la postulación al DS1', fecha: '2026-11-27' },
  { id: 'iva', texto: 'Último mes para firmar la promesa sin IVA', fecha: '2027-11-30' },
  { id: 'garantia', texto: 'Último día para pedir la garantía del Estado', fecha: '2028-05-31' }
];
var DIAS_PRONTO = 30;
function diasHastaFecha(fechaISO, hoy) {
  var a = new Date(fechaISO + 'T00:00:00'), b = new Date(hoy);
  b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((a - b) / 86400000);
}

// Misiones: en cualquier orden. Cada una dice a qué ayuda (etiqueta) y a qué hito sirve (ayudaA).
function misiones(s, hoy) {
  var lista = [];
  var m = function (id, titulo, etiqueta, ayudaA, hecho, extra) {
    lista.push(Object.assign({ id: id, titulo: titulo, etiqueta: etiqueta, ayudaA: ayudaA, hecho: !!hecho, fecha: null, requiere: [] }, extra));
  };
  if (s.ds1) {
    // Pasado el cierre del llamado, la misión queda para el próximo (sin fecha).
    var abierto = !hoy || diasHastaFecha(FECHAS_IMPORTAN[0].fecha, hoy) >= 0;
    m('ds1', abierto ? 'Postula al DS1' : 'Postula al próximo llamado del DS1', '+UF ' + Math.round(s.ds1.montoUF), 'pie', s.ds1Postulado,
      { fecha: abierto ? FECHAS_IMPORTAN[0].fecha : null, requiere: ['cuenta', 'rsh'] });
    m('rsh', 'Inscríbete en el Registro Social de Hogares', 'DS1', 'pie', s.rsh || s.ds1Postulado);
  }
  m('documentos', 'Completa tus datos y documentos', 'Preaprobación', 'preaprobacion', s.documentos || s.preaprobado);
  m('ahorro-auto', 'Activa el ahorro automático', 'Pie', 'pie', s.ahorroAutomatico);
  if (s.cuentaVivienda) m('bajo-llave', 'Guarda tu pie bajo llave', 'Protege', 'pie', s.bajoLlave);
  m('equipo', 'Suma a tu equipo', 'Ánimo', null, s.equipo);
  m('elegir', 'Elige tu camino y tu departamento', s.grupo ? 'Tu cupo' : 'Asegurar', s.grupo ? 'preaprobacion' : 'asegurar', s.eligio);
  var actual = hitoActual(s).id;
  var peso = function (x) {
    if (x.hecho) return 9;
    if (x.fecha && hoy && diasHastaFecha(x.fecha, hoy) >= 0 && diasHastaFecha(x.fecha, hoy) <= DIAS_PRONTO) return 0;
    if (x.ayudaA === actual) return 1;
    return 2;
  };
  return lista.map(function (x, i) { return { x: x, p: peso(x), i: i }; })
    .sort(function (a, b) { return a.p - b.p || a.i - b.i; })
    .map(function (o) { return o.x; });
}

// Lo que necesita cada hito antes de poder hacerse (misiones).
var REQUISITOS_HITO = { preaprobacion: ['documentos'], asegurar: ['elegir'], aprobacion: [] };

// La tarjeta de Inicio: 1) lo que vence pronto · 2) lo que destraba el siguiente hito ·
// 3) lo que más adelanta la fecha · 4) lo más rápido.
// Devuelve { tipo: 'hito' | 'mision' | 'cuota' | 'listo', id, titulo, gana, cuesta, plazo, hito: { indice, total } }.
function siguientePaso(s, hoy) {
  var h = hitoActual(s);
  var ms = misiones(s, hoy);
  var pend = ms.filter(function (x) { return !x.hecho; });
  var porId = {}; ms.forEach(function (x) { porId[x.id] = x; });
  var base = { hito: { indice: h.indice, total: h.total } };
  var deHito = function (id, plazo) {
    var d = datosHito(id, s.grupo);
    return Object.assign({ tipo: 'hito', id: id, titulo: d.accion, gana: d.gana, cuesta: d.cuesta, plazo: plazo || null }, base);
  };
  var deMision = function (x, plazo) {
    return Object.assign({ tipo: 'mision', id: x.id, titulo: x.titulo, gana: x.etiqueta, cuesta: CUESTA_MISION[x.id], plazo: plazo || x.fecha }, base);
  };
  if (h.terminado) return Object.assign({ tipo: 'listo', id: 'es-tuyo', titulo: 'Ya es tuyo', gana: null, cuesta: null, plazo: null }, base);
  // 1) Vence pronto: primero lo que la misión necesita.
  var pronto = pend.filter(function (x) { return x.fecha && hoy && diasHastaFecha(x.fecha, hoy) >= 0 && diasHastaFecha(x.fecha, hoy) <= DIAS_PRONTO; })[0];
  if (pronto) {
    for (var k = 0; k < pronto.requiere.length; k++) {
      var r = pronto.requiere[k];
      if (HITOS[r] && !hitoHecho(r, s)) return deHito(r, pronto.fecha);
      if (porId[r] && !porId[r].hecho) return deMision(porId[r], pronto.fecha);
    }
    return deMision(pronto);
  }
  // 2) Destraba el hito actual: sus requisitos y después el hito mismo.
  var req = (REQUISITOS_HITO[h.id] || []).concat(s.grupo && h.id === 'preaprobacion' ? ['elegir'] : []);
  for (var j = 0; j < req.length; j++) if (porId[req[j]] && !porId[req[j]].hecho) return deMision(porId[req[j]]);
  if (h.id !== 'pie') return deHito(h.id);
  // Juntar el pie es un hábito: el día de pago la tarjeta es la cuota.
  if (s.cuotaPendiente) return Object.assign({ tipo: 'cuota', id: 'cuota', titulo: 'Paga tu cuota de este mes', gana: 'Tu pie avanza', cuesta: '1 minuto', plazo: null }, base);
  // 3) Lo que más adelanta la fecha y 4) lo más rápido.
  var ayuda = pend.filter(function (x) { return x.ayudaA === 'pie'; })[0] || pend[0];
  return ayuda ? deMision(ayuda) : deHito('pie');
}
var CUESTA_MISION = { ds1: '20 minutos', rsh: '15 minutos', documentos: '5 minutos', 'bajo-llave': '1 minuto', 'ahorro-auto': '1 minuto', equipo: '2 minutos', elegir: '10 minutos' };


// S21-B5: "Tu pie está protegido": solo las capas reales para ese camino y esa etapa.
// s: { grupo, cuentaVivienda, bajoLlave, enVerde (promesa de un departamento en obra) }.
// Cada capa: { id, titulo, de, activa, propuesta }.
function capasProteccion(s) {
  var capas = [];
  var capa = function (id, titulo, de, activa, propuesta) { capas.push({ id: id, titulo: titulo, de: de, activa: !!activa, propuesta: !!propuesta }); };
  if (s.cuentaVivienda) {
    capa('bajo-llave', 'Separado y bajo llave', 'Avisas 30 días antes de sacar', s.bajoLlave);
    capa('uf', 'En UF', 'No lo come la inflación', true);
  }
  if (s.grupo) capa('bloqueada', 'Cuenta bloqueada', 'Nadie lo saca hasta la escritura', true, true);
  else if (s.enVerde) capa('poliza', 'Póliza de la inmobiliaria', 'Si no entrega, recuperas lo pagado', true);
  if (s.grupo) capa('salida', 'Salida sin multa', 'Si Bci no aprueba, vuelve entero', true, true);
  capa('mes-malo', 'Un mes malo', 'Lo ahorrado no se pierde', true);
  return capas;
}


// ---------- S22-F4: chips de Explorar con su regla ----------
// IVA cero (Ley 21.850): solo terminados con recepción definitiva antes del 17-oct-2026.
var CORTE_IVA_CERO = '2026-10-17';
var DFL2_MAX_M2 = 140;
var CHIPS_EXPLORAR = {
  'sin-iva': { nombre: 'Sin IVA', modos: ['vivir', 'arrendar'] },
  ds1: { nombre: 'Con DS1', modos: ['vivir'] },
  ds19: { nombre: 'Proyecto DS19', modos: ['vivir'] },
  dfl2: { nombre: 'DFL-2', modos: ['arrendar'] }
};
// ¿Cumple el departamento d del proyecto p la regla del chip?
function cumpleChip(chip, p, d) {
  switch (chip) {
    case 'sin-iva': return p.tipo === 'venta' && !!p.recepcionDefinitiva && p.recepcionDefinitiva < CORTE_IVA_CERO;
    case 'ds1': return d.listaUF <= DS1.tramo4.hastaUF + 1e-9;
    case 'ds19': return !!p.ds19;
    case 'dfl2': return d.m2 <= DFL2_MAX_M2;
  }
  return true;
}
// Lo que no se combina con el camino se bloquea con su razón en dos palabras (o null si se puede).
function bloqueoChip(chip, camino) {
  if (chip === 'sin-iva' && camino && camino.grupo) return 'Es en obra';
  if (chip === 'sin-iva' && camino && camino.inversionistas > 0) return 'Es en obra';
  return null;
}
function chipsDelModo(modo) {
  return Object.keys(CHIPS_EXPLORAR).filter(function (k) { return CHIPS_EXPLORAR[k].modos.indexOf(modo) !== -1; });
}


// ---------- S22-F2: Tu equipo anima ----------
// Por qué se manda el "¡Bien!" (hitos y misiones hechos). Sin nombres de personas: se dice la relación.
var MOTIVO_ANIMO = {
  cuenta: 'abrir tu cuenta de vivienda', pie: 'juntar tu pie', preaprobacion: 'tu preaprobación',
  asegurar: 'asegurar tu departamento', aprobacion: 'tu aprobación final', 'es-tuyo': 'tu departamento',
  ds1: 'postular al DS1', rsh: 'inscribirte en el Registro Social', documentos: 'completar tus documentos',
  'bajo-llave': 'guardar tu pie bajo llave', 'ahorro-auto': 'activar el ahorro automático', elegir: 'elegir tu departamento'
};
var MAXIMO_ANIMOS = 2;
// hechos: claves de hitos y misiones hechos hoy; dados: las que ya recibieron su "¡Bien!"; equipo: Tu equipo.
// Un "¡Bien!" por hito o misión, de alguien del equipo (las mascotas no escriben). Sin equipo, se anotan sin ánimo.
// Devuelve { nuevos: [{ clave, motivo, relacion, id }], dados }.
function animosNuevos(hechos, dados, equipo) {
  var ya = Array.isArray(dados) ? dados.slice() : [];
  var personas = (Array.isArray(equipo) ? equipo : []).filter(function (m) { return m.relacion !== 'mascota'; });
  var nuevos = [];
  (hechos || []).forEach(function (clave) {
    if (!MOTIVO_ANIMO[clave] || ya.indexOf(clave) !== -1) return;
    ya.push(clave);
    if (!personas.length) return;
    var m = personas[(ya.length - 1) % personas.length];
    nuevos.push({ clave: clave, motivo: MOTIVO_ANIMO[clave], relacion: m.relacion, id: m.id });
  });
  return { nuevos: nuevos.slice(-MAXIMO_ANIMOS), dados: ya };
}


// ---------- S22-F3: regalo de pie por enlace ----------
// El mensaje dice la meta y lo que falta sin montos exactos ni datos personales: porcentaje y meses.
function mensajeRegalo(o) {
  var pct = Math.max(0, Math.min(100, Math.round(o.pct || 0)));
  var falta = o.mesesFaltan > 0 ? ' y me faltan unos ' + (o.mesesFaltan === 1 ? '1 mes' : o.mesesFaltan + ' meses') : '';
  var antes = { 'Cumpleaños': 'Para mi cumpleaños', 'Navidad': 'Para esta Navidad', 'Titulación': 'Para mi titulación' }[o.ocasion];
  return (antes ? antes + ': e' : 'E') + 'stoy juntando el pie para mi primer departamento. Llevo el ' + pct + ' %' + falta + '. ' +
    'Si quieres ayudarme, puedes aportar aquí: ' + o.enlace;
}
// El enlace lleva un código al azar, nunca el nombre, el RUT, el sueldo ni el saldo.
function enlaceRegalo(codigo) { return 'https://primerpeldano.cl/regalo/' + String(codigo).replace(/[^a-z0-9]/gi, '').slice(0, 12); }

// ---------- S23: el departamento se construye con tus hitos y favoritos ----------
// Cada hito hecho suma una etapa al dibujo. 0 = terreno; 6 = es tuyo.
var ETAPAS_CONSTRUCCION = ['Terreno', 'Cimientos', 'Estructura', 'Muros', 'Ventanas', 'Techo y puerta', 'Es tuyo'];
function etapaConstruccion(h) {
  return h.terminado ? ETAPAS_CONSTRUCCION.length - 1 : h.hitos.filter(function (x) { return x.estado === 'hecho'; }).length;
}
// Guardar o sacar un departamento de favoritos. Devuelve una lista nueva, sin repetidos.
function alternarFavorito(lista, id) {
  var l = Array.isArray(lista) ? lista.filter(function (x, i, a) { return a.indexOf(x) === i; }) : [];
  return l.indexOf(id) === -1 ? l.concat([id]) : l.filter(function (x) { return x !== id; });
}

// ---------- S26: Tu mes como dueño ----------
// Todo lo que pagas al mes como dueño, frente a tu arriendo de hoy, y lo que se paga una sola vez.
// dividendo: en pesos, con seguros. m2: del departamento. precioUF: precio que pagas. arriendo: el de hoy (o null).
// ingreso y otrasCuotas: para "te queda para vivir" (opcionales).
function mesDueno(x) {
  var seguros = Math.round(SUPUESTOS.segurosUF * SUPUESTOS.uf);
  var gastosComunes = Math.round((x.m2 || 0) * SUPUESTOS.gastoComunM2 / 1000) * 1000;
  var arreglos = Math.round(x.precioUF * SUPUESTOS.uf * SUPUESTOS.arreglosAnual / 12 / 1000) * 1000;
  var total = x.dividendo + gastosComunes + arreglos;
  var r = {
    dividendo: x.dividendo - seguros, seguros: seguros, gastosComunes: gastosComunes, arreglos: arreglos, total: total,
    vsArriendo: x.arriendo > 0 ? total - x.arriendo : null,
    alFirmar: ufAPesos(gastosUF(x.precioUF)), mudanza: SUPUESTOS.mudanza
  };
  r.unaVez = r.alFirmar + r.mudanza;
  r.teQueda = x.ingreso > 0 ? x.ingreso - total - (x.otrasCuotas || 0) : null;
  return r;
}

if (typeof module !== 'undefined') module.exports = {
  mesDueno: mesDueno,
  ETAPAS_CONSTRUCCION: ETAPAS_CONSTRUCCION,
  etapaConstruccion: etapaConstruccion,
  alternarFavorito: alternarFavorito,
  mensajeRegalo: mensajeRegalo,
  enlaceRegalo: enlaceRegalo,
  animosNuevos: animosNuevos,
  MOTIVO_ANIMO: MOTIVO_ANIMO,
  CORTE_IVA_CERO: CORTE_IVA_CERO,
  CHIPS_EXPLORAR: CHIPS_EXPLORAR,
  cumpleChip: cumpleChip,
  bloqueoChip: bloqueoChip,
  chipsDelModo: chipsDelModo,
  capasProteccion: capasProteccion,
  HITOS_CAMINO: HITOS_CAMINO,
  HITOS: HITOS,
  FECHAS_IMPORTAN: FECHAS_IMPORTAN,
  diasHastaFecha: diasHastaFecha,
  hitoActual: hitoActual,
  misiones: misiones,
  siguientePaso: siguientePaso,
  LISTA_REFERENCIA_UF: LISTA_REFERENCIA_UF,
  MINIMO_PARA_VIVIR: MINIMO_PARA_VIVIR,
  UMBRAL_AHORRO: UMBRAL_AHORRO,
  ESTUDIO_UF: ESTUDIO_UF,
  CAMINOS: CAMINOS,
  caminosDelModo: caminosDelModo,
  mesReal: mesReal,
  sostenible: sostenible,
  numerosCamino: numerosCamino,
  recomendarCamino: recomendarCamino,
  ingresoNecesario: ingresoNecesario,
  cambiosTodaviaNo: cambiosTodaviaNo,
  simularCambios: simularCambios,
  RANGOS_PRECIO: RANGOS_PRECIO,
  buscarRango: buscarRango,
  enRango: enRango,
  plazoRango: plazoRango,
  mesesRecordar: mesesRecordar,
  arriendoConOpcion: arriendoConOpcion,
  RESPALDO: RESPALDO,
  respaldoFamiliar: respaldoFamiliar,
  MAS_BARATO: MAS_BARATO,
  pieMasBarato: pieMasBarato,
  textoRegistro: textoRegistro,
  MODOS: MODOS,
  descuentoGrupo: descuentoGrupo,
  rentaParticipacionUF: rentaParticipacionUF,
  pasoRecompra: pasoRecompra,
  simularRecompra: simularRecompra,
  saldoParticipacionUF: saldoParticipacionUF,
  mesesRecompra: mesesRecompra,
  plazoRecompra: plazoRecompra,
  ventaHoy: ventaHoy,
  cuposParaMasDescuento: cuposParaMasDescuento,
  ETAPAS_OBRA: ETAPAS_OBRA,
  FOTOS_ETAPA: FOTOS_ETAPA,
  patrimonioUF: patrimonioUF,
  crecimientoMesUF: crecimientoMesUF,
  TIPOS_AVISO: TIPOS_AVISO,
  avisosDelMes: avisosDelMes,
  protectorDisponible: protectorDisponible,
  mesesParaProtector: mesesParaProtector,
  registrarMes: registrarMes,
  participacionUF: participacionUF,
  evaluarCarga: evaluarCarga,
  flujoInversionUF: flujoInversionUF,
  preaprobacion: preaprobacion,
  INVERSION_MINIMA_UF: INVERSION_MINIMA_UF,
  faltaFinanciarUF: faltaFinanciarUF,
  inversionMinimaUF: inversionMinimaUF,
  validarInversion: validarInversion,
  limpiarCampoUF: limpiarCampoUF,
  leerMontoUF: leerMontoUF,
  cobradoUF: cobradoUF,
  cuotaMensualTotalUF: cuotaMensualTotalUF,
  capacidadCompraUF: capacidadCompraUF,
  formatoUF: formatoUF,
  cascadaMes: cascadaMes,
  saldoDeuda: saldoDeuda,
  saldoBciUF: saldoBciUF,
  pesosAUF: pesosAUF,
  diasEntre: diasEntre,
  mesesParaMeta: mesesParaMeta,
  mesesRestantes: mesesRestantes,
  mesesQueAdelanta: mesesQueAdelanta,
  caminoBase: caminoBase,
  caminosParaMostrar: caminosParaMostrar,
  RAZON_NO_MOSTRADO: RAZON_NO_MOSTRADO,
  diferenciaConBase: diferenciaConBase,
  simulacionCredito: simulacionCredito,
  totalGrupo: totalGrupo,
  escalonCruzado: escalonCruzado,
  textoHito: textoHito,
  diasHasta: diasHasta,
  diasDeAhorro: diasDeAhorro,
  HITOS_AHORRO: HITOS_AHORRO,
  hitoSiguiente: hitoSiguiente,
  cambiosDesdeVisita: cambiosDesdeVisita,
  metaDelMes: metaDelMes,
  hitosAlcanzados: hitosAlcanzados,
  sumarMes: sumarMes,
  ingresoTotal: ingresoTotal,
  carga: carga,
  cargaRedondeada: cargaRedondeada,
  nivelCarga: nivelCarga,
  ingresoMinimo: ingresoMinimo,
  ingresoFaltante: ingresoFaltante,
  mejorAlternativa: mejorAlternativa,
  leerMonto: leerMonto,
  formatoMiles: formatoMiles,
  arriendoNeto: arriendoNeto,
  rentabilidad: rentabilidad,
  RENTABILIDAD_MINIMA: RENTABILIDAD_MINIMA,
  DS1: DS1, ds1Para: ds1Para, montoDS1Tramo3: montoDS1Tramo3,
  pasaFiltroIA: pasaFiltroIA,
  ahorroPorUnirseUF: ahorroPorUnirseUF,
  porFinanciarUF: porFinanciarUF,
  avance: avance,
  porcentajeEntero: porcentajeEntero,
  formatoPorcentaje: formatoPorcentaje,
  formatoFecha: formatoFecha,
  resumenProyecto: resumenProyecto,
  SUPUESTOS: SUPUESTOS,
  precioUF: precioUF,
  pieUF: pieUF,
  gastosUF: gastosUF,
  alEscriturarUF: alEscriturarUF,
  cuotaFija: cuotaFija,
  dividendoUF: dividendoUF,
  totalMesUF: totalMesUF,
  repartoUF: repartoUF,
  ufAPesos: ufAPesos,
  formatoPesos: formatoPesos,
  escenario: escenario,
  AVATAR_PELOS: AVATAR_PELOS,
  AVATAR_ACCESORIOS: AVATAR_ACCESORIOS,
  RELACIONES_EQUIPO: RELACIONES_EQUIPO,
  normalizarAvatar: normalizarAvatar,
  agregarMiembro: agregarMiembro,
  contarEquipo: contarEquipo,
  posicionCarrera: posicionCarrera,
  mesesEntre: mesesEntre,
  fechaLlaves: fechaLlaves,
  fechaMasMeses: fechaMasMeses,
  razonTodaviaNo: razonTodaviaNo,
  unidadesHoy: unidadesHoy,
  plazoConPisos: plazoConPisos,
  formatoRedondeado: formatoRedondeado,
  formatoRango: formatoRango,
  formatoSegunEtapa: formatoSegunEtapa,
  SUPUESTOS_PIEZAS: SUPUESTOS_PIEZAS,
  PIEZAS_VIVIR: PIEZAS_VIVIR,
  ORDEN_PIEZAS: ORDEN_PIEZAS,
  bloqueoPieza: bloqueoPieza,
  precioConPiezas: precioConPiezas,
  calcularPiezas: calcularPiezas,
  plazoCreditoSiempre: plazoCreditoSiempre,
  efectoPieza: efectoPieza,
  mejorPieza: mejorPieza
};
