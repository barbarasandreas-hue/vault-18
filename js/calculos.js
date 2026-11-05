// Todas las fórmulas de Primer Peldaño.
// Los montos se calculan en UF y se convierten a pesos al final.
// Las pantallas solo llaman a estas funciones; nunca calculan por su cuenta.

var SUPUESTOS = {
  uf: 41065,                // pesos por UF
  pctGastos: 0.02,          // gastos de escritura
  tasaBci: 0.039,           // anual, con subsidio a la tasa (4,5 % − 0,6; Ley 21.836)
  tasaSinSubsidio: 0.045,   // anual, si se acaban los cupos del subsidio
  mesesBci: 360,
  segurosUF: 0.7,           // al mes
  rentaParticipacion: 0.06, // anual en UF, sobre la parte de los inversionistas (pie compartido)
  topeRecompraMeses: 84,    // si a los 84 meses no recompró todo, refinancia o vende
  topeFogaesUF: 4500,       // la garantía FOGAES llega a viviendas de hasta UF 4.500
  pctCostosVenta: 0.02,     // supuesto de diseño: corretaje y gastos si el comprador vende
  protectorCadaMeses: 6     // "Este mes no pude": una vez cada 6 meses
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
  var u = unidades === undefined ? 10 : unidades;
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
    descuento: tipo === 'lote' ? descuentoGrupo(unidades === undefined ? 10 : unidades) : 0,
    pctCredito: m.credito,
    pctUsuario: m.usuario,
    pctInversionistas: m.inversionistas,
    pie: usuario,
    gastos: gastos,
    alEscriturar: usuario + gastos,
    dividendo: dividendo,
    dividendoSinSubsidio: ufAPesos(dividendoUF(precio, modo, SUPUESTOS.tasaSinSubsidio)),
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

// En modo arrendar la IA solo muestra departamentos con rentabilidad neta de 3,9 % o más
// (la tasa con subsidio: bajo eso, el crédito cuesta más de lo que rinde el arriendo).
var RENTABILIDAD_MINIMA = 0.039;
function pasaFiltroIA(rent) { return rent >= RENTABILIDAD_MINIMA; }

// Ahorro por unirse a una compra en grupo: el descuento según las unidades del lote.
function ahorroPorUnirseUF(listaUF, unidades) {
  return listaUF * descuentoGrupo(unidades === undefined ? 10 : unidades);
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
function resumenProyecto(proyecto, departamentos, cuposExtra, invertidoUF, modo) {
  var tipoCompra = proyecto.tipo === 'conjunto' ? 'lote' : 'individual';
  var listaUF = departamentos[0].listaUF;
  var e = escenario(listaUF, tipoCompra, modo, proyecto.cupos);

  var rentabilidades = departamentos.map(function (d) {
    return rentabilidad(d.arriendoEstimadoIA, precioUF(d.listaUF, tipoCompra, proyecto.cupos));
  });
  var rentMinima = Math.min.apply(null, rentabilidades);

  var tomados = proyecto.cuposTomados + (cuposExtra || 0);
  var porFinanciar = porFinanciarUF(e.precioUF);
  var financiadas = proyecto.ufFinanciadas + (invertidoUF || 0);

  return {
    tipoCompra: tipoCompra,
    escenario: e,
    ahorro: proyecto.tipo === 'conjunto' ? ufAPesos(ahorroPorUnirseUF(listaUF, proyecto.cupos)) : 0,
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

// Hitos de la barra de avance del ahorro.
var HITOS_AHORRO = [0.25, 0.5, 0.75, 1];

// Hitos ya alcanzados con lo ahorrado (por ejemplo [0.25, 0.5]).
function hitosAlcanzados(ahorrado, meta) {
  var a = avance(ahorrado, meta);
  return HITOS_AHORRO.filter(function (h) { return a >= h; });
}

// Un mes más de ahorro, sin pasarse de la meta.
function sumarMes(ahorrado, ahorroMensual, meta) {
  return Math.min(meta, (ahorrado || 0) + (ahorroMensual || 0));
}

// ---------- Inicio: ¿cuánto puedo comprar? (S5-F0) ----------

// Mayor precio, en UF enteras hacia abajo, con un dividendo de 25 % o menos del ingreso (holgado).
// Dividendo = crédito del modo (90 % vivir, 80 % arrendar) a 3,9 % y 360 meses + seguros.
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

function saldoBciUF(precio, cuotasPagadas, modo) {
  return saldoDeuda(precio * modoDe(modo).credito, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci, cuotasPagadas, []);
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
  'grupo-vivir': { nombre: 'A · Compra en grupo', corto: 'Compra en grupo', modo: 'vivir', grupo: true,
    credito: 0.90, usuario: 0.10, inversionistas: 0, existeHoy: false },
  'individual-vivir': { nombre: 'Crédito con garantía del Estado', corto: 'Crédito con FOGAES', modo: 'vivir', grupo: false,
    credito: 0.90, usuario: 0.10, inversionistas: 0, existeHoy: true },
  'grupo-pie-compartido': { nombre: 'A + B · Grupo y pie compartido', corto: 'Grupo y pie compartido', modo: 'arrendar', grupo: true,
    credito: 0.80, usuario: 0.05, inversionistas: 0.15, existeHoy: false },
  'pie-compartido': { nombre: 'B · Pie compartido', corto: 'Pie compartido', modo: 'arrendar', grupo: false,
    credito: 0.80, usuario: 0.05, inversionistas: 0.15, existeHoy: false },
  'grupo-invertir': { nombre: 'A · Compra en grupo', corto: 'Compra en grupo', modo: 'arrendar', grupo: true,
    credito: 0.80, usuario: 0.20, inversionistas: 0, existeHoy: false },
  'individual-invertir': { nombre: 'Crédito al 80 %', corto: 'Crédito al 80 %', modo: 'arrendar', grupo: false,
    credito: 0.80, usuario: 0.20, inversionistas: 0, existeHoy: true },
  'arriendo-opcion': { nombre: 'Arriendo con opción de compra', corto: 'Arriendo con opción de compra', modo: 'vivir',
    ficha: true, existeHoy: true },
  'respaldo-familiar': { nombre: 'Respaldo familiar', corto: 'Respaldo familiar', modo: 'ambos',
    ficha: true, existeHoy: false }
};

// Los caminos de cada modo, en el orden en que se muestran.
function caminosDelModo(modo) {
  return modo === 'vivir'
    ? ['grupo-vivir', 'individual-vivir', 'arriendo-opcion', 'respaldo-familiar']
    : ['grupo-pie-compartido', 'pie-compartido', 'grupo-invertir', 'individual-invertir', 'respaldo-familiar'];
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
  var sinSubsidio = ufAPesos(cuotaFija(precio * c.credito, SUPUESTOS.tasaSinSubsidio, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
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
      id = perfil.hayGrupo ? 'grupo-pie-compartido' : 'pie-compartido';
      razon = perfil.hayGrupo ? 'invertir-poco-ahorro' : 'invertir-poco-ahorro-sin-grupo';
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

// Ajustes de precio: usado (−17,6 %, TOCTOC 2024) e IVA cero (−6,5 %, estimación de Hacienda).
// El usado no tiene subsidio a la tasa (exige primera venta) ni IVA cero.
var MAS_BARATO = {
  usado: { descuento: 0.176, sinSubsidio: true },
  'iva-cero': { descuento: 0.065, sinSubsidio: false, desde: '2026-12-01', hasta: '2027-12-01' }
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
    'Pidió que le recordemos: ' + (r.recordarme ? 'en ' + r.recordarme + ' meses' : 'no')
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

if (typeof module !== 'undefined') module.exports = {
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
  HITOS_AHORRO: HITOS_AHORRO,
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
  escenario: escenario
};
