# Evaluación · Sprint 2 · Marketplace de proyectos y publicación

Evaluado sobre el commit `bc9501c`, contra la sección "Sprint 2" de `PLAN.md` y las reglas de `CLAUDE.md` vigentes al momento de la entrega.

La app se recorrió en Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 844, **directamente en GitHub Pages** (`https://barbarasandreas-hue.github.io/vault-18/`), con un script que toca cada botón y mide la pantalla. No se probó en un teléfono físico.

**Cambios de reglas durante la evaluación:** mientras se revisaba, el Planner hizo el commit `7cb03c5`, que agrega los valores oficiales del Bci Kit (`docs/bci-kit.md`): Overpass en vez de Barlow Condensed y Figtree, títulos en peso 400, botón primario verde y botones en mayúsculas. Es posterior a la entrega y quedó planificado como **S3-F0 Bci Kit oficial**, así que **no se usa para juzgar este sprint**. Ver la corrección 1.

## 1. Veredicto

**APROBADO.** Las 7 features (S2-F0 a S2-F6) cumplen todos sus criterios y ninguna dimensión queda bajo 3.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 23 de 23 pasan |
| `node --test tests/` | Sigue fallando en Node 24. `CLAUDE.md:62` y `PLAN.md:20` aún dicen eso (corresponde al Planner) |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto"` | Vacío |
| Rutas que empiezan con `/` | Ninguna |
| Recursos externos | Solo Google Fonts. El favicon es un SVG en línea (`index.html:9`) |
| HTTP 200 en local (`python -m http.server`) | `/`, `index.html`, `css/estilos.css` y los 3 JS. `manifest.webmanifest` da 404 (corresponde a S3-F4) |
| HTTP 200 en GitHub Pages | Los 5 archivos. Su contenido es **idéntico** al commit `bc9501c` (sha1 comparado) |
| Consola y red en Pages (2 anchos, flujo completo) | 0 errores de JavaScript y 0 respuestas 4xx/5xx |
| Auto o plusvalía | No se menciona el auto. "Plusvalía" solo aparece en "Calculado sin plusvalía" (Inicio y detalle) |

**Las pruebas prueban algo real.** Comprueban los 4 criterios numéricos de S2-F2, `resumenProyecto()` para los dos tipos de proyecto (incluido el cupo extra después de comprar), que los datos cumplen S2-F1 y que el filtro de la IA saca al menos un proyecto por pestaña sin vaciarla.

### Recálculo independiente (`node -e`, sin `calculos.js`)

| Caso | Esperado | Recalculado | App |
|---|---|---|---|
| Arriendo neto de $600.000 | $495.000 | 495.000 | ✅ |
| UF 2.250 con arriendo de $420.000 | 4,5 %, pasa | 4,5002 % | "4,5 %", pasa ✅ |
| UF 2.250 con arriendo de $400.000 | 4,3 %, no pasa | 4,2859 % | "4,3 %", no pasa ✅ |
| Ahorro en lote de UF 2.500 / 3.000 | $10.266.250 / $12.319.500 | Igual | ✅ (tarjeta Alto Ñuñoa) |
| Avance de 6 de 10 | 60 % | 60 % | ✅ |
| Rentabilidad de los 12 departamentos | 3 bajo 4,5 % | va-502 4,10 %; va-901 4,18 %; pm-1004 4,36 %; el resto entre 4,62 % y 5,04 % | ✅ Ninguno está entre 4,45 % y 4,5 %, así que nunca se muestra "4,5 %" para un departamento que no pasa |
| Avance del financiamiento | — | Plaza Independencia 60 %, Brisas de La Florida 35 %, Parque Macul 80 % | ✅ |

Los 4 escenarios de Inicio siguen dentro de ±$1 de la tabla. Vivir individual muestra ahora **$752.318** (la tabla dice $752.319), porque el total pasó a ser la suma de las partes redondeadas. Está dentro de la tolerancia del plan.

