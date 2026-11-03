# Evaluación · Sprint 1 · Base y Simula

## Segunda revisión (3 de noviembre de 2026, sobre el commit `570c954`)

**Veredicto: se mantiene APROBADO.** El código de la app no cambió desde la primera revisión: `index.html`, `css/` y `js/` son los mismos de las 07:05. Esta vez sí se vio la app en pantalla: se abrió en Chrome sin ventana, emulando un teléfono de 390 × 844 y de 360 × 844, y se recorrió con un script (tocar el reparto, las 4 combinaciones, la barra y "Ver proyectos").

### Repetido y confirmado

| Verificación | Resultado |
|---|---|
| `node --test` | 9 de 9 pasan |
| `node --test tests/` | Sigue fallando en Node 24 (`✖ tests 'test failed'`). Es el comando de `CLAUDE.md` y `PLAN.md`, no el código; sigue pendiente para el Planner |
| `node --check` de los 3 JS | Sin errores |
| Palabras prohibidas, rutas `/` y recursos externos | Vacío, ninguna y solo Google Fonts |
| HTTP 200 | `/`, `index.html`, `css/estilos.css` y los 3 JS. `manifest.webmanifest` da 404 (es de S3-F4) |
| Recálculo con `node -e`, sin `calculos.js` | Los 4 escenarios coinciden al peso con la tabla, con `escenario()` y **con lo que muestra la pantalla** |
| Contraste recalculado | Igual que en la primera revisión, todo AA. El ícono decorativo del estado vacío (`--blue-60` sobre `--gray-light`) da 3,21:1, que basta para un gráfico |

### Lo que se vio en el navegador (nuevo)

| Revisión | 390 px | 360 px |
|---|---|---|
| Scroll horizontal (`scrollWidth` del documento) | 390, ninguno | 360, ninguno |
| Igual, quitando `overflow-x: hidden` del `body` | 390, ninguno | 360, ninguno. Esa línea no esconde ningún desborde |
| Elementos que se salen del ancho o textos cortados | Ninguno, con el reparto cerrado y abierto | Ninguno |
| Fuentes cargadas (Barlow Condensed 700 y Figtree 400) | Sí | Sí |
| Número protagonista "$6.467.738" | Una línea, 70 px de alto | Una línea, 59 px de alto |
| Título "Cuánto cuesta tu departamento" | Una línea | Dos líneas, cortado entre palabras |
| Botones de la barra | 77–80 × 64 px | 71–74 × 64 px; "Mi departamento" en 2 líneas, sin cortes |
| "¿De dónde sale el resto?" | Abre, `aria-expanded="true"`, muestra $92.396.250 / $73.917.000 / $13.859.438 / $4.619.813 y $1.847.925 de gastos | Igual |
| Barra: cada botón muestra solo su pantalla y marca `aria-current` | Sí, las 5 | Sí |
| "Disponible pronto" en las 4 pantallas vacías | Sí | Sí |
| "Ver proyectos" lleva a `#proyectos` | Sí | Sí |
| Dirección desconocida (`#nada`) | Muestra Simula | Muestra Simula |
| Al final de la página, "Ver proyectos" queda sobre la barra | Sí, 37 px libres | Sí, 39 px libres |
| Errores de JavaScript en la consola | Ninguno | Ninguno |

### Hallazgos nuevos (ninguno bloquea)

1. **La acción principal no se ve al abrir la app.** A 390 × 844, el botón "Ver proyectos" empieza en y = 764 y la barra en y = 777: al entrar, solo asoman unos 13 px y hay que bajar para encontrarlo. En un teléfono real, con las barras del navegador, la pantalla es más baja y el botón queda escondido del todo. No falla ningún criterio de S1-F5, pero va contra "una acción por pantalla, se entiende en 10 segundos". **Para S2-F0** (Simula pasa a Inicio), conviene subir la acción, por ejemplo con el reparto cerrado bajo el botón, o con el texto de apoyo más corto.
2. **404 en la consola.** Chrome pide `favicon.ico` y no existe. Es el único recurso que falla. Se resuelve con `<link rel="icon">` cuando lleguen los íconos de S3-F4.
3. **La barra crece 2 px a 390 px.** "Mi departamento" en 2 líneas deja ese botón en 66 px de alto, aunque `--barra-alto` dice 64. No se nota, y la barra se reemplaza en S2-F0, pero allí conviene volver a medir "Mis proyectos".

### Limpieza de la primera revisión: sigue pendiente

Los 4 puntos de la sección 5 siguen igual: el comentario "Sprint 4" en `js/datos.js:2`, `.oculto-visual` sin uso (`css/estilos.css:78-84`), el campo `descripcion` sin uso (`js/datos.js:6-7`) y `stroke="#fff"` fijo en `index.html:17`. Se pueden resolver al empezar el Sprint 2.

