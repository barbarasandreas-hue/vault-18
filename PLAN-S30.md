# PLAN · Sprint 30 — Menos texto, mejor camino (13-nov-2026)

Plan para ejecutar de una sola vez en la mañana. Se basa en: Certamen 2 (tareas 2 y 4 con fallas), tus comentarios de hoy, una auditoría de las pantallas actuales (palabras, altura, navegación) y una revisión de patrones de lectura y explicación (fuentes al final).

**Frase para partir en la mañana:**
> Ejecuta `PLAN-S30.md` completo, en orden. Primero copia de respaldo; publica un borrador después de B2 y otro después de B6; no subas nada a GitHub.

---

## 0. Decisiones que tomé por ti (no pude preguntarte)

Cada una se puede cambiar con una línea; todas dejan la versión del testeo intacta (ver B0).

| # | Duda | Qué asumí | Alternativa si no te gusta |
|---|---|---|---|
| D1 | "Los botones de abajo de la definición del camino" | Son los **chips de filtro** (Sin IVA · Con DS1 · Proyecto DS19). Se quitan, y esa función pasa a la página de ayudas ("Ver departamentos con DS1"). | Si hablabas de "Ver mis pasos con este camino": se mantiene igual, solo cambia el nombre (B2). |
| D2 | Ayudas vs. chips | Mantengo la **sección informativa** (tu preferencia) y la rediseño. Hay una compuerta: si al final de B1 no cumple los criterios, se hace el plan B (quitar la sección y dejar los chips). | — |
| D3 | "Cambiar de camino es incómodo" | Se elimina el botón + hoja "Cambiar de camino" dentro de cada camino. Ver otro camino = volver a Explorar, que ahora muestra los 4 caminos en una sola pantalla. Elegir = un solo botón "Elegir este camino". | Bandera `TIRA_CAMINOS = true` pone una tira de 4 pestañas cortas arriba (sin hoja). |
| D4 | "¿Te parece mucho tiempo?" | Propuesta 1: una línea dentro del bloque azul de Inicio. | Las otras dos propuestas, que ya tienes. |
| D5 | Qué cuenta como "demasiado texto" | Máximo **60 palabras visibles** por pantalla sin desplegar; **un solo texto de apoyo por tarjeta** y de **≤ 12 palabras**; lo demás va detrás de un toque. | Subir o bajar el tope. |
| D6 | Cifras y reglas de las ayudas | No se inventa ni se cambia ninguna cifra: se copian de `datos.js`, `calculos.js` y de los textos actuales. | — |

---

## 1. Diagnóstico

### 1.1 Lo que dijo el testeo

| Tarea | Éxito | SEQ | Qué falló | Bloque que lo ataca |
|---|---|---|---|---|
| 2 · Elegir camino y departamento | 60 % | 4,8 | No sabían que debían ir a Explorar; demasiados caminos; se olvidaban de las otras opciones; no entendían los términos | B4, B5, B1 |
| 4 · Misión que vence primero | 10 % | 4,6 | No veían cuál vencía primero | Ya resuelto con "Con fecha"; B4 lo deja arriba del todo |
| Hallazgos sueltos | — | — | Tras hacerlo su camino no sabían qué pasaba; dudas de comprar con desconocidos | B3, B6, B8 |

### 1.2 Auditoría de la app actual (390 px, con camino elegido)

| Pantalla | Palabras visibles | Altura | Problema | Meta |
|---|---|---|---|---|
| Inicio | 100 | 1.469 px | Bien; revisar la línea de tiempo | ≤ 70 |
| Tus pasos | 114 | 1.407 px | **"Empezar" queda bajo el pliegue (y ≈ 900 de 844)**; dos enlaces de glosario ocupan una tarjeta entera; frase de apoyo en misiones | ≤ 65, con el botón visible |
| Todas las misiones | 122 | 1.546 px | Frases de apoyo repetidas | ≤ 90 |
| Explorar | 128 | 1.601 px | **Solo 3 de 4 caminos caben en la pantalla**; cada tarjeta tiene 2 chips + título + 3 líneas; "Otras formas" repite una ayuda | ≤ 60, 4 caminos visibles |
| Un camino | 183 – 254 | ~2.900 px | Descripción de 4 líneas, 2–3 enlaces punteados, botón, tarjeta de ayudas, chips, lista | ≤ 100 sobre la lista |
| **Ayudas que te acercan** | **597** | **3.705 px** | 5 tarjetas × 5 filas de texto + "En tu caso". Nadie lo lee (NN/g: se lee ~20–28 % de una página) | **≤ 220 sin desplegar** |
| Crédito para usados / Arriendo con opción | 254 / 320 | ~4.000 px | Mismo patrón largo | ≤ 150 |
| Elegir departamento (`#camino/elegir`) | **849** | **10.417 px** | Lista sin filtrar de todos los departamentos, distinta de la lista del camino | Redirige (B6) |
| Respaldo familiar | 183 | 2.012 px | Título + 3 secciones + texto | ≤ 90 |
| Perfil | 49 | 898 px | Bien | — |