## 3. Criterios por feature

### S2-F0 Nueva barra de 4 secciones

| Criterio | | Evidencia |
|---|---|---|
| Inicio, Proyectos, Mis proyectos y Perfil; cada uno muestra su sección | ✅ | `index.html:181-188`; el script toca los 4 y comprueba la pantalla visible y `aria-current` |
| La activa se distingue con color, ícono relleno y texto en negrita | ✅ | `css/estilos.css:465-480`: azul, `font-weight: 700` y `--relleno: currentColor` (medido en el navegador), más una raya. El relleno se ve en las capturas |
| Los nombres no se cortan a 360 px; botones de 44 × 44 px como mínimo | ✅ | 90 × 64 px a 360 y 98 × 64 px a 390; "Mis proyectos" en una línea; 0 textos cortados |
| Simula pasa a Inicio sin perder montos, desglose ni "Calculado sin plusvalía" | ✅ | Los 4 escenarios se leen desde la pantalla; el reparto abre; el sello está en `index.html:62` |
| Las secciones no hechas dicen "Disponible pronto" | ✅ | Perfil (`index.html:172-178`) |

### S2-F1 Datos de ejemplo

| Criterio | | Evidencia |
|---|---|---|
| Al menos 4 proyectos (2 + 2) con nombre de edificio | ✅ | 6 proyectos, 3 + 3 (`js/datos.js:15-28`) |
| Al menos 10 departamentos en comunas reales de Santiago | ✅ | 12 departamentos, en Ñuñoa, Santiago, Las Condes, Independencia, La Florida y Macul |
| Tipo, cupos, cupos tomados, UF financiadas y fecha de cierre | ✅ | Todos los proyectos; además lo revisa una prueba |
| Al menos 2 departamentos bajo 4,5 % | ✅ | 3, según el recálculo |

### S2-F2 Fórmulas del marketplace

| Criterio | | Evidencia |
|---|---|---|
| Arriendo neto, rentabilidad, ahorro y avance, con pruebas | ✅ | `js/calculos.js:108-132`; `tests/calculos.test.js:61-84` |
| Los 4 valores del plan | ✅ | Ver el recálculo |

### S2-F3 Pantalla Proyectos

| Criterio | | Evidencia |
|---|---|---|
| Pestañas "Compra en conjunto" y "Financiamiento del pie" | ✅ | `index.html:112-115`, con `role="tab"`, `aria-selected` y flechas del teclado |
| Tarjeta de compra en conjunto: ahorro como protagonista, "6 de 10" con barra y cierre | ✅ | Pantalla: "Ahorras al unirte · $10.266.250 · Cupos tomados 6 de 10 · Cierra el 15 de diciembre de 2026" |
| Tarjeta de financiamiento: precio como protagonista, barra del 15 % y cierre | ✅ | "Precio del departamento · $92.396.250 · 15 % reunido con inversionistas 60 % · Cierra el 10 de febrero de 2027" |
| En modo arrendar, solo proyectos de 4,5 % o más, con "Filtrado por IA" | ✅ | Arrendar: 2 + 2 proyectos y la etiqueta visible. Vivir: 3 + 3 y la etiqueta oculta |
| Estado vacío con "Cambiar a modo vivir" | ✅ | Forzado bajando todos los arriendos en el navegador: aparece "Ningún proyecto rinde 4,5 % hoy". El botón muestra 3 tarjetas y deja Inicio en "Para vivir" |

### S2-F4 Detalle y unirse

