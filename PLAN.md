# PLAN · Primer Peldaño

Plan de sprints basado en `SPEC.md` y en el recorrido de [`docs/journey-map.md`](docs/journey-map.md). Cada sprint termina con la app abrible en el teléfono.

## Números de referencia

Los criterios usan estos valores (UF $41.065). Se acepta una diferencia de ±$1 por redondeo.

| Escenario | Precio | Al escriturar | Dividendo + seguros | Cuota inversionistas | Total al mes |
|---|---|---|---|---|---|
| Arrendar, lote | UF 2.250 | $6.467.738 | $403.272 | $168.153 | $571.425 |
| Arrendar, individual | UF 2.500 | $7.186.375 | $444.886 | $186.837 | $631.723 |
| Vivir, lote | UF 2.700 | $7.761.285 | $478.177 | $201.784 | $679.961 |
| Vivir, individual | UF 3.000 | $8.623.650 | $528.114 | $224.204 | $752.319 |

## Verificaciones que aplican a todos los sprints

- `node --test tests/` pasa completo.
- `node --check js/*.js` sin errores.
- `grep -rniE "plata|depto|dpto" index.html js/ css/` sale vacío.
- Sin rutas que empiecen con `/` (`src="/` o `href="/`).
- Sin librerías externas, salvo Google Fonts.
- Ninguna pantalla calcula por su cuenta: todo sale de `js/calculos.js`.
- Se ve bien a 390 px y sin scroll horizontal a 360 px.

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
- **S1-F3 Navegación.** Barra inferior con las 5 pantallas del comprador.
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
  - Un toque en "¿De dónde sale el resto?" muestra el reparto 80 % Bci / 15 % inversionistas / 5 % usuario, en pesos.
  - Se lee la frase "Calculado sin plusvalía".
  - Acción principal: "Continuar a postular", que lleva a Postula.
- **S1-F6 Visible en el teléfono por wifi.** `sprints/sprint-1-entrega.md` explica paso a paso cómo abrirla en el celular.
  - Con `python -m http.server 8000 --bind 0.0.0.0` corriendo, `index.html`, el CSS y los 3 JS responden 200.

## Sprint 2 · Postula y publicación

**Objetivo:** saber si el usuario califica y poder mostrar la app desde cualquier teléfono.

- **S2-F1 Fórmula de carga.** En `js/calculos.js`, carga y su nivel (holgado, en el límite, no aprueba), con pruebas.
  - Arrendar en lote con $1.500.000 + $1.000.000 → 22,9 %, holgado.
  - Arrendar en lote con $1.200.000 + $800.000 → 28,6 %, en el límite.
  - Vivir individual con $1.500.000 + $1.000.000 → 30,1 %, no aprueba.
  - Exactamente 25 % es holgado y exactamente 30 % es en el límite.
- **S2-F2 Pantalla Postula.** Dos campos de sueldo (usuario y pareja).
  - Los campos usan `inputmode="numeric"` y muestran el monto con punto de miles al escribir.
  - Número protagonista: el porcentaje de carga con semáforo (color + palabra + ícono).
  - Si un campo está vacío o es cero, muestra un mensaje de error claro y no calcula.
  - En amarillo o rojo, muestra una sugerencia concreta (por ejemplo, "Compra en lote: tu carga baja a X %") calculada con `calculos.js`.
  - Acción principal: "Postular" (deshabilitada en rojo).
- **S2-F3 Recordar elecciones.** Modo, tipo de compra y sueldos se guardan en `localStorage`.
  - Al recargar la página, Simula y Postula muestran lo último elegido.
  - Si `localStorage` no está disponible, la app funciona igual con valores por defecto.
- **S2-F4 Agregar a pantalla de inicio.** `manifest.webmanifest` con nombre, colores del Bci Kit e íconos de 192 y 512 px.
  - El manifest responde 200 y está enlazado desde `index.html`.
