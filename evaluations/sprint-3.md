# Evaluación · Sprint 3 · Bci Kit oficial, Postula, Perfil y agregar a pantalla de inicio

Evaluado sobre el commit `d80882d`, contra la sección "Sprint 3" de `PLAN.md`, `CLAUDE.md` y `docs/bci-kit.md`.

El sprint **aún no está subido a GitHub**: Pages sigue mostrando el Sprint 2. Por eso la app se probó con `python -m http.server`, en Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 844. Un script tocó cada botón y **escribió tecla por tecla** en los campos de sueldo. No se probó en un teléfono físico.

## 1. Veredicto

**APROBADO.** Las 6 features (S3-F0 a S3-F5) cumplen todos sus criterios y ninguna dimensión queda bajo 3. Hay una corrección importante para el Sprint 4: en los bordes, el porcentaje que se ve contradice al semáforo (corrección 1).

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 30 de 30 pasan |
| `node --test tests/` | Sigue fallando en Node 24. `CLAUDE.md:62` y `PLAN.md:20` todavía lo dicen (tercer sprint seguido; corresponde al Planner) |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto"` (incluido el manifest) | Vacío |
| Rutas que empiezan con `/` (HTML, JS, manifest) | Ninguna; el manifest usa `./` |
| Recursos externos | Solo Google Fonts (Overpass 400, 600 y 700) |
| HTTP 200 en local | `/`, `index.html`, `css/estilos.css`, los 3 JS, `manifest.webmanifest` e `iconos/icono-180.png`, `-192.png` y `-512.png` |
| Consola y red (flujo completo, 2 anchos, almacenamiento bloqueado y dato dañado) | 0 errores de JavaScript y 0 respuestas 4xx/5xx |
| Auto o plusvalía | No se menciona el auto. "Plusvalía" solo aparece en "Calculado sin plusvalía" |

**Las pruebas prueban algo real.** Cubren los 4 criterios de S3-F1, los bordes exactos (250.000 y 300.000 sobre 1.000.000, y también 250.001 y 300.001), el caso sin ingreso, `mejorAlternativa()` (elige la menor y solo si mejora) y `leerMonto()` y `formatoMiles()` con entradas raras ("$ 800.000", "abc", "0").

### Recálculo independiente (`node -e`, sin `calculos.js`)

| Caso | Esperado | Recalculado | En pantalla |
|---|---|---|---|
| Arrendar en lote, $1.500.000 + $1.000.000 | 22,9 %, holgado | 22,857 % | "22,9 %", Holgado, ícono check ✅ |
| Arrendar en lote, $1.200.000 + $800.000 | 28,6 %, en el límite | 28,571 % | "28,6 %", En el límite, ícono alerta ✅ |
| Vivir individual, $1.500.000 + $1.000.000 | 30,1 %, no aprueba | 30,093 % (total $752.318) | Lo prueba `node --test` ✅ |
| $900.000 + $800.000 en Alto Ñuñoa | — | 33,613 % | "33,6 %", No aprueba, "Postular" deshabilitado ✅ |
| Sugerencia: Mirador Santa Lucía en lote, con $1.200.000 + $800.000 | — | Total $528.011 → 26,401 % | "tu carga baja a 26,4 % (en el límite)" ✅ |

### Colores del Bci Kit

Se compararon con un script las 29 variables de `css/estilos.css` contra las tablas de `docs/bci-kit.md`: **son idénticas**, incluidos los dos derivados (`--yellow-dark` y `--red-dark`).

## 3. Criterios por feature

### S3-F0 Bci Kit oficial