| Criterio | | Evidencia |
|---|---|---|
| Reparto 80 / 15 / 5 en pesos y total al mes, desde `calculos.js` | ✅ | `js/app.js:203-260` usa `resumenProyecto()`. Se ve: $73.916.999 / $13.859.438 / $4.619.813; $403.272 + $168.153 = $571.425 |
| En compra en conjunto, precio de lista tachado junto al precio con descuento | ✅ | `<s>$102.662.500</s>` y $92.396.250 |
| Frase de qué pasa si no se completa | ✅ | "Si el grupo no se completa: puedes pasar a compra individual o salir sin costo." |
| "Comprar aquí" (principal) e "Invertir aquí" (secundario, "Disponible pronto") | ✅ | Primario `btn-lg` y `btn-secundario-dark`; el aviso aparece al tocar |
| "Comprar aquí" toma el cupo, lo guarda en `localStorage` y lleva a Mi compra | ✅ | `localStorage` = `{"proyectoId":"alto-nunoa","departamentoId":"an-401"}`; dirección `#mis-proyectos` con la pestaña "Mi compra"; la tarjeta pasa a "7 de 10"; la compra sigue ahí al recargar |
| Con una compra en curso, el botón se reemplaza por un aviso | ✅ | Otro proyecto: "Ya tienes una compra en curso." El mismo proyecto: "Ya te uniste a este proyecto." con "Ver mi compra" |
| (extra) Proyecto inexistente | ✅ | "No encontramos este proyecto" con "Ver proyectos" |

### S2-F5 Mis proyectos (estructura)

| Criterio | | Evidencia |
|---|---|---|
| Pestañas "Mi compra" y "Mis inversiones" | ✅ | `index.html:153-156`; Mis inversiones muestra un estado vacío con "Ver proyectos" |
| Sin compra ni inversiones: estado vacío con "Ver proyectos" | ✅ | "Aún no tienes proyectos" (`index.html:143-150`) |
| Con compra: proyecto e indicador 1 Postula · 2 Tu 5 % · 3 Firma, con el paso 1 activo | ✅ | Lista numerada (es una secuencia), `aria-current="step"` y "Postula · Paso actual" |

### S2-F6 Publicación en GitHub Pages

| Criterio | | Evidencia |
|---|---|---|
| La entrega explica en palabras simples cómo activar Pages | ✅ | `sprints/sprint-2-entrega.md`, 6 pasos (incluye hacer público el repositorio) |
| Funciona en `https://<usuario>.github.io/<repositorio>/` sin 404 | ✅ | Repositorio público con `has_pages: true`; todo el flujo se recorrió en Pages sin respuestas 4xx ni errores. La entrega decía que no se pudo comprobar porque faltaba activarlo; ahora ya está activo |

### Calidad en el teléfono (medida en el navegador)

- **Sin scroll horizontal ni elementos fuera del ancho** en Inicio, Proyectos (las dos pestañas y el vacío), los dos detalles y Mi compra, a 390 y 360 px, incluso quitando `overflow-x: hidden`.
- **Acción principal de Inicio visible sin bajar:** "Ver proyectos" termina en y = 545 a 390 px e y = 567 a 360 px, sobre la barra incluso con 640 px de alto. **El hallazgo de la segunda revisión del Sprint 1 está corregido.**
- **Toques:** todos los enlaces y botones visibles miden 44 px de alto o más.
- **Contraste de los colores nuevos:** chip, aviso y paso actual (`--blue-dark` sobre `--blue-20`) 9,16:1; chip "Filtrado por IA" 5,29:1; pestaña activa 8,95:1; pestaña inactiva 7,59:1; paso inactivo 6,95:1. En gráficos: barra de avance 6,18:1 y círculo de paso 3,35:1. Todo cumple AA.
- **Áreas seguras y viewport:** sin cambios respecto del Sprint 1, todo correcto.

## 4. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 5 | Todos los criterios se comprobaron tocando la app publicada. Los números coinciden con el recálculo, y la compra se guarda, se recupera y se puede deshacer. |
| Calidad móvil | 4 | No hay desbordes, los toques son de 44 px y el contraste es AA. Baja porque "Comprar aquí" queda a 1,5 pantallas de scroll en el detalle, y "52 m²" se parte a 360 px en Mi compra. |
| Código | 4 | Los cálculos viven en `calculos.js`, el texto se escapa y se maneja la falta de `localStorage`. Quedan un cálculo de porcentaje y estilos en línea dentro de `app.js`. |
| Diseño | 4 | Hay un número protagonista por tarjeta, barras claras y el sello sin plusvalía en el detalle. La cabecera de Proyectos tiene 4 elementos antes de la primera tarjeta, y el 80 % muestra $73.916.999. |

