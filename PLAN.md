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

## Sprint 5 · Inicio y Mi departamento

**Objetivo:** que Inicio responda lo que el usuario quiere saber al abrir la app (cuánto puede comprar, o cómo va su compra) y que vea cómo se movió el dinero del mes.

- **S5-F0 Inicio: ¿Cuánto puedo comprar? (hacer primero).** La primera vez (sin compra ni inversiones), Inicio deja de ser el simulador y responde cuánto puede comprar el usuario.
  - Nueva fórmula `capacidadCompraUF(sueldoPropio, sueldoPareja)` en `js/calculos.js`, con pruebas:
    - $1.500.000 + $1.000.000 → UF 2.472, $7.105.888 al escriturar, $624.970 al mes.
    - $1.200.000 + $800.000 → UF 1.953, $5.613.996 al escriturar, $499.792 al mes.
    - $2.000.000 + $1.000.000 → UF 2.990, $8.594.905 al escriturar, $749.907 al mes.
    - En los tres casos la carga resultante es 25 % o menos; sin sueldos devuelve `null`.
  - Pantalla: título "Tu departamento con el 5 %" con las cuatro figuras de marca, selector vivir o arrendar y dos campos de sueldo con `inputmode="numeric"`.
  - Número protagonista: "Puedes comprar hasta UF 2.472" (con los sueldos del ejemplo), y debajo lo que pone al escriturar y al mes. Se lee "Calculado sin plusvalía".
  - "¿De dónde sale el resto?" muestra el reparto 80 / 15 / 5 de ese precio en pesos.
  - Sin sueldos: mensaje "Escribe los sueldos para saber cuánto puedes comprar" y ningún número.
  - Los sueldos son los mismos que usa Postula: al llegar a Postula ya están escritos.
  - Acción principal: "Ver proyectos que me alcanzan" → Proyectos con el filtro "Me alcanza" activo, que muestra solo departamentos con precio pagado menor o igual a la capacidad; el filtro se puede quitar.
  - Ya no existe el simulador genérico ni el enlace "Volver a simular". "Empezar de nuevo" (Perfil) ahora vuelve a esta pantalla.
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

- **S5-F6 Inicio: Mi camino.** Cuando el usuario ya se unió a un proyecto, Inicio muestra cómo va su compra. Se construye sobre `proximoPaso()` (S4-F6).
  - Arriba el nombre del proyecto y un solo número según la etapa: carga (Postula), meses que faltan (Tu 5 %), lo juntado (Firma) o lo que puso este mes (Mi departamento, con los números de S5-F1).
  - Recorrido de 5 pasos: Únete · Postula · Ahorra · Firma · Departamento. Los hechos llevan check y el actual se destaca con color e ícono, no solo con color. Ningún nombre se corta a 360 px y no se usan abreviaciones.
  - Acción principal: la del paso actual, que lleva directo a ese paso.
  - Avisos de la IA: máximo 2, en lista con check, calculados con datos reales (cupos tomados, días para el cierre con la fecha de referencia de `js/datos.js`, hitos del ahorro y, después de firmar, el aviso de abono de S5-F5). Sin avisos, la sección no aparece.
  - Si tiene inversiones, una línea con lo cobrado a la fecha. Si solo tiene inversiones (sin compra), el número protagonista es lo cobrado y la acción es "Ver mis inversiones".

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
- **S7-F6 Introducción.** Una primera pantalla, solo la primera vez y antes de Inicio, con el mensaje "Tu departamento con el 5 % del precio" y una lista con check de las 3 partes (Bci, inversionistas, tú). No repite el cálculo de cuánto puede comprar, que es lo que hace Inicio.

## Sprint 8 · Modelo v3 y preaprobación simulada

**Objetivo:** que el usuario viva la preaprobación del crédito como en un banco, sin entregar datos reales. Sube documentos de ejemplo que ya vienen cargados en la app y obtiene un monto preaprobado (simulado), con lo que falta para la aprobación final.

> Modelo v3 en `CLAUDE.md` y números de referencia en `SPEC.md`, sección 0. **S8-F0 va primero:** hasta que esté aprobado, la app muestra un préstamo a UF + 8% que supera la tasa máxima legal.

- **S8-F0 Modelo v3 en las fórmulas (hacer primero).** `js/calculos.js` y sus pruebas pasan al modelo v3.
  - Se elimina el préstamo de inversionistas con cuota fija a UF + 8% (`tasaInversionistas`, `cuotaInversionistas` y donde se usen). `grep -rn "0.08\|UF + 8" js/ index.html` sale vacío.
  - Crédito según el modo: vivir = 90% (FOGAES) y pie de 10%; invertir = 80% y pie del usuario de 5% + 15% de participación de inversionistas. Tasa con subsidio 3,9%; `SUPUESTOS.tasaSinSubsidio` = 4,5%.
  - Descuento de grupo: 3% desde 5 unidades y 5% desde 10 (reemplaza el 10% fijo).
  - Nuevas fórmulas: `participacionUF(precio)`, `rentaParticipacionUF(saldo)` (6% anual / 12), `mesesRecompra(precio, arriendoBruto, fraccion)` con tope de 84 meses.
  - Pruebas con la tabla de `SPEC.md`, sección 0: dividendos $464.549 / $442.759 / $416.127 / $396.758; sin subsidio $496.904 / $473.496 / $444.886 / $424.079; recompra 51, 66, 57 y 74 meses (individual) y 48, 62, 54 y 70 (grupo). Diferencia aceptada: ±$1 y ±1 mes.
  - Filtro de rentabilidad: neta ≥ 3,9% en modo invertir.
  - Las pantallas existentes que usaban la cuota de inversionistas pasan a mostrar "Participación de inversionistas: 15% (sin cuota para ti)", hasta que el Sprint 10 haga la recompra completa.
- **S8-F5 Datos de ejemplo v3.** `js/datos.js` con proyectos en Independencia, Quinta Normal, Recoleta y Estación Central (sin Ñuñoa, Santiago Centro, La Florida ni Las Condes).
  - Rentabilidad bruta entre 4,0% y 5,0% (referencia: 4,5–4,7% en 1 dormitorio, Transsa 2025); al menos 2 departamentos bajo el filtro de 3,9% neto.
  - Al menos un estudio (≈ UF 1.200) y un 1 dormitorio (≈ UF 1.750) para el filtro "Comprar más barato".
  - Cada departamento tiene `arriendoEstimadoIA` y `origenArriendo: 'estimación IA (demo)'`.

- **S8-F1 Fórmula de preaprobación.** `preaprobacion(sueldoPropio, sueldoPareja, otrasCuotas)` en `js/calculos.js`, con pruebas.
  - Dividendo máximo = el menor entre 25 % de la renta (propio + pareja) y 30 % de la renta menos las otras cuotas.
  - Crédito máximo en UF enteras, hacia abajo, a 360 meses con seguros UF 0,7. Por defecto con la tasa con subsidio (3,9%); la pantalla dice "con subsidio a la tasa".
  - $1.500.000 + $1.000.000, sin otras cuotas → UF 3.078 (sin subsidio: UF 2.865).
  - $1.500.000 + $1.000.000, con $200.000 de otras cuotas → UF 2.691 (sin subsidio: UF 2.505).
  - $1.500.000 + $1.000.000, con $500.000 de otras cuotas → UF 1.142 (sin subsidio: UF 1.063).
  - Requisito de renta (referencial, Bci): el titular gana al menos UF 23, **o** la renta familiar es de al menos UF 39 y la pareja gana al menos UF 16. Si no cumple, devuelve `{ cumple: false, motivo }`. $800.000 sin pareja → no cumple; $800.000 + $900.000 → cumple.
  - Sin sueldos → `null`.
- **S8-F2 Postula con preaprobación.** El paso 1 de Mi compra pasa a tener tres partes: Tus datos → Tus documentos → Resultado.
  - Tus datos: los sueldos (prellenados, como hoy), un campo nuevo "Otras cuotas al mes" (teclado numérico, $0 por defecto) y el tipo de contrato (indefinido, plazo fijo o independiente).
  - Dos caminos: **"Soy cliente Bci"** (se salta los documentos y muestra un estado de carga de ≈ 1 s) o **"No soy cliente: subir documentos"**.
- **S8-F3 Documentos de ejemplo precargados.**
  - Lista con check: últimas 3 liquidaciones de sueldo, certificado de cotizaciones de la AFP (12 meses), contrato de trabajo o certificado de antigüedad, y carnet de identidad por ambos lados. Cada uno con una frase sobre para qué lo pide el banco.
  - "Subir" abre una hoja inferior con 2 o 3 archivos **ya cargados en la app** (por ejemplo, `liquidacion_septiembre.pdf`). Sus miniaturas son SVG dibujados en el código: un rectángulo con líneas grises, el título del documento y la marca "DOCUMENTO DE EJEMPLO".
  - Los documentos no muestran nombres de personas, RUT, montos ni logos de empresas reales. La preaprobación usa los sueldos que escribió el usuario.
  - Al elegir uno: barra de carga de ≈ 1 s (sin animación con `prefers-reduced-motion`), luego el check y el nombre del archivo. Se puede cambiar.
  - No usa `<input type="file">`: nada se lee, se guarda ni se envía. Se lee la frase "En esta demo tus archivos no se guardan ni se envían".
  - Zonas táctiles de 44 × 44 px. Al completar la lista, el foco pasa al botón "Ver mi preaprobación" y se anuncia.
- **S8-F4 Resultado de la preaprobación.**
  - Número protagonista: "Preaprobado (simulado) hasta UF 3.078 de crédito" y, debajo, "Dividendo de hasta $624.925 al mes, con subsidio a la tasa".
  - Si no cumple: un mensaje sin juicio (palabra + ícono, no solo color) y qué cambiar (sumar la renta de la pareja, bajar otras cuotas), con la opción de editar los datos.
  - Se lee "La aprobación final depende de la tasación y del estudio de títulos del departamento", y una lista numerada de lo que falta: tasación, estudio de títulos y escritura.
  - Acción principal: seguir al paso siguiente (Tu 5 %).
  - Los documentos marcados y el resultado se guardan en `localStorage`. "Empezar de nuevo" los borra.