### 1.3 Inconsistencias de navegación encontradas

- **N1** Hay tres listas de departamentos: la del camino (filtrada), `#camino/elegir` (sin filtrar, 10.400 px) y `#departamentos`.
- **N2** `#camino/elegir` cuelga de la pestaña *Tus pasos* mientras que elegir departamento es una decisión de *Explorar*: la pestaña activa cambia según por dónde entres.
- **N3** "Cambiar ›" en Tus pasos te manda a Explorar: el nombre promete cambiar en el lugar y no es así.
- **N4** "Otras formas · Respaldo familiar" en Explorar repite una de las 5 ayudas.
- **N5** El mismo lugar se llama "¿Cómo puedes llegar antes?" y "Ayudas que te acercan".
- **N6** El botón de elegir dice "Ver mis pasos con este camino" y cuando ya lo elegiste dice "Es tu camino · ver tus pasos": dos nombres para una misma acción.
- **N7** `#explorar/cambia` ("Ver qué lo cambia", para quien todavía no llega) muestra la misma página de ayudas de vivir: comprobar que el texto calza con "para arrendar".
- **N8** No hay una invitación clara a Explorar cuando todavía no hay camino (hallazgo del testeo).

### 1.4 Flujo ideal (lo que querría hacer la usuaria)

1. **Inicio** → "¿Cuándo llego?". Sin camino: un único botón "Elegir mi camino" → Explorar con el camino recomendado arriba.
2. **Explorar** → ve 4 caminos en una pantalla, el recomendado destacado → entra a uno → mira las ayudas → **Elegir este camino** (hoja: "Tu fecha pasa de X a Y").
3. Vuelve a **Tus pasos** con aviso "Tu camino cambió · vas en el paso N".
4. Paso "Elige tu departamento" → **Explorar, lista de su camino** (no otra lista) con una franja "Elige tu departamento".
5. Elige → Tus pasos, paso siguiente. Atrás siempre vuelve a la pestaña de origen.

---

## 2. Principios de diseño (usuaria · Bci · norma)

| Lente | Regla | Cómo se aplica |
|---|---|---|
| Usuaria: esfuerzo mínimo | Una acción por pantalla; recomendar en vez de listar; mostrar, no explicar | B1 (barras de "cuánto te acerca"), B5 (un camino "Para ti") |
| Usuaria: lectura real | La gente escanea; texto en bloques cortos, con palabras clave destacadas (NN/g) | D5; títulos de una línea; números en grande |
| Divulgación progresiva | Lo básico primero, el detalle a pedido, máximo 2 niveles (NN/g) | Tarjetas de ayuda plegables; glosario en hoja |
| Bci / negocio | Que la usuaria llegue a abrir cuenta, juntar el pie y pedir la preaprobación; transparencia ("Existe hoy / Propuesta") | Cada ayuda termina en una acción que mueve la escalera |
| Norma: ISO 9241-11 | Eficacia, eficiencia y satisfacción en un contexto de uso | Metas medibles en §6 (éxito de tarea, toques, SEQ) |
| Norma: heurísticas de Nielsen | Reconocer en vez de recordar · diseño minimalista · lenguaje de la usuaria · consistencia | Nombres únicos (N5, N6); caminos siempre visibles; sin jerga sin explicación |
| Accesibilidad (Bci Kit) | WCAG 2.2 AA: 4,5:1, toque ≥ 44 px, foco visible, movimiento reducido | Se revisa en cada bloque (§5) |

