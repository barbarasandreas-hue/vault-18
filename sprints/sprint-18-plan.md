## Sprint 18 · Un solo camino de punta a punta

**Objetivo:** que lo que la app promete en Tu camino y Llega antes se cumpla en todo el resto del recorrido (Elegir, Detalle, Tu pie, Firmar y Mi departamento) y también para quien recibe "Todavía no". Ninguna cifra contradice a otra y no reaparecen las palabras de banco.

> Diagnóstico (5-nov-2026, recorrido completo con Playwright, modo vivir, pareja de $2,5 millones, $3 millones ahorrados, $600 mil al mes, UF 2.000 a 2.500; y segundo recorrido "Solo yo", $1,1 millones, $250 mil al mes, UF 1.500 a 2.000):
> 1. **El descuento del grupo se promete al 5 % pero hoy es 3 %.** `precioUF` usa 10 unidades por defecto. Elegir dice "Ahorras al unirte $5.133.125" y Detalle "$5,1 millones", pero el grupo va en 6 de 10 y Tu pie muestra "3 % · con 3 personas más, 5 %".
> 2. **Dos relojes de llaves.** Tu pie dice "Tus llaves en 15 meses" y, en la misma pantalla, "Tu obra: 405 días para tus llaves" (13 meses, que es la entrega del edificio). Con "Ver el próximo mes", el plazo baja pero la obra y el cierre del grupo no avanzan: al llegar a Firmar, Inicio sigue diciendo "El proyecto cierra en 42 días".
> 3. **Un peso de diferencia.** Juntas antes de firmar: $11.703.526 en Detalle e Inicio, y $11.703.525 en Tu pie.
> 4. **Exactos antes de tiempo.** Elegir muestra "$5.133.125" sin departamento elegido, y Detalle muestra "$9.752.938", "$87.776.437" y "$1.950.588" fuera de la simulación.
> 5. **"Todavía no" sigue con el diseño viejo.** Para la persona de menos ingreso, Tu camino dice "Todavía no" y Llega antes abre "Tus caminos" del Sprint 15: carrusel, "Carga 32,7 %", "Dividendo al mes", "Al escriturar", "Peor caso" y montos exactos. Además ofrece "Un estudio de UF 1.200", aunque el departamento más chico se descartó para vivir. Y no ofrece el subsidio, que es justo para este perfil.
> 6. **Datos de ejemplo pobres.** Cada rango de precio tiene 1 departamento. No hay terminados ni departamentos de hasta UF 2.200 en UF 2.000 a 2.500, así que "Subsidio del Estado" y "Sin IVA" salen siempre en gris para el recorrido principal.
> 7. **El final habla como banco.** Firmar dice todo en una oración ("90 % ($87.776.437) a 30 años, al 3,9 %: $442.759 al mes"). Inicio y Mi departamento dicen "Tu dividendo". Mi departamento vuelve a pedir el arriendo, que ya se dio. "Tu equipo te acompañó: 1 persona", aunque son tú y tu pareja.

**Reglas del sprint:** las mismas del Sprint 17 (un solo cálculo por dato, precisión según lo decidido, mostrar primero y explicar al tocar, decir lo que es propuesta, nada de inversionistas en modo vivir). Además:
1. **Lo que no está asegurado se muestra como posibilidad:** "3 % hoy · 5 % si se completa".
2. **Un solo reloj de demo:** cada "mes" de la demo avanza el ahorro, la obra, el cierre del grupo y los avisos al mismo tiempo.

### Bloque 1 · Que los números no se contradigan (hacer primero)

- **S18-F1 Descuento real del grupo.**
  - `descuentoActual(proyecto)` en `js/calculos.js`, con pruebas, usa `cuposTomados` (más la persona, si ya se unió).
  - `precioUF` deja de suponer 10 unidades cuando no se le pasan.
  - Elegir, Detalle, Llega antes y Tu pie muestran el descuento de hoy y el de completar el grupo como posibilidad: "Ahorras unos $3 millones · $5 millones si se completa".
  - `efectoPieza('grupo')` usa el descuento de hoy.
  - Acepta si: con 6 de 10 cupos, ninguna pantalla muestra el 5 % como ya ganado.
- **S18-F2 Un solo reloj.**
  - `estado.mesDemo` avanza con "Ver el próximo mes". De él salen los días para la entrega, el cierre del grupo, las etapas de Tu obra y los avisos.
  - Tu obra dice "Entrega del edificio" (no "tus llaves") y muestra la misma fecha que el freno "entrega".
  - Si el pie se completa antes de la entrega: "Tu pie está listo" y "Tus llaves: cuando entreguen el edificio, en N meses". No se pasa a Firmar antes de la entrega; para la demo, "Saltar a la entrega · demo".
  - Acepta si: después de juntar el pie, ningún aviso habla del cierre del grupo como futuro y Tu obra coincide con la fecha de llaves.
