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
  - Acción principal: "Unirme". Al tocarla, el cupo se marca como tomado, se guarda en `localStorage` y la app lleva a Postula.
- **S2-F5 Publicación en GitHub Pages.** La entrega explica en palabras simples cómo activar Pages desde la rama `main`.
  - La app funciona en `https://<usuario>.github.io/<repositorio>/` sin errores 404.

## Sprint 3 · Postula y agregar a pantalla de inicio

**Objetivo:** saber si el usuario y su pareja califican para el proyecto elegido, y poder instalar la app como ícono.

- **S3-F1 Fórmula de carga.** En `js/calculos.js`, carga y su nivel (holgado, en el límite, no aprueba), con pruebas.
  - Arrendar en lote con $1.500.000 + $1.000.000 → 22,9 %, holgado.
  - Arrendar en lote con $1.200.000 + $800.000 → 28,6 %, en el límite.
  - Vivir individual con $1.500.000 + $1.000.000 → 30,1 %, no aprueba.
  - Exactamente 25 % es holgado y exactamente 30 % es en el límite.
- **S3-F2 Pantalla Postula.** Dos campos de sueldo (usuario y pareja), con el proyecto elegido visible arriba.
  - Los campos usan `inputmode="numeric"` y muestran el monto con punto de miles al escribir.
  - Número protagonista: el porcentaje de carga con semáforo (color + palabra + ícono).
  - Si un campo está vacío o es cero, muestra un mensaje de error claro y no calcula.
  - En amarillo o rojo, muestra una sugerencia concreta calculada con `calculos.js` (por ejemplo, "Si te unes a una compra en conjunto, tu carga baja a X %") y un enlace para volver a Proyectos.
  - Si el usuario no se ha unido a ningún proyecto, usa el escenario de Simula y lo dice.
  - Acción principal: "Postular" (deshabilitada en rojo).
- **S3-F3 Recordar elecciones.** Modo, tipo de compra, proyecto y sueldos se guardan en `localStorage`.
  - Al recargar la página, Simula, Proyectos y Postula muestran lo último elegido.
  - Si `localStorage` no está disponible, la app funciona igual con valores por defecto.
- **S3-F4 Agregar a pantalla de inicio.** `manifest.webmanifest` con nombre, colores del Bci Kit e íconos de 192 y 512 px.
  - El manifest responde 200 y está enlazado desde `index.html`.

## Sprint 4 · Tu 5 % y escritura

**Objetivo:** que el usuario sepa cuántos meses le toma juntar lo que pone al escriturar, se mantenga motivado y entienda lo que firma.

- **S4-F1 Fórmula de meses.** Meses para la meta, con pruebas.
  - Arrendar en lote ($6.467.738) ahorrando $500.000 al mes → 13 meses.
  - Ahorro mensual cero o vacío → error, no un número infinito.
- **S4-F2 Pantalla Tu 5 %.** La meta sale del proyecto al que se unió el usuario (o del escenario de Simula).
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
  - Acción principal: "Firmar" (simulado), que lleva a Mi departamento.

## Sprint 5 · Mi departamento

**Objetivo:** que el usuario vea cómo se movió el dinero del mes y cuánto le falta para terminar de pagar.

- **S5-F1 Fórmulas del mes.** Lo que pone el usuario y saldo de cada deuda después de N cuotas, con pruebas.
  - Arrendar en lote con arriendo bruto $450.000 → neto $371.250 → el usuario pone $200.175.
  - Arriendo bruto $700.000 → neto $577.500 → excedente de $6.075.
- **S5-F2 Cascada de la cuenta custodia (modo arrendar).** Pasos numerados: entra el arriendo, se descuenta administración, se paga el dividendo, se paga a los inversionistas, el usuario completa.
  - Número protagonista: lo que puso el usuario este mes ($200.175 en el ejemplo).
- **S5-F3 Modo vivir.** Muestra el total al mes y lo compara con el arriendo actual del usuario.
- **S5-F4 Avance de la deuda.** Dos barras: crédito Bci (30 años) e inversionistas (10 años), con meses pagados y saldo en pesos.
  - Se lee "Calculado sin plusvalía" junto al avance.
- **S5-F5 Aviso de abono.** Cuando hay excedente, aparece la acción "Abonar" con la explicación de que conviene abonar a la deuda de inversionistas porque tiene la tasa más alta.
  - Sin excedente, la acción no aparece.

## Sprint 6 · Inversionista

**Objetivo:** que un inversionista recorra el mismo marketplace, invierta en el financiamiento del pie y siga su cartera.

- **S6-F1 Selector de rol.** Al abrir la app se elige "Quiero comprar" o "Quiero invertir"; la elección se recuerda y se puede cambiar.
  - Cada rol tiene su propia barra inferior.