### Puntuaciones (sin cambios)

Funcionalidad 5 · Calidad móvil 4 (baja por el hallazgo 1, aunque ahora se vio en pantalla) · Código 4 · Diseño 4.

---

## Primera revisión

Evaluado contra la sección "Sprint 1 · Base y Simula" de la versión actual de `PLAN.md` y contra `CLAUDE.md`. La barra de 4 secciones (S2-F0) no se exige en este sprint: S1-F3 se evalúa con su texto actual (5 pantallas).

**Límite de esta revisión:** no hubo navegador. El diseño a 390 px y 360 px se evaluó leyendo `index.html` y `css/estilos.css`, y midiendo los textos críticos con las métricas reales de las fuentes (Figtree 400/700 y Barlow Condensed 700, descargadas de Google Fonts y medidas con un script de Node). Nada se vio en pantalla.

## 1. Veredicto

**APROBADO.** Las 6 features (S1-F1 a S1-F6) cumplen todos sus criterios y ninguna dimensión queda bajo 3.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` (Node v24.19.0) | 9 de 9 pasan, 0 fallan |
| `node --test tests/` | Falla: `test at tests:1:1 ✖ tests 'test failed'`. Node 24 no acepta una carpeta como argumento. **Es un problema del comando del plan, no del Generator** (ver observación para el Planner) |
| `node --check js/app.js js/calculos.js js/datos.js` | Sin errores |
| `grep -rniE "plata\|depto\|dpto" index.html js/ css/` | Vacío |
| `src="/` o `href="/` en `index.html` | Ninguno |
| Recursos externos | Solo `fonts.googleapis.com` y `fonts.gstatic.com` (`index.html:9-11`) |
| HTTP 200 (servidor en el puerto 8000) | `/` 200, `index.html` 200, `css/estilos.css` 200, `js/calculos.js` 200, `js/datos.js` 200, `js/app.js` 200 |
| `manifest.webmanifest` | 404. Corresponde a S3-F4, no se exige en este sprint |

**Observación para el Planner:** en `CLAUDE.md` y `PLAN.md` ("Verificaciones que aplican a todos los sprints") hay que cambiar `node --test tests/` por `node --test` (o `node --test tests/calculos.test.js`).

**Las pruebas sí prueban algo:** `tests/calculos.test.js` compara los 4 escenarios con la tabla de referencia (al escriturar, dividendo + seguros, cuota a inversionistas y total al mes, ±$1) y además revisa el descuento por lote, el 5 % + 2 %, el reparto 80/15/5, la conversión de UF y el formato de pesos.

### Recálculo independiente (`node -e`, sin usar `calculos.js`)

Hecho con UF $41.065, cuota francesa con tasa mensual = tasa anual / 12, 4,5 % a 360 meses sobre el 80 % + UF 0,7 de seguros, y 8 % a 120 meses sobre el 15 %.

| Escenario | Al escriturar | Dividendo + seguros | Cuota inversionistas | Total al mes | ¿Coincide con la tabla y con `escenario()`? |
|---|---|---|---|---|---|
| Arrendar, lote (UF 2.250) | 6.467.738 | 403.272 | 168.153 | 571.425 | Sí |
| Arrendar, individual (UF 2.500) | 7.186.375 | 444.886 | 186.837 | 631.723 | Sí |
| Vivir, lote (UF 2.700) | 7.761.285 | 478.177 | 201.784 | 679.961 | Sí |
| Vivir, individual (UF 3.000) | 8.623.650 | 528.114 | 224.204 | 752.319 | Sí |

Reparto de arrendar en lote: Bci $73.917.000, inversionistas $13.859.438, usuario $4.619.813, gastos $1.847.925 y precio $92.396.250. Son los mismos valores que muestra `renderSimula()`.

## 3. Criterios por feature

### S1-F1 Estructura de archivos

| Criterio | | Evidencia |
|---|---|---|
| Existen `index.html`, `css/estilos.css`, `js/calculos.js`, `js/datos.js`, `js/app.js` y `tests/calculos.test.js` | ✅ | `ls -R` |
| Todas las rutas son relativas | ✅ | `index.html:12,142-144`; el grep de `="/` sale vacío |
| Meta viewport con `viewport-fit=cover` | ✅ | `index.html:5` |
| `calculos.js` termina con `if (typeof module !== 'undefined') module.exports = {...}` | ✅ | `js/calculos.js:96-110` |

### S1-F2 Tokens del Bci Kit

