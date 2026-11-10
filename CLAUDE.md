# Primer Peldaño

App de Bci para que jóvenes profesionales compren su primer departamento sin tener que juntar el pie completo. Es un prototipo para el Taller de Interacción IV (UDD), desafío Bci Labs. El dinero, los inversionistas y la parte legal son simulados; los cálculos son reales. La app debe ser facil de comprender para el usuario. **Función principal:** te decimos cuándo puedes tener tu primer departamento, por qué camino y qué hacer este mes, y te llevamos hasta ahí. Los proyectos (compra en grupo y pie compartido) son un medio dentro del camino, no la portada.

**Las tres intenciones de la app (7-nov-2026):** 1) acercar la primera vivienda, que deje de sentirse lejana; 2) dejar todo claro, con los pasos que ya se pueden dar; 3) asesorar y acompañar toda la compra.

**Qué ve el usuario (estructura acordada el 7-nov-2026; la app todavía tiene la anterior hasta que se programe).** La barra tiene 4 pestañas: **Inicio · Tus pasos · Explorar · Perfil** (cuándo llego, qué me falta, cómo y qué compro, mis cosas). Mapa completo: `claude/mapa-navegacion-nov2026.md` en el proyecto.

- **Inicio**, solo tres bloques: cuándo llegas (el mes, única cifra grande), qué haces ahora (la tarjeta del siguiente paso, con una acción) y cuánto llevas (Tu pie, compacto; al tocarlo abre la pantalla Tu pie). Nunca muestra listas. El plazo se calcula con **el rango de precio que elige la usuaria** (de su piso a su techo), nunca con un departamento genérico.
- **Tus pasos**: la escalera de 6 hitos en orden (Tus números → Tu cuenta de vivienda → Juntar tu pie → Preaprobación Bci → Asegurar tu departamento → Es tuyo; en grupo la preaprobación va antes del pie) y las misiones, que se hacen en cualquier orden (DS1, Registro Social de Hogares, documentos, guardar bajo llave, ahorro automático, equipo, elegir camino y departamento). Nunca muestra el mes ni el saldo. El paso actual de Tus pasos es la tarjeta de Inicio.
- **Explorar**: "¿Qué quieres explorar?" con un botón grande por camino (con su fecha de llegada) → un camino (una línea de qué es, "¿Cómo funciona?", chips de piezas y sus departamentos, "Hacerlo mi camino") → un departamento ("Calza con: …"). Mirar otro camino no cambia el plan; hacerlo tuyo pide confirmar y muestra qué cambia. Lo hecho nunca se pierde.
- **Perfil**: tus datos, tu equipo, avisos e "Invertir en el pie de otros" (otro papel, no el de quien compra).
- **Tu pie** es una cuenta real de Bci (cuenta de ahorro para la vivienda, en UF; en grupo, la cuenta bloqueada) y la app es su ventana. "Tu pie está protegido" muestra sus capas; la misión "Guardar bajo llave" activa el giro diferido.
- La barra solo cambia cuando se toca; Atrás es el paso anterior; una acción principal por pantalla.
- Decisiones del 7-nov: "Llega antes" (las piezas) vive en Explorar → Un camino → "¿Cómo funciona?"; "Todavía no" se ve en Inicio y en Tus pasos, sin pantalla aparte; después de "Es tuyo", Inicio cambia de modo a Mi departamento. Plan: `PLAN.md`, Sprint 21.

## El modelo (v3, 4-nov-2026)

Fuente: brief común v3. Primer Peldaño **no inventa un crédito**: traduce el pie a cuotas que el usuario sí puede pagar, compara con sus números los caminos reales que existen y lo acompaña hasta escriturar. El recorrido tiene cuatro pasos: **Traducir → Elegir → Sostener → Llegar**.

### Crédito según el modo

- **Para vivir:** Bci presta el 90% con la garantía estatal FOGAES y el subsidio a la tasa (Ley 21.836). El usuario pone el 10% de pie.
  - **FOGAES hoy (validado con la Ley 21.543, art. sexto transitorio, 7-nov-2026):** "Garantía de Apoyo a la Vivienda Nueva": solo vivienda nueva en primera venta, hasta UF 6.000, personas naturales, crédito hasta 90 % (la garantía cubre hasta 60 % del valor), promesa desde el 31-dic-2024, pedirlo hasta el 31-may-2028. **No exige primera vivienda ni habitarla**, y viene junto con el subsidio a la tasa (80.000 cupos). El FOGAES original de 2023 (primera vivienda, UF 4.500) terminó el 31-dic-2024.
