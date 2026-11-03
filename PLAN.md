# PLAN · Primer Peldaño

Plan de sprints basado en `SPEC.md` y en el recorrido de [`docs/journey-map.md`](docs/journey-map.md). Primer Peldaño es un **marketplace de departamentos**: el usuario ve proyectos y se une a compras en conjunto o a financiamiento del pie. Cada sprint termina con la app abrible en el teléfono.

## Números de referencia

Los criterios usan estos valores (UF $41.065). Se acepta una diferencia de ±$1 por redondeo.

| Escenario | Precio | Al escriturar | Dividendo + seguros | Cuota inversionistas | Total al mes |
|---|---|---|---|---|---|
| Arrendar, lote | UF 2.250 | $6.467.738 | $403.272 | $168.153 | $571.425 |
| Arrendar, individual | UF 2.500 | $7.186.375 | $444.886 | $186.837 | $631.723 |
| Vivir, lote | UF 2.700 | $7.761.285 | $478.177 | $201.784 | $679.961 |
| Vivir, individual | UF 3.000 | $8.623.650 | $528.114 | $224.204 | $752.319 |

Ahorro por unirse a una compra en conjunto: UF 2.500 → $10.266.250; UF 3.000 → $12.319.500.

## Verificaciones que aplican a todos los sprints

- `node --test tests/` pasa completo.
- `node --check js/*.js` sin errores.
- `grep -rniE "plata|depto|dpto" index.html js/ css/` sale vacío.
- Sin rutas que empiecen con `/` (`src="/` o `href="/`).
- Sin librerías externas, salvo Google Fonts.
- Ninguna pantalla calcula por su cuenta: todo sale de `js/calculos.js`.
- Se ve bien a 390 px y sin scroll horizontal a 360 px.
- Sin nombres de personas: solo "usuario", "cliente" o "inversionista".

---

## Sprint 1 · Base y Simula

**Objetivo:** tener la app abierta en el teléfono por wifi, con la identidad del Bci Kit y la pantalla Simula calculando de verdad.

- **S1-F1 Estructura de archivos.** `index.html`, `css/estilos.css`, `js/calculos.js`, `js/datos.js`, `js/app.js`, `tests/calculos.test.js`.
  - Todas las rutas son relativas.
  - `index.html` tiene la meta viewport con `viewport-fit=cover`.
  - `js/calculos.js` termina con `if (typeof module !== 'undefined') module.exports = {...}`.
- **S1-F2 Tokens del Bci Kit.** Colores, tipografías, títulos y botones.
  - `css/estilos.css` define las 24 variables de color (`--blue-dark` … `--red-20`) y las 6 de grises y blanco.
  - Barlow Condensed y Figtree se cargan desde Google Fonts y se aplican a títulos y texto.
  - Existen clases para Display 1 a 4, Encabezado 1 a 6 y los 5 tipos de botón en 3 tamaños.
  - El fondo de la app es claro (`--white` o `--gray-light`).
- **S1-F3 Navegación.** Barra inferior con las 5 pantallas del comprador: Simula, Proyectos, Postula, Tu 5 % y Mi departamento.
  - Tocar cada ícono muestra su pantalla; la activa se distingue con color y texto, no solo con color.
  - Cada botón de la barra mide 44 × 44 px como mínimo y tiene texto visible.
  - La barra respeta el área segura inferior (`env(safe-area-inset-bottom)`).
  - Las pantallas aún no hechas muestran un estado vacío con texto ("Disponible pronto").
- **S1-F4 Fórmulas base.** En `js/calculos.js`: precio, pie, gastos, al escriturar, dividendo, cuota inversionistas, total al mes, conversión UF a pesos y formato de pesos.
  - `tests/calculos.test.js` comprueba los 4 escenarios de la tabla de referencia (al escriturar, dividendo + seguros, cuota inversionistas y total al mes).
  - El formato de pesos devuelve, por ejemplo, `$6.467.738`.
- **S1-F5 Pantalla Simula.** Elige vivir o arrendar, lote o individual.
  - Para arrendar en lote muestra como número protagonista "$6.467.738" al escriturar y "$571.425" al mes.
  - Al cambiar cualquiera de las dos opciones, los números se actualizan al instante y coinciden con la tabla de referencia.
  - Un toque en "¿De dónde sale el resto?" muestra el reparto en pesos: 80 % "lo presta Bci", 15 % "lo reúnes con inversionistas", 5 % "lo pones tú".
  - Se lee la frase "Calculado sin plusvalía".
  - Acción principal: "Ver proyectos", que lleva a Proyectos.
