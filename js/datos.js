// Datos de ejemplo de Primer Peldaño.
// En el Sprint 4 se agregan los departamentos y lotes del marketplace.

// Departamento de referencia (precio de lista en UF) según para qué se compra.
var DEPARTAMENTO_REFERENCIA = {
  arrendar: { listaUF: 2500, descripcion: 'Departamento de referencia para arrendar' },
  vivir: { listaUF: 3000, descripcion: 'Departamento de referencia para vivir' }
};

if (typeof module !== 'undefined') module.exports = { DEPARTAMENTO_REFERENCIA: DEPARTAMENTO_REFERENCIA };