- **Para invertir:** Bci presta el 80 % con el subsidio a la tasa (exige primera venta, no primera vivienda). Como la garantía tampoco exige primera vivienda, también podría prestar el 90 %; la app usa 80 % para invertir como supuesto conservador. Lo que se pierde al invertir es el DS1 y el DS19, que exigen no tener vivienda, también para la vivienda futura.
- Crédito mancomunado (usuario y pareja), a 30 años.
- **Tasa de ejemplo (7-nov-2026):** la tasa la fija cada banco según el cliente; la app usa un ejemplo, no una promesa.
  - Con subsidio: 3,46 % (Bci, noviembre de 2026, 90 % a 30 años, CAE 3,99 %; 3,41 % al 80 %).
  - Sin subsidio: 4,06 % (3,46 + 0,6; cálculo propio, Bci no la publica).
  - Peor caso: 4,45 %, la tasa de referencia de Hacienda para bancos en noviembre de 2026 (Res. Ex. 668). Si la tasa del banco sin subsidio la supera, no hay subsidio. Se revisa cada mes en el Diario Oficial, cerca del día 16.
  - En pantalla, toda tasa lleva la etiqueta "Tasa de ejemplo" y un botón "i" al lado que abre: "Cada banco fija su tasa según tu caso. Se fija el día que firmas." No se muestra una tasa sin ese "i".
  - Fuente: bci.cl/personas/credito-hipotecario.

### Los caminos

| Camino | Modo | Qué hace |
|---|---|---|
| **A · Compra en grupo** | Vivir o invertir | Bci reúne compradores preaprobados. Descuento real de 3% (5 unidades) a 5% (10 unidades), en uno o varios proyectos de la misma inmobiliaria en una zona. El pie se paga en cuotas durante la construcción, en una **cuenta de ahorro bloqueada en Bci** (art. 138 bis de la LGUC); la inmobiliaria lo recibe solo al escriturar. Salida sin multa si Bci no aprueba el crédito final o si la tasación sale menor que el precio. |
| **B · Pie compartido** | Invertir | Inversionistas ponen el 15% como **participación en el valor** (no es un préstamo). Reciben una renta de 6% anual en UF sobre su parte, y con el resto del arriendo el comprador les **recompra** su parte cada mes. Ganancias y pérdidas se reparten según la parte de cada uno; **sin recurso al sueldo** del comprador. El comprador pone el 5% con ahorro propio. Comprador de respaldo y venta asistida antes del remate. |
| ~~A + B~~ | — | Quitado el 9-nov-2026: para invertir se elige grupo **o** pie compartido, no los dos juntos. |
| **Arriendo con opción de compra** | Vivir | Camino completo (propuesta Bci; referente: Hogarízate, revisado el 9-nov; no se nombra en la interfaz). Entras con 5 % ahorrado; un socio compra un departamento terminado y te lo arrienda con el precio fijo en UF. Pagas arriendo + aporte al pie (UF 11,7 por cada UF 3.500, cerca de la mitad de la cuota) en una cuenta de vivienda bloqueada en Bci, a tu nombre. Contrato de hasta 5 años; compras desde el mes 24 o cuando juntas el 20 % + gastos. Es segunda venta: Bci presta el 80 % sin subsidio a la tasa ni garantía. Si te vas sin comprar, recuperas tu ahorro inicial y el 50 % de tus aportes; si Bci no aprueba, todo (supuestos de diseño). `arriendoOpcion` y `devolucionArriendo` en `js/calculos.js`; departamentos en `ARRIENDOS_OPCION` (`js/datos.js`). Se puede hacer tu camino (9-nov): Inicio muestra "Es tuyo en" y "Te mudas en", y Tus pasos sigue 6 hitos: Números → Juntar el 5 % para entrar → Firmar y mudarte → Juntar tu pie → Preaprobación Bci (desde el tercer año) → Es tuyo (`HITOS_CAMINO.arriendo`). |
| **Respaldo familiar** | Vivir o invertir | Ficha informativa: un familiar deja el 10% en una cuenta bloqueada en Bci ≈ 5 años y lo recupera con intereses (referente: Barclays Family Springboard). |
| **Todavía no** | Los dos | Cuando ningún camino es sostenible, la app lo dice y muestra qué cambiar (ver "Tu mes real"). |