| Criterio | | Evidencia |
|---|---|---|
| 24 variables de color (`--blue-dark` … `--red-20`) | ✅ | `css/estilos.css:10-37`; el conteo con grep da 24 |
| 6 variables de grises y blanco | ✅ | `css/estilos.css:39-44`; el conteo da 6 |
| Barlow Condensed y Figtree desde Google Fonts y aplicadas | ✅ | `index.html:11`; `css/estilos.css:47-48`, `65` (cuerpo), `89` (títulos) |
| Display 1–4 y Encabezado 1–6 | ✅ | `css/estilos.css:87-103` |
| 5 tipos de botón en 3 tamaños (más estado de carga) | ✅ | `css/estilos.css:110-165` (`.btn-sm`, normal y `.btn-lg`; `.is-cargando`) |
| Fondo claro | ✅ | `body { background: var(--gray-light) }`, `css/estilos.css:63` |

### S1-F3 Navegación (5 pantallas)

| Criterio | | Evidencia |
|---|---|---|
| Barra con Simula, Proyectos, Postula, Tu 5 % y Mi departamento | ✅ | `index.html:131-139` |
| Tocar cada ícono muestra su pantalla | ✅ | `href="#…"` → `hashchange` → `mostrar()` en `js/app.js:48-62`; los ids `pantalla-*` coinciden con `PANTALLAS` (`app.js:5`) |
| La activa se distingue con color y texto, no solo con color | ✅ | Azul + negrita 700 + raya superior + `aria-current="page"` (`css/estilos.css:348-356`, `app.js:55-58`) |
| Botón de 44 × 44 px como mínimo y texto visible | ✅ | `min-height: 64px`, `min-width: 44px` (`css/estilos.css:338-339`); columnas de alrededor de 72 px a 360 px; texto visible en cada `<a>` |
| Respeta `env(safe-area-inset-bottom)` | ✅ | `css/estilos.css:319`, y el contenido deja ese espacio libre (`:174`) |
| Pantallas aún no hechas dicen "Disponible pronto" | ✅ | `index.html:101-128` |

### S1-F4 Fórmulas base

| Criterio | | Evidencia |
|---|---|---|
| Están precio, pie, gastos, al escriturar, dividendo, cuota a inversionistas, total al mes, UF a pesos y formato de pesos | ✅ | `js/calculos.js:20-70` |
| Las pruebas cubren los 4 escenarios (4 campos cada uno) | ✅ | `tests/calculos.test.js:6-26`; `node --test` 9/9; recálculo independiente idéntico |
| `formatoPesos(6467738)` devuelve `$6.467.738` | ✅ | `tests/calculos.test.js:52`; verificado con `node -e` (también `-$1.234` y `$0`) |

### S1-F5 Pantalla Simula

| Criterio | | Evidencia |
|---|---|---|
| Arrendar en lote muestra $6.467.738 al escriturar (protagonista, `.display-1`) y $571.425 al mes | ✅ | `index.html:58-62`; estado inicial `arrendar`/`lote` (`app.js:7-10`); `escenario(2500,'lote')` da esos valores |
| Al cambiar cualquier opción se actualiza al instante y coincide con la tabla | ✅ | Evento `change` → `renderSimula()` (`app.js:29-35`); los 4 escenarios coinciden con el recálculo |
| "¿De dónde sale el resto?" muestra el reparto en pesos con los textos pedidos | ✅ | `index.html:67-91`, con el despliegue y `aria-expanded` en `app.js:37-42` |
| Se lee "Calculado sin plusvalía" | ✅ | `index.html:63` |
| Acción principal "Ver proyectos" lleva a Proyectos | ✅ | `index.html:96` (`href="#proyectos"`) |
| La pantalla no calcula por su cuenta | ✅ | `app.js` solo llama a `escenario()` y `formatoPesos()` (`app.js:16-26`) |

### S1-F6 Visible en el teléfono por wifi

| Criterio | | Evidencia |
|---|---|---|
| La entrega explica paso a paso cómo abrirla en el celular | ✅ | `sprints/sprint-1-entrega.md`, sección "Cómo verlo en el teléfono" (servidor, `ipconfig`, misma wifi y firewall) |
| `index.html`, el CSS y los 3 JS responden 200 | ✅ | Comprobado con `curl` contra `localhost:8000` |

### Calidad en el teléfono (medido, no visto)

