# Sprint 8 · Entrega: modelo v3 y preaprobación simulada

Esta entrega se escribió tarde, después de la primera evaluación (`evaluations/sprint-8.md`), para que quede la traza del sprint. S8-F1 y S8-F4 ya están aprobadas. S8-F0, S8-F2, S8-F3 y S8-F5 quedan `en progreso` con las correcciones de abajo.

## Qué se hizo (commit 6fbc203)

- **S8-F0, fórmulas v3.** Crédito según el modo: vivir 90 / 10 con FOGAES, y arrendar 80 / 15 / 5 con participación de inversionistas al 6 % en UF, que se recompra con el arriendo. La tasa es 3,9 % con subsidio y 4,5 % sin él. Se eliminó el préstamo a UF + 8 %.
- **S8-F5, datos v3.** Proyectos en Independencia, Quinta Normal, Recoleta y Estación Central, con estudio y 1 dormitorio, y el filtro de 3,9 % neto.
- **S8-F1, `preaprobacion()`.** Calcula el crédito máximo, el dividendo máximo y el requisito de renta.
- **S8-F2, Postula en tres partes.** Tus datos → Tus documentos → Resultado.
- **S8-F3, documentos de ejemplo precargados.** Hoja con archivos de ejemplo, barra de subida y sin `<input type="file">`.
- **S8-F4, resultado de la preaprobación.** Muestra lo que falta para la aprobación final.

## Correcciones de la evaluación

1. **Carga v3 en Tus datos (S8-F2).**
   - Nueva función `evaluarCarga(dividendo, otrasCuotas, sueldoPropio, sueldoPareja)` en `calculos.js`: no aprueba si el dividendo pasa de 25 % o si dividendo + cuotas pasa de 30 %. Entre 25 y 30 % con cuotas queda "En el límite".
   - El semáforo muestra "Dividendo X % · con cuotas Y %" y se vuelve a calcular al escribir en "Otras cuotas".
   - `nivelCarga`, `ingresoMinimo`, `ingresoFaltante` y `mejorAlternativa` pasaron a la regla v3, y sus pruebas también. Mi camino y `recalcularPostulacion` usan la misma regla.
2. **Postular sin pareja (S8-F2).** El sueldo de la pareja es opcional. Solo se exige el propio, y `preaprobacion` decide por renta.
3. **Tope de 84 meses (S8-F0).**
   - `plazoRecompra()` devuelve `{ meses, superaTope, noAlcanza }` y cuenta los meses que ya pasaron.
   - En pantalla se lee "Mes 84: refinancias o vendes" o "en el mes 84 refinancias o vendes" en vez de "Te faltan 94 meses".
   - Ya no se usa `|| topeRecompraMeses` como valor de relleno.
   - Prueba nueva con un arriendo de $250.000.
4. **`participacionUF(precio)` (S8-F0).** Es el 15 % del precio y `porFinanciarUF` la usa. Prueba: UF 2.500 → UF 375.
5. **Datos (S8-F5).** `arriendoBruto` pasó a llamarse `arriendoEstimadoIA`, y cada departamento lleva `origenArriendo: 'estimación IA (demo)'`. La prueba revisa los dos campos.
6. **Zona táctil (S8-F3).** `.btn-sm::before` pasó de −4 a −6 px, y `.btn-subir` tiene `min-height: 44px`. Medida con `elementFromPoint`: 54 px.
7. **Miniatura (S8-F3).** El nombre corto del documento ("Liquidación", "AFP", "Contrato", "Carnet") va dentro del SVG, y la marca va en dos líneas: "DOCUMENTO" / "DE EJEMPLO".
8. **Subida en curso (S8-F3).** El `setTimeout` no dibuja, no enfoca y no anuncia si Mis proyectos está oculta o si la hoja ya no existe.

Sugerencias que también se tomaron:

- "Avisos de la IA" pasó a llamarse "Avisos", porque son reglas.
- La descripción de `manifest.webmanifest` ya no dice "5 %".

Pendiente para el Planner: Inicio ("Puedes comprar hasta") todavía no considera las otras cuotas.

## Verificación

- `node --test tests/*.test.js`: 116 pruebas, 0 fallas.
- `node --check js/*.js`: sin errores.
- Recorridos con Playwright a 390 y 360 px (Sprint 8 completo y Sprint 9): sin errores de JavaScript y sin scroll horizontal.
- Casos de carga, con $2.000.000 sin pareja:

  | Otras cuotas | Carga | Estado | Postular |
  |---|---|---|---|
  | $0 | 19,8 % | Holgado | Habilitado |
  | $150.000 | 27,3 % | En el límite | Habilitado, con una sugerencia |
  | $500.000 | 44,8 % | No aprueba | Deshabilitado |