- **S2-F5 Publicación en GitHub Pages.** La entrega explica en palabras simples cómo activar Pages desde la rama `main`.
  - La app funciona en `https://<usuario>.github.io/<repositorio>/` sin errores 404.

## Sprint 3 · Tu 5 %

**Objetivo:** que el usuario sepa cuántos meses le toma juntar lo que pone al escriturar y se mantenga motivado.

- **S3-F1 Fórmula de meses.** Meses para la meta, con pruebas.
  - Arrendar en lote ($6.467.738) ahorrando $500.000 al mes → 13 meses.
  - Ahorro mensual cero o vacío → error, no un número infinito.
- **S3-F2 Pantalla Tu 5 %.** La meta sale del escenario elegido en Simula.
  - Número protagonista: los meses ("13 meses").
  - Campo de ahorro mensual con teclado numérico.
  - Barra de avance con hitos al 25 %, 50 %, 75 % y 100 %.
  - Acción principal: "Empezar a ahorrar".
- **S3-F3 Propio o grupal.** El usuario elige ahorro propio o grupal.
  - El grupal explica en una frase que cada persona retira exactamente lo que aportó y nadie queda debiendo.
  - No se menciona el auto en ninguna parte.
- **S3-F4 Avance simulado.** Un botón "Simular un mes" suma el ahorro mensual al avance y lo guarda en `localStorage`.
  - Al llegar a la meta, aparece un mensaje de logro y la acción "Elegir departamento".

## Sprint 4 · Elige

**Objetivo:** que el usuario elija un departamento o un lote entre opciones que ya están filtradas y entienda de dónde sale el precio.

- **S4-F1 Datos de ejemplo.** `js/datos.js` con al menos 8 departamentos y 2 lotes en comunas reales de Santiago, sin nombres de personas.
  - Al menos 2 departamentos tienen rentabilidad menor a 4,5 % (para probar el filtro).
- **S4-F2 Fórmulas de arriendo.** Arriendo neto y rentabilidad, con pruebas.
  - Arriendo bruto $600.000 → neto $495.000.
  - Departamento de UF 2.250 con arriendo bruto $420.000 → 4,5 % (pasa el filtro); con $400.000 → 4,3 % (no pasa).
- **S4-F3 Pantalla Elige.** Tarjetas con un número protagonista: el precio en pesos.
  - En modo arrendar solo aparecen departamentos con rentabilidad de 4,5 % o más, con la etiqueta "Filtrado por IA".
  - Pestañas "En lote" e "Individual"; en lote el precio aparece con el 10 % de descuento y el precio de lista tachado.
  - Al tocar una tarjeta se ve el reparto 80 / 15 / 5 en pesos y el total al mes.
  - Acción principal: "Elegir este".
- **S4-F4 Lista de firma.** Al elegir, aparece la lista de lo que se firma en la escritura (crédito Bci, segunda hipoteca, cuenta custodia), con checks y en palabras simples.
  - El departamento elegido se guarda en `localStorage`.

## Sprint 5 · Mi departamento

**Objetivo:** que el usuario vea cómo se movió el dinero del mes y cuánto le falta para terminar de pagar.

- **S5-F1 Fórmulas del mes.** Lo que pone el usuario, saldo de cada deuda después de N cuotas, con pruebas.
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

**Objetivo:** que un inversionista pueda ver oportunidades, invertir y seguir su cartera.

- **S6-F1 Selector de rol.** Al abrir la app se elige "Quiero comprar" o "Quiero invertir"; la elección se recuerda y se puede cambiar.
  - Cada rol tiene su propia barra inferior.
- **S6-F2 Oportunidades.** Tarjetas con rentabilidad (UF + 8 %), plazo (10 años), garantía (segunda hipoteca) y monto por financiar.
  - Departamento de UF 2.250 en lote → por financiar UF 337,5 = $13.859.438.
  - Una frase explica la cuenta custodia: Bci cobra el arriendo y paga a los inversionistas después del dividendo.