---

## 3. Patrón nuevo: **ficha de ayuda en 3 segundos**

Se usa en *Ayudas para llegar antes*, en *Respaldo familiar* y en las hojas de términos.

**Nivel 1 (siempre visible, ≤ 12 palabras por fila):**
`[ícono] Nombre · chip (Existe hoy / Propuesta) · barra de "cuánto te acerca" · "−6 meses"`

**Nivel 2 (se abre al tocar la fila; solo una abierta a la vez):**

| Ícono | Fila | Largo |
|---|---|---|
| persona | Para quién | ≤ 8 palabras. Con la marca ✓ "Tú cumples" o "Te falta: Registro Social" (enlaza a su misión) |
| moneda | Cuánto | ≤ 8 palabras, con el monto |
| calendario | Hasta cuándo | ≤ 6 palabras, en chip |
| enlace | Se combina con | Chips ✓ / ✕ tomados de `PIEZAS_VIVIR` y `RAZON_CHIP` (no inventar) |
| — | Cómo pedirlo | 3 pasos de ≤ 5 palabras, en fila numerada |
| botón | Acción | Primario: la acción real ("Postular al DS1" → misión). Secundario: "Ver departamentos con DS1" (aplica el filtro y vuelve a la lista) |

**Textos propuestos** (cifras tal como están hoy en la app):

| Ayuda | Para quién | Cuánto | Hasta cuándo | Cómo pedirlo |
|---|---|---|---|---|
| **Subsidio DS1** · Existe hoy | Primera vivienda, con Registro Social | UF 250 a 410 a tu pie | Llamado cierra el 27 nov | 1 Registro Social · 2 Ahorro en tu cuenta · 3 Postular |
| **Proyectos DS19** · Existe hoy | Primera vivienda, con Registro Social | Desde UF 350 | Según el proyecto | 1 Elige un proyecto DS19 · 2 Postula con la inmobiliaria · 3 Confirma montos |
| **Sin IVA** · Existe hoy | Nuevos terminados, primera venta | Precio baja cerca de 10 % | Promesa hasta nov 2027 | 1 Elige uno terminado · 2 Pide el precio sin IVA · 3 Firma la promesa |
| **Regalo de tu familia** · Propuesta | Familia o amistades | Lo que cada uno quiera | Hasta nov 2027 | 1 Manda el enlace · 2 Reciben el aporte · 3 Llega a tu cuenta |
| **Respaldo familiar** · Propuesta | Un familiar con garantía | Pones 5 % en vez de 10 % | — | 1 Manda el enlace · 2 Deja la garantía · 3 La recuperas |

Reglas: el "Hasta cuándo" y los montos salen de las constantes que ya existen (no copiar fechas a mano); "En tu caso" se reemplaza por la barra ("−6 meses") y por la marca ✓ / "Te falta".

**Términos (DS1, DS19, garantía, grupo):** hoja inferior con **1 frase + 1 ejemplo** ("DS1: platita del Estado para tu pie. Ejemplo: UF 250 ≈ $10,3 millones"). Se abre con un icono ⓘ junto a la palabra, no con enlaces punteados sueltos.

---

## 4. Bloques de trabajo (en este orden)

Archivos: `js/app.js`, `css/estilos.css`, `js/calculos.js`, `tests/`. Cada bloque termina con los criterios de aceptación; no se pasa al siguiente si no se cumplen.

### B0 · Respaldo y base (10 min)
- Copiar la carpeta completa como `vault-18_version-testeo` (copia, sin borrar nada) y anotar en `PLAN.md` "Sprint 30 parte de la versión del testeo".
- Correr `node --test tests/*.test.js` (debe dar 207 ✓) y guardar las medidas actuales de §1.2 (`aud.py`) como "antes".
- **Aceptación:** respaldo existe; pruebas en verde.