- **S1-F6 Visible en el teléfono por wifi.** `sprints/sprint-1-entrega.md` explica paso a paso cómo abrirla en el celular.
  - Con `python -m http.server 8000 --bind 0.0.0.0` corriendo, `index.html`, el CSS y los 3 JS responden 200.

## Sprint 2 · Marketplace de proyectos y publicación

**Objetivo:** que el usuario recorra el marketplace, entienda los dos tipos de proyecto y se una a uno; y poder mostrar la app desde cualquier teléfono.

- **S2-F0 Nueva barra de 4 secciones.** Reemplaza la barra del Sprint 1 (5 pasos) por Inicio, Proyectos, Mis proyectos y Perfil (ver `SPEC.md`, sección 3).
  - Tocar cada ícono muestra su sección; la activa se distingue con color, ícono relleno y texto en negrita, no solo con color.
  - Los 4 nombres caben sin cortarse a 360 px y cada botón mide 44 × 44 px como mínimo.
  - La pantalla Simula del Sprint 1 pasa a ser el simulador de Inicio, sin perder ninguno de sus criterios (montos, desglose y "Calculado sin plusvalía").
  - Las secciones aún no hechas muestran "Disponible pronto".
- **S2-F1 Datos de ejemplo.** `js/datos.js` con al menos 4 proyectos (2 de compra en conjunto y 2 de financiamiento del pie) y al menos 10 departamentos en comunas reales de Santiago. Los proyectos llevan nombre de edificio, nunca de personas.
  - Cada proyecto tiene tipo, cupos totales, cupos tomados, UF financiadas y fecha de cierre.
  - Al menos 2 departamentos tienen rentabilidad menor a 4,5 % (para probar el filtro).
- **S2-F2 Fórmulas del marketplace.** Arriendo neto, rentabilidad, ahorro por unirse y avance del proyecto, con pruebas.
  - Arriendo bruto $600.000 → neto $495.000.
  - Departamento de UF 2.250 con arriendo bruto $420.000 → 4,5 % (pasa el filtro); con $400.000 → 4,3 % (no pasa).
  - Ahorro por unirse a un lote de departamentos de UF 2.500 → $10.266.250.
  - 6 cupos tomados de 10 → 60 %.
- **S2-F3 Pantalla Proyectos.** Lista de tarjetas con pestañas "Compra en conjunto" y "Financiamiento del pie".
  - Tarjeta de compra en conjunto: número protagonista = ahorro por unirse; debajo, cupos tomados ("6 de 10") con barra y fecha de cierre.
  - Tarjeta de financiamiento del pie: número protagonista = precio en pesos; debajo, cuánto del 15 % ya se reunió con inversionistas (barra) y fecha de cierre.
  - En modo arrendar solo aparecen proyectos cuyos departamentos rinden 4,5 % o más, con la etiqueta "Filtrado por IA".
  - Si no hay proyectos que cumplan, aparece un estado vacío con la acción "Cambiar a modo vivir".
- **S2-F4 Detalle y unirse.** Al tocar una tarjeta se abre el detalle del proyecto.
  - Muestra el reparto 80 / 15 / 5 en pesos y el total al mes, calculados con `calculos.js`.
  - En compra en conjunto, el precio de lista aparece tachado junto al precio con 10 % de descuento.
  - Explica en una frase qué pasa si el grupo no se completa ("Puedes pasar a compra individual o salir sin costo").
  - Al final, dos caminos: "Comprar aquí" (principal) e "Invertir aquí" (secundario; muestra "Disponible pronto" hasta el Sprint 6).
  - "Comprar aquí" marca el cupo como tomado, lo guarda en `localStorage` y lleva a Mis proyectos › Mi compra.
  - Si el usuario ya tiene una compra, "Comprar aquí" se reemplaza por un aviso ("Ya tienes una compra en curso").
- **S2-F5 Mis proyectos (estructura).** Pestañas "Mi compra" y "Mis inversiones".
  - Sin compra ni inversiones: estado vacío con la acción "Ver proyectos".
  - Con una compra: Mi compra muestra el proyecto elegido y un indicador de pasos (1 Postula · 2 Tu 5 % · 3 Firma) con el paso 1 activo.
