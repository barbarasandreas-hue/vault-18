// Datos de ejemplo de Primer Peldaño (simulados, modelo v3).
// Los proyectos llevan nombre de edificio, nunca de personas.
// Comunas donde el arriendo de un departamento chico rinde 4,5 % o más bruto (Transsa, 2025):
// Independencia, Quinta Normal, Recoleta y Estación Central.

// Fecha de referencia de la demo: los días para el cierre se cuentan desde aquí,
// para que los números no cambien según el día en que se muestre la app.
var FECHA_REFERENCIA = '2026-11-03';

// tipo: 'conjunto' = compra en grupo (descuento de 3 % desde 5 unidades y 5 % desde 10)
//       'financiamiento' = pie compartido (un departamento a precio de lista; inversionistas ponen el 15 %)
// cupos: compradores que caben en el lote; cuposTomados: los que ya se unieron.
// ufFinanciadas: parte de la participación de 15 % que ya pusieron inversionistas.
// cierre: fecha en que se cierra el proyecto.
var PROYECTOS = [
  { id: 'mirador-independencia', nombre: 'Edificio Mirador Independencia', comuna: 'Independencia', tipo: 'conjunto',
    cupos: 10, cuposTomados: 6, ufFinanciadas: 0, cierre: '2026-12-15' },
  { id: 'parque-quinta-normal', nombre: 'Edificio Parque Quinta Normal', comuna: 'Quinta Normal', tipo: 'conjunto',
    cupos: 8, cuposTomados: 5, ufFinanciadas: 0, cierre: '2027-01-20' },
  { id: 'portal-estacion', nombre: 'Edificio Portal Estación', comuna: 'Estación Central', tipo: 'conjunto',
    cupos: 10, cuposTomados: 4, ufFinanciadas: 0, cierre: '2027-02-26' },
  { id: 'altos-recoleta', nombre: 'Edificio Altos de Recoleta', comuna: 'Recoleta', tipo: 'conjunto',
    cupos: 10, cuposTomados: 3, ufFinanciadas: 0, cierre: '2026-12-30' },
  { id: 'plaza-estacion', nombre: 'Edificio Plaza Estación', comuna: 'Estación Central', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 108, cierre: '2027-02-10' },
  { id: 'jardin-independencia', nombre: 'Edificio Jardín Independencia', comuna: 'Independencia', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 220.5, cierre: '2027-01-31' },
  { id: 'barrio-recoleta', nombre: 'Edificio Barrio Recoleta', comuna: 'Recoleta', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 175.5, cierre: '2027-03-15' }
];

// Departamentos disponibles de cada proyecto (los que aún no tienen comprador).
// arriendoBruto: arriendo mensual estimado por la IA, en pesos (en la demo, valores precalculados
// por comuna y tipología; ver origenArriendo).
var ORIGEN_ARRIENDO = 'estimación IA (demo)';
var DEPARTAMENTOS = [
  // Mirador Independencia (lote de 10, 5 % de descuento): rinde 4,0 % a 4,1 % neto
  { id: 'mi-401', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 4, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 395000 },
  { id: 'mi-603', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 6, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 400000 },
  { id: 'mi-805', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 8, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 400000 },
  { id: 'mi-1102', proyectoId: 'mirador-independencia', comuna: 'Independencia', piso: 11, m2: 48, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 405000 },
  // Parque Quinta Normal (lote de 8, 3 % de descuento): 1 dormitorio, rinde 4,0 % neto
  { id: 'pq-302', proyectoId: 'parque-quinta-normal', comuna: 'Quinta Normal', piso: 3, m2: 38, dormitorios: 1, banos: 1, listaUF: 1750, arriendoBruto: 280000 },
  { id: 'pq-704', proyectoId: 'parque-quinta-normal', comuna: 'Quinta Normal', piso: 7, m2: 38, dormitorios: 1, banos: 1, listaUF: 1750, arriendoBruto: 280000 },
  { id: 'pq-1201', proyectoId: 'parque-quinta-normal', comuna: 'Quinta Normal', piso: 12, m2: 38, dormitorios: 1, banos: 1, listaUF: 1750, arriendoBruto: 285000 },
  // Portal Estación (lote de 10, 5 % de descuento): estudios, rinden 4,0 % neto
  { id: 'pt-208', proyectoId: 'portal-estacion', comuna: 'Estación Central', piso: 2, m2: 22, dormitorios: 0, banos: 1, listaUF: 1200, arriendoBruto: 190000 },
  { id: 'pt-715', proyectoId: 'portal-estacion', comuna: 'Estación Central', piso: 7, m2: 22, dormitorios: 0, banos: 1, listaUF: 1200, arriendoBruto: 195000 },
  // Altos de Recoleta: rinde menos de 3,9 % neto (la IA lo saca en modo arrendar)
  { id: 'ar-502', proyectoId: 'altos-recoleta', comuna: 'Recoleta', piso: 5, m2: 52, dormitorios: 2, banos: 2, listaUF: 2600, arriendoBruto: 370000 },
  { id: 'ar-901', proyectoId: 'altos-recoleta', comuna: 'Recoleta', piso: 9, m2: 52, dormitorios: 2, banos: 2, listaUF: 2600, arriendoBruto: 380000 },
  // Pie compartido: un departamento por proyecto
  { id: 'pe-601', proyectoId: 'plaza-estacion', comuna: 'Estación Central', piso: 6, m2: 22, dormitorios: 0, banos: 1, listaUF: 1200, arriendoBruto: 200000 },
  { id: 'ji-303', proyectoId: 'jardin-independencia', comuna: 'Independencia', piso: 3, m2: 50, dormitorios: 2, banos: 1, listaUF: 2450, arriendoBruto: 410000 },
  // Barrio Recoleta: rinde menos de 3,9 % neto
  { id: 'br-1004', proyectoId: 'barrio-recoleta', comuna: 'Recoleta', piso: 10, m2: 40, dormitorios: 1, banos: 1, listaUF: 1950, arriendoBruto: 285000 }
];

function departamentosDe(proyectoId) {
  return DEPARTAMENTOS.filter(function (d) { return d.proyectoId === proyectoId; });
}

function buscarProyecto(id) {
  for (var i = 0; i < PROYECTOS.length; i++) if (PROYECTOS[i].id === id) return PROYECTOS[i];
  return null;
}

if (typeof module !== 'undefined') module.exports = {
  FECHA_REFERENCIA: FECHA_REFERENCIA,
  ORIGEN_ARRIENDO: ORIGEN_ARRIENDO,
  PROYECTOS: PROYECTOS,
  DEPARTAMENTOS: DEPARTAMENTOS,
  departamentosDe: departamentosDe,
  buscarProyecto: buscarProyecto
};