### B1 · Ayudas para llegar antes (el bloque principal)
- Renombrar en toda la app a **"Ayudas para llegar antes"** (N5). Ruta `#explorar/<camino>/como` sin cambios.
- Reemplazar `renderLlegaAntes` por el patrón de §3: encabezado de una línea ("Suman a tu pie y adelantan tus llaves"), fila "Calculado para UF 1.500–2.000 · Cambiar" como chip, 5 filas plegables con barra de impacto (meses), orden por impacto, la primera abierta.
- Barra de impacto: `scaleX` con los meses que ya calcula la app ("En tu caso: … 6 meses antes"); con movimiento reducido, sin animación.
- Botón secundario "Ver departamentos con …" → aplica el filtro correspondiente (`chipsActivos[k] = true`) y navega a `#explorar/<camino>`; en la lista aparece un chip "Con DS1 ✕".
- Respaldo familiar y Regalo viven aquí (se retira "Otras formas" de Explorar en B5).
- Quitar "Dónde lo ves" (ya no hace falta: el botón te lleva).
- **Aceptación (compuerta D2):** ≤ 220 palabras sin desplegar y ≤ 1.400 px de alto; cada ayuda tiene una acción; ninguna cifra cambió; 360 y 390 px sin cortes; filas ≥ 44 px; `aria-expanded` correcto; test nuevo de que cada ayuda lleva a su filtro. **Si no se cumple tras un intento:** plan B → dejar la página mínima (solo nivel 1) o retirar la sección y mantener los chips, y avisarlo en el resumen.

### B2 · Página de un camino
- Descripción ≤ 14 palabras (revisar `DESCRIPCION_CAMINO`); los 2–3 enlaces punteados de términos → un solo ⓘ "Qué significan" que abre la hoja de §3.
- Quitar la fila de chips (Sin IVA / Con DS1 / Proyecto DS19) — su función ya vive en B1 (D1). Dejar solo el corazón de Favoritos como interruptor pequeño en el encabezado de la lista y, cuando venga de una ayuda, el chip de filtro activo con ✕.
- Tarjeta "Ayudas para llegar antes": mostrar una vista previa con las ayudas que aplican ("DS1 · DS19 · Sin IVA") y cuántos meses suman, para que se entienda antes de entrar.
- Retirar el botón y la hoja **"Cambiar de camino"** (D3; `ponerOtrosCaminos` queda tras la bandera `TIRA_CAMINOS = false`).
- Botón de elegir: **"Elegir este camino"** (N6), con el mes de llegada ("Llegas en marzo 2028"); si ya es el tuyo: chip "✓ Es tu camino" + "Ver tus pasos".
- Título de la lista: "Departamentos" (sin "de este camino").
- **Aceptación:** ≤ 100 palabras sobre la primera tarjeta de departamento; el botón de elegir y la tarjeta de ayudas se ven sin hacer scroll; sin chips de ayudas; test de que "Elegir este camino" abre la hoja y al confirmar va a Tus pasos con el aviso.

> **Borrador 1:** publicar la versión después de B2 y enviarte capturas de Ayudas y Camino.

### B3 · Elegir camino: hoja de confirmación y aviso
- La hoja muestra solo: "Tu fecha pasa de **marzo 2028** a **enero 2028** · se suma 1 paso" y dos botones. Se retira el resto del texto.
- Al confirmar: Tus pasos con el aviso existente ("Tu camino cambió · vas en el paso N") y la fila del camino resaltada un instante.
- Hallazgo cubierto: "tras hacerlo su camino no sabían que pasaba".
- **Aceptación:** hoja ≤ 25 palabras; aviso visible en Tus pasos sin scroll.

### B4 · Tus pasos
- Fila "Con fecha": una sola fila amarilla (fecha, nombre, "Vence en 24 días", Ir) sin tarjeta contenedora con título; los dos enlaces de glosario pasan a un ⓘ dentro de la fila.
- Fila del camino: "Tu camino · Compra en grupo · **Ver caminos ›**" (N3; va a Explorar).
- Escalera sin cambios (es lo mejor de la pantalla).
- Paso actual: título + 1 línea ≤ 10 palabras + botón. Subir el botón para que **quede sobre el pliegue en 390 × 844** (reduciendo márgenes del bloque de la escalera si hace falta, nunca el tamaño táctil).
- Misiones del paso: quitar "Te acercan a tus llaves. Puedes hacerlas en cualquier orden." (se dice una vez, en "Ver todas").
- Si aún no hay camino: el paso actual es "Elige tu camino" con el botón "Ver caminos" → Explorar con el recomendado arriba (N8).
- **Aceptación:** ≤ 65 palabras; "Empezar" visible sin scroll a 390 × 844 y a 360 × 740; el test de la tarea 4 (qué vence primero) sigue en verde.

