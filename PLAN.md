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
    | Recién llega | "Podrías tener tu departamento en **N meses**", con el nombre del camino recomendado | Ver mi camino |
    | Eligió camino, sin proyecto | El mismo plazo y su cuota del mes | Elegir departamento |
    | Postulando | Parte de la postulación (1 de 3) | Seguir postulación |
    | Juntando el pie | "Te faltan **N meses**" | Pagar la cuota de este mes |
    | Dueña | "Ya es tuyo **N %**" (o "Este mes pagaste" si es para vivir) | Ver mi mes |
    | Solo invierte | "Este mes recibes **$X**" | Ver mis inversiones |

  - **Primera vez:** 3 preguntas cortas, una por pantalla y con barra de avance:
    1. ¿Para qué? (vivir o arrendar)
    2. Sus sueldos
    3. Su ahorro (lo que tiene y lo que puede juntar al mes)

    Después viene el resultado de "Tu camino", que junta lo que hoy está repartido en Tu mes real y Tus caminos. "Todavía no" aparece en el mismo lugar cuando corresponde.
  - **Plazo:** "Podrías tenerlo en N meses" = meses para juntar lo que falta (`numerosCamino(...).meses`) del camino recomendado. Sin ahorro mensual, se pide ese dato en vez de inventar un plazo.
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
    - La pregunta 3 tiene un **deslizador** para lo que puede juntar al mes (de $50.000 a $2.000.000, de a $10.000), junto al campo.
  - **Número que cuenta:** "N meses" cuenta desde el valor anterior cuando cambia un dato.
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
  - **"Invita a tu pareja"** (simulado): la pareja ve el mismo avance porque el crédito es de los dos. Se muestran dos avatares en la alcancía.
  - **"Regalo para tu pie"** (simulado): un enlace para que la familia aporte a la cuenta Bci del usuario. Se ve como una tarjeta con el monto aportado y quién aportó, con la relación (por ejemplo, "mamá") y nunca con nombres.
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
| 11 | S11-F0 Estructura: Inicio = Tu camino | pendiente |
| 11 | S11-F1 Base de interacción | pendiente |
| 11 | S11-F2 Inicio: las 3 preguntas y Tu camino | pendiente |
| 11 | S11-F3 Los caminos y Todavía no | pendiente |
| 11 | S11-F4 Juntar el pie y Sostener | pendiente |
| 12 | S12-F1 Proyectos y Detalle | pendiente |
| 12 | S12-F2 Postula | pendiente |
| 12 | S12-F3 Tus documentos | pendiente |
| 12 | S12-F4 Firma y Mi departamento | pendiente |
| 12 | S12-F5 Invertir y Mis inversiones | pendiente |
| 12 | S12-F6 Errores y revisión final | pendiente |
| 13 | S13-F1 Avisos con tu meta | pendiente |
| 13 | S13-F2 Cuota automática y pausa | pendiente |
| 13 | S13-F3 Juntos | pendiente |
| 13 | S13-F4 Tu grupo y tu obra | pendiente |
| 13 | S13-F5 Lo tuyo creció este mes | pendiente |
| 13 | S13-F6 Medición en la sesión de prueba | pendiente |