## Sprint 9 · Tus caminos y Todavía no

**Objetivo:** que el usuario vea con sus números un camino recomendado (o "Todavía no"), lo entienda y lo elija; y que la sesión de prueba quede registrada.

- **S9-F1 Tu mes real.** Ingreso líquido familiar − arriendo actual (en modo invertir sigue arrendando donde vive) − otras cuotas − dividendo = lo que queda para vivir, en pesos y en %.
  - Número protagonista: lo que queda al mes. Si es menos del 40% del ingreso, aviso (supuesto de diseño; ver `CLAUDE.md`).
- **S9-F2 Tus caminos.** Las reglas de recomendación de `SPEC.md`, sección 0, en `js/calculos.js` (`recomendarCamino(perfil)`), con pruebas de cada regla.
  - Arriba, **un** camino recomendado con su razón en una frase ("Te recomendamos A + B porque inviertes y tu ahorro es menor al 20%"). Debajo, "Ver otros caminos".
  - Cada camino: pie que pone el usuario, cuota mensual, meses, peor caso y si existe hoy o es una propuesta.
  - Nunca se dice "la IA recomienda" para una regla: se dice "Te recomendamos… porque…".
- **S9-F3 Todavía no.** Si no cumple la carga o "Tu mes real": título "Todavía no te conviene", sin juicio, y hasta 3 cambios calculados (por ejemplo, "Si terminas una cuota de $500.000, tu carga baja a X%", "Con un estudio de UF 1.200, tu pie es $Y", "Ahorrando $Z durante N meses llegas"). Acción: "Recordarme en N meses" (simulado).
- **S9-F4 Fichas de caminos informativos.** Arriendo con opción de compra y respaldo familiar: cómo funciona en 3 pasos, números con el departamento de referencia, peor caso, referente real y "Me interesa" (se guarda en el registro).
- **S9-F5 Comprar más barato.** Filtro en Proyectos: estudio, 1 dormitorio, usado (−17,6%) e IVA cero (−6,5%, del 1-dic-2026 al 1-dic-2027). Muestra cuánto baja el pie.
- **S9-F6 Registro de la sesión de prueba.** Pantalla para la facilitadora (acceso desde Perfil): plazo que la usuaria cree necesitar antes y después, camino elegido, explicación (0–3), confianza (1–5) y los "Me interesa". Se exporta como texto para copiar.

## Sprint 10 · Pie compartido, pie en cuotas y Sostener

**Objetivo:** que los dos caminos propios (A y B) se puedan recorrer completos y que el usuario sostenga el ahorro.

- **S10-F1 Pie compartido (B) en Mi departamento.** Cascada de la cuenta custodia: arriendo → administración → dividendo (lo paga el usuario) → renta de los inversionistas → recompra. "Casa que se va pintando" con el % que ya es tuyo, "te faltan X meses", selector 100% / 80% del arriendo y escenario peor caso.
- **S10-F2 Comprador de respaldo y "¿Y si me arrepiento?".** Para el inversionista, la casilla "Quiero ser comprador de respaldo". Para el comprador, el orden de pago si vende en el mes actual (Bci, inversionistas según su parte, costos, el resto para él) y la venta asistida si atrasa 2 dividendos.
- **S10-F3 Pie en cuotas (A).** Cuotas mensuales en la cuenta bloqueada de Bci, "Tu dinero está en Bci, no en la inmobiliaria", salida sin multa (crédito no aprobado o tasación menor) y avance del grupo.
- **S10-F4 Sostener.** Racha de cuotas, avance con hitos y "Este mes no pude" como protector de racha (una vez cada 6 meses), sin castigo.
- **S10-F5 Pendientes del Sprint 7.** El "?" responde al primer toque y tiene una zona tocable de 44 px; la carga no secuestra la navegación ni cambia el alto del botón; `location.replace` al empezar.


## Sprint 11 · Estructura e interacción del recorrido principal

**Objetivo:** que al abrir la app la usuaria vea al tiro **cuándo puede tener su departamento, por qué camino y qué hacer este mes**, y que eso se entienda mirando, no leyendo. Primero se ordena la estructura (S11-F0); después se le da forma con la skill `interaccion-bci-vanilla`.

> **Función principal de la app:** "Te decimos cuándo puedes tener tu primer departamento y te llevamos hasta ahí". Los proyectos son un medio dentro del camino, no la portada.
>
> **Por qué:**
> - La pregunta de la usuaria es "¿cuándo llego y qué hago ahora?" (E1: "lejano", "se ve muchas veces imposible"; E2: "no sé si tan pronto").
> - Hoy Inicio responde una pregunta del banco ("Puedes comprar hasta UF 3.847").
> - Tus caminos y Todavía no, que son el corazón de la propuesta, están escondidos a dos toques.
> - Inicio y Mis proyectos muestran dos sistemas de pasos que no calzan (5 pasos y 3 pasos).
>
> **Reglas del sprint:**
> - Cada pantalla lleva como máximo 2 patrones del catálogo de la skill.
> - Cada visualización **reemplaza** el texto que explicaba lo mismo.
> - Solo se anima `transform` y `opacity`.
> - Con `prefers-reduced-motion` se ve el estado final.
> - Las cifras salen de `js/calculos.js`.

- **S11-F0 Estructura: Inicio = "Tu camino".**
  - **Las 4 pestañas cambian de rol (mismas posiciones):**

    | Pestaña | Rol |
    |---|---|
    | **Inicio** | Una pantalla que siempre responde "¿cuánto falta y cuándo llegas?", con un número protagonista y una acción |
    | **Proyectos** | Se abre filtrada por el camino elegido y por lo que le alcanza (los filtros siguen a mano). Si no eligió camino, muestra todo y arriba una tarjeta corta: "Primero, tu camino", que lleva a Inicio |
    | **Mi plan** | Hoy se llama Mis proyectos. Es el detalle de cada paso, y las inversiones van en su propia pestaña interna |
    | **Perfil** | Tus datos, avisos y ayuda. El registro de la sesión de prueba queda al final, como "Sesión de prueba" |

  - **Un solo sistema de 5 pasos**, el mismo en Inicio y en Mi plan: **Elegir → Postular → Juntar el pie → Firmar → Mi departamento**. Reemplaza "Únete, Postula, Ahorra, Firma, Departamento" y "Postula, Tu pie, Firma". La función que decide el paso actual vive en un solo lugar.
  - **Inicio según la etapa** (función `etapaUsuario(estado)` en `js/app.js`):

    | Etapa | Número protagonista | Acción principal |
    |---|---|---|
    | Recién llega | "Podrías tenerlo en **N a M meses**", con su rango de precio y el camino recomendado | Ver mi camino |
    | Eligió camino, sin comprar | El mismo plazo, con su camino | Ver departamentos (de su rango) |
    | Postulando | Parte de la postulación (1 de 3) | Seguir postulación |
    | Juntando el pie | "Te faltan **N meses**" | Pagar la cuota de este mes |
    | Dueña | "Ya es tuyo **N %**" (o "Este mes pagaste" si es para vivir) | Ver mi mes |
    | Solo invierte | "Este mes recibes **$X**" | Ver mis inversiones |

  - **Primera vez:** 4 preguntas cortas, una por pantalla y con barra de avance:
    1. ¿Para qué? (vivir o arrendar)
    2. Sus sueldos
    3. Su ahorro (lo que tiene y lo que puede juntar al mes)
    4. **¿Cuánto quieres que cueste?** La usuaria elige un rango de precio (hasta UF 1.500, UF 1.500 a 2.000, UF 2.000 a 2.500 o UF 2.500 a 3.000), con su equivalente en millones, cuántos departamentos hay en ese rango para su modo y "No te alcanza hoy" cuando corresponde. Esta pregunta se agregó a pedido de la autora el 4-nov-2026: primero un departamento puntual y después un rango.

    Después viene el resultado de "Tu camino", que junta lo que hoy está repartido en Tu mes real y Tus caminos. "Todavía no" aparece en el mismo lugar cuando corresponde.
  - **Plazo:** "Podrías tenerlo en N a M meses" son los meses para juntar lo que falta (`plazoRango` en `calculos.js`), entre el piso y el techo del rango elegido.
    - El camino y la evaluación (carga, Tu mes, Todavía no) se calculan con el techo del rango: es el caso conservador.
    - Si el techo no conviene pero el piso sí, se muestra el plazo del piso con el aviso "Los de UF X te dejarían justo".
    - Hay grupo si en el rango hay una compra en grupo.
    - Elegir un camino abre Proyectos filtrado por ese rango, con el chip "UF a a b ×" para quitar el filtro.
  - **Lo que cambia de lugar:**
    - "Puedes comprar hasta UF X" pasa a ser una fila del detalle del camino ("Te prestan hasta"). Deja de ser el número de la portada.
    - Tu mes real y Tus caminos dejan de ser pantallas sueltas: son el detalle de Inicio. Las rutas `#mes-real` y `#caminos` se mantienen y abren ese detalle.
  - **Textos:**
    - La frase de la introducción y del manifest pasa a ser "Te decimos cuándo puedes tener tu primer departamento".
    - Se elimina la idea de "marketplace" de la portada.