| Criterio | | Evidencia |
|---|---|---|
| Los colores exactos de `docs/bci-kit.md` | ✅ | `css/estilos.css:9-44`; las 29 variables coinciden con el documento |
| Overpass 400, 600 y 700 reemplaza a Barlow Condensed y Figtree; títulos en 400 | ✅ | `index.html:18`; `--font` (`css/estilos.css:47`); Barlow y Figtree no aparecen. Medido: los 3 pesos cargados; todos los `.h1`–`.h6` y `.display-*` en 400. Arial solo aparece en los 4 botones de opción ocultos (`opacity: 0`) |
| Display 1–4 y Encabezado 1–6 con los tamaños del kit | ✅ | Medido: 64 / 52 / 42 / 34 y 30 / 26 / 22 / 20 / 18 / 16 px |
| Botones píldora (radio 48 px, borde 1,6 px, mayúsculas) de 36, 50 y 56 px; small con 44 px de zona táctil | ✅ | `css/estilos.css:125-149`: radio 48 px, `border: 1.6px` (Chrome dibuja cualquier borde de 1,6 px como 1 px) y `uppercase`. Medido con densidad 3: small 36, secundario y terciario 50, **primario 50,8 y 56,8 px** (ver corrección 3); el small tiene un `::before` que completa 44 px |
| Blanco sobre `--green-normal` en negrita de 19 px o más; verde chico en `--green-dark`; ningún texto amarillo | ✅ | El primario lleva 19 px en 700 (4,46:1, válido para texto grande); el primario small usa `--green-dark` (7,03:1); el secundario, el sello, el chip IA y "holgado" usan `--green-dark`; "en el límite" lleva texto `--gray-dark` sobre amarillo |
| Campos de dinero de 50 px, texto de 18 px y radio de 6 px | ✅ | `css/estilos.css:216-226`; medido: 50 px de alto y texto de 18 px; borde `--gray-semidark`; etiqueta visible arriba |
| Íconos SVG de línea dibujados en el código | ✅ | Símbolos en `index.html`; no se carga ninguna fuente de íconos |

### S3-F1 Fórmula de carga

| Criterio | | Evidencia |
|---|---|---|
| `carga()` y su nivel en `calculos.js`, con pruebas | ✅ | `js/calculos.js:186-205`; `tests/calculos.test.js` |
| 22,9 % holgado / 28,6 % en el límite / 30,1 % no aprueba | ✅ | Ver el recálculo |
| Exactamente 25 % es holgado y exactamente 30 % es en el límite | ✅ | Tolerancia de 1e-9 para el redondeo binario; probado también con 250.001 y 300.001 |

### S3-F2 Postula (paso 1 de Mi compra)

| Criterio | | Evidencia |
|---|---|---|
| Dos campos de sueldo con el proyecto elegido arriba | ✅ | Tarjeta "Edificio Alto Ñuñoa · Total al mes: $571.425" sobre los campos |
| `inputmode="numeric"` y punto de miles al escribir | ✅ | Tecla por tecla: "1" → "15" → "150" → "1.500" → "15.000" → "150.000" → "1.500.000" |
| Carga como protagonista con semáforo (color + palabra + ícono) | ✅ | `.display-2`, con borde de color, una píldora de color, la palabra ("Holgado", "En el límite", "No aprueba") y el ícono (`i-ok`, `i-alerta`, `i-no`) |
| Campo vacío o en cero: error claro y no calcula | ✅ | "El sueldo tiene que ser mayor a $0." / "Escribe el sueldo líquido del mes."; no hay número de carga y "Postular" queda deshabilitado; `aria-invalid` y `aria-describedby` |
| En amarillo o rojo: sugerencia calculada con `calculos.js` y enlace a Proyectos | ✅ | `mejorAlternativa()`: "Si te unes a la compra en conjunto de Edificio Mirador Santa Lucía, tu carga baja a 26,4 %", con enlaces a `#proyecto/mirador-santa-lucia` y `#proyectos`. En verde no aparece |
| "Postular" deshabilitado en rojo; en verde o amarillo avanza al paso 2 | ✅ | En rojo, `disabled` y una explicación. En amarillo se pasa al paso 2 (`aria-current="step"` en "Tu 5 %") y se guarda `paso: 2` |

### S3-F3 Recordar elecciones

| Criterio | | Evidencia |
|---|---|---|
| Modo, tipo de compra, proyecto y sueldos en `localStorage` | ✅ | `primer-peldano-estado` y `primer-peldano-compra` |
| Al recargar, Inicio, Proyectos y Mis proyectos muestran lo último | ✅ | Tras recargar: Inicio en vivir/individual con $8.623.650; Proyectos en "Financiamiento del pie · Para vivir · todos"; Mis proyectos en el paso 2 con 28,6 %; los campos con "1.200.000" y "800.000" |
| Sin `localStorage`, funciona con valores por defecto | ✅ | Con `localStorage` bloqueado desde antes de cargar: Inicio por defecto, comprar, postular (22,9 % → paso 2), Perfil y "Empezar de nuevo" funcionan, sin errores. Con datos dañados (`{malo`, un proyecto inexistente): valores por defecto y Mis proyectos vacío |

