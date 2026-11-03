# Sprint 3 · Entrega: Bci Kit oficial, Postula, Perfil y agregar a pantalla de inicio

Estado: listo para que el Evaluator lo revise. Las features S3-F0 a S3-F5 quedan `en progreso` en `PLAN.md`.

## Primero: lo que señaló el Evaluator (`evaluations/sprint-2.md`)

| Corrección | Qué se hizo |
|---|---|
| 1. S3-F0 primero y volver a medir a 360 px | Es lo primero del sprint (ver abajo). Medí de nuevo en el navegador: "$8.623.650" cabe justo (278 de 278 px a 360, sin desborde), las pestañas y "Mis proyectos" no se cortan, y el blanco sobre `--green-normal` solo aparece en el botón primario, en negrita de 19 px. |
| 2. "52 m²" se partía | `ficha()` usa un espacio que no se corta (` `) entre cada número y su unidad (dormitorios, baños y m²). |
| 3. Porcentaje calculado en la pantalla | Hay una función nueva, `porcentajeEntero()`, en `calculos.js`, con prueba. Se usa para el ancho de la barra y para `aria-valuenow`. |
| 4. Estilos en línea | `style="transform…"` y `style="margin-top…"` pasaron a las clases `.flecha-derecha` y `.con-chip`. Solo queda el ancho de las barras de avance, que cambia según cada proyecto. |
| 5. Comando de pruebas y tabla de referencia | Le corresponde al Planner; no toqué `CLAUDE.md` ni `PLAN.md`. |
| Sugerencia: cabecera de Proyectos | Ahora va en una sola fila: "Filtrado por IA: 4,5 % o más · Para arrendar · Cambiar". |
| Sugerencia: el 80 % muestra $73.916.999 | **No lo cambié.** Si el redondeo lo absorbe el 5 %, "al escriturar" baja a $6.467.737, y S1-F5 pide ver exactamente $6.467.738. Si lo absorbe el 15 %, mostraría $13.859.437 en la misma pantalla donde "por financiar" dice $13.859.438. El 80 % es la única parte sin otra cifra con la cual chocar. |

## Qué se hizo, feature por feature

**S3-F0 Bci Kit oficial**
- **Colores:** los 30 valores exactos de `docs/bci-kit.md` (por ejemplo, `--green-normal: #28892B`, `--blue-normal: #2772CC` y `--gray-dark: #37474F`).
- **Uso de cada color:**
  - Verde para acciones y selección. Las opciones elegidas, las pestañas activas y la barra inferior usan `--green-dark`, que da 7,03:1 con blanco.
  - Azul para enlaces e información.
  - Gris oscuro para títulos y cifras.
  - Amarillo solo como fondo.
  - Rojo para errores y para borrar.
- **Overpass** en pesos 400, 600 y 700, para todo. Los títulos van en peso 400, con interlineado 1,3.
- **Tamaños:** Display 64, 52, 42 y 34 px; Encabezados 30, 26, 22, 20, 18 y 16 px. El número protagonista en pesos usa Display 3 (42 px), como sugiere el kit, y baja a 38 px en pantallas de 360 px.
- **Botones:**
  - Todos son píldoras: radio de 48 px, borde de 1,6 px y texto en MAYÚSCULAS.
  - Miden 36, 50 y 56 px de alto. El small agrega una zona táctil invisible para llegar a 44 px.
  - El primario es verde, con la etiqueta en negrita de 19 px; en tamaño small usa `--green-dark`.
  - El terciario es blanco con borde gris.
- **Campos de dinero:** 50 px de alto, texto de 18 px, radio de 6 px, borde `--gray-semidark` y etiqueta siempre visible arriba.
- **Errores:** texto `--gray-dark` sobre `--red-20`, con un ícono `--red-normal`.
- **Íconos:** SVG de línea dibujados en el código. Agregué 3 nuevos para el semáforo (check, alerta y equis).
- **Figuras de marca** (cuadrado rojo, círculo verde, triángulo amarillo y rectángulo azul) sobre el título de Inicio.
- **Tarjetas** blancas con borde `--gray-semilight`, sin sombra.
- **Acción visible al abrir:** el título de Inicio pasó a "Tu primer departamento", para que quepa en una línea. Así "Ver proyectos" sigue visible sin bajar: termina en y = 538 a 360 × 640, con la barra en y = 576.