### B5 · Explorar
- Encabezado: "¿Qué quieres explorar?" (se quita "Tienes 4 caminos…").
- Vivir/Arrendar se mantiene.
- **Un camino destacado** ("Para ti", tarjeta grande: nombre, 1 línea ≤ 8 palabras, chip "Llegas: marzo 2028", flecha) y debajo **"Otros caminos"**: 3 filas compactas (ícono, nombre, mes de llegada, ›), sin los 2 chips ni la frase de 3 líneas. Los 4 caminos deben verse en la primera pantalla.
- Debajo: fila con 2 botones pequeños (Favoritos · Todos los departamentos) y el enlace "Por qué no te mostramos otros".
- Retirar **"Otras formas · Respaldo familiar"** (vive en Ayudas; N4).
- **Aceptación:** ≤ 60 palabras; 4 caminos visibles sin scroll a 390 × 844; el mes de llegada es el mismo que muestra Inicio para ese camino (test).

### B6 · Navegación coherente
| Ruta | Hoy | Después |
|---|---|---|
| `#camino/elegir` | Lista sin filtrar, 10.400 px, pestaña *Tus pasos* | **Redirige** a `#explorar/<caminoElegido>` con franja "Elige tu departamento"; pestaña *Explorar* (N1, N2) |
| `#departamentos` | Lista completa | Se queda como "Todos", con filtros; se llega desde Explorar |
| Misión "Elige tu departamento" y paso 5 | → `#camino/elegir` | → `#explorar/<camino>?elegir` |
| Elegir un departamento | — | → Tus pasos, siguiente paso |
| `#explorar/cambia` | Mismo texto que vivir | Revisar el copy para "arrendar" (N7) |
- Mantener `pilaRutas` para que Atrás regrese a la pestaña de origen (si entras al camino desde Tus pasos, Atrás vuelve a Tus pasos).
- Crear `nav.py` con una tabla esperada (ruta → pestaña activa → destino de Atrás) para las 27 rutas del `crawl.py` y que falle si algo se sale.
- **Aceptación:** `crawl.py` sin errores en 27 rutas; `nav.py` todo ✓; ninguna ruta cambia de pestaña a mitad del flujo.

> **Borrador 2:** publicar después de B6, con capturas de Tus pasos y Explorar.

### B7 · Dieta de texto en el resto de la app
Aplicar D5 pantalla por pantalla. Orden y metas:

| Pantalla | Qué cortar |
|---|---|
| Inicio | Línea de tiempo y frases bajo cifras que repiten el título; aplicar D4 |
| Tu pie | Frases de apoyo bajo cada fila; dejar capas con ícono + 2 palabras |
| Todas las misiones | Frases de apoyo repetidas; la etiqueta ("DS1", "Tu cupo") ya explica |
| Crédito para usados / Arriendo con opción | Mismo patrón que B2 (descripción ≤ 14 palabras, ayudas, lista) |
| Respaldo familiar | Patrón de §3: ≤ 90 palabras |
| Hojas (hitos, misiones, preaprobación, transferencia) | Máximo 1 frase + lista corta; quitar párrafos de contexto |
| Departamento (detalle) | Títulos de bloque que repiten la cifra |
| Avisos y toasts | ≤ 8 palabras |

Regla mecánica: ningún párrafo de primer nivel > 2 líneas (≈ 18 palabras); si hay más, va en `<details>` o en una hoja. Cuando una frase no agrega información sobre el título, se borra.
- **Aceptación:** tabla de §1.2 vuelve a medirse y todas las metas se cumplen o se justifica la excepción; los tests siguen en verde.

### B8 · Grupo: confianza ("dudas de comprar con desconocidos")
- En la ficha del grupo: franja con 2 datos grandes "Grupo preaprobado por Bci" y "Si alguien se retira: …". **Falta decidir con Bci** si es devolución total o con multa: dejar la frase como "Propuesta" con chip amarillo y no inventar condiciones.
- **Aceptación:** la franja ocupa ≤ 40 palabras y no promete nada que no esté en `mapa-navegacion` ("Pendiente").

