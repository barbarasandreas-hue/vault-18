# Sprint 7 · Entrega: pulido, comprensión y accesibilidad

Estado: listo para que el Evaluator lo revise. Las features S7-F1 a S7-F6 quedan `en progreso` en `PLAN.md`.

## Primero: los pendientes de la segunda revisión del Sprint 6

| Pendiente | Qué se hizo |
|---|---|
| Quedaba un `Math.min(360, …)` en "Simular otro mes" | Ahora usa `SUPUESTOS.mesesBci`. En `app.js` ya no quedan 120 ni 360 escritos a mano. |
| "Ver" en "Tus inversiones" salía gris | La regla del gris ahora solo se aplica al primer texto de la línea, así que "Ver" queda en `--blue-dark`. |

## Qué se hizo, feature por feature

**S7-F1 Estado de carga en botones**
- "Comprar aquí", "Cambiar mi compra a este proyecto", "Postular", "Firmar" y "Confirmar" muestran el estado de carga del Bci Kit durante 0,7 s antes de avanzar:
  - El botón mantiene su tamaño y su color.
  - El texto cambia a "Cargando…", con un indicador que gira.
  - El botón queda marcado con `aria-busy` y los lectores de pantalla anuncian "Cargando…".
- Un segundo toque mientras carga no hace nada, así que no se compra ni se invierte dos veces.
- Con "movimiento reducido" activado en el teléfono, el indicador no gira.

**S7-F2 Contraste AA**
- Un script recorre todas las pantallas a 360 y 390 px:
  - Introducción, Inicio (sin compra y Mi camino) y Proyectos con sus dos pestañas y el filtro.
  - Detalle, con las explicaciones abiertas.
  - Invertir con error, y Mis inversiones.
  - Postula en rojo y en amarillo, Tu 5 % con error y con avance, Firma y Mi departamento con excedente.
  - Perfil, con la confirmación de borrar abierta.
- En cada pantalla mide el color real de cada texto contra su fondo real, con 4,5:1 para texto normal y 3:1 para texto grande.
- **Encontró 2 fallas, las dos por colores heredados:**
  - La explicación de "Segunda hipoteca" heredaba el gris de su fila: 4,14:1.
  - El texto chico "Lo puedes abonar a tu deuda." estaba en gris sobre verde claro: 4,16:1.
- Ahora las dos usan `--gray-dark`, y el script da **0 fallas** en todas las pantallas.
- **Prueba nueva, `tests/contraste.test.js`:** lee los colores de `css/estilos.css` y comprueba las 21 combinaciones de texto y fondo que usa la app, y que el amarillo nunca sea color de texto. Si alguien cambia un color y rompe el contraste, la prueba falla.

**S7-F3 Textos de 10 segundos**
- Medí el título y la frase de apoyo de cada pantalla:

  | Pantalla | Título (palabras) | Apoyo (palabras) |
  |---|---|---|
  | Inicio | Tu departamento con el 5 % (5) | 10 |
  | Mi camino | Mi camino (2) | nombre del proyecto |
  | Proyectos | Proyectos (1) | 8 |
  | Detalle | nombre del edificio (3 a 4) | comuna y ficha |
  | Invertir | Invertir (1) | proyecto (6) |
  | Mis proyectos | Mis proyectos (2) | 9 |
  | Perfil | Perfil (1) | 8 |
  | Introducción | Tu departamento con el 5 % del precio (**7**) | 11 |

- **La única excepción es la Introducción, con 7 palabras**, contando "5 %" como una. S7-F6 pide exactamente ese mensaje ("Tu departamento con el 5 % del precio"), así que preferí respetarlo. Si el Planner prefiere 6 palabras, podría ser "Tu departamento con solo el 5 %". Ver Decisiones.

**S7-F4 Explicaciones a un toque**
- Hay un botón de ayuda (ícono "?", zona táctil de 44 × 44 px, `aria-expanded` y una etiqueta como "¿Qué es la carga?") junto a 7 términos:

  | Término | Dónde aparece |
  |---|---|
  | Dividendo | Detalle (total al mes) y Firma |
  | Pie | Resultado de Inicio y título de Tu 5 % |
  | Carga | Postula, junto a "Tu carga" |
  | Segunda hipoteca | Detalle ("Garantía") y Firma |
  | Cuenta custodia | Detalle, Firma y la cascada de Mi departamento |
  | Compra en conjunto | Pestaña de Proyectos y etiqueta del detalle |
  | Financiamiento del pie | Pestaña de Proyectos y etiqueta del detalle |