**Comprar más barato** es un filtro sobre todos los caminos: estudio, 1 dormitorio, usado, IVA cero (Ley 21.850, art. 4.° transitorio, validado el 7-nov-2026): un año desde el 1-dic-2026; solo viviendas con recepción definitiva anterior al 17-oct-2026, en primera venta, sin tope de valor; vale también si la promesa se firma dentro del año y la escritura después; retroactivo para escrituras del 22-abr al 1-dic-2026.

### Reglas que no se rompen

- **Nunca bono pie:** el precio de la escritura es siempre el real.
- **Nunca un préstamo de inversionistas a UF + 8%:** supera la tasa máxima convencional (6,51% en UF hasta UF 2.000 y 6,03% sobre ese monto; CMF, 15-sep-2026).
- La inmobiliaria **no puede ser inversionista** de sus propias unidades.
- El dinero del usuario siempre está en cuentas de Bci; nunca en un fondo común de la app (art. 39 de la Ley General de Bancos).
- Siempre se muestra el escenario sin plusvalía y el peor caso.

### La IA

- **Recomendar el camino = reglas transparentes**, escritas en `js/calculos.js` y explicadas en pantalla ("Te recomendamos B porque…"). No se llama IA a una regla.
- **Estimar el arriendo de cada departamento = el modelo de IA** (en la demo, valores precalculados por comuna y tipología, con un error de 10% o menos como hipótesis). Con ese arriendo se calcula la rentabilidad y el plazo de recompra.

## Supuestos de cálculo

- UF de referencia: $41.065.
- Seguros del crédito: ≈ UF 0,7 al mes.
- Arriendo neto = arriendo bruto × 0,9 (administración) × 11/12 (1 mes vacío al año). Peor caso: arriendo 10% más bajo.
- Rentabilidad neta = arriendo neto × 12 / precio. En modo invertir la IA solo muestra departamentos con rentabilidad neta ≥ la tasa con subsidio de ejemplo (3,46 %).
- Límite de carga: dividendo ≤ 25% del ingreso líquido familiar, y dividendo + otras cuotas ≤ 30%. Sobre eso, no aprueba.
- **Tu mes real:** ingreso líquido − arriendo que paga hoy (si sigue arrendando) − otras cuotas − dividendo. Si no cumple el límite de carga, o si queda menos del 40% del ingreso para vivir (supuesto de diseño, a validar en las sesiones), el camino es "Todavía no".
- Si el comprador vende (¿Y si me arrepiento?): costos de venta de 2 % del precio (supuesto de diseño). Orden de pago: Bci, inversionistas según su parte del valor neto de costos, costos y el resto para el comprador. Siempre sin plusvalía.
- Hoja de Simulación (Decreto 49, vigente desde el 27-feb-2027): tasa, dividendo con y sin seguros, CAE y costo total. CAE = tasa interna de retorno mensual × 12 de los flujos del crédito: se recibe el crédito menos los gastos de escritura y se pagan 360 dividendos con seguros (supuesto de diseño: todos los gastos de escritura cuentan como gastos del crédito). Costo total = 360 dividendos con seguros + gastos.
- Caminos: se muestran el recomendado, siempre el crédito de siempre (FOGAES para vivir, 80 % para invertir) y a lo más uno más; los demás, con su razón en "Por qué no te mostramos otros".
- Sostener: "Este mes no pude" mantiene la racha una vez cada 6 meses. Lo ahorrado nunca se pierde.
- **Piezas de Llega antes (Sprint 17, modo vivir).** Cada pieza baja el precio, pone dinero en el pie o fija una fecha mínima. Plazo = el mayor entre (lo que falta ÷ lo que juntas al mes) y las fechas mínimas: la entrega del edificio y, en el DS1 tramo 3, los 12 meses de la cuenta de vivienda. Supuestos:
  - descuento en grupo según los cupos del lote;
  - subsidio DS1 en dos tramos (S20-T2; `DS1` y `ds1Para` en `js/calculos.js`): tramo 3 hasta UF 2.200, monto = 850 − 0,375 × precio entre UF 250 y 400, ahorro UF 80 y cuenta con 12 meses; tramo 4 de UF 2.200 a 4.000, UF 410 (promedio del llamado), ahorro UF 200 y sin 12 meses de cuenta. Tope de sueldo neto del núcleo para quien está sobre el 90 % del Registro Social (RM): tramo 3, $1.992.086 una persona y $2.788.921 dos; tramo 4, $2.673.511 una persona y $3.496.130 dos. Exige no tener vivienda: bloqueado para invertir. Se combina con la garantía y el subsidio a la tasa en departamentos nuevos: crédito = precio − ahorro − subsidio, con tope de 90 %;
  - sin IVA = −10 % (el mismo valor en Comprar más barato), solo departamentos terminados (recepción antes del 17-oct-2026) y con la promesa firmada hasta noviembre de 2027;
  - regalo de $300 mil; hasta nov-2027, una donación por escritura a hijos o nietos paga la mitad del impuesto, una vez por donante (Ley 21.850, art. 1.° transitorio);
  - respaldo familiar = Bci presta el 95 %, pones el 5 % y un familiar deja el 10 % bloqueado hasta que la deuda baja al 80 % (propuesta; igual en la ficha y en la pieza).

  La app solo ofrece una pieza si hay un departamento de ejemplo que la cumpla. Las fórmulas están en `calcularPiezas` y `plazoConPisos`.
