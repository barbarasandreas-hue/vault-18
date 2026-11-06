# Sprint 17 · Entrega: que se entienda sin contexto

Estado: listo para que el Evaluator lo revise. S17-F1 a S17-F11 quedan `en progreso`. Llega antes y Tu camino nuevos son para el modo vivir; el modo arrendar mantiene Caminos del Sprint 16.

## Qué se hizo

**Bloque 1 · Arreglos de confianza**
- **S17-F1 Un solo plazo.**
  - `plazoConPisos`, `calcularPiezas`, `mesesEntre` y `fechaLlaves` en `js/calculos.js`. El plazo es el mayor entre lo que toma juntar lo que falta y las fechas mínimas (la entrega del edificio y los 12 meses de la cuenta de vivienda), y `freno` dice cuál manda.
  - Inicio, Llega antes, Detalle y Tu pie usan esa misma regla.
  - Tu pie cuenta lo ya ahorrado desde el primer día: antes decía "Llevas $0" y daba 20 meses; ahora da 15, igual que Inicio y el detalle.
- **S17-F2 Números según lo decidido.**
  - `formatoRedondeado`, `formatoRango` y `formatoSegunEtapa`, con pruebas.
  - Inicio y Llega antes muestran rangos ("entre $350 y $450 mil") y el detalle muestra cifras redondeadas ("$11,7 millones").
  - Se quitó de Inicio "Bci te podría prestar hasta $126.398.070".
- **S17-F3 Preguntas sin tropiezos.**
  - No se ve la barra de pestañas mientras se responde.
  - "¿Para qué quieres tu departamento?" ya no viene marcado.
  - Con "Solo yo", no aparece el sueldo de la pareja.
  - El arriendo de hoy se pregunta también para vivir (opcional), para compararlo después.
  - `scroll-padding-bottom` evita que el botón fijo tape un campo enfocado.
- **S17-F4 Toasts que no persiguen.** Al cambiar de pantalla, el toast se cierra si ya estuvo visible 1,5 s.

**Bloque 2 · Traducir sin agregar texto**
- **S17-F5 Palabras de la persona.**
  - Cambios de texto:

    | Antes | Ahora |
    |---|---|
    | "Dividendo al mes" | "Pagas al mes" |
    | "Meta al escriturar" / "Pones al escriturar" | "Juntas antes de firmar" |
    | "Tu carga" | "Parte de tu sueldo" |
    | "Simular un mes" | "Ver el próximo mes · demo" |

  - Postular lleva el sello "Sin compromiso" y muestra los sueldos ya dados con "Cambiar", en vez de pedirlos de nuevo.
  - El resultado dice "Bci te aprueba este departamento"; las cifras van en "Ver números".
- **S17-F6 Introducción en una promesa.** Una pregunta, una línea y "Empezar", sin porcentajes ni inversionistas.

**Bloque 3 · Pantallas nuevas**
- **S17-F7 Modelo de piezas.**
  - `PIEZAS_VIVIR`, `bloqueoPieza`, `efectoPieza` y `mejorPieza`, con supuestos declarados en `CLAUDE.md`.
  - El descuento en grupo usa los cupos reales del lote.
  - La app solo ofrece una pieza si hay un departamento de ejemplo que la cumpla (`bloqueoApp`).
- **S17-F8 Tu camino: ahora y después.**
  - Ahora: "Tus llaves 14 a 16 meses", entre qué meses llegan y lo que te frena.
  - Sello "Con la garantía del Estado pones solo el 10 %" y "Si juntas al mes".
  - Después: "Después, pagas al mes entre $350 y $450 mil", al lado del arriendo de hoy.
  - "Crédito de siempre (80 %)" tachado y una acción: "Ver cómo llegar antes".
- **S17-F9 Llega antes.**
  - Reemplaza el carrusel y la carrera en modo vivir. Tiene dos grupos, "Paga menos" y "Recibe ayuda".
  - Cada fila lleva nombre, efecto ("−1 mes", "Sobre UF 2.200", "Sin terminados"), "?" con la condición en una línea e interruptor. La recomendada lleva ★.
  - Al cambiar una pieza aparece "−N meses" por un momento. "Ver números" y "Ver simulación" quedan plegados.
- **S17-F10 Tu pie más simple.**
  - Se quitó "Ahorro propio / Ahorro grupal".
  - Muestra "Tus llaves en", la fecha y el freno.
  - Cuota automática, "Este mes no pude", protector de racha (con "?") y "Cambiar mi ahorro mensual" quedan en "Más opciones".
  - En grupo, el sello "Tu pie está asegurado en Bci".
- **S17-F11 Inversiones solo para quien invierte.** En modo vivir la barra queda en Mi camino · Departamentos · Perfil. En Perfil, "También quiero invertir" la muestra.

## Diferencias con el plan y pendientes
- **Datos de ejemplo:** no hay departamentos terminados ni de hasta UF 2.200 en el rango UF 2.000 a 2.500. Por eso "Sin IVA" sale "Sin terminados" y "Subsidio del Estado" sale "Sobre UF 2.200". En el rango UF 1.500 a 2.000 el subsidio sí se puede sumar. Si se quiere mostrar estas piezas, hay que agregar departamentos terminados a `js/datos.js`.
- **Firmar y Mi departamento** siguen con el escenario de siempre: el crédito al 90 %, sin subsidio ni IVA cero en las cifras del crédito. "Ya tienes" en Firmar sí usa la meta nueva.
- **Fecha de firma:** en compra en grupo, si se junta el pie antes de la entrega, la demo pasa igual a Firmar.
- **Modo arrendar:** no cambió (Caminos con carrusel y carrera).

## Verificación
- `node --test tests/*.test.js`: 157 pruebas, 0 fallas (8 nuevas en `tests/sprint17.test.js`).
- Recorrido A con Playwright a 390, 360 y 320 px:
  - el plazo es el mismo en Inicio (14 a 16), Llega antes con grupo (14 a 15), Detalle (15) y Tu pie (15);
  - la barra no aparece en las preguntas y no hay opción marcada;
  - "Solo yo" oculta a la pareja;
  - el "?" abre la condición;
  - Postular muestra los datos y "Sin compromiso", y el resultado dice "Bci te aprueba";
  - Tu pie no tiene "Ahorro grupal";
  - Inversiones no aparece en modo vivir y "También quiero invertir" la muestra;
  - Inicio y Llega antes no dicen dividendo, escriturar, carga ni participación;
  - no hay desborde horizontal ni errores de JavaScript.
- Modo arrendar, revisión rápida: sin errores, con Inversiones visible y la carrera igual que antes.
