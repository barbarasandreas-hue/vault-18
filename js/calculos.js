// Todas las fórmulas de Primer Peldaño.
// Los montos se calculan en UF y se convierten a pesos al final.
// Las pantallas solo llaman a estas funciones; nunca calculan por su cuenta.

var SUPUESTOS = {
  uf: 41065,              // pesos por UF
  descuentoLote: 0.10,    // 10 % de descuento en compra en lote
  pctBci: 0.80,           // crédito hipotecario Bci
  pctInversionistas: 0.15,
  pctUsuario: 0.05,       // pie que pone el usuario
  pctGastos: 0.02,        // gastos de escritura
  tasaBci: 0.045,         // anual
  mesesBci: 360,
  segurosUF: 0.7,         // al mes
  tasaInversionistas: 0.08, // anual, sobre UF
  mesesInversionistas: 120
};

// Precio que paga el usuario: en lote se aplica el descuento.
function precioUF(listaUF, tipo) {
  return tipo === 'lote' ? listaUF * (1 - SUPUESTOS.descuentoLote) : listaUF;
}

function pieUF(precio) { return precio * SUPUESTOS.pctUsuario; }
function gastosUF(precio) { return precio * SUPUESTOS.pctGastos; }
function alEscriturarUF(precio) { return pieUF(precio) + gastosUF(precio); }

// Cuota fija (sistema francés). Tasa mensual = tasa anual / 12.
function cuotaFija(monto, tasaAnual, meses) {
  var i = tasaAnual / 12;
  if (i === 0) return monto / meses;
  return monto * i / (1 - Math.pow(1 + i, -meses));
}