- **S6-F2 Proyectos (vista inversionista).** Las mismas tarjetas del marketplace, mostrando rentabilidad (UF + 8 %), plazo (10 años), garantía (segunda hipoteca) y lo que falta por financiar.
  - Departamento de UF 2.250 en una compra en conjunto → por financiar UF 337,5 = $13.859.438.
  - Una frase explica la cuenta custodia: Bci cobra el arriendo y paga a los inversionistas después del dividendo.
- **S6-F3 Invertir.** Campo de monto en UF con teclado numérico.
  - Número protagonista: la cuota mensual que recibirá. UF 10 → $4.982 al mes.
  - Menos de UF 10 o más de lo que falta por financiar → mensaje de error y "Confirmar" deshabilitado.
  - Al confirmar, el avance del financiamiento del proyecto sube en el marketplace.
- **S6-F4 Mi cartera.** Lista de inversiones guardadas en `localStorage`.
  - Número protagonista: cobrado a la fecha. Botón "Simular un mes" suma una cuota por inversión.
  - Sin inversiones, muestra un estado vacío con la acción "Ver proyectos".

## Sprint 7 · Pulido, comprensión y accesibilidad

**Objetivo:** que la app se sienta terminada y sea fácil de comprender para todos, incluidas personas con baja visión.

- **S7-F1 Estado de carga en botones.** Las acciones principales (Unirme, Postular, Firmar, Confirmar) muestran el estado de carga del Bci Kit por un momento antes de avanzar.
- **S7-F2 Contraste AA.** Todas las combinaciones de texto y fondo cumplen 4,5:1 (texto normal) o 3:1 (texto grande), calculadas con los colores reales del CSS.
- **S7-F3 Textos de 10 segundos.** Cada pantalla tiene un título de máximo 6 palabras y una frase de apoyo de máximo 15.
- **S7-F4 Explicaciones a un toque.** Dividendo, pie, carga, segunda hipoteca, cuenta custodia, compra en conjunto y financiamiento del pie tienen un ícono de ayuda que abre una explicación de una frase, sin jerga.
- **S7-F5 Revisión en 360 px.** Ningún texto cortado ni scroll horizontal en ninguna pantalla.
- **S7-F6 Introducción.** Una primera pantalla, solo la primera vez, con el mensaje "Tu departamento con el 5 % del precio" y una lista con check de las 3 partes (Bci, inversionistas, tú) y de los dos tipos de proyecto.

---

## Estado

| Sprint | Feature | Estado |
|---|---|---|
| 1 | S1-F1 Estructura de archivos | en progreso |
| 1 | S1-F2 Tokens del Bci Kit | en progreso |
| 1 | S1-F3 Navegación | en progreso |
| 1 | S1-F4 Fórmulas base | en progreso |
| 1 | S1-F5 Pantalla Simula | en progreso |
| 1 | S1-F6 Visible en el teléfono por wifi | en progreso |
| 2 | S2-F1 Datos de ejemplo | pendiente |
| 2 | S2-F2 Fórmulas del marketplace | pendiente |
| 2 | S2-F3 Pantalla Proyectos | pendiente |
| 2 | S2-F4 Detalle y unirse | pendiente |
| 2 | S2-F5 Publicación en GitHub Pages | pendiente |
| 3 | S3-F1 Fórmula de carga | pendiente |
| 3 | S3-F2 Pantalla Postula | pendiente |
| 3 | S3-F3 Recordar elecciones | pendiente |
| 3 | S3-F4 Agregar a pantalla de inicio | pendiente |
| 4 | S4-F1 Fórmula de meses | pendiente |
| 4 | S4-F2 Pantalla Tu 5 % | pendiente |
| 4 | S4-F3 Propio o grupal | pendiente |
| 4 | S4-F4 Avance simulado | pendiente |
| 4 | S4-F5 Lista de firma | pendiente |
| 5 | S5-F1 Fórmulas del mes | pendiente |
| 5 | S5-F2 Cascada de la cuenta custodia | pendiente |
| 5 | S5-F3 Modo vivir | pendiente |
| 5 | S5-F4 Avance de la deuda | pendiente |
| 5 | S5-F5 Aviso de abono | pendiente |
| 6 | S6-F1 Selector de rol | pendiente |
| 6 | S6-F2 Proyectos (vista inversionista) | pendiente |
| 6 | S6-F3 Invertir | pendiente |
| 6 | S6-F4 Mi cartera | pendiente |
| 7 | S7-F1 Estado de carga en botones | pendiente |
| 7 | S7-F2 Contraste AA | pendiente |
| 7 | S7-F3 Textos de 10 segundos | pendiente |
| 7 | S7-F4 Explicaciones a un toque | pendiente |
| 7 | S7-F5 Revisión en 360 px | pendiente |
| 7 | S7-F6 Introducción | pendiente |