- **S11-F1 Base de interacción.**
  - Tokens de movimiento en `:root` (`--dur-micro` 120 ms, `--dur-corta` 220 ms, `--dur-media` 360 ms, `--dur-larga` 700 ms y las curvas `--ease-salida`, `--ease-entrada`, `--ease-mover` y `--ease-resorte`).
  - Regla global de `prefers-reduced-motion`. Las duraciones escritas a mano (`.15s`, `.2s`) pasan a tokens.
  - **Presión de botón:** `:active` con `scale(.97)` en `--dur-micro`, en botones, chips, pestañas y tarjetas.
  - **Cambio de pantalla:** la pantalla que entra hace un fundido con `translateY(8px)` en `--dur-media`. La que sale no se anima.
  - **Toast:** confirma lo que pasa fuera de la vista ("Te uniste a…", "Invertiste…", "Anotado: te interesa"). Va sobre la barra, dura 3 s y lleva `role="status"`. Reemplaza los avisos verdes que quedan bajo el botón fijo.
  - **12 íconos nuevos** de línea (viewBox 24, trazo 2, extremos redondeados): `i-banco`, `i-inversionistas`, `i-persona`, `i-casa`, `i-llave`, `i-calendario`, `i-documento`, `i-alcancia`, `i-flujo`, `i-grupo`, `i-regalo` (descuento) e `i-candado` (cuenta bloqueada). La pestaña Mi plan usa `i-calendario`.
  - Función `contarHasta(elemento, desde, hasta, formato)` (número que cuenta), con `requestAnimationFrame` en `--dur-larga`. Con movimiento reducido escribe el valor final de inmediato, y `aria-live` recibe solo el valor final.
- **S11-F2 Inicio: las 3 preguntas y Tu camino.**
  - **Preguntas:**
    - La pregunta 1 son dos tarjetas grandes con ícono: llave para "Para arrendar" y casa para "Para vivir".
    - La pregunta 3 son solo campos, sin deslizador ni vista previa del plazo: el plazo aparece recién en Tu camino, junto al departamento al que se refiere (cambio pedido por la autora, 4-nov-2026).
  - **Número que cuenta:** en Tu camino, "Podrías tener un departamento de UF 2.500 en N meses" cuenta desde el valor anterior cuando cambia un dato.
  - **Tu mes real visual:** la lista de sumas y restas pasa a ser una barra del sueldo (100 %) partida en arriendo, otras cuotas, dividendo y "te queda". Tiene una leyenda en filas con ícono y monto, y una marca fija en el 40 % ("mínimo para vivir"). Si "te queda" cae bajo la marca, ese tramo pasa a la zona de alerta con la palabra "Ojo" y el ícono.
  - **Reparto visual:** "¿De dónde sale el precio?" pasa a ser una casa dividida en franjas (Bci, inversionistas y tú), cada una con ícono, % y monto. Las franjas suben escalonadas, a 60 ms una de otra. Reemplaza la barra y la lista de check.
- **S11-F3 Los caminos y Todavía no.**
  - **Tarjetas que se deslizan:**
    - Los caminos van en una fila horizontal con `scroll-snap`. La recomendada va primero, con la etiqueta "Te recomendamos".
    - Hay puntos indicadores y botones "anterior" y "siguiente" de 44 px como alternativa al gesto.
    - Se elimina "Ver otros caminos".
  - **Ilustración de íconos** arriba de cada tarjeta:

    | Camino | Ilustración |
    |---|---|
    | En grupo | `i-grupo` y `i-regalo` |
    | Pie compartido | `i-persona` + `i-inversionistas` → `i-casa` |
    | Con garantía del Estado | `i-escudo` + `i-casa` |
    | Fichas | Su ícono propio |

  - **Todavía no:**
    - Los cambios pasan a ser interruptores (`role="switch"`).
    - Al activar uno, el plazo, "te queda" y la carga se vuelven a calcular en vivo (`cambiosTodaviaNo`), y el estado pasa de reloj a check si ya conviene.
- **S11-F4 Juntar el pie y Sostener.**
  - **Llenado:** la barra de hitos pasa a ser una alcancía (SVG) que se llena con `scaleY` desde abajo, con los hitos 25, 50, 75 y 100 % en su costado.
  - **Logro:** al pasar un hito, entra un sello con `--ease-resorte` ("¡25 %!") y el toast lo confirma.
  - **Racha:** una fila de 6 puntos de calendario. Los meses pagados van en verde, el mes con protector lleva un escudo y los demás quedan vacíos. Reemplaza el chip "N meses seguidos".
  - Cuando la usuaria está juntando el pie, esta misma alcancía es el número protagonista de Inicio.

## Sprint 12 · Interacción: compra, inversión y cierre

**Objetivo:** que Proyectos, Mi plan y la inversión tengan el mismo lenguaje visual del Sprint 11, con sus mismas reglas.

- **S12-F1 Proyectos y Detalle.**
  - **Personas del grupo:** en la tarjeta y en el detalle, la barra de cupos se reemplaza por una fila de N figuras (`i-persona`). Las tomadas van en color, la del usuario con borde y la etiqueta "Tú", y las libres en contorno. Entran escalonadas, a 40 ms una de otra. Se mantiene el texto "6 de 10".
  - En el pie compartido, la participación reunida se muestra como un **llenado** del 15 % de la casa.
  - El Detalle usa el mismo **reparto visual** de S11-F2.
- **S12-F2 Postula.** **Medidor** de carga: un semicírculo con zonas (hasta 25 % verde, de 25 a 30 % amarilla y sobre 30 % roja) y una aguja que gira con `--ease-mover`. Se mantienen la palabra (Holgado, En el límite, No aprueba) y el ícono. Con cuotas, una segunda marca muestra la carga del dividendo solo.
- **S12-F3 Tus documentos.**
  - **Éxito con check:** al elegir un archivo, su miniatura vuela hacia la fila del documento con `translate` en `--dur-media`, y el check se dibuja con `stroke-dasharray`. Reemplaza la barra de subida.
  - La **hoja de archivos** pasa a ser una hoja inferior real: sube desde abajo, tiene fondo atenuado y se cierra con Esc, tocando afuera o con el botón "Cerrar".
- **S12-F4 Firma y Mi departamento.**
  - **Éxito con check** al firmar: la llave entra con `--ease-resorte` y el toast dice "¡Firmaste!".
  - **Llenado:** la casa se pinta con una animación desde el % anterior cada vez que se simula un mes.
  - **Flujo:** la cascada se reemplaza por un flujo vertical. Arriba va el arriendo, y cada tramo baja con una flecha (`i-flujo`) hacia administración, renta de los inversionistas y recompra. Los tramos entran escalonados, a 80 ms uno de otro, y el ancho de cada uno es proporcional a su monto (con `scaleX`). El dividendo se ve aparte, como "Lo pagas tú".
- **S12-F5 Invertir y Mis inversiones.**
  - **Deslizador** de UF (desde el mínimo hasta lo que falta por financiar), sin quitar el campo, y **número que cuenta** en "Recibirás el primer mes".
  - En Mis inversiones, "Cobrado a la fecha" cuenta al simular un mes.
- **S12-F6 Errores y revisión final.**
  - **Error que tiembla** en los campos inválidos (±4 px, 3 veces, `--dur-corta`), siempre con su mensaje.
  - Revisión de todas las pantallas a 360 y 390 px, con movimiento reducido y con lector de pantalla.
  - Con un script de Playwright, se cuenta el texto visible antes y después: cada pantalla con una visualización nueva debe tener menos palabras que antes.


## Sprint 13 · Volver a la app

> **Orden sugerido:** Sprint 11 → Sprint 13 → Sprint 12. El 13 da datos para las sesiones de prueba ("¿volverías?"); el 12 es pulido visual.

**Objetivo:** que haya una razón concreta para abrir la app cada mes durante los meses de ahorro y de obra, y después de comprar. Sin cobrar por ahorrar, sin culpa y sin promesas de plusvalía.

> Referentes (investigación del 4-nov-2026, `claude/retencion-referentes-nov2026.md` en el proyecto):
> - **Recordatorios:** los que nombran la meta concreta suben el ahorro 16 %; los genéricos no tienen efecto (Karlan y otros, NBER 16205).
> - **Nuevo comienzo:** al inicio de mes, los compromisos con una meta suben 23,6 % (Dai, Milkman y Riis, 2014).
> - **Progreso regalado y rachas:** Nunes y Drèze; Duolingo.
> - **Ahorro de a dos y aportes de la familia:** Moneybox (Housemates y Gifts), Nude (Team up) y HomeFundIt.
> - **Avance de obra con fotos, cuotas y avisos:** MobySuite, la app que usan inmobiliarias chilenas.
> - **Ver crecer lo tuyo:** Zillow.
> - **Lo que ahuyenta:** cobrar por ahorrar, no poder pausar y retiros lentos.

- **S13-F1 Avisos con tu meta.**
  - Una campana en el encabezado abre "Avisos", con una lista de avisos simulados en el formato de una notificación del teléfono.
  - Cada aviso nombra la meta concreta: "Faltan 7 meses para tu departamento en Independencia". Nunca dice "Recuerda ahorrar".
  - Los avisos de cuota llegan el día 1 de cada mes ("Nuevo mes: tu cuota de $800.000"). Si se usó "Este mes no pude", el aviso dice "Nuevo mes, nueva racha", sin culpa.
  - Máximo 1 aviso por semana. En Perfil se pueden apagar por tipo: cuota, grupo, obra y departamento.
  - Las reglas de qué aviso toca viven en `js/calculos.js` (`avisosDelMes`), con pruebas.
- **S13-F2 Cuota automática y pausa.**
  - En Tu pie, el interruptor "Pagar mi cuota sola el día 5" (simulado) lleva un ícono de calendario.
  - Si está activo, "Simular un mes" cuenta la cuota sola, y "Este mes no pude" actúa como pausa.
  - La salida sin multa se ve siempre, con un toque.