- **Barra a 360 px:** "departamento" ocupa 70,1 px (72,3 px en negrita) a 11 px, y la columna mide 72 px menos 4 px de relleno. La grilla `1fr` agranda esa columna a su ancho mínimo (alrededor de 76 px) y achica las demás a unos 71 px. No hay corte ni scroll, pero queda **muy justo**. A 390 px pasa lo mismo con 12 px. "Mi departamento" usa 2 líneas: 24 + 2 + 2 × 13,8 + 12 ≈ 63,6 px, que cabe dentro de los 64 px.
- **Número protagonista:** el más largo, "$8.623.650", mide 254 px a 64 px (hay 310 px disponibles a 390) y 215 px a 54 px (hay 280 px disponibles a 360).
- **Título** "Cuánto cuesta tu departamento" (30 px): mide 344 px, cabe en una línea a 390 y se parte entre palabras a 360.
- **Selectores y reparto:** entran con holgura a 360 px. El monto más ancho de la lista mide alrededor de 95 px, y la palabra más larga ("inversionistas", 97 px) cabe en su columna de alrededor de 141 px.
- **Contraste (WCAG, con los colores del CSS):** texto principal 14,76:1; texto de apoyo `--gray-semidark` sobre blanco 7,59:1 y sobre `--gray-light` 6,95:1; azul sobre blanco y blanco sobre azul 8,95:1; número `--blue-dark` 13,25:1; sello `--green-dark` sobre `--green-20` 5,29:1; botón deshabilitado 4,97:1; ícono de check 6,64:1. Todo cumple AA.
- **Áreas seguras:** arriba (`.app`), a los lados (`.pantalla` con `max(20px, env(...))`) y abajo (barra).
- **No aplican en este sprint:** campos de dinero con `inputmode` (no hay campos) y manifest (S3-F4).

## 4. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 5 | Los 4 escenarios coinciden al peso con el recálculo independiente, el reparto y la navegación funcionan y no hay cálculos fuera de `calculos.js`. |
| Calidad móvil | 4 | Viewport, áreas seguras, toques de 44 px y contraste AA están bien; la barra queda justa con "departamento" a 360 px y nada se vio en un teléfono real. |
| Código | 4 | Está ordenado según `CLAUDE.md`, con nombres claros y pruebas reales; hay restos menores (una clase sin uso, un campo sin uso y un comentario desactualizado). |
| Diseño | 4 | Usa los tokens del Bci Kit, un solo número protagonista, el sello sin plusvalía y una lista con check; es sobrio y no parece una plantilla, aunque la marca es solo texto. |

## 5. Correcciones requeridas

No hay correcciones que bloqueen. Limpieza recomendada para el Sprint 2, en orden de importancia:

1. `js/datos.js:2`: el comentario dice "En el Sprint 4 se agregan los departamentos y lotes", pero según `PLAN.md` eso es S2-F1. Hay que actualizarlo.
2. `css/estilos.css:78-84`: `.oculto-visual` no se usa en ninguna parte. Hay que usarla (por ejemplo, para un texto de apoyo en la barra) o borrarla.
3. `js/datos.js:6-7`: el campo `descripcion` no se usa. Hay que borrarlo o mostrarlo en Simula.
4. `index.html:17`: el check del ícono tiene `stroke="#fff"` fijo. Conviene usar un color del kit (`var(--white)` por CSS) para no salirse de los tokens.

## 6. Qué revisar a mano en el teléfono

1. **Barra inferior a 360 px:** que "Mi departamento" se lea completo en 2 líneas, que no empuje a los otros botones y que la raya azul de la pantalla activa no se descuadre, porque las columnas quedan de anchos distintos.
2. **Número protagonista y "Calculado sin plusvalía":** que se entiendan en 10 segundos, que el número grande no se parta y que el sello verde se lea bien a pleno sol.
3. **iPhone con barra de gestos:** que la barra no quede bajo la línea de inicio y que el botón "Ver proyectos" no quede tapado por la barra al bajar hasta el final.

## 7. Sugerencias (no bloquean)

- `body { overflow-x: hidden }` (`css/estilos.css:68`) esconde cualquier desborde horizontal en vez de evitarlo. Conviene probar sin esa línea en el navegador, para detectar desbordes antes del Sprint 7.
- La rama de respaldo de `formatoPesos` (`calculos.js:66-68`) no tiene prueba. Se puede agregar una que fuerce ese camino.
- `escenario()` redondea por separado el dividendo, la cuota y el total. En vivir individual, la suma de las partes da $752.318 y el total $752.319. Cuando una pantalla muestre las tres cifras juntas (S2-F4), conviene calcular el total como la suma de las partes redondeadas para que cuadre a la vista. Lo mismo pasa con el reparto: 80 + 15 + 5 suma $92.396.251 contra un precio de $92.396.250.
- Al pasar a la barra de 4 secciones (S2-F0), el problema de "departamento" en la barra desaparece, pero hay que repetir la medición con "Mis proyectos".
