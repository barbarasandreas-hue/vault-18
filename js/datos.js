// Datos de ejemplo de Primer Peldaño (simulados).
// Los proyectos llevan nombre de edificio, nunca de personas.

// Departamento de referencia (precio de lista en UF) para el simulador de Inicio.
var DEPARTAMENTO_REFERENCIA = {
  arrendar: { listaUF: 2500 },
  vivir: { listaUF: 3000 }
};

// tipo: 'conjunto' = compra en conjunto (lote con 10 % de descuento)
//       'financiamiento' = financiamiento del pie (un departamento a precio de lista)
// cupos: compradores que caben; cuposTomados: los que ya se unieron.
// ufFinanciadas: parte del 15 % que ya aportaron inversionistas.
// cierre: fecha en que se cierra el proyecto.
var PROYECTOS = [
  { id: 'alto-nunoa', nombre: 'Edificio Alto Ñuñoa', comuna: 'Ñuñoa', tipo: 'conjunto',
    cupos: 10, cuposTomados: 6, ufFinanciadas: 0, cierre: '2026-12-15' },
  { id: 'mirador-santa-lucia', nombre: 'Edificio Mirador Santa Lucía', comuna: 'Santiago', tipo: 'conjunto',
    cupos: 8, cuposTomados: 5, ufFinanciadas: 0, cierre: '2027-01-20' },
  { id: 'vista-apoquindo', nombre: 'Edificio Vista Apoquindo', comuna: 'Las Condes', tipo: 'conjunto',
    cupos: 4, cuposTomados: 2, ufFinanciadas: 0, cierre: '2026-12-30' },
  { id: 'plaza-independencia', nombre: 'Edificio Plaza Independencia', comuna: 'Independencia', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 202.5, cierre: '2027-02-10' },
  { id: 'brisas-la-florida', nombre: 'Edificio Brisas de La Florida', comuna: 'La Florida', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 126, cierre: '2027-01-31' },
  { id: 'parque-macul', nombre: 'Edificio Parque Macul', comuna: 'Macul', tipo: 'financiamiento',
    cupos: 1, cuposTomados: 0, ufFinanciadas: 312, cierre: '2027-03-15' }
];

// Departamentos disponibles de cada proyecto (los que aún no tienen comprador).
// arriendoBruto: arriendo mensual estimado, en pesos.
var DEPARTAMENTOS = [
  // Alto Ñuñoa: rinde 4,8 % a 5,0 %
  { id: 'an-401', proyectoId: 'alto-nunoa', comuna: 'Ñuñoa', piso: 4, m2: 52, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 450000 },
  { id: 'an-603', proyectoId: 'alto-nunoa', comuna: 'Ñuñoa', piso: 6, m2: 52, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 455000 },
  { id: 'an-805', proyectoId: 'alto-nunoa', comuna: 'Ñuñoa', piso: 8, m2: 52, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 460000 },
  { id: 'an-1102', proyectoId: 'alto-nunoa', comuna: 'Ñuñoa', piso: 11, m2: 52, dormitorios: 2, banos: 1, listaUF: 2500, arriendoBruto: 470000 },
  // Mirador Santa Lucía: rinde 4,7 % a 4,8 %
  { id: 'msl-302', proyectoId: 'mirador-santa-lucia', comuna: 'Santiago', piso: 3, m2: 45, dormitorios: 1, banos: 1, listaUF: 2300, arriendoBruto: 400000 },
  { id: 'msl-704', proyectoId: 'mirador-santa-lucia', comuna: 'Santiago', piso: 7, m2: 45, dormitorios: 1, banos: 1, listaUF: 2300, arriendoBruto: 405000 },
  { id: 'msl-1201', proyectoId: 'mirador-santa-lucia', comuna: 'Santiago', piso: 12, m2: 45, dormitorios: 1, banos: 1, listaUF: 2300, arriendoBruto: 410000 },
  // Vista Apoquindo: rinde menos de 4,5 % (la IA lo saca en modo arrendar)
  { id: 'va-502', proyectoId: 'vista-apoquindo', comuna: 'Las Condes', piso: 5, m2: 58, dormitorios: 2, banos: 2, listaUF: 3400, arriendoBruto: 520000 },
  { id: 'va-901', proyectoId: 'vista-apoquindo', comuna: 'Las Condes', piso: 9, m2: 58, dormitorios: 2, banos: 2, listaUF: 3400, arriendoBruto: 530000 },
  // Financiamiento del pie: un departamento por proyecto
  { id: 'pi-601', proyectoId: 'plaza-independencia', comuna: 'Independencia', piso: 6, m2: 48, dormitorios: 2, banos: 1, listaUF: 2250, arriendoBruto: 440000 },
  { id: 'blf-303', proyectoId: 'brisas-la-florida', comuna: 'La Florida', piso: 3, m2: 55, dormitorios: 2, banos: 2, listaUF: 2400, arriendoBruto: 460000 },
  // Parque Macul: rinde menos de 4,5 %
  { id: 'pm-1004', proyectoId: 'parque-macul', comuna: 'Macul', piso: 10, m2: 60, dormitorios: 3, banos: 2, listaUF: 2600, arriendoBruto: 470000 }
];

function departamentosDe(proyectoId) {
  return DEPARTAMENTOS.filter(function (d) { return d.proyectoId === proyectoId; });
}

function buscarProyecto(id) {
  for (var i = 0; i < PROYECTOS.length; i++) if (PROYECTOS[i].id === id) return PROYECTOS[i];
  return null;
}

if (typeof module !== 'undefined') module.exports = {
  DEPARTAMENTO_REFERENCIA: DEPARTAMENTO_REFERENCIA,
  PROYECTOS: PROYECTOS,
  DEPARTAMENTOS: DEPARTAMENTOS,
  departamentosDe: departamentosDe,
  buscarProyecto: buscarProyecto
};