- Al tocar el botón se abre debajo una frase sin jerga, y al volver a tocarlo se cierra. Por ejemplo, para la carga: "Es la parte de lo que ganan tú y tu pareja que se va cada mes en el dividendo y la cuota a los inversionistas."
- **Perfil › Ayuda** reúne las 7 explicaciones e incluye el enlace "Ver de nuevo la introducción".

**S7-F5 Revisión en 360 px**
- Revisé todas las pantallas y estados de arriba a 360 × 640 y 390 × 844, con las explicaciones abiertas: no hay scroll horizontal, textos cortados, elementos fuera del ancho ni toques bajo 44 px.
- Arreglé un detalle: en la Introducción, a 360 × 640, el botón fijo tapaba parte del sello. Ahora el botón va al final del contenido.

**S7-F6 Introducción**
- Aparece **solo la primera vez y antes de Inicio** (`#bienvenida`), sin la barra inferior.
- Lleva las figuras de marca y el mensaje "**Tu departamento con el 5 % del precio**".
- Tiene una lista con check de las 3 partes:
  - "Bci te presta el 80 %"
  - "Inversionistas te prestan el 15 %"
  - "Tú pones el 5 % y los gastos"
- No repite el cálculo de cuánto puede comprar.
- "Empezar" la marca como vista (`localStorage`) y lleva a Inicio. Al recargar ya no aparece.
- "Empezar de nuevo", en Perfil, la vuelve a mostrar, para repetir la demo desde cero.
- Si el usuario ya tenía una compra o inversiones de antes, no se le muestra.

## Cómo verlo en el teléfono

**Desde cualquier lugar:** https://barbarasandreas-hue.github.io/vault-18/ (una vez subido; tarda 1 o 2 minutos en actualizarse).

**Por wifi:**
1. En la terminal, dentro de la carpeta del proyecto, escribe `python -m http.server 8000 --bind 0.0.0.0`.
2. Con `ipconfig`, busca la "Dirección IPv4" (hoy es `172.20.10.2`).
3. En el teléfono, en la misma red, abre `http://172.20.10.2:8000`.

**Para ver la Introducción:** si ya habías usado la app, ve a Perfil, toca "Empezar de nuevo" y luego "Sí, borrar todo".

## Qué tocar para probar

1. **Introducción:** lee las 3 partes y toca "Empezar".
2. **Inicio:** escribe los sueldos y toca el "?" junto a "al escriturar" para leer qué es el pie.
3. **Proyectos:** toca el "?" de la pestaña, abre un proyecto y toca los "?" de "Garantía" y de "cuenta custodia". Toca "Comprar aquí": aparece "Cargando…" por un momento.
4. **Postula:** toca el "?" junto a "Tu carga". Luego toca "Postular" y fíjate en "Cargando…".
5. **Firma:** toca los "?" de la lista y después "Firmar".
6. **Perfil:** revisa la sección Ayuda.

## Decisiones

- **El título de la Introducción tiene 7 palabras** (ver S7-F3): S7-F6 dicta ese texto exacto, y S7-F3 pide máximo 6. Elegí respetar el mensaje que pide S7-F6. Le corresponde al Planner decidir.
- **La espera del estado de carga es de 0,7 s:** se nota, pero no molesta. Es simulada, porque no hay servidor.
- **La explicación se abre debajo del término**, no en una ventana flotante. Así no tapa nada, se lee con el zoom del teléfono y funciona igual con lector de pantalla.
- **La prueba de contraste vive en `tests/contraste.test.js`.** No es una fórmula, así que no va en `calculos.js`, y `node --test` la encuentra igual.

## Pendiente o para saber

- **Lo probé en Chrome emulando teléfonos, no en un teléfono real.** Falta revisar con lector de pantalla real (VoiceOver o TalkBack) que los botones "?" se anuncien bien y que se escuche "Cargando…".
- **Pendientes del Planner que siguen abiertos:**
  - El comando `node --test tests/`.
  - $752.318 en la tabla de referencia.
  - Las excepciones al kit en `docs/bci-kit.md`.
  - Registrar los agregados del Generator.
  - El 15 % por departamento en compra en conjunto.
  - El departamento de cada inversión.
  - Si se separa `app.js`.
  - Ahora también el largo del título de la Introducción.
