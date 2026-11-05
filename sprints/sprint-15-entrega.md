# Sprint 15 · Entrega: navegación y confianza

Estado: listo para que el Evaluator lo revise. S15-F1 a S15-F7 quedan `en progreso`. Sigue el [Mapa de navegación](https://claude.ai/artifact/6xq2Rua2GbSX4y3zqLAgxu).

## Qué se hizo

**S15-F1 Mi camino como recorrido único**
- Pestañas: **Mi camino · Departamentos · Inversiones · Perfil**. "Mi plan" ya no existe.
- Cada paso tiene su dirección: `#camino`, `#camino/caminos`, `#camino/ficha/:id`, `#camino/elegir`, `#camino/proyecto/:id`, `#camino/postular/datos|documentos|resultado`, `#camino/pie`, `#camino/firmar`, `#camino/mi-departamento`, `#camino/avisos`.
- Atrás vuelve al paso anterior (por ejemplo, de documentos a tus datos, o de postular al detalle del departamento). Un paso que aún no llega redirige al paso de hoy; uno ya hecho muestra su resumen ("Listo").
- Tocar la pestaña en la que estás vuelve a su raíz; cada pestaña recuerda dónde quedaste.
- Las direcciones antiguas (`#inicio`, `#proyectos`, `#proyecto/:id`, `#mis-proyectos`, `#caminos`, `#invertir/:id`, `#avisos`) llevan a las nuevas.
- Se quitaron la fila de 5 pasos, las pestañas Mi compra / Mis inversiones y la fila de subpasos de Postular. Queda "Paso 3 de 5 · Juntar el pie" y "1 de 3 · Tus datos" en texto.
- La raíz de Mi camino muestra la acción de la etapa: "Elegir mi camino", "Elegir departamento", "Seguir postulando", "Pagar mi cuota", "Ir a firmar" o "Ver mi departamento".

**S15-F2 Escalera tocable**
- Peldaño hecho → resumen; actual → abre el paso; futuro → no abre y dice "Primero: juntar el pie." Son enlaces y botones con nombre accesible y 44 px de alto.

**S15-F3 Caminos: lo que sirve, comparado con lo de siempre**
- "Con tus números" (rango, ingresos y modo, con "Cambiar" en hoja), el recomendado con su porqué, siempre el crédito de siempre y a lo más un camino más (`caminosParaMostrar`).
- Cada camino nuevo dice qué gana frente al crédito de siempre: "Pie en cuotas · 5 % más barato · llegas 1 mes antes" (`diferenciaConBase`). El crédito base dice "El crédito de siempre".
- Mismas cifras en cada tarjeta: al escriturar, dividendo, llegas en, carga y peor caso.
- "Por qué no te mostramos otros", plegado, una línea por camino ("Pie compartido: es para comprar y arrendar.").
- "Llega antes": respaldo familiar, lista de regalos y comprar más barato. El arriendo con opción de compra solo aparece en "Todavía no", como puente.

**S15-F4 Elegir departamento dentro del camino**
- `#camino/elegir`: solo el camino elegido y el rango. Dos controles: el chip del rango y "Filtrar" (hoja con estudio, 1 dormitorio, usado, IVA cero y "solo los que me alcanzan", con el botón "Ver N departamentos").
- El detalle desde el camino tiene una sola acción: "Elegir este departamento".

**S15-F5 Departamentos e Inversiones**
- Departamentos: por defecto tu camino y tu rango, con "Solo mi camino ×" para ver todos. Sin datos, el detalle ofrece "¿Me alcanza?" (abre las preguntas con ese rango). Con datos, "Llevar a mi camino" pide confirmar en una hoja y te lleva a Postular. Con otra compra en curso: "Ya estás comprando en …".
- Inversiones: arriba lo cobrado y tus inversiones; abajo, las oportunidades (proyectos con parte del 15 % por reunir). El detalle muestra solo "Invertir aquí" y "Para invertir".

**S15-F6 Perfil en filas y hoja "Mis datos"**
- Filas: Mis datos (hoja), Avisos (`#perfil/avisos`), Ayuda (`#perfil/ayuda`), Sesión de prueba, Ver la introducción y Empezar de nuevo (con confirmación).
- "Mis datos" (modo, sueldos, otras cuotas, ahorro, lo que juntas al mes y arriendo) es la misma hoja desde Tu camino, Caminos y Perfil. Al guardar se recalcula todo sin salir.

**S15-F7 Confianza que solo da el banco**
- En Tu camino: "Bci te podría prestar hasta $X" con el sello "Preaprobación simulada" (desde `preaprobacion`, la misma regla de carga).
- "Ver simulación" en cada camino: crédito, tasa, dividendo sin y con seguros, CAE, costo total y la CAE sin subsidio (`simulacionCredito`). Para un departamento de UF 2.500 al 90 %: CAE ≈ 4,63 %.
- En cada detalle: "Inmobiliaria cliente de Bci: Sí / No" con su "?" (`clienteBci` en `js/datos.js`).

## Verificación
- `node --test tests/*.test.js`: 145 pruebas, 0 fallas (6 nuevas en `tests/sprint15.test.js`).
- Recorridos del mapa con Playwright a 390, 360 y 320 px, sin errores ni desborde:
  - A: primera vez → caminos (≤ 3, con comparación, simulación) → elegir (2 controles, Filtrar) → detalle (sin invertir, con cliente Bci) → postular, sin cambiar de pestaña; Atrás de postular al detalle y de documentos a tus datos.
  - C: tocar Mi camino vuelve a la raíz; la acción lleva a `#camino/pie`; peldaño hecho → resumen; futuro → "Primero: …"; la pestaña recuerda el paso.
  - B: Departamentos sin datos → "¿Me alcanza?"; con datos → "Llevar a mi camino" con confirmación → Postular en Mi camino.
  - D: Inversiones → oportunidad (solo "Invertir aquí") sin cambiar de pestaña.
- Siguen sin errores las pruebas de los Sprints 13 y 14 (avisos, regalos, moneda, mantener para firmar, plegables) adaptadas a las rutas nuevas.
- Medición con ui-ux-pro-max en las pantallas nuevas: sin desborde, foco en el título al navegar, una acción principal por pantalla.
