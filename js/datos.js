// Datos de ejemplo de Primer Peldaño.
// Los proyectos y departamentos del marketplace se agregan en S2-F1.

// Departamento de referencia (precio de lista en UF) según para qué se compra.
var DEPARTAMENTO_REFERENCIA = {
  arrendar: { listaUF: 2500 },
  vivir: { listaUF: 3000 }
};

if (typeof module !== 'undefined') module.exports = { DEPARTAMENTO_REFERENCIA: DEPARTAMENTO_REFERENCIA };