- Departamento de referencia: UF 2.500 de lista. Comunas de los ejemplos: Independencia, Quinta Normal, Recoleta y Estación Central.

## Reglas de diseño y contenido

- Interfaz en español de Chile. Usar "dinero", nunca "plata".
- Escribir siempre "departamento" completo, nunca "depto." ni "dpto.".
- Un nombre por crédito (9-nov): "Crédito con garantía del Estado" (vivir, 90 %), "Crédito al 80 %" (invertir) y "Crédito para usados" (80 %, sin subsidio; solo en modo vivir: para invertir, los usados van dentro del Crédito al 80 %, que es el mismo crédito). No usar "crédito tradicional", "crédito de siempre" ni "crédito con FOGAES" en pantalla.
- Todo "Paso X de 6" sigue la escalera de Tus pasos (`pasoEscalera` en `js/app.js`).
- Inicio (10-nov): el edificio que se construye con tu pie (`tarjetaObra(true)`) va dentro de la sección azul del plazo, en vez del edificio con la persona en su ventana. Con "Todavía no" (sin sección azul), va como tarjeta arriba.
- En el detalle de un departamento, la acción principal queda fija abajo (`accion-fija detalle-accion`).
- Comprar es una decisión grande (10-nov, `accionVisita`): en el detalle, primero "Agendar visita" y solo después de marcar "Ya lo visité" aparece "Elegir este departamento". La visita se agenda con la mitad del pie juntada (para no hacer perder tiempo a la corredora); antes, el aviso dice cuánto falta y lleva a Tu pie. Horarios de ejemplo desde la fecha real.
- "Todavía no" siempre ofrece una salida (9-nov, `salidasTodaviaNo`): en Inicio, la razón, el "sí" más cercano con su fecha y un botón; en Tus pasos, todas las salidas (DS1, sin IVA, terminar cuotas, rango más bajo, compra en grupo, sumar una renta) y apartar lo del mes. En el arriendo con opción, otro departamento que sí alcance.
- Edificios en obra con grupo vistos desde el camino con garantía del Estado (9-nov, opción 2): precio de lista, etiqueta "En obra", sin bloque de grupo y la línea "Si te unes a su grupo: podrías pagar … menos" como posibilidad. Comprarlo así guarda la compra con `sinGrupo` (`compraSinGrupo`, `enGrupoDe`).
- No usar nombres de personas en la interfaz; hablar de "usuario" o "cliente" O "inversionista".
- Parejas y familias diversas (Sprint 16): no se pregunta ni se guarda el género de nadie; el avatar no tiene opción de género; la pareja es siempre "tu pareja" y su avatar nunca se sugiere; las relaciones de Tu equipo se pueden repetir (dos mamás, dos papás); textos en neutro ("¡Es tuyo!", "Solo yo"), sin "Bienvenida/o", "novio/a", "esposo/a" ni "marido".
- No usar el auto como forma de juntar el pie. Sí se puede mostrar, en "Todavía no", que terminar de pagar una cuota libera capacidad.
- Seguir el **Bci Kit**, la guía de diseño de Bci: https://www.bci.cl/corporativo/documentacion
  - Colores: cuatro familias (azul, verde, amarillo y rojo) más grises. Cada familia tiene tonos `dark`, `normal`, `80`, `60`, `40` y `20`, y los grises van de `dark` a `light`. Usar variables con esos nombres: `--blue-dark`, `--blue-normal`, `--blue-80` … `--blue-20`, `--green-*`, `--yellow-*`, `--red-*`, `--gray-dark`, `--gray-semidark`, `--gray-neutral`, `--gray-semilight`, `--gray-light`, `--white`.
  - Los valores oficiales (colores, tipografía, botones, formularios) están en `docs/bci-kit.md`, tomados de la página del Bci Kit. Rojo y amarillo no tienen tono `dark` en la guía: se usan los derivados de ese documento.
  - Botones: primario, secundario dark, secundario light, terciario y terciario light, en tamaños small, normal y large, con estado de carga. Son píldoras (borde redondeado de 48 px) con texto en mayúsculas.
  - Títulos: estilos Display 1 a 4 y Encabezado 1 a 6.
  - Listas: viñetas con ícono de check cuando el orden no importa; listas numeradas solo para secuencias o prioridades.
  - Accesibilidad: contraste AA como mínimo, pensando en usuarios con baja visión. Ojo: el texto blanco sobre `--green-normal` no llega a AA en tamaño normal; seguir la regla de `docs/bci-kit.md`. El amarillo nunca se usa como texto.
  - Íconos: Bci usa una fuente propia que no es pública; usar íconos SVG de línea dibujados en el código.
  - **Un significado por color (9-nov):** verde = acción y logro; azul = información y tu plan; amarillo (solo fondo) = atención suave ("Todavía no", "en el límite"); rojo = urgencia o error (misiones que vencen en menos de 30 días, "no aprueba"); gris = neutro y comparación ("Tu arriendo hoy", etiquetas de tipo, pasos que faltan). Los caminos de Explorar van en el tono 20 de su color, con borde, sombra y botón con flecha en el tono fuerte; títulos en gris. La escalera: verde oscuro hecho, azul ahora, gris falta.
