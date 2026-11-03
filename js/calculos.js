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
  return (fraccion * 100).toFixed(d).replace('.', ',') + ' %';
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
function resumenProyecto(proyecto, departamentos, cuposExtra) {
  var tipoCompra = proyecto.tipo === 'conjunto' ? 'lote' : 'individual';
  var listaUF = departamentos[0].listaUF;
  var e = escenario(listaUF, tipoCompra);

  var rentabilidades = departamentos.map(function (d) {
    return rentabilidad(d.arriendoBruto, precioUF(d.listaUF, tipoCompra));
  });
  var rentMinima = Math.min.apply(null, rentabilidades);

  var tomados = proyecto.cuposTomados + (cuposExtra || 0);
  var porFinanciar = porFinanciarUF(e.precioUF);

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
    porFinanciar: ufAPesos(porFinanciar),
    financiado: ufAPesos(proyecto.ufFinanciadas),
    avanceFinanciamiento: avance(proyecto.ufFinanciadas, porFinanciar)
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
  return Math.round(c * 1000) / 1000;
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

if (typeof module !== 'undefined') module.exports = {
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