## 5. Correcciones requeridas

No hay correcciones que bloqueen. Para el Sprint 3, en orden de importancia:

1. **S3-F0 Bci Kit oficial, lo primero del Sprint 3.** Hoy la app usa Barlow Condensed y Figtree, `--blue-normal: #0033cc`, primario azul y botones sin mayúsculas. Todo eso cambia con `docs/bci-kit.md`. Como toca todas las pantallas, conviene hacerlo antes que Postula y Perfil, y volver a medir a 360 px. Overpass es más ancha que Barlow Condensed: hay que revisar el número protagonista ("$8.623.650"), las pestañas y "Mis proyectos" en la barra. Además, el blanco sobre `--green-normal` debe ir en negrita de 19 px o más.
2. **`js/app.js:57`, función `ficha()`:** usar un espacio que no se corta entre el número y "m²" (`d.m2 + ' m²'`). A 360 px, Mi compra muestra "52" al final de una línea y "m²" sola en la siguiente.
3. **`js/app.js:71`, función `barraAvance()`:** `Math.round(fraccion * 100)` es un cálculo hecho en la pantalla. Hay que moverlo a `calculos.js` (por ejemplo, `porcentajeEntero(fraccion)`) y usarlo también para `aria-valuenow`.
4. **`js/app.js:135`, `:313` y `:317`:** los `style="transform:rotate(-90deg)"` y `style="margin-top:8px"` dentro de los textos HTML tienen que pasar a clases en `css/estilos.css`.
5. **Planner:** cambiar `node --test tests/` por `node --test` en `CLAUDE.md:62` y `PLAN.md:20`, y actualizar la tabla de referencia de `PLAN.md` a vivir individual = $752.318, que es la suma de las partes que muestra la app.

## 6. Qué revisar a mano en el teléfono

1. **Detalle de un proyecto:** a 390 × 844, "Comprar aquí" empieza recién en y ≈ 1.200, así que hay que bajar más de una pantalla. Fíjate si se entiende que hay que bajar, o si se siente escondido.
2. **Íconos de la barra:** el relleno de la sección activa se hace con variables CSS dentro de `<use>`. En Chrome funciona; revisa en Safari de iPhone que el ícono activo se vea relleno y no vacío.
3. **Comprar y volver:** compra en Alto Ñuñoa, cierra el navegador, vuelve a abrir la dirección de Pages y revisa que Mis proyectos recuerde la compra.

## 7. Sugerencias (no bloquean)

- **80 % = $73.916.999.** Para que el reparto sume exacto, el 80 % de Bci absorbe el redondeo y pierde $1, aunque su valor exacto es redondo ($73.917.000). Se vería más natural que lo absorbiera la parte que sí tenía decimales. Si es el 5 %, hay que confirmar que "al escriturar" siga dentro de ±$1 de la tabla.
- **Acción del detalle:** se puede considerar una barra fija con "Comprar aquí" sobre la barra inferior, o un segundo botón bajo la tarjeta del precio. Hoy el detalle sigue la letra del plan ("al final, dos caminos"), así que es una decisión del Planner.
- **Cabecera de Proyectos:** "Filtrado por IA", la frase del modo y "Cambiar" ocupan 3 líneas antes de las pestañas. Se podrían juntar en una sola fila para que la primera tarjeta suba.
- **"Salir de esta compra"** no estaba en el plan, pero sirve para la demo y coincide con "salir sin costo" de `SPEC.md`. Conviene que el Planner lo registre.