- Fondos claros. Tipografía: **Overpass** (la del Bci Kit) para títulos y textos, desde Google Fonts. Los títulos van en peso 400, no en negrita.
- Mobile first (390 px de ancho). Un número y una acción por pantalla. Se entiende en 10 segundos. Siempre mostrar el escenario sin plusvalía.
- **Textos mínimos, al estilo Bci** (sin explicaciones innecesarias):
  - Cada pantalla lleva título, número protagonista, a lo más una línea de apoyo y la acción.
  - No se explica lo que ya dice un número, un título, una etiqueta o un botón.
  - Lo que explica un término va en el botón "?" del glosario, no en un párrafo.
  - Los botones y los chips no llevan porcentajes ni paréntesis: "Usado", no "Usado (−17,6 %)".
  - Cada frase cabe en una línea del teléfono. Si necesita dos, primero revisar qué sobra.
  - Los datos se muestran en filas (etiqueta y monto), no dentro de una oración.
  - No se repite "Es una simulación…": basta una palabra ("simulado") donde haga falta.
  - Se mantienen siempre, aunque sean texto: el sello sin plusvalía, el peor caso (por ejemplo, el dividendo sin subsidio), si un camino existe hoy o es una propuesta, y los avisos de la demo que pide el plan.
- Los montos se muestran en pesos chilenos, con punto de miles (es-CL).
- **La precisión del número va con lo que la persona ya decidió** (5-nov-2026):
  - Sin departamento elegido, todo sale de su rango de precio y se muestra en rangos y redondeado, con la etiqueta "con tu rango". Ejemplos: "entre $8 y $10 millones", "unos $600 mil al mes", "11 a 15 meses".
  - Con un departamento elegido, se redondea: "$9,8 millones", "$443 mil al mes".
  - El monto exacto ("$9.752.938") aparece solo en la simulación, la preaprobación y Firmar.
  - Un atajo (compra en grupo, regalo, IVA cero) nunca se da por aplicado si la persona no lo eligió: se muestra como posibilidad ("podrías llegar 3 meses antes").
  - Una sola cifra grande por pantalla, en la unidad que la persona siente: dinero al mes o meses. Los millones, como máximo una vez.
  - En Inicio, el plazo del pie va en meses ("15 a 27 meses"); si pasa de un año, debajo y en chico: "aprox. 1 año y 3 meses a 2 años y 3 meses" (10-nov, `mesesRango` y `aproxRango`).