- **S2-F6 Publicación en GitHub Pages.** La entrega explica en palabras simples cómo activar Pages desde la rama `main`.
  - La app funciona en `https://<usuario>.github.io/<repositorio>/` sin errores 404.

## Sprint 3 · Postula, Perfil y agregar a pantalla de inicio

**Objetivo:** pasar la app al Bci Kit oficial, saber si el usuario y su pareja califican para el proyecto elegido, y poder instalar la app como ícono.

- **S3-F0 Bci Kit oficial (hacer primero).** Reemplaza los valores de referencia de los Sprints 1 y 2 por los oficiales de `docs/bci-kit.md`.
  - `css/estilos.css` usa exactamente los colores de `docs/bci-kit.md` (por ejemplo, `--green-normal: #28892B`, `--blue-normal: #2772CC`, `--gray-dark: #37474F`).
  - Overpass (pesos 400, 600 y 700) reemplaza a Barlow Condensed y Figtree en `index.html` y en el CSS; los títulos van en peso 400.
  - Display 1 a 4 y Encabezado 1 a 6 tienen los tamaños de `docs/bci-kit.md`.
  - Los botones son píldoras (radio 48 px, borde 1,6 px, texto en mayúsculas) con altos de 36, 50 y 56 px; el small tiene una zona táctil de 44 px como mínimo.
  - El texto blanco sobre `--green-normal` va en negrita de 19 px o más; el texto verde chico va en `--green-dark`; ningún texto es amarillo.
  - Los campos de dinero miden 50 px de alto, con texto de 18 px y radio de 6 px.
  - Los íconos son SVG de línea dibujados en el código; no se usa la fuente de íconos de Bci.
- **S3-F1 Fórmula de carga.** En `js/calculos.js`, carga y su nivel (holgado, en el límite, no aprueba), con pruebas.
  - Arrendar en lote con $1.500.000 + $1.000.000 → 22,9 %, holgado.
  - Arrendar en lote con $1.200.000 + $800.000 → 28,6 %, en el límite.
  - Vivir individual con $1.500.000 + $1.000.000 → 30,1 %, no aprueba.
  - Exactamente 25 % es holgado y exactamente 30 % es en el límite.
- **S3-F2 Postula (paso 1 de Mi compra).** Dos campos de sueldo (usuario y pareja), con el proyecto elegido visible arriba.
  - Los campos usan `inputmode="numeric"` y muestran el monto con punto de miles al escribir.
  - Número protagonista: el porcentaje de carga con semáforo (color + palabra + ícono).
  - Si un campo está vacío o es cero, muestra un mensaje de error claro y no calcula.
  - En amarillo o rojo, muestra una sugerencia concreta calculada con `calculos.js` (por ejemplo, "Si te unes a una compra en conjunto, tu carga baja a X %") y un enlace para volver a Proyectos.
  - Acción principal: "Postular" (deshabilitada en rojo). Al postular en verde o amarillo, el indicador avanza al paso 2.
- **S3-F3 Recordar elecciones.** Modo, tipo de compra, proyecto y sueldos se guardan en `localStorage`.
  - Al recargar la página, Inicio, Proyectos y Mis proyectos muestran lo último elegido.
  - Si `localStorage` no está disponible, la app funciona igual con valores por defecto.
- **S3-F4 Agregar a pantalla de inicio.** `manifest.webmanifest` con nombre, colores del Bci Kit e íconos de 192 y 512 px.
  - El manifest responde 200 y está enlazado desde `index.html`.
- **S3-F5 Perfil.** Muestra y permite editar modo (vivir o arrendar), sueldos y arriendo actual; al guardar, todo se recalcula.
  - "Empezar de nuevo" borra lo guardado y vuelve al simulador de Inicio.

## Sprint 4 · Tu 5 % y escritura

**Objetivo:** que el usuario sepa cuántos meses le toma juntar lo que pone al escriturar, se mantenga motivado y entienda lo que firma.

- **S4-F1 Fórmula de meses.** Meses para la meta, con pruebas.
  - Arrendar en lote ($6.467.738) ahorrando $500.000 al mes → 13 meses.
  - Ahorro mensual cero o vacío → error, no un número infinito.
