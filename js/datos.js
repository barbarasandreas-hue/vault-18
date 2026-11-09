// Datos de ejemplo de Primer Peldaño (simulados, modelo v3).
// Los proyectos llevan nombre de edificio, nunca de personas.
// Comunas donde el arriendo de un departamento chico rinde 4,5 % o más bruto (Transsa, 2025):
// Independencia, Quinta Normal, Recoleta y Estación Central.

// Fecha de referencia de la demo: los días para el cierre se cuentan desde aquí,
// para que los números no cambien según el día en que se muestre la app.
var FECHA_REFERENCIA = '2026-11-03';

// tipo: 'conjunto' = compra en grupo (descuento de 3 % desde 5 unidades y 5 % desde 10)
//       'financiamiento' = pie compartido (un departamento a precio de lista; inversionistas ponen el 15 %)
//       'venta' = departamento nuevo terminado, se compra solo (S18-F6). Solo en modo vivir; es el que puede ir sin IVA.
// cupos: compradores que caben en el lote; cuposTomados: los que ya se unieron.
// ufFinanciadas: parte de la participación de 15 % que ya pusieron inversionistas.
// inversionistas (simulado, pie compartido): cuántas personas ya pusieron parte de ese 15 %.
// cierre: fecha en que se cierra el proyecto.
// etapaObra (compra en grupo): 0 excavación, 1 obra gruesa, 2 terminaciones, 3 recepción, 4 escritura (ETAPAS_OBRA).
// entregaEstimada: fecha estimada de entrega del edificio.
// clienteBci (simulado): si la inmobiliaria es deudora o cliente de Bci; se informa en el detalle (conflicto de interés).
// fachada (S16-F7): color del Bci Kit (nombre del token) y pisos del edificio dibujado en la tarjeta.
// recepcionDefinitiva (S22-F4, terminados): fecha de la recepción municipal. IVA cero solo si es antes del 17-oct-2026.
// ds19 (S22-F4): proyecto de integración social del DS19 (simulado).
// grupo (simulado): cuota promedio y meses que lleva ahorrando el grupo, hace cuántos días se unió alguien y cuántos pagaron este mes.
var PROYECTOS = [
  { id: 'mirador-independencia', fachada: { color: 'blue-normal', pisos: 6 }, clienteBci: true, grupo: { cuotaPromedio: 650000, mesesAhorrando: 4, unidoHaceDias: 2, pagaronMes: 5 }, etapaObra: 1, entregaEstimada: '2027-12-15', nombre: 'Edificio Mirador Independencia', comuna: 'Independencia', tipo: 'conjunto',
    cupos: 10, cuposTomados: 6, ufFinanciadas: 0, cierre: '2026-12-15' },
  { id: 'parque-quinta-normal', fachada: { color: 'green-normal', pisos: 5 }, clienteBci: false, grupo: { cuotaPromedio: 600000, mesesAhorrando: 6, unidoHaceDias: 5, pagaronMes: 4 }, etapaObra: 2, entregaEstimada: '2027-06-30', nombre: 'Edificio Parque Quinta Normal', comuna: 'Quinta Normal', tipo: 'conjunto',
    cupos: 8, cuposTomados: 5, ufFinanciadas: 0, cierre: '2027-01-20' },
  { id: 'portal-estacion', fachada: { color: 'gray-semidark', pisos: 7 }, clienteBci: true, grupo: { cuotaPromedio: 450000, mesesAhorrando: 2, unidoHaceDias: 1, pagaronMes: 4 }, etapaObra: 0, entregaEstimada: '2028-03-31', nombre: 'Edificio Portal Estación', comuna: 'Estación Central', tipo: 'conjunto',
    cupos: 10, cuposTomados: 4, ufFinanciadas: 0, cierre: '2027-02-26' },
  { id: 'altos-recoleta', fachada: { color: 'blue-dark', pisos: 5 }, clienteBci: false, grupo: { cuotaPromedio: 700000, mesesAhorrando: 3, unidoHaceDias: 8, pagaronMes: 2 }, etapaObra: 1, entregaEstimada: '2027-10-31', nombre: 'Edificio Altos de Recoleta', comuna: 'Recoleta', tipo: 'conjunto',
    cupos: 10, cuposTomados: 3, ufFinanciadas: 0, cierre: '2026-12-30' },
  // S18-F6: más ejemplos para vivir, al menos 3 por rango. En obra (compra en grupo):
  { id: 'nodo-estacion', fachada: { color: 'blue-80', pisos: 6 }, clienteBci: true, grupo: { cuotaPromedio: 520000, mesesAhorrando: 3, unidoHaceDias: 3, pagaronMes: 4 }, etapaObra: 1, entregaEstimada: '2028-01-31', nombre: 'Edificio Nodo Estación', comuna: 'Estación Central', tipo: 'conjunto',
    cupos: 10, cuposTomados: 5, ufFinanciadas: 0, cierre: '2027-01-15' },
  { id: 'vista-independencia', ds19: true, fachada: { color: 'green-normal', pisos: 5 }, clienteBci: false, grupo: { cuotaPromedio: 480000, mesesAhorrando: 1, unidoHaceDias: 4, pagaronMes: 3 }, etapaObra: 0, entregaEstimada: '2028-05-31', nombre: 'Edificio Vista Independencia', comuna: 'Independencia', tipo: 'conjunto',
    cupos: 8, cuposTomados: 4, ufFinanciadas: 0, cierre: '2027-02-15' },
  { id: 'pasaje-recoleta', ds19: true, fachada: { color: 'gray-semidark', pisos: 4 }, clienteBci: true, grupo: { cuotaPromedio: 380000, mesesAhorrando: 2, unidoHaceDias: 6, pagaronMes: 2 }, etapaObra: 1, entregaEstimada: '2027-11-30', nombre: 'Edificio Pasaje Recoleta', comuna: 'Recoleta', tipo: 'conjunto',
    cupos: 6, cuposTomados: 2, ufFinanciadas: 0, cierre: '2027-01-31' },
  { id: 'terrazas-quinta', fachada: { color: 'blue-normal', pisos: 7 }, clienteBci: false, grupo: { cuotaPromedio: 760000, mesesAhorrando: 5, unidoHaceDias: 1, pagaronMes: 6 }, etapaObra: 2, entregaEstimada: '2027-09-30', nombre: 'Edificio Terrazas Quinta Normal', comuna: 'Quinta Normal', tipo: 'conjunto',
    cupos: 10, cuposTomados: 7, ufFinanciadas: 0, cierre: '2026-12-20' },
  // Terminados (se compran solos, se entregan al firmar):
  { id: 'acacias-quinta', recepcionDefinitiva: '2026-08-20', fachada: { color: 'green-dark', pisos: 5 }, clienteBci: true, etapaObra: 4, nombre: 'Edificio Las Acacias', comuna: 'Quinta Normal', tipo: 'venta',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 0, cierre: null },
  { id: 'aromos-estacion', recepcionDefinitiva: '2026-09-30', fachada: { color: 'blue-dark', pisos: 4 }, clienteBci: false, etapaObra: 4, nombre: 'Edificio Los Aromos', comuna: 'Estación Central', tipo: 'venta',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 0, cierre: null },
  { id: 'cerezos-recoleta', recepcionDefinitiva: '2026-11-05', fachada: { color: 'gray-dark', pisos: 4 }, clienteBci: true, etapaObra: 4, nombre: 'Edificio Los Cerezos', comuna: 'Recoleta', tipo: 'venta',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 0, cierre: null },
  { id: 'robles-independencia', recepcionDefinitiva: '2026-06-15', fachada: { color: 'blue-80', pisos: 6 }, clienteBci: false, etapaObra: 4, nombre: 'Edificio Los Robles', comuna: 'Independencia', tipo: 'venta',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 0, cierre: null },
  { id: 'plaza-estacion', fachada: { color: 'green-dark', pisos: 4 }, clienteBci: false, nombre: 'Edificio Plaza Estación', comuna: 'Estación Central', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 108, inversionistas: 6, cierre: '2027-02-10' },
  { id: 'jardin-independencia', fachada: { color: 'blue-80', pisos: 4 }, clienteBci: true, nombre: 'Edificio Jardín Independencia', comuna: 'Independencia', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 220.5, inversionistas: 11, cierre: '2027-01-31' },
  { id: 'barrio-recoleta', fachada: { color: 'gray-dark', pisos: 6 }, clienteBci: false, nombre: 'Edificio Barrio Recoleta', comuna: 'Recoleta', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 175.5, inversionistas: 9, cierre: '2027-03-15' }
];