## Stack técnico

- Sitio estático: HTML, CSS y JavaScript sin frameworks ni paso de compilación, para que se pueda abrir con doble clic y publicar gratis en GitHub Pages.
- El punto de partida es `primer-peldano.html`, un solo archivo. Al ordenarlo, usar esta estructura:

```
index.html          pantallas y navegación
css/estilos.css     tokens de color y tipografía del Bci Kit, componentes
js/calculos.js      todas las fórmulas (dividendo, cuota, arriendo neto, carga)
js/datos.js         departamentos y lotes de ejemplo
js/app.js           estado y render de las pantallas
```

- Todas las fórmulas viven en `js/calculos.js`; las pantallas solo las llaman.
- Fuentes desde Google Fonts. No agregar librerías salvo que sea necesario, y avisar antes.

## Cómo correrlo

- En el computador: `python -m http.server 8000 --bind 0.0.0.0` en la carpeta del proyecto (en Windows es `python`, no `python3`) y abrir http://localhost:8000. Probar siempre con el navegador en ancho de celular.
- En el teléfono, misma red wifi: con el servidor anterior corriendo, buscar la IP del computador con `ipconfig` ("Dirección IPv4", por ejemplo `192.168.1.20`) y abrir `http://192.168.1.20:8000` en el teléfono. Si no carga, permitir Python en el firewall de Windows para redes privadas.
- En el teléfono, desde cualquier lugar: publicarla en GitHub Pages desde la rama `main` y abrir la dirección `https://<usuario>.github.io/<repositorio>/`. Desde el menú del navegador, "Agregar a pantalla de inicio" la deja como un ícono de app.
- Pruebas de las fórmulas: `node --test tests/*.test.js` (Node ya viene instalado; no hace falta `npm install`).
- Interacción y movimiento (Sprints 11 y 12): seguir la skill `interaccion-bci-vanilla` (tokens de movimiento, catálogo de patrones, íconos y accesibilidad). Si no está disponible, sus reglas están resumidas en `PLAN.md`, Sprint 11.
- Revisión de UI/UX: la skill `ui-ux-pro-max` (instalada en `.agents/skills/` y `.claude/skills/`; buscador en `scripts/search.py`) se usa para revisar accesibilidad, interacción, animación, navegación y formularios. **Nunca reemplaza el Bci Kit**: no se cambian colores, tipografía, botones ni íconos por sus paletas o fuentes, y sus sugerencias no pasan por encima de "Textos mínimos, al estilo Bci".
- Auditoría de interfaz: la skill `web-design-guidelines` (Vercel, en `.agents/skills/` y `.claude/skills/`) revisa los archivos contra las Web Interface Guidelines y entrega hallazgos `archivo:línea`. Sus hallazgos se aplican sin romper el Bci Kit ni "Textos mínimos, al estilo Bci".
- Roles de Claude Code en `.claude/agents/`: `planner` (escribe SPEC.md y PLAN.md), `generator` (programa un sprint) y `evaluator` (revisa el sprint y lo aprueba o rechaza).

## Forma de trabajo

- Hacer cambios pequeños y explicar el plan antes de un cambio grande.
- Después de cada cambio, decir qué archivo cambió y cómo verlo.
- Usar git: un commit por cambio, con el mensaje en español.
- Quien trabaja en el proyecto es diseñadora, no programadora: explicar los pasos de terminal en palabras simples.
