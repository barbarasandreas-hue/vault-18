# Sprint 14 · Entrega: emoción, juego y grupo

Estado: listo para que el Evaluator lo revise. S14-F1 a S14-F5 quedan `en progreso`. Se construyó con la skill `interaccion-bci-vanilla` y la regla de textos mínimos. La analogía que ordena todo: construir tu primer departamento peldaño a peldaño, mientras el edificio real sube.

## Qué se hizo

**S14-F1 La escalera en Inicio**
- Los 5 pasos son peldaños que suben de izquierda a derecha: los listos en verde claro con check, el actual en verde oscuro y los pendientes en gris. El último es más ancho para que "Mi departamento" no se corte.
- Una figura está parada sobre el peldaño actual. Cuando avanzas de paso y vuelves a Inicio, sube desde el peldaño anterior (`--ease-resorte`).
- Para lector de pantalla: cada peldaño dice "listo" o "estás aquí", y el actual tiene `aria-current="step"`.

**S14-F2 El edificio con ventanas**
- En Detalle (compra en grupo) y en Tu grupo, el grupo es un edificio: cada comprador es una ventana encendida (amarillo), la tuya es verde con "Tú" y las libres están apagadas. Se llena de abajo hacia arriba y las ventanas se encienden una tras otra.
- Al lado: "5 de 10" y la actividad sin nombres: "Se unió alguien hace 2 días" y "3 de 5 pagaron su cuota este mes" (simulado en `js/datos.js`).
- **Meta común:** "Entre todos llevan $X", con un "?" que aclara que cada uno tiene su propia cuenta Bci (`totalGrupo`).
- **"Simular que alguien se une"** en Tu grupo. Si el grupo cruza 5 o 10 (`escalonCruzado`), todas las ventanas destellan a la vez, vibra y el toast dice "¡Su grupo llegó a 5! Todos tienen 3 % de descuento".
- En la tarjeta de Proyectos se mantiene la fila de personas, que es más chica.

**S14-F3 Hitos del pie**
- Al pasar el 25, el 50 y el 75 %, la alcancía da un salto, vibra una vez y el toast conecta con la obra: "Vas en la mitad de tu pie. Tu edificio va en obra gruesa." (`textoHito`).
- Queda pendiente el beneficio de Bci como propuesta: se confirma con el equipo antes de construirlo.

**S14-F4 Gestos en Tu pie**
- **La moneda:** arriba de la alcancía está la cuota ("$800.000 · Tu cuota al mes") y se arrastra hasta la alcancía para simular el mes, como echar una moneda por la ranura. La alcancía crece cuando la moneda está encima. Reemplaza la línea "Cuota de $X al mes", que repetía el monto. "Simular un mes" sigue siendo la alternativa con teclado y lector de pantalla.
- **Pausa sin culpa:** con "Este mes no pude" o "Pausar este mes", la alcancía descansa (respira despacio y se atenúa). No se rompe ni se vacía.
- **Días para tus llaves** en Tu obra: "361 días para tus llaves", hasta la entrega estimada (`diasHasta`). No pide decidir nada.

**S14-F5 Firmar y recibir las llaves**
- "Mantén para firmar": el botón se llena de izquierda a derecha en 1,5 s. Si se suelta antes, no firma. Un toque solo no firma; con Enter o Espacio firma directo, y con movimiento reducido basta un toque.
- Al firmar, la llave entra girando, cae confeti en los colores del Bci Kit (una sola vez en toda la app y nunca con movimiento reducido), vibra y el toast dice "¡Es tuyo!" (o "¡Es tuyo! Avisamos a quienes aportaron").

## Cómo verlo

1. Inicio: la escalera bajo la tarjeta principal.
2. Proyectos → un proyecto en grupo: el edificio con ventanas.
3. Postular y llegar a Tu pie: arrastrar la moneda a la alcancía, tocar "Este mes no pude" y bajar a Tu grupo y Tu obra. Tocar "Simular que alguien se une" hasta llegar a 5.
4. Juntar el pie y mantener presionado "Mantén para firmar".
5. Volver a Inicio: la figura sube al último peldaño.

## Verificación

- `node --test tests/*.test.js`: 139 pruebas, 0 fallas (4 nuevas en `tests/sprint14.test.js`).
- Recorrido con Playwright a 390 y 360 px (`rec14`): sin errores ni desborde. Revisa la escalera, el edificio, el arrastre de la moneda, el hito de grupo con destello, el descanso de la alcancía, que un clic no firme y que mantener 1,5 s sí firme, el confeti y que la figura suba.
- Recorridos de los Sprints 10, 11 y 13: sin errores. Los que firmaban con un clic ahora firman con Enter.
- Contraste: el amarillo nunca va como texto (la moneda usa texto gris oscuro sobre amarillo claro). Las ventanas amarillas llevan borde `--yellow-dark` y no son el único indicador: la cantidad va en número al lado.
- Sin "plata", "depto", "dpto" ni "la IA recomienda".
