# Sprint 11 · Entrega: estructura e interacción del recorrido principal

Estado: listo para que el Evaluator lo revise. S11-F0 a S11-F4 quedan `en progreso`. Se construyó con la skill `interaccion-bci-vanilla` y la regla de textos mínimos.

## Qué se hizo

**S11-F0 Estructura: Inicio = "Tu camino"**
- **Inicio responde según la etapa** (`renderInicio`):
  - con una compra, muestra el paso de la compra;
  - si solo invierte, muestra lo cobrado;
  - la primera vez, hace las 3 preguntas;
  - si ya las respondió, muestra el plazo de su camino.
- **Las 3 preguntas**, una por pantalla, con barra de avance y "Atrás":
  1. ¿Para qué? Dos tarjetas grandes, casa y llave, con `role="radio"`.
  2. ¿Cuánto ganan? Tu sueldo, el de tu pareja (opcional) y otras cuotas.
  3. ¿Cuánto ahorras? Lo ahorrado, lo que puedes juntar al mes (campo y deslizador) y, si es para arrendar, el arriendo de hoy. Una vista previa en vivo muestra "Podrías tenerlo en N meses".

  Si la persona ya tenía sueldos y ahorro mensual guardados, no repite las preguntas.
- **Tu camino:**
  - El número protagonista es "Podrías tener tu departamento en **N meses**", con el camino recomendado (o el elegido), lo que junta al mes y el dividendo de después.
  - La acción es "Ver mi camino" o, si ya eligió camino, "Elegir departamento".
  - Si no conviene, se ve "Todavía no", con la acción "Ver qué lo cambia".
  - "Cambiar mis datos" vuelve a las preguntas.
- **Un solo sistema de 5 pasos** en Inicio y en Mi plan: Elegir → Postular → Juntar el pie → Firmar → Mi departamento.
- **Mis proyectos pasa a llamarse "Mi plan"**, con el ícono de calendario y un estado vacío que lleva a Inicio.
- **Proyectos:** si la persona no eligió camino, arriba aparece la tarjeta "Primero, tu camino". Elegir un camino abre Proyectos con sus filtros.
- **Tu mes real y Tus caminos** se juntan en `#caminos`. La ruta `#mes-real` abre esa pantalla en "Tu mes". "Te prestan hasta UF X" pasó a ser una fila de "Tu mes".
- **Perfil:** la sesión de prueba quedó al final.
- **Frase de la app** (introducción, meta y manifest): "¿Cuándo puedes tener tu primer departamento? Te lo decimos y te llevamos hasta ahí".

**S11-F1 Base de interacción**
- Tokens de movimiento en `:root`, regla global de `prefers-reduced-motion` y duraciones pasadas a tokens.
- Presión (`scale(.97)`) en botones, chips, pestañas, tarjetas, opciones e interruptores.
- Fundido al cambiar de pantalla, solo en la pantalla que entra.
- **Toast** (`role="status"`, 3 s) en: elegir camino, invertir, "Me interesa", recordarme, hitos y "Este mes no pude". Reemplaza los avisos verdes.
- 12 íconos nuevos: banco, inversionistas, persona, casa, llave, calendario, documento, alcancía, flujo, grupo, descuento y candado.
- `contarHasta()`: el número cuenta desde el valor anterior; con movimiento reducido va directo al final.
- **Error que tiembla** en las preguntas, siempre con su mensaje (adelanto de S12-F6).

**S11-F2 Tu camino visual**
- **Tu mes:** barra del ingreso partida en dividendo, cuotas, arriendo y "te queda", con una marca en el 40 % ("40 % para vivir"). La leyenda va en filas, con ícono y monto. Si no alcanza, el tramo de "te queda" pasa a amarillo y aparece "Ojo" con ícono.
- **Reparto visual:** una casa en franjas (Bci, inversionistas y tú) que suben escalonadas, con una leyenda de punto de color, % y monto. Va en cada tarjeta de camino.

**S11-F3 Los caminos y Todavía no**
- **Carrusel con `scroll-snap`:**
  - la tarjeta recomendada va primero, con borde verde, "Te recomendamos" y su razón;
  - hay puntos indicadores y botones "anterior" y "siguiente" de 44 px;
  - la tarjeta siguiente se asoma por el borde;
  - las fichas tienen su ilustración de íconos.
- **Todavía no con interruptores** (`role="switch"`): terminar las cuotas, un estudio de UF 1.200 y la renta necesaria. Cada cambio recalcula en vivo, con `simularCambios` en `calculos.js` y su prueba, la carga, lo que te queda y el plazo, y el estado pasa de reloj a check ("Ya te conviene").

**S11-F4 Juntar el pie y Sostener**
- **Alcancía en SVG** que se llena desde el % anterior, con marcas en 25, 50, 75 y 100 % y chips de hitos. El hito nuevo entra con un sello (`--ease-resorte`) y un toast.
- **Racha:** 6 puntos de calendario (pagado ✓, protector 🛡, perdido o vacío) más "N meses seguidos". Se guarda en `historialMeses`.
- En Inicio, mientras se junta el pie, el protagonista es "Te faltan N meses" junto a la alcancía, y la acción es "Pagar mi cuota".

**De paso**
- La carga de Postula ya no se vuelve a dibujar si nada cambió. Antes, al salir de un campo, el bloque se movía y el botón Postular no respondía al primer toque cuando había un "?" abierto.
- Se borró el código que ya no se usa: la capacidad en la portada, Tu mes real suelto y los hitos antiguos.

## Verificación

- `node --test tests/*.test.js`: 124 pruebas, 0 fallas. Hay 2 nuevas: `simularCambios` y el contraste del toast.
- `node --check`: sin errores. No hay "plata", "depto", "dpto" ni "la IA recomienda".
- **Recorrido nuevo con Playwright a 390 y 360 px**, sin errores de JavaScript ni scroll horizontal:
  - preguntas (con el temblor sin sueldo), Tu camino, el carrusel y elegir un camino;
  - Tu camino con el camino elegido;
  - Todavía no en Inicio y con interruptores (cuotas + estudio → "Ya te conviene");
  - `#mes-real`, Tu pie (alcancía, racha y protector), Inicio juntando el pie y Mi plan.

  Plazo verificado: con $1,5 M + $1 M, $3 M ahorrados y $400.000 al mes, da **10 meses**.
- Los recorridos de los Sprints 8, 9 y 10 se adaptaron al nuevo Inicio y pasan.

## Decisiones y límites

1. **El plazo es "meses para juntar lo que falta"** del camino recomendado, con el departamento de referencia de UF 2.500. No incluye la obra ni la escritura.
2. **La primera pregunta avanza al tocar una opción**, sin un botón "Siguiente": es un toque menos.
3. **La leyenda del reparto no lleva ícono**, solo el punto de color, para que quepa en la tarjeta a 360 px. Los íconos de actor aparecen en las filas de datos.
4. **El deslizador va de $50.000 a $2.000.000.** Para montos mayores se escribe en el campo.
