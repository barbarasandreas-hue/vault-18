# Evaluación · Sprint 4 · Tu 5 % y escritura

Evaluado sobre el commit `24aee3b`, contra la sección "Sprint 4" de `PLAN.md`. El commit `f3fcff0` es del Planner: solo cambia `PLAN.md`, `SPEC.md` y el journey map para el Sprint 5, y no se usa para juzgar este sprint.

La app se probó con el servidor local, en Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 640, con un script que escribe tecla por tecla. No se probó en un teléfono físico.

## 1. Veredicto

**APROBADO.** Las 6 features (S4-F1 a S4-F6) cumplen sus criterios. Las correcciones 1 a 6 del Sprint 3 están aplicadas y verificadas.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 36 de 36 pasan |
| `node --check` de los 3 JS | Sin errores |
| Palabras prohibidas, rutas `/` y librerías | Vacío, ninguna y solo Google Fonts |
| HTTP 200 en local | `index.html`, el CSS, los 3 JS, el manifest y los íconos |
| Consola y red en todo el recorrido (2 tamaños) | 0 errores y 0 respuestas 4xx/5xx |
| La palabra "auto" en la app | No aparece |
| Consistencia entre el número y el semáforo | 0 diferencias en 50.000 cargas alrededor de 25 % y 30 % |

**Recálculo independiente:** $6.467.738 / $500.000 = 12,94, que da **13 meses**. Con ahorro de cero, vacío o negativo se devuelve `null`. Ingreso mínimo para Alto Ñuñoa: $1.904.750, así que con $900.000 + $800.000 faltan $204.750.

## 3. Criterios por feature

| Feature | Criterio | | Evidencia (navegador) |
|---|---|---|---|
| S4-F1 | 13 meses; con cero o vacío, error | ✅ | `mesesParaMeta()` con pruebas |
| S4-F2 | La meta sale del proyecto; protagonista "13 meses"; campo numérico; hitos 25/50/75/100; "Empezar a ahorrar" | ✅ | Meta $6.467.738 de Alto Ñuñoa; `inputmode="numeric"` y 50 px; 4 hitos; con el campo vacío o en $0 aparece un error y el botón queda deshabilitado |
| S4-F3 | Propio o grupal; frase de "nadie aporta por otro"; sin inversionistas ni auto | ✅ | El texto grupal es exacto; la pantalla dice "Tu 5 % más gastos, lo juntas tú" |
| S4-F4 | "Simular un mes" suma y guarda en `localStorage` | ✅ | 12 → 1 mes; avisos al 25 % (mes 4), 50 % (mes 7) y 75 % (mes 10); tras recargar en el mes 4 sigue en "9 meses · $2.000.000 · 31 %" |
| S4-F5 | Logro, lista con check (crédito Bci, segunda hipoteca, custodia) en palabras simples; "Firmar" → Mi departamento | ✅ | En el mes 13 se pasa al paso 3 con "¡Juntaste tu 5 %!"; 3 ítems con check y montos ($73.916.999, $403.272, $13.859.438, $168.153); "Firmar" → "¡Firmaste!" con los 3 pasos listos |
| S4-F6 | Inicio muestra el paso y su número, con un botón directo; "Volver a simular" a un toque | ✅ | "Paso 2 de 3 · Tu 5 % · Te faltan 13 meses · SEGUIR AHORRANDO" lleva a Tu 5 %. Paso 3: "Ya juntaste $6.467.738 · IR A FIRMAR". Paso 4: "Pagas al mes $571.425". "Volver a simular" abre el simulador y "Volver a mi próximo paso" vuelve |

**Correcciones del Sprint 3:** la carga se ve sin bajar (y = 540 a 390 px, y = 336 a 360 × 640); 30,04 % ahora muestra "30,0 %, En el límite"; en rojo dice cuánto ingreso falta; "Cambiar mi compra" es primario `btn-lg`.

**Móvil:** no hay scroll horizontal ni textos cortados en ninguna pantalla del recorrido, y todos los toques miden 44 px o más.

**Contraste de los elementos nuevos** (calculado con los colores del CSS; AA es 4,5:1, y 3:1 en gráficos): logro 7,44 (texto) y 5,42 (título verde); fila compacta y textos de los hitos 5,40; hito logrado 7,03; chip del paso en Inicio 5,66; borde del punto de cada hito (gráfico) 5,40. Todo cumple AA.

**Capturas (390 y 360 px):** Tu 5 % con la barra de hitos (check en 25 %) y el aviso verde; la firma con el logro y los 3 ítems con check y montos; Inicio con "Paso 2 de 3 · Tu 5 %", "13 meses" y "Seguir ahorrando" visibles sin bajar. Se ven ordenadas y siguen el Bci Kit. El "·" ya no se ve pegado a la palabra siguiente.

## 4. Puntuaciones

Funcionalidad 5 · Calidad móvil 4 · Código 4 · Diseño 4.

## 5. Correcciones requeridas (no bloquean)

1. **Acciones fuera de la vista en teléfonos bajos (360 × 640):** "13 meses" en Tu 5 % antes de empezar (y = 701, bajo la barra en y = 575), "Empezar a ahorrar", "Simular un mes" y "Firmar" quedan bajo la barra. En la firma, aun a 390 × 844, "Firmar" queda en y = 980. Hay que llevar el resultado a la vista con `scrollIntoView`, como en Postula, y considerar una acción fija sobre la barra.
2. **`js/app.js` tiene 1.032 líneas.** Antes del Sprint 5, que rediseña Inicio, conviene separar las pantallas.
3. **Planner:** el comando `node --test tests/` (cuarto sprint pendiente) y el valor $752.318 de la tabla.

## 6. Qué revisar en el teléfono

1. En Tu 5 %, si ves "13 meses" sin cerrar el teclado.
2. Hacer el recorrido completo hasta "Firmar" y ver si se entiende cada paso en 10 segundos.