### S3-F4 Agregar a pantalla de inicio

| Criterio | | Evidencia |
|---|---|---|
| Manifest con nombre, colores del Bci Kit e íconos de 192 y 512 px | ✅ | "Primer Peldaño · Bci", `theme_color` `#28892B`, fondo `#F6F7F8` y `standalone`. Los íconos miden 192 × 192 y 512 × 512 de verdad (decodificados en el navegador), más un `apple-touch-icon` de 180 × 180 |
| Responde 200 y está enlazado desde `index.html` | ✅ | `<link rel="manifest">`; `Page.getAppManifest` de Chrome no reporta errores |

### S3-F5 Perfil

| Criterio | | Evidencia |
|---|---|---|
| Muestra y permite editar modo, sueldos y arriendo actual | ✅ | Se abre con los valores guardados (vivir, 1.200.000 y 800.000) |
| Al guardar, todo se recalcula | ✅ | Cambié a arrendar con pareja $400.000: Inicio quedó en arrendar, Postula recalculó a 35,7 %, No aprueba, y aparece "Cambios guardados…". Con un sueldo en $0 no guarda y muestra el error |
| "Empezar de nuevo" borra todo y vuelve a Inicio | ✅ | Pide confirmar sin ventana emergente ("¿Seguro? Esto no se puede deshacer."). Después: `#inicio`, las 2 claves en `null`, arrendar/lote y $6.467.738, y Mis proyectos vacío |

### Calidad en el teléfono (medida en el navegador)

- **Sin scroll horizontal ni elementos fuera del ancho** en Inicio, Proyectos, Detalle, Postula, el paso 2 y Perfil, a 390 y 360 px, incluso quitando `overflow-x: hidden`.
- **Inicio:** "Ver proyectos" termina en y = 543 a 390 px e y = 538 a 360 px, visible sin bajar incluso con 640 px de alto. "$6.467.738" en Overpass cabe a 360 px.
- **Toques:** todos los botones y enlaces miden 44 px o más (el small llega con su `::before`).
- **Contraste con los colores oficiales** (calculado; AA es 4,5:1, y 3:1 para texto grande y gráficos):

  | Elemento | Contraste |
  |---|---|
  | Texto sobre `--gray-light` | 8,99 |
  | Texto de apoyo | 5,40 / 5,04 |
  | Primario (texto grande) | 4,46 |
  | Primario small, secundario y selección | 7,03 |
  | Terciario | 5,40 |
  | Deshabilitado | 7,79 |
  | Enlaces | 7,39 / 6,89 |
  | "Holgado" | 5,42 |
  | "En el límite" | 7,46 |
  | "No aprueba" | 5,05 |
  | Error | 6,82 |
  | Sugerencia | 9,04 |
  | Peligro | 7,14 |
  | Chip | 5,66 |
  | Ícono de error (gráfico) | 3,18 |
  | Borde del campo (gráfico) | 5,40 |

  Solo el borde izquierdo amarillo del semáforo da 1,29:1, pero no es la única señal: la palabra y el ícono van en una píldora con texto de 7,46:1.

## 4. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 4 | Todos los criterios se cumplen y resisten el almacenamiento bloqueado y los datos dañados. Baja porque en los bordes la pantalla dice "30,0 %" junto a "No aprueba" y "sobre 30 %". |
| Calidad móvil | 4 | No hay desbordes, los toques miden 44 px y el contraste es AA en todo el texto. Baja porque en Postula el número protagonista queda bajo la barra mientras se escribe. |
| Código | 4 | Las fórmulas están en `calculos.js` con buenas pruebas y la lectura del almacenamiento es defensiva. Queda una suma de sueldos dentro de `app.js`, y `app.js` ya tiene 713 líneas. |
| Diseño | 4 | Aplica fielmente el Bci Kit, con las figuras de marca, el semáforo triple y una confirmación sin ventana emergente. Postula es larga antes del número y el "·" de la ficha se ve pegado. |