- **S13-F3 Juntos.**
  - **"Invita a tu pareja"** (simulado): la pareja ve el mismo avance porque el crédito es de los dos. Se muestran dos avatares.
  - **Lista de regalos para tu pie** (simulado), como una lista de novios pero para el primer departamento:
    - Se cuelga de una **ocasión real** en que la familia igual iba a regalar: cumpleaños, Navidad, titulación u otra.
    - La usuaria crea la lista en Tu pie, elige la ocasión y decide si su familia ve los montos o solo el porcentaje.
    - La familia **no usa la app**: abre un enlace con una sola pantalla (`#regalo`, sin barra de navegación). Ve el avance del pie, elige el aporte ($50.000, $100.000 o $200.000), ve su efecto ("Adelanta su departamento 1 mes" o "Equivale a 8 días de su ahorro"), dice qué es de la usuaria (mamá, papá, abuela…) y deja un mensaje opcional. Sello: "Va directo a su cuenta Bci para el pie".
    - La usuaria ve cada aporte con la relación y el mensaje, nunca con nombres. Al firmar, se avisa a quienes aportaron.
    - Es opcional: la app nunca pide "pídele a tu familia" ni cuenta un aporte en el plazo antes de que llegue. Validar en las entrevistas si la familia ayudaría y en qué ocasión.
    - Cálculos: `mesesQueAdelanta` y `diasDeAhorro`, con pruebas.
  - Es la puerta de entrada al respaldo familiar.
- **S13-F4 Tu grupo y tu obra** (compra en grupo).
  - **Más cupos, más descuento:** "Con 1 persona más, el descuento sube a 5 %" (`cuposParaMasDescuento`, con pruebas) y un botón para compartir el proyecto (simulado). Así, invitar tiene un motivo real.
  - **Avance de obra:** una línea de tiempo con 5 hitos (excavación, obra gruesa, terminaciones, recepción y escritura). Cada hito lleva una ilustración, la fecha estimada y la etapa actual marcada.
  - En `js/datos.js`, cada proyecto en grupo agrega `etapaObra` y `entregaEstimada`.
- **S13-F5 Lo tuyo creció este mes** (después de comprar).
  - En Mi departamento, la tarjeta de cada mes dice "Lo tuyo creció $X": la recompra más lo que bajó la deuda con Bci, **sin plusvalía**.
  - Junto a la tarjeta se ve el total "Lo tuyo hoy" (`patrimonioUF`: precio − saldo Bci − parte de los inversionistas, con pruebas).
  - El aviso mensual del departamento usa esta cifra.
  - Para quien invierte, el aviso es "Recibiste $9.204 de Edificio Jardín Independencia".
- **S13-F6 Medición en la sesión de prueba.**
  - Se agregan dos preguntas al registro:
    - "¿Volverías a abrir la app el próximo mes?" (sí, tal vez, no);
    - "¿Qué aviso te haría volver?", para elegir entre los de S13-F1.
  - El texto exportado las incluye.

---

## Sprint 14 · Emoción, juego y grupo

**Objetivo:** que la app se sienta, no solo se lea. Una analogía ordena todo: **construir tu primer departamento peldaño a peldaño**, mientras el edificio real sube. Cada parte tiene su imagen, sus gestos y una recompensa que nace del avance real.

**Reglas del sprint** (además de la skill `interaccion-bci-vanilla` y de "Textos mínimos"):
- **La recompensa es el avance real**, nunca puntos, monedas inventadas ni premios al azar.
- Se premia **ahorrar, sostener y entender**. Nunca endeudarse más ni decidir rápido.
- **Celebración escasa:** confeti una sola vez, al firmar. Los hitos llevan una celebración chica. Si todo celebra, nada celebra.
- **Sin presión falsa:** "quedan 2 cupos" solo si es verdad, y sin cuentas regresivas de urgencia para decidir.
- Cada gesto nuevo tiene su botón alternativo, que funciona con teclado y lector de pantalla. Todo respeta el movimiento reducido.
- Máximo 2 patrones de movimiento por pantalla. Solo se anima `transform` y `opacity`.
- **Descartado** (revisión del 4-nov): los m² que ya son tuyos y las frases de identidad ("Ya eres dueña de tu cocina").

**Analogías por parte**

| Parte | Analogía | Emoción que busca |
|---|---|---|
| Inicio | La escalera: cada paso es un peldaño | Claridad y anticipación |
| Proyectos y Tu grupo | El edificio con ventanas encendidas: cada comprador es una ventana | Pertenencia |
| Tu pie | La alcancía que se llena al ritmo de la obra | Avance y calma |
| Firmar | Recibir las llaves | Alegría (la única celebración grande) |
| Pausa y Todavía no | Un descanso, no una caída | Alivio, sin culpa |

- **S14-F1 La escalera en Inicio.**
  - Los 5 pasos de Tu camino pasan a ser una escalera de 5 peldaños, con una figura parada en el paso actual.
  - Al avanzar de paso, la figura sube un peldaño (`--ease-resorte`, una vez, al volver a Inicio).
  - Se mantienen los nombres de los pasos y el texto para lector de pantalla ("Paso 3 de 5: Juntar el pie").
  - Reemplaza la lista vertical de Inicio. En Mi plan se queda la fila de pasos actual.
- **S14-F2 El edificio con ventanas.**
  - En Detalle y en Tu grupo, la fila de personas pasa a ser la fachada de un edificio con tantas ventanas como cupos. Las tomadas están encendidas (amarillo cálido con borde, sin texto amarillo), la tuya está destacada con "Tú" y las libres están apagadas.
  - En la tarjeta de Proyectos se mantiene la fila de personas, que es más chica.
  - **Meta común:** "Entre todos llevan $X en sus cuentas Bci". Cada uno sigue con su cuenta propia: es una suma, no un fondo común.
  - **Actividad sin nombres** (simulada en `js/datos.js`): "Se unió alguien hace 2 días" y "4 de 7 pagaron su cuota este mes".
  - **Hito del grupo:** cuando el grupo llega a 5 o a 10 (por ejemplo, al simular que se une alguien), todas las ventanas destellan a la vez y un toast dice "¡Su grupo llegó a 5! Todos tienen 3 % de descuento".
  - Cálculo en `js/calculos.js`: `totalGrupo` (suma de lo juntado por el grupo), con pruebas.
- **S14-F3 Hitos del pie.**
  - Al pasar el 25, el 50 y el 75 % del pie: la alcancía hace un pequeño salto, el hito se marca y vibra una vez en los teléfonos que lo permiten (`navigator.vibrate`).
  - El aviso del hito conecta con la obra: "Vas en la mitad de tu pie. Tu edificio va en obra gruesa."
  - Los hitos pueden traer un **beneficio de Bci como propuesta** (por ejemplo, al 50 %, la tasación sin costo), marcado como "propuesta", igual que los caminos que no existen hoy. Se confirma con el equipo antes de construirlo.
- **S14-F4 Gestos en Tu pie.**
  - **Arrastrar la cuota a la alcancía** para simular el mes. "Simular un mes" queda como botón alternativo.
  - **Pausa sin culpa:** al pausar o usar el protector, la alcancía "descansa" (se atenúa y respira despacio), no se rompe ni se vacía.
  - **Cuenta regresiva a las llaves** en la compra en grupo: "Faltan 214 días" hasta la entrega estimada, junto a Tu obra. No es una cuenta de urgencia: no pide decidir nada.
- **S14-F5 Firmar y recibir las llaves.**
  - **Mantener presionado para firmar:** un anillo se llena en 1,5 s y le da peso a la decisión. Si se suelta antes, no firma. Con teclado, Enter firma directo.
  - Al firmar, la llave gira en la cerradura, cae confeti en los colores del Bci Kit (una sola vez, nunca con movimiento reducido) y dice "¡Es tuyo!".
  - Si hubo aportes de la familia: "Avisamos a quienes aportaron" (ya existe en S13-F3).

---

## Sprint 15 · Navegación y confianza