- **S4-F2 Tu 5 % (paso 2 de Mi compra).** La meta sale del proyecto al que se unió el usuario.
  - Número protagonista: los meses ("13 meses").
  - Campo de ahorro mensual con teclado numérico.
  - Barra de avance con hitos al 25 %, 50 %, 75 % y 100 %.
  - Acción principal: "Empezar a ahorrar".
- **S4-F3 Propio o grupal.** El usuario elige ahorro propio o grupal.
  - El grupal explica en una frase que cada persona junta su propio 5 % y retira exactamente lo que aportó: nadie aporta por otro ni queda debiendo.
  - En ninguna parte de la pantalla se sugiere que el 5 % lo pongan inversionistas u otras personas.
  - No se menciona el auto en ninguna parte.
- **S4-F4 Avance simulado.** Un botón "Simular un mes" suma el ahorro mensual al avance y lo guarda en `localStorage`.
- **S4-F5 Lista de firma.** Al llegar a la meta aparece un mensaje de logro y la lista de lo que se firma en la escritura (crédito Bci, segunda hipoteca con los inversionistas, cuenta custodia), con checks y en palabras simples.
  - Es el paso 3 de Mi compra. Acción principal: "Firmar" (simulado); después, Mi compra pasa a mostrar Mi departamento.
- **S4-F6 Inicio con próximo paso.** Una vez que el usuario se unió a un proyecto, Inicio muestra una tarjeta con el paso en que va y su número (por ejemplo, "Te faltan 13 meses") y un botón que lleva directo a ese paso.
  - "Volver a simular" sigue a un toque.

## Sprint 5 · Mi departamento

**Objetivo:** que el usuario vea cómo se movió el dinero del mes y cuánto le falta para terminar de pagar.

- **S5-F1 Fórmulas del mes.** Lo que pone el usuario y saldo de cada deuda después de N cuotas, con pruebas.
  - Arrendar en lote con arriendo bruto $450.000 → neto $371.250 → el usuario pone $200.175.
  - Arriendo bruto $700.000 → neto $577.500 → excedente de $6.075.
- **S5-F2 Cascada de la cuenta custodia (modo arrendar).** Se ve en Mis proyectos › Mi compra después de firmar. Pasos numerados: entra el arriendo, se descuenta administración, se paga el dividendo, se paga a los inversionistas, el usuario completa.
  - Número protagonista: lo que puso el usuario este mes ($200.175 en el ejemplo).
- **S5-F3 Modo vivir.** Muestra el total al mes y lo compara con el arriendo actual del usuario.
- **S5-F4 Avance de la deuda.** Dos barras: crédito Bci (30 años) e inversionistas (10 años), con meses pagados y saldo en pesos.
  - Se lee "Calculado sin plusvalía" junto al avance.
- **S5-F5 Aviso de abono.** Cuando hay excedente, aparece la acción "Abonar" con la explicación de que conviene abonar a la deuda de inversionistas porque tiene la tasa más alta.
  - Sin excedente, la acción no aparece.

## Sprint 6 · Inversionista

**Objetivo:** que cualquier usuario pueda invertir en un proyecto desde el mismo marketplace y seguir sus inversiones. No hay selector de rol: se decide dentro de cada proyecto.

- **S6-F1 Invertir aquí.** En el detalle de cada proyecto, "Invertir aquí" queda activo y abre la pantalla Invertir.
  - Un usuario puede tener una compra e inversiones al mismo tiempo.
- **S6-F2 Información para invertir.** El detalle del proyecto muestra rentabilidad (UF + 8 %), plazo (10 años), garantía (segunda hipoteca) y lo que falta por financiar.
  - Departamento de UF 2.250 en una compra en conjunto → por financiar UF 337,5 = $13.859.438.
  - Una frase explica la cuenta custodia: Bci cobra el arriendo y paga a los inversionistas después del dividendo.
- **S6-F3 Invertir.** Campo de monto en UF con teclado numérico.
  - Número protagonista: la cuota mensual que recibirá. UF 10 → $4.982 al mes.
  - Menos de UF 10 o más de lo que falta por financiar → mensaje de error y "Confirmar" deshabilitado.
  - Al confirmar, el avance del financiamiento del proyecto sube en el marketplace.
- **S6-F4 Mis inversiones.** Pestaña de Mis proyectos con la lista de inversiones guardadas en `localStorage`.
  - Número protagonista: cobrado a la fecha. Botón "Simular un mes" suma una cuota por inversión.
  - Sin inversiones, muestra un estado vacío con la acción "Ver proyectos".
  - Si el usuario solo tiene inversiones (sin compra), Mis proyectos abre directo en esta pestaña e Inicio muestra lo cobrado a la fecha.

