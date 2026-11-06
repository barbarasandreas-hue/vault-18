# Sprint 18 · Entrega del Bloque 2: "Todavía no" con piezas

Estado: S18-F5 y S18-F6 quedan `en progreso` para que el Evaluator los revise. El Bloque 3 sigue pendiente.

## Qué se hizo
- **S18-F6 Datos de ejemplo.**
  - 8 proyectos nuevos en las mismas cuatro comunas, con 3 departamentos para vivir en cada rango:
    - 4 en obra, con compra en grupo: Nodo Estación (UF 2.150), Vista Independencia (UF 1.900), Pasaje Recoleta (UF 1.450) y Terrazas Quinta Normal (UF 2.800);
    - 4 terminados (tipo nuevo `venta`: se compran solos, solo en modo vivir y se entregan al firmar): Las Acacias (UF 2.300), Los Aromos (UF 1.650), Los Cerezos (UF 1.300) y Los Robles (UF 2.700).
  - Con esto "Sin IVA" y "Subsidio del Estado" se pueden activar en el recorrido principal.
  - Ejemplo: Las Acacias sin IVA queda en UF 2.070, bajo el tope, así que también suma el subsidio.
  - Cómo se arma la lista:
    - el rango toma los departamentos que calzan con las piezas: grupo = en obra, sin IVA = terminados;
    - con el subsidio, la lista de Elegir solo muestra los que quedan bajo el tope.
  - Grupo y Sin IVA no se suman (uno es en obra y el otro terminado). La fila bloqueada lo dice.
  - Para vivir, el Detalle reparte el precio con las piezas: tú, el subsidio (amarillo) y Bci. El peor caso sin subsidio a la tasa también sale de las piezas.
  - Con el subsidio, el plazo respeta los 12 meses de la cuenta de vivienda:
    - en Tu pie y en el pie listo, "Te frena: tu cuenta de vivienda";
    - no se firma antes;
    - el botón de la demo dice "Ir a tu firma · demo".
- **S18-F5 "Todavía no" con piezas.**
  - `razonTodaviaNo(perfil, dividendo)` usa la misma regla de siempre (25 %, 30 % y 40 % para vivir) con la cuota que dan las piezas.
  - Tu camino muestra "Todavía no · La cuota pasa tu límite" (o "Te quedaría poco para vivir"), con "?" para el límite, y "Ver qué lo cambia".
  - Llega antes reemplaza la pantalla vieja de "Tus caminos" (sin carrusel, carga, dividendo ni al escriturar):
    - cada pieza dice "Así cabe" (verde) o "Aún no" (gris), y la ★ va en la primera que existe hoy y lo cambia;
    - al final, "Mientras tanto: arriendo con opción de compra";
    - la acción fija es "Recordarme en N meses".
  - Al sumar la pieza que lo cambia, aparecen tus llaves y "Elegir departamento".
  - Se quitó "Un estudio de UF 1.200" en modo vivir (el departamento más chico estaba descartado).
  - En Tu camino, si el piso cabe pero el techo no: "Los de UF 2.000 te dejarían justo".

## Pendiente (Bloque 3)
- La preaprobación, el encabezado de Postular y Firmar siguen con el crédito al 90 % del precio de lista. No usan las piezas (sin IVA y subsidio).
- Ejemplo con Las Acacias:
  - Detalle: "Después pagas $362 mil" y Bci presta $70,6 millones;
  - Firmar: $85 millones y $429.685.
- Es S18-F7.

## Verificación
- `node --test tests/*.test.js`: 165 pruebas, 0 fallas (3 nuevas del Bloque 2).
- Recorrido "Solo yo" ($1.100.000, $0, $250.000 al mes, UF 1.500 a 2.000):
  - empieza en "Todavía no" y el subsidio marca "Así cabe";
  - al sumarlo, las llaves llegan en 19 a 20 meses;
  - sin errores.
- Recorrido de un terminado con sin IVA y subsidio, de Elegir a Firmar: el plazo es de 12 meses por la cuenta de vivienda y la misma meta en Detalle, Tu pie y Firmar.
- Recorrido A del Sprint 17 a 390, 360 y 320 px: sin desborde ni errores. Inicio ahora dice 12 a 16 meses, porque hay un terminado en el rango.
- Modo arrendar, revisión rápida: sin errores. Los terminados no aparecen.