// Departamentos disponibles de cada proyecto (los que aún no tienen comprador).
// arriendoEstimadoIA: arriendo mensual bruto estimado por la IA, en pesos. En la demo son valores
// precalculados por comuna y tipología, y origenArriendo lo dice.
var ORIGEN_ARRIENDO = 'estimación IA (demo)';
var DEPARTAMENTOS = [
  // Mirador Independencia (lote de 10, 5 % de descuento): rinde 4,0 % a 4,1 % neto
  { id: 'mi-401', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 4, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoEstimadoIA: 395000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'mi-603', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 6, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoEstimadoIA: 400000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'mi-805', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 8, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoEstimadoIA: 400000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'mi-1102', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 11, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoEstimadoIA: 405000, origenArriendo: ORIGEN_ARRIENDO },
  // Parque Quinta Normal (lote de 8, 3 % de descuento): 1 dormitorio, rinde 4,0 % neto
  { id: 'pq-302', proyectoId: 'parque-quinta-normal', comuna: 'Quinta Normal', piso: 3, m2: 38, dormitorios: 1, banos: 1, listaUF: 1750, arriendoEstimadoIA: 280000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'pq-704', proyectoId: 'parque-quinta-normal', comuna: 'Quinta Normal', piso: 7, m2: 38, dormitorios: 1, banos: 1, listaUF: 1750, arriendoEstimadoIA: 280000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'pq-1201', proyectoId: 'parque-quinta-normal', comuna: 'Quinta Normal', piso: 12, m2: 38, dormitorios: 1, banos: 1, listaUF: 1750, arriendoEstimadoIA: 285000, origenArriendo: ORIGEN_ARRIENDO },
  // Portal Estación (lote de 10, 5 % de descuento): estudios, rinden 4,0 % neto
  { id: 'pt-208', proyectoId: 'portal-estacion', comuna: 'Estación Central', piso: 2, m2: 22, dormitorios: 0, banos: 1, listaUF: 1200, arriendoEstimadoIA: 190000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'pt-715', proyectoId: 'portal-estacion', comuna: 'Estación Central', piso: 7, m2: 22, dormitorios: 0, banos: 1, listaUF: 1200, arriendoEstimadoIA: 195000, origenArriendo: ORIGEN_ARRIENDO },
  // Altos de Recoleta: rinde menos de 3,9 % neto (la IA lo saca en modo arrendar)
  { id: 'ar-502', proyectoId: 'altos-recoleta', comuna: 'Recoleta', piso: 5, m2: 52, dormitorios: 2, banos: 2, listaUF: 2600, arriendoEstimadoIA: 345000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ar-901', proyectoId: 'altos-recoleta', comuna: 'Recoleta', piso: 9, m2: 52, dormitorios: 2, banos: 2, listaUF: 2600, arriendoEstimadoIA: 350000, origenArriendo: ORIGEN_ARRIENDO },
  // S18-F6: nuevos para vivir (arriendo estimado igual que el resto, para comparar)
  { id: 'ne-504', proyectoId: 'nodo-estacion', comuna: 'Estación Central', piso: 5, m2: 44, dormitorios: 2, banos: 1, listaUF: 2150, arriendoEstimadoIA: 330000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'vi-302', proyectoId: 'vista-independencia', comuna: 'Independencia', piso: 3, m2: 40, dormitorios: 1, banos: 1, listaUF: 1900, arriendoEstimadoIA: 290000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'pr-201', proyectoId: 'pasaje-recoleta', comuna: 'Recoleta', piso: 2, m2: 34, dormitorios: 1, banos: 1, listaUF: 1450, arriendoEstimadoIA: 220000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'tq-603', proyectoId: 'terrazas-quinta', comuna: 'Quinta Normal', piso: 6, m2: 56, dormitorios: 2, banos: 2, listaUF: 2800, arriendoEstimadoIA: 430000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ac-402', proyectoId: 'acacias-quinta', comuna: 'Quinta Normal', piso: 4, m2: 46, dormitorios: 2, banos: 1, listaUF: 2300, arriendoEstimadoIA: 370000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ae-305', proyectoId: 'aromos-estacion', comuna: 'Estación Central', piso: 3, m2: 36, dormitorios: 1, banos: 1, listaUF: 1650, arriendoEstimadoIA: 270000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'cr-203', proyectoId: 'cerezos-recoleta', comuna: 'Recoleta', piso: 2, m2: 32, dormitorios: 1, banos: 1, listaUF: 1300, arriendoEstimadoIA: 205000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ri-506', proyectoId: 'robles-independencia', comuna: 'Independencia', piso: 5, m2: 54, dormitorios: 2, banos: 2, listaUF: 2700, arriendoEstimadoIA: 410000, origenArriendo: ORIGEN_ARRIENDO },
  // Pie compartido: un departamento por proyecto
  { id: 'pe-601', proyectoId: 'plaza-estacion', comuna: 'Estación Central', piso: 6, m2: 22, dormitorios: 0, banos: 1, listaUF: 1200, arriendoEstimadoIA: 200000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ji-303', proyectoId: 'jardin-independencia', comuna: 'Independencia', piso: 3, m2: 50, dormitorios: 2, banos: 1, listaUF: 2450, arriendoEstimadoIA: 410000, origenArriendo: ORIGEN_ARRIENDO },
  // Barrio Recoleta: rinde menos de 3,9 % neto
  { id: 'br-1004', proyectoId: 'barrio-recoleta', comuna: 'Recoleta', piso: 10, m2: 40, dormitorios: 1, banos: 1, listaUF: 1950, arriendoEstimadoIA: 275000, origenArriendo: ORIGEN_ARRIENDO }
];

// S22-F4: departamentos usados de ejemplo para el crédito de siempre (Bci presta el 80 %, sin subsidio a la tasa,
// sin garantía ni IVA cero; sirve el DS1 si cumple el tope). dfl2: si el departamento tiene el beneficio DFL-2.
var USADOS = [
  { id: 'us-indep-1', comuna: 'Independencia', anio: 2012, m2: 52, dormitorios: 2, banos: 1, listaUF: 2300, dfl2: true },
  { id: 'us-quinta-1', comuna: 'Quinta Normal', anio: 2008, m2: 45, dormitorios: 2, banos: 1, listaUF: 1900, dfl2: true },
  { id: 'us-recoleta-1', comuna: 'Recoleta', anio: 2015, m2: 36, dormitorios: 1, banos: 1, listaUF: 1600, dfl2: false },
  { id: 'us-estacion-1', comuna: 'Estación Central', anio: 2017, m2: 30, dormitorios: 1, banos: 1, listaUF: 1450, dfl2: true }
];

// 9-nov: arriendo con opción de compra (propuesta Bci). Departamentos terminados: te mudas al firmar el contrato.
// Un socio de Bci es dueño mientras arriendas; el precio de compra queda fijo en UF. Nombres de edificio, nunca de personas.
// arriendoEstimadoIA: arriendo de mercado, igual que en el resto de los departamentos.
var ARRIENDOS_OPCION = [
  { id: 'ao-maitenes', nombre: 'Edificio Los Maitenes', comuna: 'Independencia', anio: 2025, piso: 7, m2: 44, dormitorios: 2, banos: 1, listaUF: 2200, arriendoEstimadoIA: 360000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ao-brisas', nombre: 'Edificio Brisas de Recoleta', comuna: 'Recoleta', anio: 2026, piso: 4, m2: 36, dormitorios: 1, banos: 1, listaUF: 1650, arriendoEstimadoIA: 270000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ao-alameda', nombre: 'Edificio Alameda Poniente', comuna: 'Estación Central', anio: 2025, piso: 12, m2: 28, dormitorios: 0, banos: 1, listaUF: 1350, arriendoEstimadoIA: 230000, origenArriendo: ORIGEN_ARRIENDO },
  { id: 'ao-lilas', nombre: 'Edificio Las Lilas', comuna: 'Quinta Normal', anio: 2026, piso: 3, m2: 50, dormitorios: 2, banos: 2, listaUF: 2450, arriendoEstimadoIA: 390000, origenArriendo: ORIGEN_ARRIENDO }
];

function departamentosDe(proyectoId) {
  return DEPARTAMENTOS.filter(function (d) { return d.proyectoId === proyectoId; });
}

function buscarProyecto(id) {
  for (var i = 0; i < PROYECTOS.length; i++) if (PROYECTOS[i].id === id) return PROYECTOS[i];
  return null;
}

// S26: Cómo es vivir ahí. Referencias de cada comuna (no del edificio); se revisan en el mapa.
var BARRIOS = {
  'Independencia': { metro: 'Línea 3: Hospitales y Plaza Chacabuco', salud: 'Hospital Clínico de la U. de Chile y Hospital San José', verde: 'Plaza Chacabuco', vida: 'La Vega Central y Patronato, a pocas cuadras' },
  'Recoleta': { metro: 'Línea 2: Cerro Blanco, Cementerios y Einstein', salud: 'Clínica Dávila', verde: 'Cerro Blanco y el Parque Metropolitano', vida: 'Barrio Patronato y La Vega Central' },
  'Estación Central': { metro: 'Línea 1: Estación Central y Universidad de Santiago; trenes en la estación', salud: 'Centros de salud de la comuna', verde: 'Parque Quinta Normal, cerca', vida: 'Universidad de Santiago y comercio de Alameda' },
  'Quinta Normal': { metro: 'Línea 5: Gruta de Lourdes, Blanqueado y Quinta Normal', salud: 'Centros de salud de la comuna', verde: 'Parque Quinta Normal', vida: 'Museos del parque y ferias libres' }
};

if (typeof module !== 'undefined') module.exports = {
  FECHA_REFERENCIA: FECHA_REFERENCIA,
  ORIGEN_ARRIENDO: ORIGEN_ARRIENDO,
  PROYECTOS: PROYECTOS,
  DEPARTAMENTOS: DEPARTAMENTOS,
  USADOS: USADOS,
  ARRIENDOS_OPCION: ARRIENDOS_OPCION,
  BARRIOS: BARRIOS,
  departamentosDe: departamentosDe,
  buscarProyecto: buscarProyecto
};