- **S18-F3 Un solo monto para "Juntas antes de firmar".** Una función (`metaCompra`) redondea una sola vez y todas las pantallas la leen. Prueba: Detalle, Tu pie, Inicio y Firmar muestran el mismo número.
- **S18-F4 Precisión en Elegir y Detalle.**
  - Las tarjetas de Elegir y Departamentos usan montos redondeados.
  - "De dónde sale el precio", en Detalle, va en filas redondeadas ("10 % tú · $9,8 millones").
  - Los exactos quedan solo en "Ver simulación", la preaprobación y Firmar.

### Bloque 2 · "Todavía no" con piezas

- **S18-F5 Tu camino y Llega antes también para "Todavía no".**
  - El modo vivir con "Todavía no" usa `renderTuCaminoVivir` y `renderLlegaAntes`, no `renderCaminos` del Sprint 15.
  - Arriba, la razón en 2 a 4 palabras ("La cuota pasa tu límite"). En "?", la regla del 25 %.
  - Las piezas muestran si cambian el resultado: "Con esta: sí cabe" o "Aún no".
  - Se quita "Un estudio de UF 1.200" en modo vivir. Se mantienen "Si juntas al mes" y "Recordarme".
  - "Arriendo con opción de compra" queda como enlace al final ("Mientras tanto").
  - Acepta si: el recorrido "Solo yo" con $1,1 millones no muestra carrusel ni "Carga", "Dividendo", "Al escriturar" o "Peor caso" fuera de "?", y el subsidio aparece sumable.
- **S18-F6 Datos de ejemplo para que las piezas se vean.** En `js/datos.js`:
  - al menos 3 departamentos por rango;
  - en UF 2.000 a 2.500, uno terminado (para "Sin IVA") y uno de hasta UF 2.200 (para el subsidio);
  - en UF 1.500 a 2.000, uno en obra con grupo.
  - Las comunas siguen siendo Independencia, Quinta Normal, Recoleta y Estación Central. Los arriendos estimados se marcan como estimación de la IA (demo).
  - Acepta si: en el recorrido A, "Subsidio del Estado" y "Sin IVA" se pueden activar (con su departamento) y la app solo los ofrece si hay uno que los cumpla.

### Bloque 3 · El final en el idioma nuevo

- **S18-F7 Firmar en filas y con las piezas elegidas.**
  - "Lo que firmas" pasa a filas: Bci te presta, Pagas al mes, Plazo y Tasa, con exactos (aquí sí van).
  - Usa las piezas activas: precio con descuento, subsidio o sin IVA, y el peor caso en una fila ("Sin subsidio a la tasa").
- **S18-F8 Mi departamento e Inicio después de firmar.**
  - "Pagas al mes" en vez de "Tu dividendo".
  - Se usa el arriendo ya dado en las preguntas; solo se pide si falta.
  - "Tu equipo" cuenta a todas las personas (tú incluido).
  - Una cifra grande: lo que pagas al mes, junto a lo que pagabas de arriendo.
- **S18-F9 Revisión de palabras en todo el modo vivir.**
  - Ampliar la búsqueda del Sprint 17 a Elegir, Detalle, Tu pie, Firmar y Mi departamento.
  - Fuera de "?" y de la simulación no aparecen: dividendo, escriturar, carga, participación, peor caso, "Al escriturar" ni "Bci te presta hasta".

**Fuera de este sprint:** el modo arrendar (sigue con Caminos y la carrera del Sprint 16) y la validación de supuestos con Bci (lista del Sprint 17).

**Verificación del sprint:**
- `node --test tests/*.test.js` con `tests/sprint18.test.js`:
  - descuento actual según cupos;
  - `precioUF` sin unidades no da 5 %;
  - un solo monto de meta;
  - "Todavía no" se resuelve con una pieza que baja el precio;
  - no se firma antes de la entrega.
- Recorrido A completo (de las preguntas a Mi departamento) y recorrido "Solo yo", con Playwright a 390, 360 y 320 px:
  - las mismas cifras de meta, llaves y descuento en cada pantalla;
  - ningún monto exacto antes de Postular, salvo en "Ver simulación";
  - palabras de banco solo dentro de "?" y la simulación;
  - sin desborde ni errores de JavaScript.
- Prueba con personas del segmento (las del Sprint 17, más una de ingreso menor):
  - "¿Cuánto te ahorras por comprar en grupo?" (esperado: "depende de si se completa");
  - "¿Cuándo te entregan las llaves si juntas el pie antes?".

---