**Objetivo:** que comprar sea un solo recorrido en una sola pestaña, que Caminos muestre solo lo que sirve comparado con el crédito de siempre, y que se note por qué esta app y no un portal inmobiliario. Mapa completo: [Mapa de navegación](https://claude.ai/artifact/6xq2Rua2GbSX4y3zqLAgxu) y `claude/mapa-navegacion-nov2026.md` en el proyecto.

> Diagnóstico (recorrido de una usuaria nueva, 5-nov-2026): el recorrido de compra salta de pestaña 2 veces, hay 3 niveles de pasos apilados, 8 controles antes de la lista de departamentos, el detalle mezcla comprar e invertir, y Atrás no sigue los pasos.
>
> Frase guía: **los portales te muestran departamentos; Primer Peldaño te dice cuándo puedes tener el tuyo y te lleva hasta ahí, con el banco que te presta.** Se refuerza con la experiencia, no con frases de venta.

**Reglas de navegación** (valen para todo el sprint):
1. La barra solo cambia cuando se toca. El único cruce (Departamentos → Mi camino) se confirma en una hoja.
2. Comprar vive entero en Mi camino.
3. Atrás es el paso anterior: cada paso y subpaso tiene su dirección.
4. Tocar la pestaña activa vuelve a su raíz; cada pestaña recuerda dónde quedaste.
5. Una acción principal por pantalla.
6. Datos, rango y filtros se cambian en una hoja inferior, sin salir de la pantalla.
7. Comprar en Mi camino, invertir en Inversiones; el detalle de un proyecto muestra solo la acción de la pestaña de origen.

- **S15-F1 Mi camino como recorrido único.**
  - Pestañas: **Mi camino · Departamentos · Inversiones · Perfil**. "Mi plan" desaparece.
  - Rutas: `#camino`, `#camino/caminos`, `#camino/ficha/:id`, `#camino/elegir`, `#camino/proyecto/:id`, `#camino/postular/datos`, `/documentos`, `/resultado`, `#camino/pie`, `#camino/firmar`, `#camino/mi-departamento`, `#camino/avisos`. Las rutas antiguas (`#inicio`, `#mis-proyectos`, `#caminos`, `#proyectos`, `#proyecto/:id`) redirigen a las nuevas.
  - La raíz cambia según la etapa, con un número y una acción: 0 preguntas (sin barra) · 1 plazo → "Elegir mi camino" · 2 camino → "Elegir departamento" · 3 postulando → "Seguir postulando" · 4 pie → "Pagar mi cuota" · 5 → "Ir a firmar" · 6 → "Ver mi departamento".
  - Se elimina la fila de 5 pasos de Mi plan, las pestañas Mi compra / Mis inversiones y la fila de subpasos de Postular (queda "1 de 3" en texto).
  - Acepta si: el recorrido A del mapa (primera vez → Postular) no cambia de pestaña; Atrás desde cada paso vuelve al anterior; tocar Mi camino estando en un paso vuelve a la raíz.
- **S15-F2 Escalera tocable.**
  - Peldaño hecho → resumen de solo lectura; actual → abre el paso; futuro → no abre y dice "Primero: …".
  - Son `<a>` o `<button>` con nombre accesible; 44 px de alto como mínimo.
- **S15-F3 Caminos: lo que sirve, comparado con lo de siempre.**
  - Orden: "Con tus números" (rango e ingresos, "Cambiar" en hoja) → camino recomendado con su porqué → **siempre el crédito base** (FOGAES para vivir, 80 % para invertir) → a lo más un camino viable más.
  - Cada tarjeta tiene las mismas cifras en el mismo orden: pones al escriturar · dividendo · llegas en · carga · peor caso sin subsidio.
  - **Diferencia contra el crédito base** en cada camino nuevo, en una línea ("Pie en cuotas · 3 % más barato · llegas 4 meses antes"). Cálculo en `js/calculos.js` (`diferenciaConBase`), con pruebas.
  - "Por qué no te mostramos otros" plegado, una línea por camino no mostrado (`razonNoMostrado`, con pruebas).
  - Las fichas salen del carrusel: respaldo familiar pasa a "Llega antes" (con la lista de regalos, comprar más barato e IVA cero); arriendo con opción de compra queda solo en "Todavía no", como puente.
- **S15-F4 Elegir departamento dentro del camino.**
  - `#camino/elegir` muestra solo los proyectos del camino elegido y del rango. Dos controles: el chip del rango y "Filtrar" (hoja con estudio, 1 dormitorio, usado, IVA cero y "solo los que me alcanzan").
  - El detalle desde el camino tiene una sola acción: "Elegir este departamento".
- **S15-F5 Departamentos e Inversiones.**
  - **Departamentos** (`#departamentos`): explorar sin compromiso, por defecto tu camino y tu rango, con "Ver todos". Detalle con "Llevar a mi camino" (hoja de confirmación) o, sin datos, "¿Me alcanza?" (abre las preguntas con ese departamento de meta). Con una compra en curso: "Ya estás comprando en …".
  - **Inversiones** (`#inversiones`): arriba lo cobrado y tus inversiones; abajo, las oportunidades de pie compartido. Detalle con "Invertir aquí" → monto en UF.
- **S15-F6 Perfil en filas y hoja "Mis datos".**
  - Perfil pasa de formulario largo a filas: Mis datos (hoja), Avisos, Ayuda, Sesión de prueba, Empezar de nuevo (con confirmación).
  - La misma hoja "Mis datos" se abre desde Tu camino; al guardar, el plazo se recalcula ahí mismo.
- **S15-F7 Confianza que solo da el banco.**
  - En Tu camino, junto al plazo: "Bci te podría prestar hasta $X" con el sello "Preaprobación simulada" (`montoMaximoCredito`, desde la regla de carga, con pruebas).
  - **"Ver simulación"** en cada camino: hoja con tasa, CAE, costo total del crédito y dividendo con y sin seguros, como la Hoja de Simulación del nuevo reglamento de información al consumidor de créditos hipotecarios (Decreto 49, vigente desde el 27-feb-2027). `cae` y `costoTotalCredito` en `js/calculos.js`, con pruebas (la CAE incluye seguros y gastos de escritura; supuestos declarados en `CLAUDE.md`).
  - En el detalle de cada proyecto, una fila "Inmobiliaria cliente de Bci: sí / no" (`clienteBci` en `js/datos.js`).
  - Nada de frases de venta ni comparaciones con portales dentro de la app.

**Verificación del sprint:** los 4 recorridos del mapa (A primera vez, B explorar primero, C un mes del pie, D invertir) se prueban con Playwright a 390, 360 y 320 px; se repiten las revisiones con `web-design-guidelines` y `ui-ux-pro-max`.

---

## Sprint 16 · Tu personaje y tu equipo

**Objetivo:** que la persona se vea a sí misma, y a quienes la acompañan, avanzando hacia su departamento, y que las pantallas donde decide (preguntas, caminos, elegir y documentos) sean tan entretenidas como Tu pie. Bocetos: [Primer Peldaño entretenido](https://claude.ai/artifact/FW2HB2gjHCP7uWw6HWoiXY).

> Diagnóstico (5-nov-2026): lo entretenido se juntó al final del recorrido (Tu pie, Firmar, Inicio). Preguntas, Caminos, Elegir y Documentos siguen siendo formularios y listas, y es ahí donde más se abandona.

**Fuera de este sprint:** álbum de stickers, tarjeta para historia, edificio de noche en Mi departamento, "Tu mes" en tres pantallas, balanza en Postular y mapa del barrio.

**Reglas del sprint:**
1. Se celebra solo el avance real: cada timbre, luz o paso del avatar corresponde a un dato de la usuaria.
2. Todo gesto tiene un botón al lado y respeta "reducir movimiento".
3. La ilustración acompaña al número; plazos, montos y condiciones siempre se leen en texto.
4. **Diversidad de parejas y familias** (vale para todo el sprint):
   - No se pregunta ni se guarda el género de nadie. El avatar no tiene opción "hombre" o "mujer": todos los peinados, colores, ropa y accesorios están disponibles para todos.
   - La pareja se llama siempre "tu pareja". Su avatar lo diseña la usuaria desde cero; nunca se propone uno por defecto ni se deduce del avatar de la usuaria.
   - La familia se arma con relaciones, sin límite por tipo: se pueden agregar dos mamás, dos papás, dos abuelas, etc.
   - Los textos van en neutro: "¡Es tuyo!", "Solo yo", "Tu pareja ve este avance". No hay saludos con género ("Bienvenida", "Bienvenido").
   - Las ilustraciones de ejemplo (la tarjeta "En pareja" de las preguntas, los bocetos de la ayuda) usan dos avatares sin cara, con peinados y ropa que no marcan género.
   - El crédito mancomunado se explica como "tú y tu pareja", sin suponer matrimonio ni tipo de pareja.
   - El "?" de la lista de regalos dice hoy "como una lista de novios"; pasa a "como una lista de regalos de matrimonio, pero para tu pie".
5. Nada de nombres de personas: solo relaciones.

- **S16-F1 Creador de avatar.**
  - Estilo **plano sin cara**, el mismo del personaje de la escalera.
  - Opciones: 5 tonos de piel, 6 peinados (corto, largo, moño, rizado, rapado, ondulado), 6 colores de pelo (incluye azul y canas), ropa en 6 colores del Bci Kit, accesorios (lentes, audífonos, mochila, gorro, planta) y mascota (sin mascota, perro, gato).
  - Se abre desde Perfil ("Tu avatar") y desde el primer paso de las preguntas iniciales. Se ve en vivo mientras se elige.
  - El estado guarda `avatar` (`piel`, `pelo`, `colorPelo`, `ropa`, `accesorios`, `mascota`). Si no lo crea, la app usa uno neutro y nunca le pide crearlo dos veces.
  - Se dibuja con una función `avatarSVG(avatar, tamaño)` en `js/app.js`. Las muestras de color tienen nombre accesible ("Tono 3", "Pelo castaño") y los botones usan `aria-pressed`.
  - Acepta si: cada opción cambia la vista previa al tocarla; el avatar se mantiene al recargar; no hay ninguna opción de género.
- **S16-F2 Preguntas iniciales: tu escena se arma.**
  - Arriba hay una escena con el avatar; cada respuesta agrega algo:
    - "Con mi pareja" abre el creador para la pareja (sin avatar sugerido).
    - "Con mi familia" agrega figuras de la familia.
    - "+ Mascota" suma la mascota.
  - Opciones para "¿Con quién vas a vivir?": Solo yo · Con mi pareja · Con mi familia, y aparte el interruptor "+ Mascota".
  - Al terminar, la escena entra en la ventana encendida del Inicio (opción A del Sprint 15), con un fundido simple.
  - Sigue siendo "Pregunta N de 4" y cada respuesta se puede cambiar.
- **S16-F3 El avatar en la app.**
  - Ventana encendida de Inicio: la usuaria y quienes viven con ella.
  - Escalera: el personaje es su avatar.
  - Firmar: la puerta se abre con la usuaria y su equipo delante; luego viene el confeti que ya existe.
  - Hoja "Mis datos" y Perfil: el avatar arriba, con "Editar".
- **S16-F4 Tu equipo (familia con avatar).**
  - En Tu pie, la sección "Tu equipo" con avatares y "Agregar a alguien" (hoja). Se elige la relación y se diseña su avatar.
  - Relaciones: tu pareja, tu mamá, tu papá, tu hermana, tu hermano, tu abuela, tu abuelo, tu tía, tu tío, tu amiga, tu amigo y tu mascota. Se pueden repetir.
  - Cada miembro tiene su papel: "ve este avance" (pareja invitada), "aportó" o "vio tu lista". El estado guarda `equipo: [{relacion, avatar, papel}]`.
  - Lista de regalos: cada aporte muestra el avatar de quien aportó, con su monto y su mensaje.
  - Vista de la familia (`#regalo`): antes de aportar, "Tu avatar" permite retocar el avatar propio (simulado). Ese avatar aparece en el aporte.
  - Puerta final: aparece todo el equipo, con el texto "Tu equipo te acompañó: N personas y 1 mascota". El conteo sale de una función en `js/calculos.js`, con pruebas.
  - Acepta si: se pueden agregar dos personas con la misma relación (por ejemplo, dos mamás); la pareja no tiene avatar sugerido; ningún texto lleva género.
- **S16-F5 Caminos: la carrera a la puerta.**
  - Arriba de las tarjetas de Caminos hay un carril por cada camino mostrado (a lo más 3, según S15-F3). El avatar de la usuaria avanza hacia una puerta y la etiqueta dice "N a M meses".
  - La posición sale de `posicionCarrera(meses, mesesMax)` en `js/calculos.js`, con pruebas: el camino que llega antes queda más cerca de la puerta.
  - En compra en grupo se ven otros avatares en el mismo carril (sin nombres).
  - Debajo va la letra chica del camino más rápido en una línea, por ejemplo "Con inversionistas llegas 8 meses antes; ellos tienen el 15 % hasta que lo recompres".
  - El control "Si juntas al mes" mueve los avatares en vivo. Con "reducir movimiento" cambian de posición sin animarse.
  - Para lectores de pantalla, la carrera es una lista con camino y meses.
  - Tocar un carril baja a la tarjeta de ese camino.
- **S16-F6 Documentos: pasaporte con timbres.**
  - Los documentos de Postular se ven como páginas de un pasaporte: carnet, liquidaciones, cotizaciones AFP e informe de deudas.
  - Al subir un documento, cae un timbre "LISTO" con un giro corto y una vibración breve si el teléfono la permite. Los que faltan dicen "FALTA", con borde punteado.
  - Una sola acción: subir el siguiente documento que falta.
  - Con "reducir movimiento" el timbre aparece sin caer.
- **S16-F7 Elegir departamento: fachadas ilustradas.**
  - Cada proyecto tiene su edificio dibujado en `js/datos.js` (`fachada: {color, pisos}`), con colores del Bci Kit.
  - Las tarjetas de Elegir y Departamentos muestran la fachada arriba, el nombre y el precio en UF.
  - Guardar un proyecto enciende una ventana, igual que en Inicio.
  - Los chips de filtro y el rango se mantienen como en S15-F4.

**Verificación del sprint:**
- `node --test tests/` con las pruebas nuevas en `tests/sprint16.test.js`: `posicionCarrera`, el conteo del equipo y la repetición de relaciones.
- Recorrido A con Playwright a 390, 360 y 320 px, con dos parejas distintas: una con avatares de pelo largo y una con avatares de pelo corto. Revisar que ningún texto cambie según el avatar.
- Búsqueda de textos con género en la interfaz: "Bienvenida", "Bienvenido", "novio", "novia", "esposo", "esposa", "marido".
- Revisión con `web-design-guidelines` y `ui-ux-pro-max`: foco, nombres accesibles de las muestras y movimiento reducido.

---

## Sprint 17 · Que se entienda sin contexto

**Objetivo:** que alguien que abre la app por primera vez entienda en 10 segundos cuándo tendría sus llaves, cuánto pagaría al mes después y qué puede sumar para llegar antes, sin palabras de banco y con el mínimo de texto. Referencias: [Los caminos por dentro](https://claude.ai/artifact/RFm2D8cznhpUG38jsKmMWU) (modelo y simulador), [Arma tu camino](https://claude.ai/artifact/9Mi7e9rRcAySXyMBvwjuwF) (bocetos E) y `claude/modelo-caminos-piezas-nov2026.md` en el proyecto.

> Diagnóstico (5-nov-2026, recorrido como usuaria nueva, para vivir):
> - El plazo cambia según la pantalla: Inicio dice 11 a 15 meses, Caminos dice 15 y Tu pie dice 20. La causa es que Tu pie no cuenta lo ya ahorrado.
> - Los montos aparecen exactos sin haber elegido un departamento.
> - Hay demasiadas palabras de banco (dividendo, escriturar, carga, preaprobación, participación) y demasiados bloques por pantalla.
> - Inversiones y los inversionistas aparecen para quien quiere vivir.
>
> Hallazgo del modelo: la compra en grupo no adelanta las llaves, porque las fija la entrega del edificio. Lo que hace es bajar el precio y lo que hay que juntar al mes.

**Reglas del sprint:**
1. **Un solo cálculo por dato.** El plazo, lo que juntas al mes y el dividendo salen de una función en `js/calculos.js` y se muestran igual en todas las pantallas.
2. **La precisión va con lo decidido** (`CLAUDE.md`): rangos sin departamento, redondeado con departamento y exacto solo en la simulación, la preaprobación y Firmar.
3. **Mostrar primero, explicar al tocar.** Cada pieza es una fila con nombre, efecto, "?" e interruptor. Las condiciones van en "?", en una línea. Ningún párrafo en pantalla.
4. **Se dice lo que es propuesta.** Grupo, regalo y respaldo familiar llevan la etiqueta "Propuesta".
5. **Se sigue el modo vivir.** Nada de inversionistas ni de Inversiones para quien compra para vivir.

### Bloque 1 · Arreglos de confianza (hacer primero)

- **S17-F1 Un solo plazo.**
  - `plazoCamino(perfil, piezas, departamento)` en `js/calculos.js` devuelve, con pruebas: meses, mes y año de las llaves, freno (`ahorro`, `entrega`, `cuenta-vivienda`, `ninguno`), lo que basta juntar al mes, el porcentaje de la meta ya cubierto y el dividendo.
  - Tu pie cuenta lo ya ahorrado como avance desde el día uno.
  - Inicio, Caminos, Detalle y Tu pie usan esa función.
  - Acepta si: en el recorrido A, el plazo es el mismo (o está contenido en el rango) en las cuatro pantallas.
- **S17-F2 Números según lo decidido.**
  - `formatoSegunEtapa(monto, etapa)` en `js/calculos.js`, con pruebas, devuelve "entre $8 y $10 millones", "$9,8 millones" o "$9.752.938".
  - Inicio: "Bci te podría prestar hasta" pasa a ser el rango redondeado, o se va a "Ver números". Nunca aparece un monto mayor que el precio sin explicación.
  - Una misma cifra se muestra en una sola unidad: pesos al mes y millones, sin mezclar con UF en la misma pantalla.
- **S17-F3 Preguntas sin tropiezos.**
  - Sin la barra de pestañas mientras se responden las preguntas.
  - Ninguna opción marcada de antemano en "¿Para qué quieres tu departamento?".
  - El botón fijo no tapa campos: la página deja espacio debajo del último campo. "Atrás" queda visible.
  - Con "Solo yo", el campo "Sueldo de tu pareja" no aparece.
- **S17-F4 Toasts que no persiguen.** Un toast se cierra al cambiar de pantalla y no se repite si la persona ya lo vio.

### Bloque 2 · Traducir sin agregar texto

- **S17-F5 Palabras de la persona.**
  - Cambios de texto:

    | Hoy | Queda |
    |---|---|
    | "Dividendo" | "Pagas al mes" |
    | "Pones al escriturar" | "Juntas antes de firmar" |
    | "Preaprobado hasta UF …" | "✓ Bci te aprueba este departamento" (el detalle va en "Ver números") |
    | "Simular un mes" | "Ver el próximo mes · demo" |

  - "Carga", "Peor caso", "Participación" y "Tasación" pasan al "?".
  - "Postular" lleva el sello "Sin compromiso".
  - Postular no vuelve a pedir lo que ya se respondió: muestra los datos con "Cambiar".
  - Acepta si: una búsqueda de "dividendo", "escriturar" y "carga" en las pantallas del modo vivir solo los encuentra dentro de "?" o en la simulación.
- **S17-F6 Introducción en una promesa.**
  - Una frase ("¿Cuándo puedes tener tu departamento? Te lo decimos y te llevamos.") y "Empezar".
  - Sin porcentajes ni inversionistas.

### Bloque 3 · Las pantallas nuevas

- **S17-F7 Modelo de piezas en `js/calculos.js`.**
  - `PIEZAS` con su efecto: baja el precio, pone dinero en el pie o fija una fecha mínima. También sus condiciones y si existe hoy o es propuesta.
  - `bloqueoPieza(id, elegidas, departamento)` devuelve la razón en dos palabras y cómo desbloquearla.
  - `efectoPieza(id, …)` devuelve un solo número: "−1 mes", "−$5,0 millones" o "−$438 mil al mes".
  - `mejorPieza(…)` elige la que más acerca. Nunca propone el respaldo familiar, porque depende de otra persona.
  - Piezas para vivir:
    - **Descuento en grupo:** solo en obra.
    - **Subsidio del Estado (DS1 tramo 3):** hasta UF 2.200; cuenta de vivienda de 12 meses; monto por tabla.
    - **Sin IVA:** solo terminados; firmar antes del 1-dic-2027.
    - **Regalo de tu familia.**
    - **Respaldo familiar.**
  - Pruebas mínimas:
    - grupo y sin IVA no se suman;
    - el subsidio se bloquea sobre UF 2.200;
    - con grupo, el freno es la entrega;
    - con subsidio, el plazo es de al menos 12 meses;
    - sin IVA se apaga si las llaves llegan después del 1-dic-2027.
  - Supuestos declarados en `CLAUDE.md`: subsidio de UF 270 (promedio, hasta tener la tabla oficial), sin IVA = −10 %, regalo de $300 mil.
- **S17-F8 Tu camino: ahora y después.** Reemplaza el bloque de Inicio sin compra.
  - **Ahora:** el mes y el año de las llaves (rango sin departamento), una barra con el % ya cubierto y el freno en 2 a 4 palabras.
  - **Después:** "Pagas al mes", junto al arriendo de hoy (si la persona lo dio).
  - La garantía del Estado va en un sello ("Pones solo el 10 %"). El crédito de siempre (80 %) aparece en una línea tachada.
  - Se mantiene "Si juntas al mes".
  - Una acción: "Ver cómo llegar antes".
- **S17-F9 Llega antes.** Reemplaza el carrusel, la carrera y "Llega antes" de Caminos.
  - Dos grupos: "Paga menos" y "Recibe ayuda".
  - Cada fila: nombre de 2 o 3 palabras, chip con el efecto, "?" e interruptor. La recomendada lleva ★. Lo bloqueado queda en gris con la razón.
  - Al sumar una pieza:
    - el mes cuenta hacia el nuevo valor;
    - aparece "−N meses";
    - la barra avanza (movimiento de la skill `interaccion-bci-vanilla`);
    - con "reducir movimiento" solo cambia el número.
  - "Ver números" plegado: precio, Bci presta, subsidio, pie y gastos, lo que ya tienes y lo que falta.
  - "Ver simulación" queda dentro, para la Hoja de Simulación.
- **S17-F10 Tu pie más simple.**
  - Quedan visibles el chanchito, la cuota, el % (que ya cuenta lo ahorrado) y una acción.
  - "Ahorro propio / Ahorro grupal" desaparece: lo define el camino.
  - "Este mes no pude", "Cambiar mi ahorro mensual", Juntos, Tu grupo y Tu obra siguen en plegables.
  - En compra en grupo, el sello "Tu pie está asegurado" (Ley 20.007 y cuenta Bci).
- **S17-F11 Inversiones solo para quien invierte.**
  - Con modo vivir, la pestaña Inversiones no aparece. La barra queda en Mi camino · Departamentos · Perfil.
  - Se puede activar desde Perfil, en "También quiero invertir".

**Verificación del sprint:**
- `node --test tests/*.test.js` con `tests/sprint17.test.js` (plazo único, formato según etapa, piezas y bloqueos).
- Recorrido A con Playwright a 390, 360 y 320 px:
  - el mismo plazo en Inicio, Llega antes, Detalle y Tu pie;
  - sin la barra de pestañas en las preguntas;
  - ningún campo tapado;
  - sin "dividendo" ni "escriturar" fuera de "?" y de la simulación;
  - sin Inversiones en modo vivir.
- Prueba con 3 personas del segmento:
  - "¿Cuándo tendrías tus llaves?";
  - "¿Cuánto pagas al mes después?";
  - "¿Se pueden usar dos de estas cosas a la vez?";
  - "¿Postular te compromete?".
  - Éxito: 3 de 3 en las dos primeras preguntas.

**Por validar con Bci (no bloquea el sprint; se marca como supuesto):**
- Si el DS1 se combina con FOGAES en el mismo crédito.
- La tabla oficial de montos del DS1.
- Un tope por regalo (impuesto a las donaciones).
- Cuánto baja el precio sin IVA en cada proyecto.

---

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

## Sprint 19 · Menos texto y razones para volver

Origen: revisión de diseño, textos y retorno (5-nov-2026), doc "Primer Peldaño · Revisión de diseño, textos y retorno". Encontró 41 textos innecesarios en 23 pantallas, y que la persona que todavía no llega no tiene nada que hacer este mes.

- **S19-B1 · Limpiar textos.** Aplicar la tabla de 41 textos (quitar, acortar, mover al glosario, corregir). Aceptación: ninguna frase salta de línea a 360 px; no queda "A ·", "(80 %)", "Casi igual" ni "Para la facilitadora"; con "Solo yo" todo en singular; Detalle con 5 filas visibles.
  - Hecho (6-nov-2026): textos 1-10, 12-21, 25, 26, 28, 31, 32, 35, 36, 39-41; "Casi igual" pasa a "Misma fecha"; el detalle del crédito queda plegado y el dividendo sin subsidio sigue a la vista. Pasan al B2: 11, 22-24, 27, 29, 30, 33, 34. Pasan al B4: 37 y 38.
- **S19-B2 · Una cifra y una acción por pantalla.** Mi departamento con una cifra grande y un sello sin plusvalía; Tu pie con un solo botón "Pagar mi cuota" (el avance de mes de la demo va a Perfil); Llega antes con héroe de una línea; Postular con montos redondeados y "Salir de esta compra" como enlace. Aceptación: a lo más una cifra Display por pantalla en la auditoría.
  - Hecho (6-nov-2026): Llega antes con el plazo en una línea; Postular con montos redondeados y "Salir de esta compra" como enlace (también en Tu pie); Tu pie sin el porcentaje grande, con "Pagar mi cuota" y 3 plegables ("Tu cuota", "Juntos", "Tu grupo y tu obra"); Mi departamento con una cifra grande y un sello; "6 de 10" y "Después, pagas al mes" bajan de tamaño. Auditoría: a lo más una cifra Display por pantalla (las listas de tarjetas, una por tarjeta).
- **S19-B3 · Preguntas sin interrupciones.** El avatar se crea al final, la hoja no se abre sola; "Con mascota" sale de la pantalla de sueldos; campos con `name`, `autocomplete="off"` y ejemplo. Aceptación: cero hojas emergentes de la introducción a Tu camino.
  - Hecho (6-nov-2026): el avatar ya no se abre solo ni aparece en las preguntas (se crea en Perfil) y "Con mascota" salió de los sueldos (Bloque 1); los campos de dinero tienen `name`, `autocomplete="off"` y un ejemplo ("Ej.: 1.200.000…"). Verificado: cero hojas emergentes en los dos recorridos.
- **S19-B4 · Razones para volver.** "Desde tu última visita" en Inicio; Todavía no con "Mi meta de este mes" y recordatorio el día de pago; avisos por hito; hitos con celebración (primer mes, 25 %, la mitad, 12 meses de cuenta de vivienda); puntos en la galería; aviso de que los datos quedan en este teléfono. Fórmulas nuevas en `js/calculos.js` con prueba. Aceptación: al volver con un mes avanzado Inicio muestra un cambio; la persona sola de $1,1 millones ve una acción para este mes; cada hito se celebra una sola vez. Siguiente ola (Sprint 20): avance de obra con foto, misiones que destraban piezas, Tu equipo que anima y regalo de pie.
  - Hecho (6-nov-2026): "Desde tu última visita" en Inicio (cuotas sumadas, personas nuevas en el grupo, etapa de obra y cambio de fecha; queda hasta tocar "Entendido"); "Tu meta de este mes" en Tu camino cuando todavía no llega (apartar lo del mes y la pieza que más acerca el sí); "Recordarme cada mes" en vez de 24 meses; avisos del pie en meses ("Te faltan 2 meses para la mitad de tu pie"); confeti al cruzar un hito, una sola vez y nunca con movimiento reducido; "Tus datos quedan solo en este teléfono" en Perfil. La galería ya tenía puntos. Fórmulas nuevas en `js/calculos.js` (hitoSiguiente, cambiosDesdeVisita, metaDelMes) con 3 pruebas.

## Sprint 20 · Tasa de ejemplo y beneficios validados

Origen: doc "Beneficios del Estado para la vivienda y los caminos de Primer Peldaño" (7-nov-2026), sección 6, validada con la Ley 21.543, la Ley 21.850, la Res. Ex. 1.649 del Minvu y la Res. Ex. 668 de Hacienda.

- **S20-T1 · Tasa de ejemplo con "i" (hacer primero).** Cambiar en `js/calculos.js` la tasa con subsidio a 3,46 %, la sin subsidio a 4,06 % y el peor caso a 4,45 % (ver `CLAUDE.md`, "Tasa de ejemplo"). En cada pantalla donde aparece una tasa (simulación, Detalle del crédito, preaprobación, Firmar), la etiqueta pasa a "Tasa de ejemplo" con un botón "i" al lado. El "i" abre una hoja corta: "Cada banco fija su tasa según tu caso. Se fija el día que firmas." Ícono SVG de línea del Bci Kit, área táctil de 44 px, `aria-label="Qué significa tasa de ejemplo"`. Actualizar las pruebas que usan 3,9 % y 4,5 %. Aceptación: ninguna tasa en pantalla sin su "i"; el peor caso usa 4,45 %; pasan todas las pruebas.
- Pendientes de la ola anterior: avance de obra con foto, misiones que destraban piezas, Tu equipo que anima y regalo de pie.

## Sprint 21 · Cuatro pestañas: Inicio, Tus pasos, Explorar y Perfil

Origen: replanteamiento del 7-nov-2026 (doc del proyecto `claude/mapa-navegacion-nov2026.md` y `CLAUDE.md`, "Qué ve el usuario"). Hacer después de S20-T1 (tasa de ejemplo). Antes de empezar: `git push` (respaldo).

Decisiones del 7-nov que este sprint aplica:
- "Llega antes" (las piezas con interruptores y su efecto en la fecha) pasa a vivir dentro de Explorar → Un camino → "¿Cómo funciona?".
- "Todavía no" se ve en Inicio (la cifra grande dice "Todavía no" con lo que falta) y en Tus pasos ("Tu meta de este mes" y los puentes como misiones). No hay pantalla aparte.
- Después del hito "Es tuyo", Inicio cambia de modo a Mi departamento (dividendo, fotos, arriendo si invierte); Tus pasos queda como recuerdo del recorrido.
- "Invertir en el pie de otros" (hoy la pestaña Inversiones) pasa a Perfil.

Bloques (cada uno se puede ver y probar solo; un commit por bloque):
- **S21-B1 · La barra nueva, sin cambiar contenido.** Barra Inicio · Tus pasos · Explorar · Perfil (ícono de escalera en SVG de línea). Mover las pantallas actuales a su lugar: Mi camino → Tus pasos; Departamentos → Explorar; Inversiones → Perfil. Direcciones nuevas para Atrás. Aceptación: se llega a todas las pantallas de antes; ninguna queda huérfana; pasan todas las pruebas.
- **S21-B2 · Inicio con tres bloques.** Cuándo llegas (única cifra grande) · tarjeta del siguiente paso (con "Hito N de 6", lo que gana, lo que cuesta, el plazo y "Recuérdamelo") · Tu pie compacto. Nada de listas. Modo "Todavía no" y modo Mi departamento. Fórmula nueva en `js/calculos.js`: `siguientePaso(estado)` con la prioridad: vence pronto → destraba el siguiente hito → más adelanta la fecha → más rápido, con pruebas. Aceptación: a lo más una cifra Display; una sola acción; la tarjeta cambia al completar un paso.
- **S21-B3 · Tus pasos: hitos y misiones.** Escalera vertical de 6 hitos según el camino (crédito con garantía: números → cuenta de vivienda → juntar pie → preaprobación → asegurar → es tuyo; en grupo la preaprobación va antes del pie). Cada hito tocable con su hoja. Misiones (DS1, Registro Social, documentos, bajo llave, ahorro automático, equipo, elegir camino y departamento) con su etiqueta; se ven 3 y una hoja con todas y "Fechas que importan". Fórmulas `hitoActual(estado)` y `misiones(estado)` con pruebas. Aceptación: nunca muestra el mes ni el saldo; el "Ahora" coincide con la tarjeta de Inicio; cambiar de camino conserva lo hecho.
- **S21-B4 · Explorar: caminos primero.** Pantalla 1 "¿Qué quieres explorar?" con un botón grande por camino (fecha de llegada, etiqueta) + "Ver todos los departamentos" + "Por qué no te mostramos otros". Pantalla 2 Un camino: una línea, "¿Cómo funciona?" (aquí vive Llega antes), chips de piezas y comuna, lista, "Hacerlo mi camino" con confirmación que muestra qué cambia. Pantalla 3 Un departamento con "Calza con". Aceptación: máximo 1 toque de Explorar a la lista de un camino; mirar otro camino no cambia el plan.
- **S21-B5 · Tu pie y su protección.** Pantalla Tu pie: saldo, "Pagar mi cuota", filas de cuota, ahorro automático, "Guardar bajo llave", sello "Tu pie está protegido" con sus capas según camino y etapa, movimientos. En grupo, "Cuenta bloqueada · tu grupo". Todo simulado. Aceptación: una sola acción; el sello lista solo capas reales para ese camino.

Fuera de este sprint: campos nuevos de `js/datos.js` para filtros (usado, recepción definitiva, ds19, dfl2) y la fila de usados; la regla de arrepentirse en el grupo (pendiente de decidir).

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
| 3 | S3-F0 Bci Kit oficial (hacer primero) | aprobada |
| 3 | S3-F1 Fórmula de carga | aprobada |
| 3 | S3-F2 Postula (paso 1 de Mi compra) | aprobada |
| 3 | S3-F3 Recordar elecciones | aprobada |
| 3 | S3-F4 Agregar a pantalla de inicio | aprobada |
| 3 | S3-F5 Perfil | aprobada |
| 4 | S4-F1 Fórmula de meses | aprobada |
| 4 | S4-F2 Tu 5 % (paso 2 de Mi compra) | aprobada |
| 4 | S4-F3 Propio o grupal | aprobada |
| 4 | S4-F4 Avance simulado | aprobada |
| 4 | S4-F5 Lista de firma | aprobada |
| 4 | S4-F6 Inicio con próximo paso | aprobada |
| 5 | S5-F0 Inicio: ¿Cuánto puedo comprar? (hacer primero) | aprobada |
| 5 | S5-F1 Fórmulas del mes | aprobada |
| 5 | S5-F2 Cascada de la cuenta custodia | aprobada |
| 5 | S5-F3 Modo vivir | aprobada |
| 5 | S5-F4 Avance de la deuda | aprobada |
| 5 | S5-F5 Aviso de abono | retirada en v3 (la participación se recompra sola con el arriendo) |
| 5 | S5-F6 Inicio: Mi camino | aprobada |
| 6 | S6-F1 Invertir aquí | aprobada |
| 6 | S6-F2 Información para invertir | aprobada |
| 6 | S6-F3 Invertir | aprobada |
| 6 | S6-F4 Mis inversiones | aprobada |
| 7 | S7-F1 Estado de carga en botones | rechazada |
| 7 | S7-F2 Contraste AA | aprobada |
| 7 | S7-F3 Textos de 10 segundos | aprobada |
| 7 | S7-F4 Explicaciones a un toque | rechazada |
| 7 | S7-F5 Revisión en 360 px | aprobada |
| 7 | S7-F6 Introducción | aprobada |
| 8 | S8-F0 Modelo v3 en las fórmulas | en progreso |
| 8 | S8-F5 Datos de ejemplo v3 | en progreso |
| 8 | S8-F1 Fórmula de preaprobación | aprobada |
| 8 | S8-F2 Postula con preaprobación | en progreso |
| 8 | S8-F3 Documentos de ejemplo precargados | en progreso |
| 8 | S8-F4 Resultado de la preaprobación | aprobada |
| 9 | S9-F1 Tu mes real | aprobada |
| 9 | S9-F2 Tus caminos | aprobada |
| 9 | S9-F3 Todavía no | en progreso |
| 9 | S9-F4 Fichas de caminos informativos | aprobada |
| 9 | S9-F5 Comprar más barato | en progreso |
| 9 | S9-F6 Registro de la sesión de prueba | aprobada |
| 10 | S10-F1 Pie compartido en Mi departamento | en progreso |
| 10 | S10-F2 Comprador de respaldo y ¿Y si me arrepiento? | en progreso |
| 10 | S10-F3 Pie en cuotas | en progreso |
| 10 | S10-F4 Sostener | en progreso |
| 10 | S10-F5 Pendientes del Sprint 7 | en progreso |
| 11 | S11-F0 Estructura: Inicio = Tu camino | en progreso |
| 11 | S11-F1 Base de interacción | en progreso |
| 11 | S11-F2 Inicio: las 3 preguntas y Tu camino | en progreso |
| 11 | S11-F3 Los caminos y Todavía no | en progreso |
| 11 | S11-F4 Juntar el pie y Sostener | en progreso |
| 12 | S12-F1 Proyectos y Detalle | en progreso |
| 12 | S12-F2 Postula | en progreso |
| 12 | S12-F3 Tus documentos | en progreso |
| 12 | S12-F4 Firma y Mi departamento | en progreso |
| 12 | S12-F5 Invertir y Mis inversiones | en progreso |
| 12 | S12-F6 Errores y revisión final | en progreso |
| 13 | S13-F1 Avisos con tu meta | en progreso |
| 13 | S13-F2 Cuota automática y pausa | en progreso |
| 13 | S13-F3 Juntos | en progreso |
| 13 | S13-F4 Tu grupo y tu obra | en progreso |
| 13 | S13-F5 Lo tuyo creció este mes | en progreso |
| 13 | S13-F6 Medición en la sesión de prueba | en progreso |
| 14 | S14-F1 La escalera en Inicio | en progreso |
| 14 | S14-F2 El edificio con ventanas | en progreso |
| 14 | S14-F3 Hitos del pie | en progreso |
| 14 | S14-F4 Gestos en Tu pie | en progreso |
| 14 | S14-F5 Firmar y recibir las llaves | en progreso |
| 15 | S15-F1 Mi camino como recorrido único | en progreso |
| 15 | S15-F2 Escalera tocable | en progreso |
| 15 | S15-F3 Caminos: lo que sirve, comparado con lo de siempre | en progreso |
| 15 | S15-F4 Elegir departamento dentro del camino | en progreso |
| 15 | S15-F5 Departamentos e Inversiones | en progreso |
| 15 | S15-F6 Perfil en filas y hoja Mis datos | en progreso |
| 15 | S15-F7 Confianza que solo da el banco | en progreso |
| 16 | S16-F1 Creador de avatar | en progreso |
| 16 | S16-F2 Preguntas iniciales: tu escena se arma | en progreso |
| 16 | S16-F3 El avatar en la app | en progreso |
| 16 | S16-F4 Tu equipo (familia con avatar) | en progreso |
| 16 | S16-F5 Caminos: la carrera a la puerta | en progreso |
| 16 | S16-F6 Documentos: pasaporte con timbres | en progreso |
| 16 | S16-F7 Elegir departamento: fachadas ilustradas | en progreso |
| 17 | S17-F1 Un solo plazo | en progreso |
| 17 | S17-F2 Números según lo decidido | en progreso |
| 17 | S17-F3 Preguntas sin tropiezos | en progreso |
| 17 | S17-F4 Toasts que no persiguen | en progreso |
| 17 | S17-F5 Palabras de la persona | en progreso |
| 17 | S17-F6 Introducción en una promesa | en progreso |
| 17 | S17-F7 Modelo de piezas | en progreso |
| 17 | S17-F8 Tu camino: ahora y después | en progreso |
| 17 | S17-F9 Llega antes | en progreso |
| 17 | S17-F10 Tu pie más simple | en progreso |
| 17 | S17-F11 Inversiones solo para quien invierte | en progreso |
| 18 | S18-F1 Descuento real del grupo | en progreso |
| 18 | S18-F2 Un solo reloj | en progreso |
| 18 | S18-F3 Un solo monto para "Juntas antes de firmar" | en progreso |
| 18 | S18-F4 Precisión en Elegir y Detalle | en progreso |
| 18 | S18-F5 Tu camino y Llega antes también para "Todavía no" | en progreso |
| 18 | S18-F6 Datos de ejemplo para que las piezas se vean | en progreso |
| 18 | S18-F7 Firmar en filas y con las piezas elegidas | en progreso |
| 18 | S18-F8 Mi departamento e Inicio después de firmar | en progreso |
| 18 | S18-F9 Revisión de palabras en todo el modo vivir | en progreso |