**S3-F1 Fórmula de carga**
- Las funciones `carga()`, `nivelCarga()` y `mejorAlternativa()` están en `calculos.js`, junto con `leerMonto()` y `formatoMiles()` para los campos.
- Las pruebas cubren los 4 criterios del plan:
  - $1.500.000 + $1.000.000 en arrendar y lote → 22,9 %, holgado.
  - $1.200.000 + $800.000 → 28,6 %, en el límite.
  - $1.500.000 + $1.000.000 en vivir e individual → 30,1 %, no aprueba.
  - Exactamente 25 % es holgado y exactamente 30 % es en el límite.
- Pasan 30 de 30 pruebas.

**S3-F2 Postula (paso 1 de Mi compra)**
- **Arriba:** el proyecto elegido y su total al mes, y luego un indicador compacto de pasos: 1 Postula · 2 Tu 5 % · 3 Firma.
- **Campos:** "Tu sueldo líquido" y "Sueldo líquido de tu pareja", con `inputmode="numeric"`. El punto de miles aparece mientras escribes.
- **Número protagonista:** la carga ("22,9 %") en Display 2, con el semáforo en color, palabra e ícono:
  - Verde: "Holgado", con un check.
  - Amarillo: "En el límite", con un triángulo de alerta. El texto va en gris oscuro sobre el amarillo, nunca amarillo sobre blanco.
  - Rojo: "No aprueba", con una equis.
- **Errores:** con un campo vacío aparece "Escribe el sueldo líquido del mes.", y con $0 aparece "El sueldo tiene que ser mayor a $0.". En los dos casos no se calcula y "Postular" queda deshabilitado.
- **Sugerencia en amarillo o rojo:** busca, con `calculos.js`, el proyecto que más baja la carga. Por ejemplo: "Si te unes a la compra en conjunto de Edificio Mirador Santa Lucía, tu carga baja a 26,4 %". Incluye un enlace a ese proyecto y otro a Proyectos.
- **Botón "Postular":** queda deshabilitado en rojo, con la explicación debajo. En verde o amarillo, al tocarlo se pasa al paso 2, con "Postulación enviada (simulada)" y "Cambiar mis sueldos".
- **Extra:** si ya tienes una compra y abres otro proyecto, aparece "Cambiar mi compra a este proyecto". Así la sugerencia se puede seguir de verdad: sin esto, el usuario quedaba bloqueado por "Ya tienes una compra en curso".

**S3-F3 Recordar elecciones**
- Se guardan en `localStorage` el modo, el tipo de compra, los sueldos y el arriendo actual (`primer-peldano-estado`), además de la compra y su paso (`primer-peldano-compra`).
- Al recargar, Inicio, Proyectos (con la pestaña según el tipo de compra) y Mis proyectos (con los sueldos y la carga) muestran lo último elegido.
- Si `localStorage` está bloqueado o el dato está dañado, la app usa los valores por defecto. Lo probé bloqueándolo en el navegador y todo el recorrido funcionó.

**S3-F4 Agregar a pantalla de inicio**
- `manifest.webmanifest` incluye:
  - Nombre "Primer Peldaño · Bci".
  - `theme_color` `#28892B` y fondo `#F6F7F8`.
  - Pantalla completa (`standalone`).
  - Íconos de 192 y 512 px.
- El ícono es un peldaño blanco sobre el verde del Bci Kit (`iconos/`). Hay además uno de 180 px para iPhone (`apple-touch-icon`).
- El manifest responde 200, está enlazado desde `index.html` y los íconos cargan con sus medidas exactas.