## Sprint 7 · Pulido, comprensión y accesibilidad

**Objetivo:** que la app se sienta terminada y sea fácil de comprender para todos, incluidas personas con baja visión.

- **S7-F1 Estado de carga en botones.** Las acciones principales (Comprar aquí, Postular, Firmar, Confirmar) muestran el estado de carga del Bci Kit por un momento antes de avanzar.
- **S7-F2 Contraste AA.** Todas las combinaciones de texto y fondo cumplen 4,5:1 (texto normal) o 3:1 (texto grande), calculadas con los colores reales del CSS.
- **S7-F3 Textos de 10 segundos.** Cada pantalla tiene un título de máximo 6 palabras y una frase de apoyo de máximo 15.
- **S7-F4 Explicaciones a un toque.** Dividendo, pie, carga, segunda hipoteca, cuenta custodia, compra en conjunto y financiamiento del pie tienen un ícono de ayuda que abre una explicación de una frase, sin jerga. Las mismas explicaciones se reúnen en Perfil › Ayuda.
- **S7-F5 Revisión en 360 px.** Ningún texto cortado ni scroll horizontal en ninguna pantalla.
- **S7-F6 Introducción.** Una primera pantalla, solo la primera vez, con el mensaje "Tu departamento con el 5 % del precio" y una lista con check de las 3 partes (Bci, inversionistas, tú) y de los dos tipos de proyecto.

---

## Estado

| Sprint | Feature | Estado |
|---|---|---|
| 1 | S1-F1 Estructura de archivos | aprobada |
| 1 | S1-F2 Tokens del Bci Kit | aprobada |
| 1 | S1-F3 Navegación | aprobada |
| 1 | S1-F4 Fórmulas base | aprobada |
| 1 | S1-F5 Pantalla Simula | aprobada |
| 1 | S1-F6 Visible en el teléfono por wifi | aprobada |
| 2 | S2-F0 Nueva barra de 4 secciones | aprobada |
| 2 | S2-F1 Datos de ejemplo | aprobada |
| 2 | S2-F2 Fórmulas del marketplace | aprobada |
| 2 | S2-F3 Pantalla Proyectos | aprobada |
| 2 | S2-F4 Detalle y unirse | aprobada |
| 2 | S2-F5 Mis proyectos (estructura) | aprobada |
| 2 | S2-F6 Publicación en GitHub Pages | aprobada |
| 3 | S3-F0 Bci Kit oficial (hacer primero) | pendiente |
| 3 | S3-F1 Fórmula de carga | pendiente |
| 3 | S3-F2 Postula (paso 1 de Mi compra) | pendiente |
| 3 | S3-F3 Recordar elecciones | pendiente |
| 3 | S3-F4 Agregar a pantalla de inicio | pendiente |
| 3 | S3-F5 Perfil | pendiente |
| 4 | S4-F1 Fórmula de meses | pendiente |
| 4 | S4-F2 Tu 5 % (paso 2 de Mi compra) | pendiente |
| 4 | S4-F3 Propio o grupal | pendiente |
| 4 | S4-F4 Avance simulado | pendiente |
| 4 | S4-F5 Lista de firma | pendiente |
| 4 | S4-F6 Inicio con próximo paso | pendiente |
| 5 | S5-F1 Fórmulas del mes | pendiente |
| 5 | S5-F2 Cascada de la cuenta custodia | pendiente |
| 5 | S5-F3 Modo vivir | pendiente |
| 5 | S5-F4 Avance de la deuda | pendiente |
| 5 | S5-F5 Aviso de abono | pendiente |
| 6 | S6-F1 Invertir aquí | pendiente |
| 6 | S6-F2 Información para invertir | pendiente |
| 6 | S6-F3 Invertir | pendiente |
| 6 | S6-F4 Mis inversiones | pendiente |
| 7 | S7-F1 Estado de carga en botones | pendiente |
| 7 | S7-F2 Contraste AA | pendiente |
| 7 | S7-F3 Textos de 10 segundos | pendiente |
| 7 | S7-F4 Explicaciones a un toque | pendiente |
| 7 | S7-F5 Revisión en 360 px | pendiente |
| 7 | S7-F6 Introducción | pendiente |
