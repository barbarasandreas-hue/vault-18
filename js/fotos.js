// Fotos de la app (referenciales). Este archivo lo arma `node scripts/fotos.js` a partir de la carpeta fotos/:
//   fotos/edificios/<id del proyecto>.jpg (también .jpeg, .png o .webp)         la fachada de cada edificio (tarjetas y galería)
//   fotos/interiores/<tipología>-<espacio>.jpg    living, cocina y dormitorio (o baño) por tipología
// Tipologías: estudio, 1d, 2d y 2d2b. Si una foto no está, la app muestra el edificio dibujado.
var FOTOS = {"edificios":{},"interiores":{}};
if (typeof module !== 'undefined') module.exports = { FOTOS: FOTOS };