**S3-F5 Perfil**
- Permite editar el modo (arrendar o vivir), los dos sueldos y lo que pagas hoy de arriendo (opcional).
- "Guardar cambios" guarda todo, avisa "Cambios guardados. Todo se recalculó con tus datos nuevos." y recalcula la postulación. Si con los sueldos nuevos la carga pasa de 30 %, la compra vuelve al paso 1.
- "Empezar de nuevo" pide confirmar sin ventanas emergentes ("¿Seguro? Esto no se puede deshacer." · "Sí, borrar todo" · "Cancelar"). Después borra todo y vuelve al simulador de Inicio.

## Cómo verlo en el teléfono

**Desde cualquier lugar** (cuando el cambio esté subido a GitHub): https://barbarasandreas-hue.github.io/vault-18/

**Por wifi, desde el computador:**
1. En la terminal, dentro de la carpeta del proyecto: `python -m http.server 8000 --bind 0.0.0.0`.
2. Averigua la IP del computador con `ipconfig`: es la línea "Dirección IPv4". Hoy es `172.20.10.2`.
3. Con el teléfono en la misma red, abre `http://172.20.10.2:8000`.
4. Si no carga, permite Python en el Firewall de Windows para redes privadas.

**Para instalarla como app:** en iPhone, toca Compartir y luego "Agregar a pantalla de inicio". En Android, toca el menú ⋮ y luego "Agregar a pantalla principal". Debe aparecer el ícono verde del peldaño.

## Qué tocar para probar

1. **Inicio:** fíjate en la tipografía nueva, los botones verdes en mayúsculas y las 4 figuras sobre el título.
2. **Comprar:** entra a Proyectos, abre Edificio Alto Ñuñoa y toca "Comprar aquí". Llegas a Postula.
3. **Postula:** prueba estas combinaciones:

   | Tu sueldo | Sueldo de tu pareja | Resultado esperado |
   |---|---|---|
   | 1.500.000 | 1.000.000 | 22,9 %, verde |
   | 1.200.000 | 800.000 | 28,6 %, amarillo, con sugerencia |
   | 900.000 | 800.000 | 33,6 %, rojo, "Postular" deshabilitado |
   | (borrar uno) o 0 | | Mensaje de error |

   Después de "Postular" en verde o amarillo, el indicador pasa al paso 2.
4. **Recarga la página:** todo sigue igual.
5. **Perfil:** baja el sueldo de tu pareja y guarda. Mi compra vuelve a calcular la carga.
6. **Empezar de nuevo:** en Perfil, toca "Empezar de nuevo" y luego "Sí, borrar todo". Vuelves al simulador con todo limpio.

## Decisiones

- **Selección en verde oscuro, no azul:** el Bci Kit reserva el verde para acciones y el azul para enlaces. La opción elegida, la pestaña activa, la barra y el paso actual usan `--green-dark`, que da 7,03:1.
- **Enlaces en `--blue-dark`, no en `--blue-normal`:** `--blue-normal` sobre el fondo gris claro da 4,49:1, justo bajo el 4,5 que pide AA.
- **Botón deshabilitado con texto `--gray-dark`:** el Bci Kit usa `--gray-neutral`, que da 1,4:1 y no se lee con baja visión. Además, siempre lleva una explicación al lado.
- **Números protagonistas en semibold (600):** los títulos siguen en 400 como pide el kit, pero las cifras grandes se leen mejor así, sobre todo con baja visión.
- **El indicador de pasos ahora es compacto** (3 casillas en fila), para que la carga quede arriba en Postula. La descripción de cada paso sigue disponible para los lectores de pantalla.
- **"Cambiar mi compra a este proyecto"** no estaba en el plan. Lo agregué para que la sugerencia de Postula se pueda seguir hasta el final.
- **"Sí, borrar todo" en rojo**, porque el Bci Kit usa el rojo para eliminar.

## Pendiente o para saber

- **Lo probé en Chrome emulando un teléfono, no en un teléfono real.** Falta revisar en Safari de iPhone que el ícono activo de la barra se vea relleno y que la app se instale con el ícono verde.
- **GitHub Pages todavía muestra el Sprint 2.** Este sprint está en commits locales; hay que subirlos (`git push`) para que la página pública se actualice.
- **El comando de pruebas:** `node --test tests/` sigue fallando en Node 24; `node --test` funciona. Le corresponde al Planner.
