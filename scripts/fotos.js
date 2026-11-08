// Arma js/fotos.js con las fotos que hay en la carpeta fotos/. Se corre con: node scripts/fotos.js
// No cambia las fotos: solo anota cuáles existen, para que la app no pida archivos que faltan.
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const lista = (carpeta) => {
  const dir = path.join(raiz, 'fotos', carpeta);
  if (!fs.existsSync(dir)) return [];
  // { nombre sin extensión (en minúsculas): archivo tal como está }, para aceptar .jpg, .JPG o .jpeg.
  const r = {};
  fs.readdirSync(dir).filter((f) => /\.(jpe?g|webp|png)$/i.test(f)).sort()
    .forEach((f) => { r[f.replace(/\.(jpe?g|webp|png)$/i, '').toLowerCase()] = f; });
  return r;
};
const fotos = { edificios: lista('edificios'), interiores: lista('interiores'), obra: lista('obra') };
const texto = `// Fotos de la app (referenciales). Este archivo lo arma \`node scripts/fotos.js\` a partir de la carpeta fotos/:
//   fotos/edificios/<id del proyecto>.jpg (también .jpeg, .png o .webp)         la fachada de cada edificio (tarjetas y galería)
//   fotos/interiores/<tipología>-<espacio>.jpg    living, cocina y dormitorio (o baño) por tipología
//   fotos/obra/<etapa>.jpg    una foto referencial por etapa: excavacion, obra-gruesa, terminaciones, recepcion (S22-F1)
// Tipologías: estudio, 1d, 2d y 2d2b. Si una foto no está, la app muestra el edificio dibujado.
var FOTOS = ${JSON.stringify(fotos)};
if (typeof module !== 'undefined') module.exports = { FOTOS: FOTOS };
`;
fs.writeFileSync(path.join(raiz, 'js', 'fotos.js'), texto);
console.log(`Listo: ${Object.keys(fotos.edificios).length} edificios, ${Object.keys(fotos.interiores).length} interiores y ${Object.keys(fotos.obra).length} etapas de obra.`);