### B9 · Pendientes chicos
- B9 de Sprint 28 "varios primarios en el detalle" (un solo botón principal por pantalla).
- Verificar que cada hoja se cierra con Esc y devuelve el foco.

### B10 · Cierre
1. `node --test tests/*.test.js` (207 + los nuevos).
2. `crawl.py` (27 rutas) y `nav.py`.
3. `aud.py`: tabla "antes / después" de palabras y alturas, para tu informe.
4. Capturas a 360 y 390 px, con movimiento reducido y con texto al 150 %.
5. Contraste, zonas de toque y foco en las pantallas tocadas.
6. Publicar el artifact (versión final) y enviarte las capturas.
7. Actualizar `PLAN.md` (marcar B0–B10) y guardar el resumen en el proyecto.
8. **No subir a GitHub.** Mensaje de commit listo para cuando quieras (Sprints 27–30).

---

## 5. Lista de revisión por bloque (copiar al terminar cada uno)

- [ ] ≤ 60 palabras sin desplegar (D5)
- [ ] Una acción principal por pantalla
- [ ] Atrás vuelve a donde estaba
- [ ] Toques ≥ 44 px; contraste ≥ 4,5:1; foco visible
- [ ] Funciona con movimiento reducido y con texto al 150 %
- [ ] Ninguna cifra o fecha escrita a mano (salen de datos y cálculos)
- [ ] Pruebas, `crawl.py` y `nav.py` en verde

---

## 6. Cómo sabremos si mejoró (para el siguiente testeo)

| Medida (ISO 9241-11) | Hoy | Meta |
|---|---|---|
| Éxito en elegir camino y departamento (eficacia) | 60 % | ≥ 80 % |
| Éxito en entender la misión que vence primero | 10 % | ≥ 80 % (ya se ve arriba) |
| SEQ en esas dos tareas (satisfacción) | 4,8 y 4,6 | ≥ 5,5 |
| Toques de Inicio a "Elegir mi camino" (eficiencia) | por medir | ≤ 3 |
| Palabras en Ayudas | 597 | ≤ 220 |

Para el informe de 2 páginas: la tabla §1.3 y la de §6 cuentan la historia (hallazgo → cambio → medida) sin agregar texto.

---

## 7. Riesgos

- **B1 es la apuesta.** Si queda recargada, la compuerta D2 manda: plan B sin pelear con el diseño.
- **Quitar los chips** cambia cómo se filtran los departamentos; los tests de filtros se actualizan, no se borran.
- **Redirigir `#camino/elegir`** puede dejar enlaces viejos (hojas, toasts): buscarlos con `grep "camino/elegir"` (9 líneas hoy en `app.js`) y cambiarlos todos.
- **Textos con cifras** (UF 250, 27 nov, nov 2027): al recortar, no perder el dato que se calcula.
- **Cambiar de camino** (D3) es el punto más subjetivo: queda detrás de una bandera.
- Este sprint modifica tu carpeta local, no la versión publicada del testeo; el respaldo (B0) es tu punto de retorno.

---

## 8. Fuentes

- Nielsen Norman Group · *How people read on the web: the eyetracking evidence* y *Text scanning patterns* (se escanea, no se lee; chunking, viñetas y palabras clave): https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
- Nielsen Norman Group · *Formatting long-form content* (capas y divulgación progresiva con acordeones): https://nngroup.com/articles/formatting-long-form-content
- Nielsen Norman Group · *Progressive disclosure*: https://www.nngroup.com/videos/progressive-disclosure/
- Interaction Design Foundation · *Usability evaluation* (ISO 9241-11: eficacia, eficiencia, satisfacción; 10 heurísticas de Nielsen–Molich): https://ixdf.org/literature/topics/usability-evaluation
- Kora · *Designing financial UX for comprehension* (términos técnicos con explicación en lenguaje cotidiano): https://www.korahq.com/blog/designing-financial-ux-for-comprehension---not-just-completion
- UXPin · *Fintech design* (divulgación progresiva, lenguaje simple y expectativas claras): https://www.uxpin.com/studio/blog/fintech-design/
- Bci Kit y deck del Certamen 2 (guías: una cifra y una acción por pantalla, textos mínimos, WCAG 2.2 AA).