// Dividendo Bci sobre el 80 % del precio, más seguros.
function dividendoUF(precio) {
  return cuotaFija(precio * SUPUESTOS.pctBci, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF;
}

// Cuota a los inversionistas sobre el 15 % del precio.
function cuotaInversionistasUF(precio) {
  return cuotaFija(precio * SUPUESTOS.pctInversionistas, SUPUESTOS.tasaInversionistas, SUPUESTOS.mesesInversionistas);
}

function totalMesUF(precio) {
  return dividendoUF(precio) + cuotaInversionistasUF(precio);
}

// De dónde sale el precio: 80 % Bci, 15 % inversionistas, 5 % usuario.
function repartoUF(precio) {
  return {
    bci: precio * SUPUESTOS.pctBci,
    inversionistas: precio * SUPUESTOS.pctInversionistas,
    usuario: precio * SUPUESTOS.pctUsuario
  };
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
// listaUF: precio de lista del departamento; tipo: 'lote' o 'individual'.
// Las cifras cuadran a la vista: el total al mes es la suma de sus partes
// redondeadas, y el 80 % de Bci (la parte más grande) absorbe el redondeo
// para que 80 + 15 + 5 sume exactamente el precio.
function escenario(listaUF, tipo) {
  var precio = precioUF(listaUF, tipo);
  var precioPesos = ufAPesos(precio);
  var dividendo = ufAPesos(dividendoUF(precio));
  var cuota = ufAPesos(cuotaInversionistasUF(precio));
  var reparto = repartoUF(precio);
  var inversionistas = ufAPesos(reparto.inversionistas);
  var usuario = ufAPesos(reparto.usuario);
  var bci = precioPesos - inversionistas - usuario;
  var gastos = ufAPesos(gastosUF(precio));
  return {
    listaUF: listaUF,
    precioUF: precio,
    precioLista: ufAPesos(listaUF),
    precio: precioPesos,
    pie: usuario,
    gastos: gastos,
    alEscriturar: usuario + gastos,
    dividendo: dividendo,
    cuotaInversionistas: cuota,
    totalMes: dividendo + cuota,
    reparto: {
      bci: bci,
      inversionistas: inversionistas,
      usuario: usuario
    }
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

// La IA solo muestra departamentos que rinden 4,5 % o más al año.
var RENTABILIDAD_MINIMA = 0.045;
function pasaFiltroIA(rent) { return rent >= RENTABILIDAD_MINIMA; }

// Ahorro por unirse a una compra en conjunto: 10 % del precio de lista.
function ahorroPorUnirseUF(listaUF) { return listaUF * SUPUESTOS.descuentoLote; }

// Lo que se reúne con inversionistas: 15 % del precio pagado.
function porFinanciarUF(precio) { return precio * SUPUESTOS.pctInversionistas; }

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
// proyecto.tipo: 'conjunto' (compra en conjunto, con 10 % de descuento)
// o 'financiamiento' (financiamiento del pie, a precio de lista).
// departamentos: los disponibles del proyecto (misma tipología y precio).
// cuposExtra: cupos que tomó el usuario en este teléfono (0 o 1).
// invertidoUF: lo que el usuario invirtió en este proyecto desde este teléfono.
function resumenProyecto(proyecto, departamentos, cuposExtra, invertidoUF) {
  var tipoCompra = proyecto.tipo === 'conjunto' ? 'lote' : 'individual';
  var listaUF = departamentos[0].listaUF;
  var e = escenario(listaUF, tipoCompra);

  var rentabilidades = departamentos.map(function (d) {
    return rentabilidad(d.arriendoBruto, precioUF(d.listaUF, tipoCompra));
  });
  var rentMinima = Math.min.apply(null, rentabilidades);

  var tomados = proyecto.cuposTomados + (cuposExtra || 0);
  var porFinanciar = porFinanciarUF(e.precioUF);
  var financiadas = proyecto.ufFinanciadas + (invertidoUF || 0);

  return {
    tipoCompra: tipoCompra,
    escenario: e,
    ahorro: proyecto.tipo === 'conjunto' ? ufAPesos(ahorroPorUnirseUF(listaUF)) : 0,
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

// Hasta 25 %: holgado. Sobre 25 % y hasta 30 %: en el límite. Sobre 30 %: no aprueba.
// Se compara la carga redondeada que ve el usuario.
var LIMITE_HOLGADO = 0.25;
var LIMITE_MAXIMO = 0.30;
var TOLERANCIA = 1e-9; // para que 0,25 y 0,30 no se pasen por redondeo binario
function nivelCarga(c) {
  var r = cargaRedondeada(c);
  if (r === null) return null;
  if (r <= LIMITE_HOLGADO + TOLERANCIA) return 'holgado';
  if (r <= LIMITE_MAXIMO + TOLERANCIA) return 'limite';
  return 'no-aprueba';
}

// Ingreso del hogar mínimo para que la carga no pase de 30 %.
function ingresoMinimo(totalMes) {
  return Math.ceil(totalMes / LIMITE_MAXIMO);
}

// Cuánto ingreso al mes le falta al hogar para postular (0 si ya alcanza).
function ingresoFaltante(totalMes, sueldoPropio, sueldoPareja) {
  return Math.max(0, ingresoMinimo(totalMes) - ingresoTotal(sueldoPropio, sueldoPareja));
}

// De varias opciones { id, totalMes }, la que deja la carga más baja,
// solo si mejora la carga actual. Devuelve { id, carga, nivel } o null.
function mejorAlternativa(cargaActual, opciones, sueldoPropio, sueldoPareja) {
  var mejor = null;
  opciones.forEach(function (o) {
    var c = carga(o.totalMes, sueldoPropio, sueldoPareja);
    if (c !== null && c < cargaActual && (!mejor || c < mejor.carga)) {
      mejor = { id: o.id, carga: c, nivel: nivelCarga(c) };
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

// Mayor precio, en UF enteras hacia abajo, con una carga de 25 % o menos (holgado).
// Total al mes = dividendo (80 %, 4,5 %, 360 meses) + seguros + cuota inversionistas (15 %, 8 %, 120 meses).
function capacidadCompraUF(sueldoPropio, sueldoPareja) {
  var ingreso = ingresoTotal(sueldoPropio, sueldoPareja);
  if (!ingreso || ingreso <= 0) return null;
  var presupuestoUF = LIMITE_HOLGADO * ingreso / SUPUESTOS.uf - SUPUESTOS.segurosUF;
  if (presupuestoUF <= 0) return 0;
  var factor = SUPUESTOS.pctBci * cuotaFija(1, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) +
    SUPUESTOS.pctInversionistas * cuotaFija(1, SUPUESTOS.tasaInversionistas, SUPUESTOS.mesesInversionistas);
  return Math.floor(presupuestoUF / factor + 1e-9);
}

// 2472 → "UF 2.472"; 337.5 → "UF 337,5".
function formatoUF(uf) {
  var decimas = Math.round(uf * 10);          // primero se redondea a un decimal
  var entero = Math.floor(decimas / 10);
  var decimal = decimas - entero * 10;
  return 'UF' + '\u00a0' + formatoMiles(entero) + (decimal ? ',' + decimal : '');
}

// ---------- Mi departamento: el mes (S5-F1) ----------

// Cómo se reparte el arriendo de un mes en la cuenta custodia (modo arrendar).
// Primero se descuentan la administración (10 %) y el mes vacío del año (1/12 de lo que queda),
// después se paga el dividendo, luego a los inversionistas, y el usuario completa la diferencia.
function cascadaMes(dividendo, cuotaInversionistas, arriendoBruto) {
  var bruto = Math.max(0, arriendoBruto || 0);
  var administracion = Math.round(bruto * 0.10);
  var vacancia = Math.round((bruto - administracion) / 12);
  var neto = bruto - administracion - vacancia;
  var total = dividendo + cuotaInversionistas;
  return {
    bruto: bruto,
    administracion: administracion,
    vacancia: vacancia,
    neto: neto,
    dividendo: dividendo,
    cubreDividendo: Math.min(neto, dividendo),
    cuotaInversionistas: cuotaInversionistas,
    cubreCuota: Math.min(Math.max(0, neto - dividendo), cuotaInversionistas),
    total: total,
    pone: Math.max(0, total - neto),        // lo que completa el usuario
    excedente: Math.max(0, neto - total)    // lo que sobra (se puede abonar)
  };
}

// Lo que pone el usuario un mes en modo arrendar (negativo = recibe la diferencia).
function loQuePoneUsuario(totalMes, arriendoBruto) {
  return totalMes - Math.round(arriendoNeto(arriendoBruto));
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

function saldoBciUF(precio, cuotasPagadas) {
  return saldoDeuda(precio * SUPUESTOS.pctBci, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci, cuotasPagadas, []);
}

function saldoInversionistasUF(precio, cuotasPagadas, abonos) {
  return saldoDeuda(precio * SUPUESTOS.pctInversionistas, SUPUESTOS.tasaInversionistas,
    SUPUESTOS.mesesInversionistas, cuotasPagadas, abonos);
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

// Cuota mensual que recibe el inversionista: cuota fija a UF + 8 % en 120 meses, en UF.
function cuotaInversionUF(montoUF) {
  return cuotaFija(montoUF, SUPUESTOS.tasaInversionistas, SUPUESTOS.mesesInversionistas);
}

// Revisa un monto a invertir. Devuelve null si sirve, o 'vacio', 'minimo' o 'maximo'.
function validarInversion(montoUF, faltaUF) {
  if (montoUF === null || montoUF === undefined || isNaN(montoUF)) return 'vacio';
  if (montoUF < INVERSION_MINIMA_UF) return 'minimo';
  if (montoUF > faltaUF + 1e-9) return 'maximo';
  return null;
}

// Lo cobrado a la fecha por una lista de inversiones { montoUF, cuotasCobradas }, en UF.
function cobradoUF(inversiones) {
  return (inversiones || []).reduce(function (suma, x) {
    return suma + cuotaInversionUF(x.montoUF) * Math.min(x.cuotasCobradas || 0, SUPUESTOS.mesesInversionistas);
  }, 0);
}

// Lo que recibe al mes por todas sus inversiones que aún no terminan, en UF.
function cuotaMensualTotalUF(inversiones) {
  return (inversiones || []).reduce(function (suma, x) {
    return suma + ((x.cuotasCobradas || 0) < SUPUESTOS.mesesInversionistas ? cuotaInversionUF(x.montoUF) : 0);
  }, 0);
}

if (typeof module !== 'undefined') module.exports = {
  INVERSION_MINIMA_UF: INVERSION_MINIMA_UF,
  faltaFinanciarUF: faltaFinanciarUF,
  cuotaInversionUF: cuotaInversionUF,
  validarInversion: validarInversion,
  cobradoUF: cobradoUF,
  cuotaMensualTotalUF: cuotaMensualTotalUF,
  capacidadCompraUF: capacidadCompraUF,
  formatoUF: formatoUF,
  cascadaMes: cascadaMes,
  loQuePoneUsuario: loQuePoneUsuario,
  saldoDeuda: saldoDeuda,
  saldoBciUF: saldoBciUF,
  saldoInversionistasUF: saldoInversionistasUF,
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
  cuotaInversionistasUF: cuotaInversionistasUF,
  totalMesUF: totalMesUF,
  repartoUF: repartoUF,
  ufAPesos: ufAPesos,
  formatoPesos: formatoPesos,
  escenario: escenario
};