## 5. Correcciones requeridas

No bloquean. Para el Sprint 4, en orden de importancia:

1. **El porcentaje y el semáforo se contradicen en los bordes** (`js/calculos.js`, `nivelCarga()` y `formatoPorcentaje()`). Con una carga de 30,04 % (Alto Ñuñoa con $902.214 + $1.000.000), Postula muestra **"30,0 %", "No aprueba" y "Con una carga sobre 30 % no puedes postular"**. Con 25,04 % muestra "25,0 %" y "En el límite". Para quien lo lee, 30,0 % es "hasta 30 %". Hay que hacer que el nivel use el mismo valor que se muestra. Por ejemplo, agregar en `calculos.js` una función `cargaRedondeada(k)` que redondee a 1 decimal y que use tanto `nivelCarga` como la pantalla. Luego hay que sumar pruebas con 25,04 % y 30,04 %, sin romper las de exactamente 25 % y 30 %.
2. **En Postula, la carga queda fuera de la vista mientras se escribe** (`js/app.js`, `renderPostula()`). A 390 × 844, la tarjeta de la carga empieza bajo la barra (y ≈ 770). En un teléfono real, el teclado tapa todavía más. Hay que achicar lo que va antes de los campos: la tarjeta del proyecto en una línea y los pasos más bajos. Otra opción es llevar la carga a la vista (`scrollIntoView`) cuando los dos sueldos sean válidos.
3. **Alto del primario** (`css/estilos.css:152`): con 19 px y un interlineado de 1,2, el primario mide 50,8 y 56,8 px en vez de 50 y 56. Se arregla con `line-height: 1.1` en `.btn-primario`, o bajando el relleno vertical en 1 px.
4. **`js/app.js:447`:** `estado.sueldoPropio + estado.sueldoPareja` es un cálculo hecho en la pantalla. Hay que agregar `ingresoTotal(propio, pareja)` en `calculos.js` y usarla también dentro de `carga()`.
5. **Planner:** cambiar `node --test tests/` por `node --test` en `CLAUDE.md:62` y `PLAN.md:20`, y actualizar `PLAN.md:14` a vivir individual = $752.318. Va por tercer sprint pendiente.

## 6. Qué revisar a mano en el teléfono

1. **Postula con el teclado abierto:** escribe los dos sueldos y fíjate si ves tu carga sin cerrar el teclado ni bajar.
2. **Instalar la app:** desde Pages (después de `git push`), usa "Agregar a pantalla de inicio" y revisa que aparezca el ícono verde del peldaño y que la app abra sin la barra del navegador.
3. **Bordes y separadores en Safari de iPhone:** los botones deberían verse con un borde algo más grueso que en Chrome (1,6 px). Revisa también si en la ficha ("Ñuñoa · Piso 4 · 2 dormitorios") el "·" se ve pegado a la palabra siguiente, como en Chrome.

## 7. Sugerencias (no bloquean)

- **Sugerencia en rojo que tampoco aprueba:** con $900.000 + $800.000, la mejor alternativa da 31,1 %, que también es "no aprueba". En ese caso conviene decir cuánto ingreso falta para llegar a 30 % (por ejemplo, "Con $205.000 más de ingreso al mes, podrías postular"), calculado en `calculos.js`.
- **Número protagonista en 600:** el kit pide títulos en 400. La decisión de usar 600 en las cifras está explicada en la entrega y se lee mejor; el Planner debería registrarla en `docs/bci-kit.md` para que no se vuelva a discutir.
- **Título de Inicio en Encabezado 2 (26 px):** el kit sugiere Encabezado 1 (30 px) para los títulos de pantalla. Funciona así para que quepa en una línea; si se cambia, hay que volver a medir la primera vista.
- **`app.js` ya tiene 713 líneas.** Antes del Sprint 4 conviene separar cada pantalla en funciones o secciones claras, o en archivos como `js/postula.js` y `js/perfil.js` si el Planner lo aprueba.
- **"Cambiar mi compra a este proyecto"** no estaba en el plan, pero hace que la sugerencia se pueda seguir. Conviene que el Planner lo registre.
- **Subir el sprint (`git push`)** para que Pages muestre el Bci Kit oficial y se pueda instalar la app.