- **S6-F3 Invertir.** Campo de monto en UF con teclado numérico.
  - Número protagonista: la cuota mensual que recibirá. UF 10 → $4.982 al mes.
  - Menos de UF 10 o más de lo que falta por financiar → mensaje de error y "Confirmar" deshabilitado.
- **S6-F4 Mi cartera.** Lista de inversiones guardadas en `localStorage`.
  - Número protagonista: cobrado a la fecha. Botón "Simular un mes" suma una cuota por inversión.
  - Sin inversiones, muestra un estado vacío con la acción "Ver oportunidades".

## Sprint 7 · Pulido y accesibilidad

**Objetivo:** que la app se sienta terminada y sea fácil de usar para todos, incluidas personas con baja visión.

- **S7-F1 Estado de carga en botones.** Las acciones principales (Postular, Elegir este, Confirmar) muestran el estado de carga del Bci Kit por un momento antes de avanzar.
- **S7-F2 Contraste AA.** Todas las combinaciones de texto y fondo cumplen 4,5:1 (texto normal) o 3:1 (texto grande), calculadas con los colores reales del CSS.
- **S7-F3 Textos de 10 segundos.** Cada pantalla tiene un título de máximo 6 palabras y una frase de apoyo de máximo 15.
- **S7-F4 Revisión en 360 px.** Ningún texto cortado ni scroll horizontal en ninguna pantalla.
- **S7-F5 Introducción.** Una primera pantalla, solo la primera vez, con el mensaje "Tu departamento con el 5 % del precio" y una lista con check de las 3 partes (Bci, inversionistas, tú).

---

## Estado

| Sprint | Feature | Estado |
|---|---|---|
| 1 | S1-F1 Estructura de archivos | pendiente |
| 1 | S1-F2 Tokens del Bci Kit | pendiente |
| 1 | S1-F3 Navegación | pendiente |
| 1 | S1-F4 Fórmulas base | pendiente |
| 1 | S1-F5 Pantalla Simula | pendiente |
| 1 | S1-F6 Visible en el teléfono por wifi | pendiente |
| 2 | S2-F1 Fórmula de carga | pendiente |
| 2 | S2-F2 Pantalla Postula | pendiente |
| 2 | S2-F3 Recordar elecciones | pendiente |
| 2 | S2-F4 Agregar a pantalla de inicio | pendiente |
| 2 | S2-F5 Publicación en GitHub Pages | pendiente |
| 3 | S3-F1 Fórmula de meses | pendiente |
| 3 | S3-F2 Pantalla Tu 5 % | pendiente |
| 3 | S3-F3 Propio o grupal | pendiente |
| 3 | S3-F4 Avance simulado | pendiente |
| 4 | S4-F1 Datos de ejemplo | pendiente |
| 4 | S4-F2 Fórmulas de arriendo | pendiente |
| 4 | S4-F3 Pantalla Elige | pendiente |
| 4 | S4-F4 Lista de firma | pendiente |
| 5 | S5-F1 Fórmulas del mes | pendiente |
| 5 | S5-F2 Cascada de la cuenta custodia | pendiente |
| 5 | S5-F3 Modo vivir | pendiente |
| 5 | S5-F4 Avance de la deuda | pendiente |
| 5 | S5-F5 Aviso de abono | pendiente |
| 6 | S6-F1 Selector de rol | pendiente |
| 6 | S6-F2 Oportunidades | pendiente |
| 6 | S6-F3 Invertir | pendiente |
| 6 | S6-F4 Mi cartera | pendiente |
| 7 | S7-F1 Estado de carga en botones | pendiente |
| 7 | S7-F2 Contraste AA | pendiente |
| 7 | S7-F3 Textos de 10 segundos | pendiente |
| 7 | S7-F4 Revisión en 360 px | pendiente |
| 7 | S7-F5 Introducción | pendiente |
