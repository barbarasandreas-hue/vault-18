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

if (typeof module !== 'undefined') module.exports = {
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
